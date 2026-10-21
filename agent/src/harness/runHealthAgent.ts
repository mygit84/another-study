// Harness wellness-агента: коуч составляет план, ревьюер проверяет его на безопасность.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';
import { Agent, run, setDefaultOpenAIClient, setOpenAIAPI, setTracingDisabled } from '@openai/agents';
import { createHealthCoach } from '@/agents/healthCoach';
import { createSafetyReviewer, ReviewSchema, type Review } from '@/agents/safetyReviewer';

const MAX_ROUNDS = 3;

const PROXYAPI_URL = 'https://api.proxyapi.ru/v1';

export type HealthAgentResult = { plan: string; review: Review; rounds: number };

// Подключаем ProxyAPI как OpenAI-совместимый провайдер; возвращаем имя модели
function connectProvider(): string {
  try {
    process.loadEnvFile(path.join(process.cwd(), '.env.local'));
  } catch {
    throw new Error('Не найден agent/.env.local');
  }
  const apiKey = process.env.PROXYAPI_API_KEY;
  if (!apiKey) throw new Error('В agent/.env.local не задан PROXYAPI_API_KEY');
  setDefaultOpenAIClient(new OpenAI({ baseURL: PROXYAPI_URL, apiKey }));
  setOpenAIAPI('chat_completions');
  setTracingDisabled(true);
  return process.env.PROXYAPI_MODEL ?? 'deepseek/deepseek-v4.1-flash';
}

async function ask(agent: Agent, input: string): Promise<string> {
  const result = await run(agent, input);
  return String(result.finalOutput ?? '').trim();
}

// Снимаем обёртку ```json и валидируем через Zod
function parseReview(text: string): Review | null {
  const json = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  try {
    const parsed = ReviewSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// Невалидный JSON — один повторный запрос
async function review(reviewer: Agent, input: string): Promise<Review> {
  const first = parseReview(await ask(reviewer, input));
  if (first) return first;
  console.warn('Ревьюер вернул невалидный JSON, повторяю запрос...');
  const retry = `${input}\n\nТвой прошлый ответ не прошёл проверку. Верни только JSON по схеме, без текста вокруг.`;
  const second = parseReview(await ask(reviewer, retry));
  if (second) return second;
  throw new Error('Ревьюер дважды вернул невалидный JSON');
}

const dataPath = (name: string) => path.join(process.cwd(), 'data', name);
const readLocal = (name: string) => readFile(dataPath(name), 'utf8');

export async function runHealthAgent(task: string): Promise<HealthAgentResult> {
  const model = connectProvider();
  const coach = createHealthCoach(model);
  const reviewer = createSafetyReviewer(model);

  // 2. Профиль и дневник — контекст для обоих агентов
  const [profile, log] = await Promise.all([readLocal('profile.md'), readLocal('log.md')]);
  const context = `${profile}\n\n${log}`;

  let plan = '';
  let issues: string[] = [];
  let result!: Review;
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    // 3. Коуч пишет план; со 2-го раунда — правит по замечаниям
    const feedback = issues.length
      ? `\n\nТвой прошлый план:\n${plan}\n\nЗамечания ревьюера:\n${issues.map((issue) => `- ${issue}`).join('\n')}`
      : '';
    plan = await ask(coach, `Задача: ${task}\n\n${context}${feedback}`);

    // 4. Ревьюер проверяет план
    result = await review(reviewer, `Задача пользователя: ${task}\n\n${context}\n\nПлан коуча:\n${plan}`);
    console.log(`\nРаунд ${round}: verdict=${result.verdict}, score=${result.score}`);
    result.issues.forEach((issue) => console.log(`  - ${issue}`));

    // 5–7. Развилка по вердикту
    if (result.verdict === 'needs_human_professional') {
      console.log('\nЗапрос требует консультации специалиста (врача). План не составляется.');
      return { plan, review: result, rounds: round };
    }
    if (result.verdict === 'approve') {
      await writeFile(dataPath('output.md'), `${plan}\n`);
      console.log(`\nПлан одобрен (score ${result.score}/10) и сохранён в output.md`);
      return { plan, review: result, rounds: round };
    }
    issues = result.issues;
  }

  console.log(`\nПлан не одобрен за ${MAX_ROUNDS} раунда, output.md не изменён.`);
  return { plan, review: result, rounds: MAX_ROUNDS };
}
