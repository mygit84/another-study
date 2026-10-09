# Wellness-агент: план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CLI-агент `agent/index.ts`: коуч составляет wellness-план, ревьюер проверяет его и возвращает JSON, оркестратор крутит до 3 раундов и сохраняет одобренный план в `output.md`.

**Architecture:** Один файл `agent/index.ts`. Два `Agent` из `@openai/agents` без tools, общий OpenAI-клиент на ProxyAPI в режиме `chat_completions`. Оркестрация — обычный цикл в коде, ответ ревьюера разбирается `JSON.parse` + Zod с одним ретраем.

**Tech Stack:** Node ≥ 20.12 (нужен `process.loadEnvFile`), TypeScript через `tsx`, `@openai/agents`, `openai`, `zod`.

**Spec:** `docs/superpowers/specs/2026-10-09-wellness-agent-design.md`

## Global Constraints

- Один `index.ts`, до ~150 строк, короткие комментарии на русском.
- Без классов (собственных), без папок `src/`, без tools/function calling, без UI/серверов/БД.
- Без тестов: пользователь проверяет вручную в консоли. Исполнитель не запускает агента против API.
- Системные промпты — константы в `index.ts`.
- `baseURL = https://api.proxyapi.ru/v1`; ключ `PROXYAPI_API_KEY` из `agent/.env.local`; модель `PROXYAPI_MODEL`, по умолчанию `deepseek/deepseek-v4.1-flash`.
- `setOpenAIAPI('chat_completions')`, `setTracingDisabled(true)`.
- `MAX_ROUNDS = 3`; ретрай ревьюера — ровно 1.
- `agent/.env.local` не читать и не выводить; `agent/agent.js` не трогать.
- Коммиты — короткие русские сообщения в sentence case.

## Review Focus

1. Ревьюер оборачивает JSON в ```` ```json ```` — должен разбираться без ретрая (снимаем обёртку перед `JSON.parse`).
2. Ревьюер пишет текст вокруг JSON или `score` строкой — один ретрай с напоминанием, после второй ошибки понятное исключение и код 1.
3. Медицинская задача («подбери мне лекарство от давления») — ревьюер видит исходную задачу и возвращает `needs_human_professional` уже в 1-м раунде; `output.md` не создаётся.
4. Нет `agent/.env.local` или ключа в нём — понятная ошибка, а не стек из SDK.
5. Запуск без аргумента — подсказка по использованию и код 1, без обращения к API.

Каждый пункт проверяется вручную в шаге «Ручная проверка» задачи 2.

---

### Task 1: Зависимости, провайдер и коуч

**Files:**
- Modify: `agent/package.json` (уже создан, `npm install` допишет зависимости)
- Create: `agent/index.ts`
- Уже созданы: `agent/profile.md`, `agent/log.md`

**Interfaces:**
- Produces: `ask(agent: Agent, input: string): Promise<string>`, константы `coach`, `model`, `context` внутри `main()`, функция `main(): Promise<void>`.

- [ ] **Step 1: Установить зависимости**

```bash
cd agent && npm install @openai/agents openai zod && npm install -D tsx
```

Ожидается: в `agent/package.json` появились `dependencies` и `devDependencies`, создан `agent/package-lock.json`.

- [ ] **Step 2: Убедиться, что `node_modules` игнорируется**

```bash
git check-ignore agent/node_modules
```

Ожидается: путь напечатан. Если пусто — добавить строку `node_modules` в корневой `.gitignore`.

- [ ] **Step 3: Написать `agent/index.ts` (только коуч)**

```ts
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
```

- [ ] **Step 4: Проверка типов**

```bash
cd agent && npx -p typescript tsc --noEmit --strict --skipLibCheck --module nodenext --moduleResolution nodenext --target es2022 index.ts
```

Ожидается: без ошибок. Если ругается на `process`/`node:fs` — `npm install -D @types/node` в `agent/` и повторить.

- [ ] **Step 5: Ручная проверка (пользователь)**

```bash
cd agent && npx tsx index.ts
cd agent && npx tsx index.ts "составь план питания на завтра"
```

Ожидается: первый — подсказка, код 1; второй — план в markdown по формату коуча.

- [ ] **Step 6: Commit**

```bash
git add agent/package.json agent/package-lock.json agent/index.ts agent/profile.md agent/log.md
git commit -m "Wellness-агент: коуч на ProxyAPI"
```

---

### Task 2: Ревьюер, Zod, цикл раундов и output.md

**Files:**
- Modify: `agent/index.ts`

**Interfaces:**
- Consumes: `ask`, `coach`, `model`, `context`, `task`, `main` из задачи 1.
- Produces: `ReviewSchema`, `type Review`, `parseReview(text: string): Review | null`, `review(input: string): Promise<Review>`, файл `agent/output.md` при `approve`.

- [ ] **Step 1: Импорты**

Заменить строку `import { readFile } from 'node:fs/promises';` на:

```ts
import { readFile, writeFile } from 'node:fs/promises';
```

и добавить после импорта `@openai/agents`:

```ts
import { z } from 'zod';
```

- [ ] **Step 2: Промпт ревьюера и константа раундов**

Добавить после `COACH_PROMPT`:

```ts
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
```

- [ ] **Step 3: Агент-ревьюер, схема и разбор с ретраем**

Добавить после строки `const coach = ...`:

```ts
const reviewer = new Agent({ name: 'Safety Reviewer', instructions: REVIEWER_PROMPT, model });

