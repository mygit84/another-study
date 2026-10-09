# Wellness Agent

Next.js-приложение над двумя агентами. Health Coach составляет wellness-план по задаче, профилю и дневнику. Safety Reviewer проверяет план и возвращает вердикт. Если ревьюер просит правок, коуч переделывает план; всего не больше трёх раундов.

## Запуск

```bash
cd agent
npm install
```

Создайте `agent/.env.local`:

```
PROXYAPI_API_KEY=ваш-ключ
# необязательно, по умолчанию deepseek/deepseek-v4.1-flash
PROXYAPI_MODEL=deepseek/deepseek-v4.1-flash
```

- `npm run dev` запускает UI на http://localhost:3000: введите задачу и нажмите **Run Agent**.
- `npm run cli -- "составь план питания на завтра"` запускает тот же цикл из терминала.

Если план одобрен (`approve`), он сохраняется в `data/output.md`.

## Флоу

UI → `POST /api/agent/run { task }` → `runHealthAgent(task)` → `{ plan, review: { verdict, score, issues }, rounds }`.

- `approve`: показывается план, он записан в `data/output.md`.
- `revise` после трёх раундов: показываются последний план и замечания, `output.md` не меняется.
- `needs_human_professional`: показывается предупреждение «Этот запрос требует консультации специалиста», план скрыт.
- Ошибка (нет ключа, сбой провайдера, невалидный ответ ревьюера): `500 { error }`, текст ошибки виден в UI.

## Структура

```
app/page.tsx                   страница: задача, Run Agent, результат
app/api/agent/run/route.ts     POST-эндпоинт
src/agents/healthCoach.ts      промпт и фабрика коуча
src/agents/safetyReviewer.ts   промпт, Zod-схема ревью и фабрика ревьюера
src/harness/runHealthAgent.ts  провайдер, проверка JSON и цикл ревизий
data/                          profile.md, log.md, output.md
index.ts                       CLI-обёртка
```

## Почему `index.ts` оставлен тонким CLI-враппером

Можно было удалить `index.ts`, но он оставлен как обёртка над `runHealthAgent` примерно в 20 строк. Причины:

- цикл агентов можно быстро проверить из терминала, без dev-сервера и браузера;
- видно, что harness не зависит от Next: UI и CLI вызывают одну и ту же функцию, логика живёт в одном месте.

Цикл, промпты и сообщения в консоли перенесены из V0 без изменений. Коды выхода CLI тоже как в V0: 1 при ошибке или если план не одобрен за три раунда.
