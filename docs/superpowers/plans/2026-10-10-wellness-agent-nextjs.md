# Wellness-агент на Next.js: план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** обернуть CLI wellness-агента (`agent/index.ts`) в Next.js-приложение: UI → `POST /api/agent/run` → `runHealthAgent`. Логика агентов не меняется.

**Architecture:** код агентов переносится из `agent/index.ts` в `agent/src/agents/*` (промпты и фабрики) и `agent/src/harness/runHealthAgent.ts` (провайдер, ревью, цикл). Next App Router в `agent/app/` вызывает harness из route handler. `agent/index.ts` превращается в тонкий CLI над тем же harness.

**Tech Stack:** Next.js 16.4.0 (App Router), React 19, TypeScript ~6.0, `@openai/agents`, `openai`, Zod 4, ProxyAPI (DeepSeek), tsx для CLI.

**Spec:** `docs/superpowers/specs/2026-10-10-wellness-agent-nextjs-design.md`

## Global Constraints

- Все пути ниже относятся к `agent/` (если не указано иное). Команды запускаются из `agent/`.
- Промпты `COACH_PROMPT` и `REVIEWER_PROMPT`, `MAX_ROUNDS = 3`, `ReviewSchema`, `ask`, `parseReview`, `review` и тело цикла копируются из V0 дословно. Меняются только пути к файлам и `return` → возврат результата.
- Без стриминга, чата, истории, авторизации, БД и состояния между запросами. Агентам не добавляются новые возможности.
- Тесты не пишутся, TDD не используется (явное требование). Проверка: `tsc`, `next build`, ручные прогоны.
- Не создавать файлы сверх спеки. `next.config.ts` добавляется только если без него падает сборка.
- `agent/agent.js` и корневой лендинг не трогать (кроме корневого `.gitignore`).
- Коммиты: короткая русская тема в sentence case, в конце `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Пустая задача или задача из пробелов → `400 { error }`. Кнопка в UI при пустом поле заблокирована.
2. Тело запроса не JSON или без `task` → `400`, а не `500`.
3. Нет `.env.local` или ключа → `500` с текстом «Не найден agent/.env.local» / «…не задан PROXYAPI_API_KEY», который виден в UI.
4. Повторное нажатие во время работы → кнопка заблокирована, второй запрос не уходит.
5. `needs_human_professional` → план не показан в UI, `output.md` не изменён.

---

### Task 1: Harness, агенты и CLI-враппер

**Files:**
- Move: `index.ts` логика → `src/agents/healthCoach.ts`, `src/agents/safetyReviewer.ts`, `src/harness/runHealthAgent.ts`
- Move: `profile.md`, `log.md`, `output.md` → `data/`
- Rewrite: `index.ts` (CLI-враппер)
- Modify: `package.json`; Create: `tsconfig.json`; Modify: `../.gitignore`

**Interfaces:**
- Produces: `runHealthAgent(task: string): Promise<HealthAgentResult>`, `type HealthAgentResult = { plan: string; review: Review; rounds: number }`, `type Review = { verdict: 'approve' | 'revise' | 'needs_human_professional'; score: number; issues: string[] }`. Импорт через alias `@/` → `./src/`.

- [ ] **Step 1: Перенести данные**

```bash
mkdir -p data && git mv profile.md log.md output.md data/
```

- [ ] **Step 2: Установить зависимости**

```bash
npm install next@16.4.0 react@^19.3.0 react-dom@^19.3.0
npm install -D typescript@~6.0.2 @types/react @types/react-dom @types/node@^24
```

Затем привести `scripts` в `package.json` к виду:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "cli": "tsx index.ts"
}
```

- [ ] **Step 3: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: `src/agents/healthCoach.ts`**

`COACH_PROMPT` копируется из V0 символ в символ.

```ts
import { Agent } from '@openai/agents';

const COACH_PROMPT = `…дословно из V0…`;

export function createHealthCoach(model: string) {
  return new Agent({ name: 'Health Coach', instructions: COACH_PROMPT, model });
}
```

- [ ] **Step 5: `src/agents/safetyReviewer.ts`**

`REVIEWER_PROMPT` и `ReviewSchema` копируются из V0 символ в символ.

```ts
import { Agent } from '@openai/agents';
import { z } from 'zod';

const REVIEWER_PROMPT = `…дословно из V0…`;

export const ReviewSchema = z.object({
  verdict: z.enum(['approve', 'revise', 'needs_human_professional']),
  score: z.number().min(0).max(10),
  issues: z.array(z.string()),
});
export type Review = z.infer<typeof ReviewSchema>;

export function createSafetyReviewer(model: string) {
  return new Agent({ name: 'Safety Reviewer', instructions: REVIEWER_PROMPT, model });
}
```

- [ ] **Step 6: `src/harness/runHealthAgent.ts`**

`connectProvider`, `ask`, `parseReview` и `review` переносятся из V0. В `connectProvider` меняется только путь: `path.join(process.cwd(), '.env.local')`. Цикл переносится из `main()` дословно, кроме трёх выходов: они теперь возвращают `{ plan, review: result, rounds }`.

