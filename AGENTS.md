# Repository Guidelines

NutriOS landing page: a single-page, statically pre-rendered React site. `SPEC.md` is the authoritative requirements document; when sections conflict, priority is §2 Safety → §11 Acceptance criteria → everything else.

## Project Structure & Module Organization

- `src/main.tsx` exports `createRoot` via `vite-react-ssg/single-page`, so the page is pre-rendered to `dist/index.html` and then hydrated. Code that touches `window`, `document`, `matchMedia` or `IntersectionObserver` must run only inside `useEffect`, or the pre-render breaks.
- `src/App.tsx` puts the sections in order inside `WaitlistProvider` and `DemoProvider` (`src/context/`).
- All user-facing text lives in `src/content/ru.ts`. Never write string literals into JSX.
- The interactive demo (`src/components/app-shell/`) is driven by `DemoContext` and the static data in `src/mock/demo-data.ts`. There is no backend.
- CTA behaviour (`onboarding` vs `waitlist`) and the hero title variant are feature flags in `src/lib/config.ts`. `src/lib/analytics.ts` `track()` is a no-op stub with a typed event union; add new events there.
- Each component is a folder with `Name.tsx`, `Name.module.scss` (may be omitted when Tailwind fully covers the styling) and `index.ts`, grouped into `ui/`, `sections/`, `app-shell/` and `backgrounds/`. Never import one component's styles into another.
- `src/components/backgrounds/` holds decorative animated backgrounds styled with Tailwind CSS v4 utilities (no `.module.scss` needed there). They are `aria-hidden`, `pointer-events-none`, animate only via `motion-safe:` and take colors only from tokens. Pass one to `Section` via its `background` prop.

## Build, Test, and Development Commands

- `npm start`: Vite dev server on 127.0.0.1.
- `npm run build`: `tsc -b`, then the SSG build into `dist/`.
- `npm run preview`: serve the build.
- `npm run lint`: oxlint, Stylelint on `src/**/*.scss`, and the copy check.
- `npm run check-copy:html`: also scan the built `dist/**/*.html` (run after `build`).

The repo has no test runner yet.

## Safety Copy Check

`scripts/check-copy.ts` fails on medical or weight-loss stop words (for example «лечение», «диагноз», «похуде», «гарантир») anywhere in `src/content/**`, in `src/mock/**` and in the built HTML. These words are allowed only under content keys where they are negated: `disclaimer*` and `faq.items.medical.*` / `faq.items.weight.*`. Never add a file-level ignore. The footer disclaimer text is fixed verbatim in SPEC §2.3.

## Coding Style & Naming Conventions

- TypeScript is `strict` with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (use `import type`) and `erasableSyntaxOnly` (no enums or namespaces). Import via the `@/` alias.
- oxlint enforces `react/rules-of-hooks`. Files should export only components; exporting constants is allowed.
- SCSS (Stylelint `standard-scss`):
  - Use only `@use`/`@forward`; `@import` and `@extend` are banned.
  - No hex or named colors outside `_tokens.scss`. No `!important` outside `_mixins.scss`/`global.scss`.
  - Nesting depth is at most 3. No ID selectors.
  - Class names are camelCase (`.mealCardActive`), combined with `clsx`.
- Tailwind is loaded from `src/styles/tailwind.css` without preflight, in CSS layers, so SCSS Modules always win. Its `@theme inline` maps tokens (`--color-aurora-1` → `var(--aurora-1)`), holds the background keyframes, disables Tailwind's default palette and font sizes, and uses the same breakpoints as `_breakpoints.scss` (`sm:` ≡ `up(sm)`). The spacing scale already matches (`gap-4` = `--space-4` = 16px).
- Tailwind is allowed anywhere, but only where the benefit outweighs the harm. When in doubt, use SCSS.
  - Benefit (use Tailwind): simple layout and spacing (`flex`, `grid`, `gap-*`, `p-*`, `m-*`), sizing, positioning, visibility and responsive tweaks that would otherwise need a one-line module class, or would be the only reason a component has a `.module.scss`.
  - Harm (use SCSS Modules): typography (use the `text-h1`…`text-small` mixins), any color not mapped to a token in `@theme`, arbitrary values (`w-[37px]`, `bg-[#fff]`; the only exception is the decorative backgrounds in `src/components/backgrounds/`), states and variants built with `clsx`, pseudo-elements, complex selectors, and class lists longer than about 6 utilities.
  - Never set the same property on one element from both Tailwind and a module class: the module silently wins. One element keeps one source per property.
  - Stylelint does not see Tailwind classes, so the token and color rules above must be followed by hand.
- `src/styles/_index.scss` is auto-injected into every module and must only `@forward` partials; it must emit no CSS. Use the typography mixins (`text-h1`…`text-small`) and tokens instead of raw font sizes, colors or spacing.

## Commit & Pull Request Guidelines

The history has one commit, with a short Russian, sentence-case subject («Первый вариант лендинга»). Feature branches use the form `Feature/<n>`.
