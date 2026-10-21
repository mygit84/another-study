# Правила репозитория

В репозитории два независимых проекта:

- Корень — лендинг NutriOS: одностраничный React-сайт со статическим пре-рендером. `SPEC.md` — главный документ требований; при конфликте разделов приоритет такой: §2 Безопасность → §11 Критерии приёмки → всё остальное.
- `agent/` — wellness-агент «Ешь, гуляй и спи», отдельное Next.js 16 App Router приложение со своими `package.json`, `tsconfig.json` и `node_modules`. С лендингом в рантайме ничего не делит. Его дизайны и планы лежат в `docs/superpowers/specs/` и `docs/superpowers/plans/`.

Всё до раздела «Wellness-агент» относится только к лендингу.

## Структура проекта и модули

- `src/main.tsx` экспортирует `createRoot` через `vite-react-ssg/single-page`: страница пре-рендерится в `dist/index.html`, затем гидрируется. Код, обращающийся к `window`, `document`, `matchMedia` или `IntersectionObserver`, должен выполняться только внутри `useEffect`, иначе пре-рендер ломается.
- `src/App.tsx` выстраивает секции по порядку внутри `WaitlistProvider` и `DemoProvider` (`src/context/`).
- Все тексты для пользователя лежат в `src/content/ru.ts`. Никогда не пишите строковые литералы в JSX.
- Интерактивное демо (`src/components/app-shell/`) управляется `DemoContext` и статическими данными из `src/mock/demo-data.ts`. Бэкенда нет.
- Поведение CTA (`onboarding` или `waitlist`) и вариант заголовка hero — фича-флаги в `src/lib/config.ts`. `track()` в `src/lib/analytics.ts` — заглушка без действий с типизированным объединением событий; новые события добавляйте туда.
- Каждый компонент — папка с `Name.tsx`, `Name.module.scss` (можно опустить, если стили полностью покрыты Tailwind) и `index.ts`; папки сгруппированы в `ui/`, `sections/`, `app-shell/` и `backgrounds/`. Никогда не импортируйте стили одного компонента в другой.
- `src/components/backgrounds/` — декоративные анимированные фоны на утилитах Tailwind CSS v4 (без `.module.scss`). Они `aria-hidden`, `pointer-events-none`, анимируются только через `motion-safe:` и берут цвета только из токенов. Фон передаётся в `Section` через проп `background`.

## Сборка, тесты и разработка

- `npm start`: dev-сервер Vite на 127.0.0.1.
- `npm run build`: `tsc -b`, затем SSG-сборка в `dist/`.
- `npm run preview`: раздача собранной версии.
- `npm run lint`: oxlint, Stylelint по `src/**/*.scss` и проверка текстов.
- `npm run check-copy:html`: дополнительно проверяет собранные `dist/**/*.html` (запускать после `build`).
- `npm run agent`: старое отдельное демо исполнителя и ревьюера `agent/agent.js`, не связано с Next.js-приложением.

oxlint в `npm run lint` проверяет и `agent/`. Предупреждение `only-export-components` на `agent/app/layout.tsx` (экспорт `metadata`, которого требует Next.js) ожидаемое.

Тест-раннера в репозитории пока нет.

## Проверка текстов на безопасность

`scripts/check-copy.ts` падает на медицинских стоп-словах и словах о снижении веса (например, «лечение», «диагноз», «похуде», «гарантир») в `src/content/**`, `src/mock/**` и в собранном HTML. Эти слова разрешены только под ключами контента, где они стоят с отрицанием: `disclaimer*` и `faq.items.medical.*` / `faq.items.weight.*`. Никогда не добавляйте игнор на уровне файла. Текст дисклеймера в футере зафиксирован дословно в SPEC §2.3.

## Стиль кода и именование

