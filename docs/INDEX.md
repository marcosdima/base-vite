# Documentation Index (AI Agent Lookup Router)

Start here to locate the exact documentation and source files for any subsystem, UI primitive, headless hook, widget, or utility without scanning the entire repository.

## 1. Classification Decision Tree (Where Does New Code Belong?)

Before creating a new component or module, classify it using this three-tier rule:

1. **UI Primitive (`src/components/ui/`)** → Atomic, domain-agnostic visual building block bound to `theme.ts` tokens (and `@radix-ui/react-*` if complex ARIA/keyboard behavior is needed). Zero business state. See [`docs/ui/README.md`](./ui/README.md).
2. **Headless Hook (`src/hooks/`)** → Reusable state, lifecycle, or mathematical controller with **zero JSX and zero styling** so any page can render it freely. See [`docs/hooks/README.md`](./hooks/README.md).
3. **Widget (`src/components/widgets/`)** → Opinionated, self-contained module where the visual metaphor and interaction loop are inseparable (e.g., an interactive CLI terminal). Never create a widget for stateful logic that changes appearance per project (use a headless hook) or decorative card layouts (compose `ui/` primitives). See [`docs/widgets/README.md`](./widgets/README.md).

---

## 2. Task-to-Doc Quick Router

| If your task involves...                                         | Read this doc first                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Rebranding app name, storage keys, locales, or API URL           | [`docs/core/config-and-env.md`](./core/config-and-env.md)           |
| Adding a page, route, navigation link, or error fallback         | [`docs/core/routing-and-layout.md`](./core/routing-and-layout.md)   |
| Adding an RTK Query endpoint, Redux slice, or store hook         | [`docs/core/state-and-api.md`](./core/state-and-api.md)             |
| Modifying login/sign-in flow, token persistence, or route guards | [`docs/core/auth.md`](./core/auth.md)                               |
| Reading/extending theme tokens, light/dark mode, or typography   | [`docs/core/styling-and-tokens.md`](./core/styling-and-tokens.md)   |
| Adding translation keys (`en`/`es`) or language/theme toggles    | [`docs/core/i18n-and-switches.md`](./core/i18n-and-switches.md)     |
| Writing Vitest unit tests, using custom `render()`, or CI checks | [`docs/core/testing-and-quality.md`](./core/testing-and-quality.md) |

---

## 3. Catalog by Category

### Core Architecture (`docs/core/`)

| Subsystem         | Doc                                                            | Source Path                                                             | Summary                                                                                          |
| ----------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Config & Env      | [`core/config-and-env.md`](./core/config-and-env.md)           | `src/config/app.config.ts`, `src/utils/config.ts`                       | Central `APP_CONFIG`, storage prefix, locales, `API_BASE_URL`.                                   |
| Routing & Layout  | [`core/routing-and-layout.md`](./core/routing-and-layout.md)   | `src/app/router.tsx`, `src/components/layout/`                          | React Router v7 setup, `AppShell`, `ErrorBoundary`, `RouteErrorFallback`.                        |
| State & API       | [`core/state-and-api.md`](./core/state-and-api.md)             | `src/app/store.ts`, `src/app/hooks.ts`, `src/services/`                 | `createAppStore`, typed Redux hooks, Axios `httpClient`, shared `baseApi`.                       |
| Authentication    | [`core/auth.md`](./core/auth.md)                               | `src/features/auth/`, `src/components/auth/`, `src/services/authApi.ts` | Auth slice, `localStorage` persistence, RTK Query auth endpoints, `RequireAuth`, `AuthFormCard`. |
| Styling & Tokens  | [`core/styling-and-tokens.md`](./core/styling-and-tokens.md)   | `src/styles/`                                                           | `lightTheme`/`darkTheme` tokens, `AppThemeProvider`, `GlobalStyles`, `typography`.               |
| i18n & Switches   | [`core/i18n-and-switches.md`](./core/i18n-and-switches.md)     | `src/i18n/`, `src/components/switches/`                                 | Bilingual `en`/`es` resources, `LanguageSwitcher`, `ThemeChanger`.                               |
| Testing & Quality | [`core/testing-and-quality.md`](./core/testing-and-quality.md) | `src/test/render.tsx`, `eslint.config.js`, `package.json`               | All-provider `render()` test helper, Vitest, ESLint 10, Husky, Commitlint, `pnpm verify`.        |