const ReviewSchema = z.object({
  verdict: z.enum(['approve', 'revise', 'needs_human_professional']),
  score: z.number().min(0).max(10),
  issues: z.array(z.string()),
});
type Review = z.infer<typeof ReviewSchema>;
```

Добавить после функции `ask`:

```ts
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
async function review(input: string): Promise<Review> {
  const first = parseReview(await ask(reviewer, input));
  if (first) return first;
  console.warn('Ревьюер вернул невалидный JSON, повторяю запрос...');
  const retry = `${input}\n\nТвой прошлый ответ не прошёл проверку. Верни только JSON по схеме, без текста вокруг.`;
  const second = parseReview(await ask(reviewer, retry));
  if (second) return second;
  throw new Error('Ревьюер дважды вернул невалидный JSON');
}
```

- [ ] **Step 4: Цикл раундов в `main`**

Заменить в `main` строки

```ts
  const plan = await ask(coach, `Задача: ${task}\n\n${context}`);
  console.log(plan);
```

на:

```ts
  let plan = '';
  let issues: string[] = [];
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    // 3. Коуч пишет план; со 2-го раунда — правит по замечаниям
    const feedback = issues.length
      ? `\n\nТвой прошлый план:\n${plan}\n\nЗамечания ревьюера:\n${issues.map((issue) => `- ${issue}`).join('\n')}`
      : '';
    plan = await ask(coach, `Задача: ${task}\n\n${context}${feedback}`);

    // 4. Ревьюер проверяет план
    const result = await review(`Задача пользователя: ${task}\n\n${context}\n\nПлан коуча:\n${plan}`);
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
```

- [ ] **Step 5: Проверка типов и длины**

```bash
cd agent && npx -p typescript tsc --noEmit --strict --skipLibCheck --module nodenext --moduleResolution nodenext --target es2022 index.ts && wc -l index.ts
```

Ожидается: без ошибок, не больше ~150 строк.

- [ ] **Step 6: Ручная проверка (пользователь)**

```bash
cd agent && npx tsx index.ts "составь план питания на завтра"
cd agent && npx tsx index.ts "подбери мне лекарство от давления"
```

Ожидается:
- первый — строки `Раунд N: verdict=..., score=...` с issues; при `approve` создаётся `agent/output.md` и печатается score;
- второй — `Раунд 1: verdict=needs_human_professional`, сообщение про специалиста, `output.md` не меняется.

Пункты Review Focus 1–2 видны по отсутствию/наличию строки «невалидный JSON, повторяю запрос»; 4 — временно переименовать `.env.local` и запустить; 5 — проверено в задаче 1.

- [ ] **Step 7: Commit**

```bash
git add agent/index.ts
git commit -m "Wellness-агент: ревьюер с Zod и цикл ревизий"
```
