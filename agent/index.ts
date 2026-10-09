// Wellness-агент: коуч составляет план, ревьюер проверяет его на безопасность.
// Запуск: npx tsx index.ts "составь план питания на завтра"
import { readFile } from 'node:fs/promises';
import OpenAI from 'openai';
import { Agent, run, setDefaultOpenAIClient, setOpenAIAPI, setTracingDisabled } from '@openai/agents';

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

const PROXYAPI_URL = 'https://api.proxyapi.ru/v1';

// Подключаем ProxyAPI как OpenAI-совместимый провайдер
process.loadEnvFile(new URL('.env.local', import.meta.url));
const apiKey = process.env.PROXYAPI_API_KEY;
if (!apiKey) throw new Error('В agent/.env.local не задан PROXYAPI_API_KEY');
setDefaultOpenAIClient(new OpenAI({ baseURL: PROXYAPI_URL, apiKey }));
setOpenAIAPI('chat_completions');
setTracingDisabled(true);

const model = process.env.PROXYAPI_MODEL ?? 'deepseek/deepseek-v4.1-flash';
const coach = new Agent({ name: 'Health Coach', instructions: COACH_PROMPT, model });

async function ask(agent: Agent, input: string): Promise<string> {
  const result = await run(agent, input);
  return String(result.finalOutput ?? '').trim();
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

  // 2. Профиль и дневник — контекст для обоих агентов
  const [profile, log] = await Promise.all([readLocal('profile.md'), readLocal('log.md')]);
  const context = `${profile}\n\n${log}`;

  const plan = await ask(coach, `Задача: ${task}\n\n${context}`);
  console.log(plan);
}

main().catch((error: unknown) => {
  console.error(`Ошибка: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