- TypeScript в режиме `strict` с `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (используйте `import type`) и `erasableSyntaxOnly` (без enum и namespace). Импорты через алиас `@/`.
- oxlint следит за `react/rules-of-hooks`. Файлы должны экспортировать только компоненты; экспорт констант разрешён.
- SCSS (Stylelint `standard-scss`):
  - Только `@use`/`@forward`; `@import` и `@extend` запрещены.
  - Никаких hex- и именованных цветов вне `_tokens.scss`. Никакого `!important` вне `_mixins.scss`/`global.scss`.
  - Глубина вложенности не больше 3. Без ID-селекторов.
  - Имена классов в camelCase (`.mealCardActive`), комбинируются через `clsx`.
- Tailwind подключается из `src/styles/tailwind.css` без preflight, в CSS-слоях, поэтому SCSS-модули всегда побеждают. Его `@theme inline` отображает токены (`--color-aurora-1` → `var(--aurora-1)`), хранит keyframes фонов, отключает стандартную палитру и размеры шрифтов Tailwind и использует те же брейкпоинты, что `_breakpoints.scss` (`sm:` ≡ `up(sm)`). Шкала отступов уже совпадает (`gap-4` = `--space-4` = 16px).
- Tailwind можно использовать везде, но только там, где польза больше вреда. Если сомневаетесь — SCSS.
  - Польза (берите Tailwind): простая раскладка и отступы (`flex`, `grid`, `gap-*`, `p-*`, `m-*`), размеры, позиционирование, видимость и адаптивные правки, которые иначе потребовали бы однострочный класс в модуле или стали бы единственной причиной завести `.module.scss`.
  - Вред (берите SCSS-модули): типографика (миксины `text-h1`…`text-small`), любой цвет, не отображённый в токен в `@theme`, произвольные значения (`w-[37px]`, `bg-[#fff]`; единственное исключение — декоративные фоны в `src/components/backgrounds/`), состояния и варианты через `clsx`, псевдоэлементы, сложные селекторы и списки длиннее примерно 6 утилит.
  - Никогда не задавайте одно и то же свойство одному элементу и из Tailwind, и из класса модуля: модуль молча победит. У каждого свойства элемента один источник.
  - Stylelint не видит классы Tailwind, поэтому правила токенов и цветов выше соблюдайте вручную.
- `src/styles/_index.scss` автоматически подключается в каждый модуль и должен только делать `@forward` партиалов; он не должен генерировать CSS. Вместо сырых размеров шрифта, цветов и отступов используйте миксины типографики (`text-h1`…`text-small`) и токены.

## Wellness-агент (`agent/`)

Все команды запускайте изнутри `agent/`: harness ищет `.env.local` и `data/*.md` относительно `process.cwd()`.

- `npm run dev` / `npm run build` / `npm start`: Next.js-приложение. `npm run cli -- "<задача>"`: тот же цикл агентов из терминала.
- В `agent/.env.local` обязателен `PROXYAPI_API_KEY` (`PROXYAPI_MODEL` — по желанию). LLM вызывается через OpenAI-совместимый эндпоинт ProxyAPI с помощью `@openai/agents`.
- Флоу: `app/page.tsx` → `POST /api/agent/run { task }` → `runHealthAgent` в `src/harness/runHealthAgent.ts` → `{ plan, review: { verdict, score, issues }, rounds }`. Промпты коуча и ревьюера — в `src/agents/`. Цикл длится не больше 3 раундов; `data/output.md` записывается только при вердикте `approve`. При вердикте `needs_human_professional` UI скрывает план.
- Не меняйте промпты и логику цикла, если задача не касается агентов напрямую. UI и `index.ts` (CLI) вызывают один и тот же harness, поэтому логика живёт там, а не в route или странице.
- Стили — обычный CSS в `app/globals.css` с именами токенов лендинга и его шрифтами Manrope/Unbounded (через `next/font`). Tailwind и SCSS здесь нет; Stylelint и проверка текстов лендинга на `agent/` не запускаются.
- `agent/AGENTS.md` пересоздаётся `next dev` и указывает на документацию в `agent/node_modules/next/dist/docs/`. Читайте её, прежде чем трогать API Next.js.
- Тестов здесь тоже нет. Проверка: `npx tsc --noEmit`, `npm run build` и реальный запрос.

## Коммиты и pull request'ы

Темы коммитов короткие, на русском, с заглавной буквы. Работа над агентом идёт с префиксом «Wellness-агент: …» (например, «Wellness-агент: Next.js UI и эндпоинт /api/agent/run»). Feature-ветки называются `Feature/<n>`. Спека и план коммитятся до реализации.

## Принципы кодовой базы

- Поддерживать кодовую базу в высокомодульном состоянии и с хорошей документацией.  
- Следовать принципу «разделения ответственности» (separation of concerns).