### UI Primitives (`docs/ui/` → `@/components/ui`)

| Primitive      | Doc                              | Source Path                  | Summary                                                                        |
| -------------- | -------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| Boundary Guide | [`ui/README.md`](./ui/README.md) | `src/components/ui/index.ts` | Criteria for UI primitives and `@radix-ui/react-*` integration rules.          |
| `Badge`        | [`ui/badge.md`](./ui/badge.md)   | `src/components/ui/Badge/`   | Semantic pill badge (`neutral`, `accent`, `success`, `warning`, `error`).      |
| `Button`       | [`ui/button.md`](./ui/button.md) | `src/components/ui/Button/`  | Action button (`primary`, `secondary`, `ghost`, `danger`, sizes, `isLoading`). |
| `Card`         | [`ui/card.md`](./ui/card.md)     | `src/components/ui/Card/`    | Surface container (`default`, `muted`, `elevated`, configurable padding).      |
| `Input`        | [`ui/input.md`](./ui/input.md)   | `src/components/ui/Input/`   | Accessible text field with `label`, `hint`, `error` alert, and `leftIcon`.     |
| `Stack`        | [`ui/stack.md`](./ui/stack.md)   | `src/components/ui/Stack/`   | Flex layout container driven by `theme.spacing` tokens.                        |
| `Tabs`         | [`ui/tabs.md`](./ui/tabs.md)     | `src/components/ui/Tabs/`    | Accessible tabbed interface wrapping `@radix-ui/react-tabs`.                   |

### Headless Hooks (`docs/hooks/` → `@/hooks`)

| Hook           | Doc                                                | Source Path                | Summary                                                                                                  |
| -------------- | -------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Boundary Guide | [`hooks/README.md`](./hooks/README.md)             | `src/hooks/index.ts`       | Criteria for UI-agnostic state and behavior hooks.                                                       |
| `usePlayback`  | [`hooks/use-playback.md`](./hooks/use-playback.md) | `src/hooks/usePlayback.ts` | Step-by-step timeline controller (`play`, `pause`, `prev`, `next`, `speed`, `reset`).                    |
| `usePoll`      | [`hooks/use-poll.md`](./hooks/use-poll.md)         | `src/hooks/usePoll.ts`     | Voting state controller (`options`, `percentage`, `totalVotes`, `leadingOptionId`, `vote`, `addOption`). |

### Widgets (`docs/widgets/` → `@/components/widgets`)

| Widget         | Doc                                            | Source Path                        | Summary                                                                         |
| -------------- | ---------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| Boundary Guide | [`widgets/README.md`](./widgets/README.md)     | `src/components/widgets/index.ts`  | Strict widget definition and anti-patterns (what must NOT be a widget).         |
| `Terminal`     | [`widgets/terminal.md`](./widgets/terminal.md) | `src/components/widgets/Terminal/` | Interactive CLI emulator with command registry, built-in commands, and history. |

### Utilities (`docs/utils/` → `@/utils/*`)

| Utility Module  | Doc                                                      | Source Path                                 | Summary                                                                                                        |
| --------------- | -------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Bezier Geometry | [`utils/bezier.md`](./utils/bezier.md)                   | `src/utils/bezier.ts`                       | Bernstein Bezier evaluation, box edge anchors, and SVG arrow path computation.                                 |
| Formatting      | [`utils/format.md`](./utils/format.md)                   | `src/utils/format.ts`                       | `formatBytes`, localized number formatting (`fmt`), and zero-padded hex (`fmtHex`).                            |
| Motion & FLIP   | [`utils/motion.md`](./utils/motion.md)                   | `src/utils/motion.ts`                       | Reduced-motion detection, straight-line FLIP (`animateFlip`), and Bezier path animation (`animateAlongCurve`). |
| Math & Random   | [`utils/math-and-random.md`](./utils/math-and-random.md) | `src/utils/range.ts`, `src/utils/random.ts` | Logarithmic slider mapping, range summarization with gaps, `hash32`, and deterministic `SeededRandom`.         |