```ts
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

// connectProvider / ask / parseReview / review — из V0, путь к .env.local через process.cwd()

const dataPath = (name: string) => path.join(process.cwd(), 'data', name);
const readLocal = (name: string) => readFile(dataPath(name), 'utf8');

export async function runHealthAgent(task: string): Promise<HealthAgentResult> {
  const model = connectProvider();
  const coach = createHealthCoach(model);
  const reviewer = createSafetyReviewer(model);

  // профиль/дневник и цикл — из V0; `const result` → присваивание внешней `let result!: Review`
  // needs_human_professional → return { plan, review: result, rounds: round }
  // approve → writeFile(dataPath('output.md'), `${plan}\n`) → return { plan, review: result, rounds: round }
  // после цикла: console.log «не одобрен…» → return { plan, review: result, rounds: MAX_ROUNDS }
}
```

- [ ] **Step 7: `index.ts` превращается в CLI-враппер**

```ts
// CLI-обёртка над runHealthAgent. Запуск из agent/: npm run cli -- "составь план питания на завтра"
import { runHealthAgent } from '@/harness/runHealthAgent';

async function main() {
  const task = process.argv.slice(2).join(' ').trim();
  if (!task) {
    console.error('Использование: npm run cli -- "составь план питания на завтра"');
    process.exitCode = 1;
    return;
  }
  const { review } = await runHealthAgent(task);
  if (review.verdict === 'revise') process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(`Ошибка: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
```

- [ ] **Step 8: Корневой `.gitignore`**

Дописать в `../.gitignore`:

```
# Next.js (agent/)
.next
next-env.d.ts
*.tsbuildinfo
```

- [ ] **Step 9: Проверить**

Run: `npx tsc --noEmit` → без ошибок.
Run: `diff <(git show HEAD:agent/index.ts | sed -n '/^const COACH_PROMPT/,/^Если получил/p') <(sed -n '/^const COACH_PROMPT/,/^Если получил/p' src/agents/healthCoach.ts)` → пусто (так же для `REVIEWER_PROMPT`).
Run: `npm run cli -- "составь план питания на завтра"` → в консоли раунды как в V0; при `approve` изменился `data/output.md`.

- [ ] **Step 10: Commit**

```bash
git add -A . ../.gitignore
git commit -m "Wellness-агент: harness и агенты вынесены из index.ts"
```

### Task 2: API-эндпоинт и UI

**Files:**
- Create: `app/layout.tsx`, `app/page.tsx`, `app/api/agent/run/route.ts`

**Interfaces:**
- Consumes: `runHealthAgent`, `HealthAgentResult` из `@/harness/runHealthAgent`.
- Produces: `POST /api/agent/run` с телом `{ task }` → `200 HealthAgentResult` | `400/500 { error: string }`.

- [ ] **Step 1: `app/api/agent/run/route.ts`**

```ts
import { z } from 'zod';
import { runHealthAgent } from '@/harness/runHealthAgent';

const BodySchema = z.object({ task: z.string().trim().min(1) });

export async function POST(request: Request) {
  const body = BodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: 'Введите задачу' }, { status: 400 });
  try {
    return Response.json(await runHealthAgent(body.data.task));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
```

- [ ] **Step 2: `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Wellness Agent' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: `app/page.tsx`**

Клиентский компонент, `State = idle | running | result(data) | result(error)`. Форма с textarea и кнопкой Run Agent, которая заблокирована при `running` или пустом вводе. При `running` показывается «Агент работает…». При ошибке выводится `role="alert"` с текстом. При `needs_human_professional` показывается заметный блок «Этот запрос требует консультации специалиста», а план скрыт. В остальных случаях план выводится в `<pre style={{ whiteSpace: 'pre-wrap' }}>`. Всегда показываются verdict, score `/10`, rounds и список issues (или «Замечаний нет»).

- [ ] **Step 4: Проверить**

Run: `npm run build` → успех. Если падает на `@openai/agents`, создать `next.config.ts` с `serverExternalPackages: ['@openai/agents']` и повторить.
Run: `npm run dev`, затем:
- `curl -s -X POST localhost:3000/api/agent/run -H 'Content-Type: application/json' -d '{"task":"  "}'` → 400;
- `curl … -d 'oops'` → 400;
- `curl … -d '{"task":"составь план питания на завтра"}'` → 200 с `plan/review/rounds`, `data/output.md` обновлён;
- `curl … -d '{"task":"какие таблетки пить от давления?"}'` → `verdict: needs_human_professional`.
- Проверить UI в браузере: idle → «Агент работает…» → результат.

- [ ] **Step 5: Commit**

```bash
git add app
git commit -m "Wellness-агент: Next.js UI и эндпоинт /api/agent/run"
```

### Task 3: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Написать README**: установка (`npm install`, `.env.local` с `PROXYAPI_API_KEY` и опциональным `PROXYAPI_MODEL`), запуск (`npm run dev`, `npm run cli -- "…"`), структура и флоу, решение по `index.ts`: оставлен как тонкий CLI-враппер, потому что позволяет проверить цикл без браузера и показывает, что harness не зависит от Next.
- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "Wellness-агент: README"
```
