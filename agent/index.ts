// Wellness-агент: коуч составляет план, ревьюер проверяет его на безопасность.
// Запуск: npx tsx index.ts "составь план питания на завтра"
import { readFile, writeFile } from 'node:fs/promises';
import OpenAI from 'openai';
import { Agent, run, setDefaultOpenAIClient, setOpenAIAPI, setTracingDisabled } from '@openai/agents';
import { z } from 'zod';

const COACH_PROMPT = `Ты — wellness-коуч: питание, тренировки, восстановление, сон, привычки.
Ты получаешь задачу пользователя, его профиль и дневник последних дней.
Составь план, который учитывает цели, ограничения и предпочтения из профиля и опирается на дневник.

Формат ответа (markdown):
## Цель — одно предложение
## План — по пунктам или по времени дня, с конкретными продуктами, порциями, упражнениями
## Почему так — 2–4 пункта со ссылкой на профиль и дневник
## На что обратить внимание — 1–3 пункта

Запрещено: ставить диагнозы, назначать или отменять лекарства, БАДы, медицинские дозировки, лечить симптомы болезней.
Если задача медицинская, не составляй план: коротко объясни, что это вне твоей компетенции, и посоветуй обратиться к врачу.
Если получил замечания ревьюера — исправь план по каждому замечанию и верни план целиком.`;

const REVIEWER_PROMPT = `Ты — ревьюер безопасности wellness-планов.
Ты получаешь задачу пользователя, его профиль, дневник и план коуча.

Критерии:
1. Безопасность: нет диагнозов, лекарств, БАДов, медицинских дозировок; нет экстремальных дефицитов калорий, голодания, нагрузок, противоречащих ограничениям профиля.
2. Реалистичность: план выполним с учётом режима, времени на готовку и инвентаря.
3. Соответствие профилю: учтены цели, ограничения, непереносимости и предпочтения; есть опора на дневник.

Вердикт:
- "needs_human_professional" — если сама задача медицинская (лекарства, диагнозы, лечение, симптомы болезни), даже если коуч корректно отказал;
- "revise" — если есть нарушения критериев; в issues перечисли конкретные исправления;
- "approve" — если план безопасен, реалистичен и соответствует профилю; issues может быть пустым.

score — оценка плана от 0 до 10.
Отвечай ТОЛЬКО JSON без markdown и текста вокруг:
{"verdict": "approve" | "revise" | "needs_human_professional", "score": number, "issues": string[]}`;

const MAX_ROUNDS = 3;

const PROXYAPI_URL = 'https://api.proxyapi.ru/v1';

// Подключаем ProxyAPI как OpenAI-совместимый провайдер; возвращаем имя модели
function connectProvider(): string {
  try {
    process.loadEnvFile(new URL('.env.local', import.meta.url));
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

const ReviewSchema = z.object({
  verdict: z.enum(['approve', 'revise', 'needs_human_professional']),
  score: z.number().min(0).max(10),
  issues: z.array(z.string()),
});
type Review = z.infer<typeof ReviewSchema>;

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

const readLocal = (name: string) => readFile(new URL(name, import.meta.url), 'utf8');

async function main() {
  // 1. Задача из CLI
  const task = process.argv.slice(2).join(' ').trim();
  if (!task) {
    console.error('Использование: npx tsx index.ts "составь план питания на завтра"');
    process.exitCode = 1;
    return;
  }

  const model = connectProvider();
  const coach = new Agent({ name: 'Health Coach', instructions: COACH_PROMPT, model });
  const reviewer = new Agent({ name: 'Safety Reviewer', instructions: REVIEWER_PROMPT, model });

  // 2. Профиль и дневник — контекст для обоих агентов
  const [profile, log] = await Promise.all([readLocal('profile.md'), readLocal('log.md')]);
  const context = `${profile}\n\n${log}`;

  let plan = '';
  let issues: string[] = [];
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    // 3. Коуч пишет план; со 2-го раунда — правит по замечаниям
    const feedback = issues.length
      ? `\n\nТвой прошлый план:\n${plan}\n\nЗамечания ревьюера:\n${issues.map((issue) => `- ${issue}`).join('\n')}`
      : '';
    plan = await ask(coach, `Задача: ${task}\n\n${context}${feedback}`);

    // 4. Ревьюер проверяет план
    const result = await review(reviewer, `Задача пользователя: ${task}\n\n${context}\n\nПлан коуча:\n${plan}`);
    console.log(`\nРаунд ${round}: verdict=${result.verdict}, score=${result.score}`);
    result.issues.forEach((issue) => console.log(`  - ${issue}`));

    // 5–7. Развилка по вердикту
    if (result.verdict === 'needs_human_professional') {
      console.log('\nЗапрос требует консультации специалиста (врача). План не составляется.');
      return;
    }
    if (result.verdict === 'approve') {
      await writeFile(new URL('output.md', import.meta.url), `${plan}\n`);
      console.log(`\nПлан одобрен (score ${result.score}/10) и сохранён в output.md`);
      return;
    }
    issues = result.issues;
  }

  console.log(`\nПлан не одобрен за ${MAX_ROUNDS} раунда, output.md не изменён.`);
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(`Ошибка: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
