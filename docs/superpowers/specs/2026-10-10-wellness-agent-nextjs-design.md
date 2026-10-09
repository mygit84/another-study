# Wellness-агент: Next.js-обёртка — дизайн

## Цель

Превратить CLI-скрипт `agent/index.ts` в простое Next.js-приложение (App Router, `next@16.4.0`), не меняя логику агентов: промпты, `MAX_ROUNDS = 3`, Zod-схема ревью, повторный запрос при невалидном JSON и цикл ревизий остаются идентичными V0.

## Флоу

Пользователь вводит задачу → `POST /api/agent/run { task }` → `runHealthAgent(task)` → `{ plan, review: { verdict, score, issues }, rounds }` → UI показывает план и результат safety review.

## Размещение

Приложение живёт в `agent/` как отдельный проект со своим `package.json`. Корневой Vite-лендинг NutriOS не затрагивается. `agent/agent.js` и корневой скрипт `npm run agent` не меняются.

## Структура (`agent/`)

| Файл | Содержимое |
|------|------------|
| `app/layout.tsx` | минимальный корневой layout (обязателен для App Router) |
| `app/page.tsx` | клиентский компонент: textarea, кнопка Run Agent, блок результата |
| `app/api/agent/run/route.ts` | POST-эндпоинт, валидирует `task`, вызывает `runHealthAgent` |
| `src/agents/healthCoach.ts` | `COACH_PROMPT` + `createHealthCoach(model)` |
| `src/agents/safetyReviewer.ts` | `REVIEWER_PROMPT`, `ReviewSchema`, тип `Review`, `createSafetyReviewer(model)` |
| `src/harness/runHealthAgent.ts` | `connectProvider`, `ask`, `parseReview`, `review`, `MAX_ROUNDS`, цикл; экспортирует `runHealthAgent(task)` |
| `data/profile.md`, `data/log.md`, `data/output.md` | перенос через `git mv` |
| `index.ts` | тонкий CLI-враппер над `runHealthAgent` |
| `README.md` | запуск, решение по `index.ts` |
| `package.json`, `tsconfig.json` | служебные |

Больше файлов не создаётся. Исключение: `next.config.ts` с `serverExternalPackages`, и только если без него `@openai/agents` не собирается бандлером.

## Что меняется при переносе

Меняется только то, без чего код не работает в Next:

1. **Пути.** После бандлинга `new URL(..., import.meta.url)` указывает внутрь `.next/`, поэтому файлы читаются через `path.join(process.cwd(), 'data', name)`. `.env.local` грузится через `process.loadEnvFile(path.join(process.cwd(), '.env.local'))`. Next сам загружает `.env.local`, повторная загрузка не перезаписывает существующие переменные. Тексты ошибок прежние.
2. **Результат вместо `return`/`exitCode`.** `runHealthAgent(task)` возвращает `{ plan, review, rounds }`:
   - `approve`: план записан в `data/output.md`;
   - `needs_human_professional`: план не сохраняется;
   - три раунда без `approve`: возвращается последний план и последнее ревью (`verdict: "revise"`), `rounds: 3`, `output.md` не меняется.
   Ошибки (нет ключа, сбой ProxyAPI, дважды невалидный JSON ревьюера) пробрасываются исключением. `console.log` по раундам остаются и печатаются в терминал сервера.
3. **Агенты.** Создаются фабриками от `model`, как и в V0 (после `connectProvider()`).

## API

`POST /api/agent/run`, тело `{ task: string }`:
- `task` не непустая строка → `400 { error }`;
- успех → `200 { plan, review: { verdict, score, issues }, rounds }`;
- исключение → `500 { error: message }`.

## UI

- `status: 'idle' | 'running' | 'result'`; в состоянии running текст «Агент работает…», кнопка заблокирована.
- Result: либо ответ API, либо текст ошибки на месте блока результата.
- В блоке результата: финальный план (`<pre>` с `white-space: pre-wrap`, без markdown-рендерера), verdict, score, список issues, количество раундов.
- `needs_human_professional`: заметное предупреждение «Этот запрос требует консультации специалиста», план не показывается.
- Стили минимальные, инлайном.

## CLI

`npm run cli "задача"` → `tsx index.ts`, вызывает `runHealthAgent`, печатает итог. При ошибке или вердикте, отличном от `approve`, выходит с кодом 1.

## Зависимости и окружение

- Добавить `next@16.4.0`, `react`, `react-dom`, `typescript`, `@types/react`, `@types/node`. Оставить `@openai/agents`, `openai`, `zod`, `tsx`.
- Скрипты: `dev`, `build`, `start`, `cli`.
- В корневой `.gitignore` добавить `.next` и `next-env.d.ts`.

## Ограничения

Без стриминга, чата, истории, авторизации, БД и состояния между запросами. Новые возможности агентам не добавляются. Тесты не пишутся.

## Проверка

1. `tsc --noEmit` и `next build` проходят.
2. `npm run dev`, `curl -X POST /api/agent/run` с обычной задачей: ответ корректный, `data/output.md` обновлён.
3. Медицинская задача → `needs_human_professional`.
4. `npm run cli "..."` работает.
5. Ручная проверка UI в браузере.
