# AGENTS.md

Guidelines for AI coding agents working in this repository.

## 1. Language & Communication

- **Always respond to the user in English**, regardless of the prompt's language.
- Write **all code, comments, JSDoc/docstrings, tests, commit messages, and documentation in English**.
- User-facing UI strings are multilingual (`en` and `es` built in). Every visible UI string must be added to **both** `en` and `es` in `src/i18n/resources.ts`.

## 2. Stack & Hard Constraints

- **Build & Runtime**: Vite 8, React 19, TypeScript (`strict: true`).
- **Routing**: React Router v7 (`createBrowserRouter` in `src/app/router.tsx`).
- **State & Data**: Redux Toolkit + RTK Query (`baseApi` in `src/services/baseApi.ts`) + Axios (`src/services/httpClient.ts`).
- **Styling**: `styled-components` v6 with semantic design tokens in `src/styles/theme.ts` (`lightTheme` / `darkTheme`), plus `motion` for animation, `@radix-ui/react-*` for complex accessible primitives, and `react-icons` for icons.
- **Testing**: Vitest + `@testing-library/react` using the custom `render` helper in `src/test/render.tsx`.
- **Package Manager**: `pnpm` (`pnpm@12.11.2`).
  - `pnpm 12` enforces `minimumReleaseAge: 1440` (24 hours). Never disable or bypass this policy. If an install fails with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, pin a release older than 24 hours.
- **Commits**: Conventional Commits enforced via Husky + Commitlint (`commitlint.config.js`).
  - Format: `<type>(<optional-scope>): <imperative lowercase summary>` (e.g., `feat(ui): add Tabs primitive`, `refactor(hooks): extract headless usePoll hook`, `docs: update roadmap`).
  - Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`, `style`, `perf`, `build`, `revert`.
  - Keep commits atomic and scoped by concern (docs/tooling, core plumbing, UI primitives, hooks, widgets, pages).

## 3. Architecture & Folder Ownership

Follow the strict three-tier boundary between **UI Primitives**, **Headless Hooks**, and **Widgets**:

- **UI Primitive (`src/components/ui/`)**: Low-level visual building blocks bound to `theme.ts` (`Button`, `Input`, `Card`, `Badge`, `Stack`, `Tabs`). Zero domain logic.
- **Headless Hook (`src/hooks/`)**: Reusable state and behavior logic with **zero UI assumptions** (`usePlayback`, `usePoll`), so any feature can render it with custom layouts, colors, or primitives.
- **Widget (`src/components/widgets/`)**: Only for opinionated, self-contained UI + behavior modules where the visual metaphor itself is the component (`Terminal`).

| Path                       | Purpose                                                                                                      | Rules                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `src/config/app.config.ts` | Central project identity (`name`, `storagePrefix`, locales, API base URL)                                    | Edit here first when adapting the starter to a new project.               |
| `src/app/`                 | Global wiring (`store.ts`, `hooks.ts`, `router.tsx`)                                                         | Use `useAppDispatch` / `useAppSelector` from `@/app/hooks`.               |
| `src/components/ui/`       | Core, project-agnostic UI primitives (`Button`, `Input`, `Card`, `Badge`, `Stack`, `Tabs`)                   | Compose these first before creating bespoke styled elements.              |
| `src/components/widgets/`  | Self-contained, general-purpose optional modules (`Terminal`)                                                | Keep domain-agnostic and ready to drop into any page.                     |
| `src/components/layout/`   | Shell & resilience (`AppShell`, `ErrorBoundary`)                                                             | Keep navigation declarative in `AppShell`.                                |
| `src/components/auth/`     | Auth UI and route guards (`AuthFormCard`, `RequireAuth`)                                                     | —                                                                         |
| `src/components/switches/` | Global UI toggles (`LanguageSwitcher`, `ThemeChanger`)                                                       | —                                                                         |
| `src/features/`            | Domain Redux slices and persistence helpers (`auth/`)                                                        | Export selectors and actions cleanly from each slice.                     |
| `src/services/`            | API client & RTK Query endpoints (`httpClient.ts`, `baseApi.ts`, `authApi.ts`)                               | Inject new endpoints onto `baseApi` via `baseApi.injectEndpoints(...)`.   |
| `src/styles/`              | Design tokens and global CSS (`theme.ts`, `GlobalStyles.ts`, `typography.ts`, `AppThemeProvider.tsx`)        | Never put component-specific styles here.                                 |
| `src/pages/`               | Route-level views (`HomePage`, `PlaygroundPage`, `DashboardPage`, `LoginPage`, `SignInPage`, `NotFoundPage`) | Each multi-file page lives in its own folder with colocated styles.       |
| `src/hooks/`               | Reusable headless React hooks (`usePlayback`, `usePoll`)                                                     | Keep UI-agnostic and unit-tested with `renderHook`.                       |
| `src/i18n/`                | i18next initialization and `resources.ts`                                                                    | Keep `en` and `es` keys in sync.                                          |
| `src/test/`                | Vitest setup (`setup.ts`) and wrapper (`render.tsx`)                                                         | Always import `render`, `screen`, `fireEvent`, etc. from `@/test/render`. |
| `src/utils/`               | Pure, domain-agnostic utility functions                                                                      | Keep side-effect-free and unit-tested.                                    |

## 4. Canonical Patterns (Single Way per Concern)

1. **Imports**: Use the `@/` path alias (`@/components/ui`, `@/app/hooks`) for cross-directory imports, and `./` for files inside the same folder.
2. **Style Colocation**: Every styled component or page owns a colocated `ComponentName.styles.ts` file inside its folder (`ComponentName/ComponentName.tsx`, `ComponentName.styles.ts`, `ComponentName.test.tsx`, `index.ts`). Prefix custom styled-components props with `$` (`$variant`, `$active`) so they are not forwarded to the DOM.
3. **Theme Tokens**: Read colors, fonts, font sizes, spacing, radii, breakpoints, z-index, and transitions from `theme` in `src/styles/theme.ts`. Avoid hardcoded hex colors in app/primitive UI unless representing intentional brand accents.
4. **Complex Interactive UI**: Never hand-roll focus traps, portals, keyboard navigation, or ARIA state machines for **Modals/Dialogs, Dropdowns, Tabs, Selects, Tooltips, or Popovers**. Install the corresponding `@radix-ui/react-*` primitive and style it with `styled-components` + theme tokens (see `src/components/ui/Tabs/` as the reference implementation).
5. **Drag and Drop**: Never hand-roll raw HTML5 `draggable` / `dataTransfer` boards. When a project requires drag-and-drop or sortable containers, use `@dnd-kit/core` + `@dnd-kit/sortable` (or `motion`'s `Reorder` for single-axis lists).
6. **Typed Redux**: Never import raw `useDispatch` or `useSelector` in components or pages; always use `useAppDispatch` and `useAppSelector` from `@/app/hooks`.
7. **RTK Query Endpoints**: Never create a second `createApi` store slice for REST endpoints. Inject endpoints via `baseApi.injectEndpoints(...)` in `src/services/<domain>Api.ts` and register cache tags cleanly.
8. **Visual Testing Playground**: Add new UI primitives, headless hooks, or general-purpose widgets to `src/pages/PlaygroundPage/PlaygroundPage.tsx` under the corresponding tab (`primitives`, `tokens`, `hooks`, `widgets`) so they can be visually verified in both light and dark themes at `/playground`.

## 5. Task Recipes

- **Add a UI Primitive** (`src/components/ui/<Name>/`):
  1. Create `<Name>.styles.ts`, `<Name>.tsx`, `<Name>.test.tsx`, and `index.ts`.
  2. Re-export from `src/components/ui/index.ts`.
  3. Showcase all variants/states in the `primitives` tab of `src/pages/PlaygroundPage/PlaygroundPage.tsx`.
- **Add a Headless Hook** (`src/hooks/use<Name>.ts`):
  1. Implement UI-agnostic state and actions in `src/hooks/use<Name>.ts` with unit tests in `src/hooks/use<Name>.test.ts`.
  2. Re-export from `src/hooks/index.ts` and mount an interactive demo in the `hooks` tab of `PlaygroundPage`.
- **Add a General-Purpose Widget** (`src/components/widgets/<Name>/`):
  1. Keep all state/styles/types self-contained inside the folder with an `index.ts` barrel.
  2. Re-export from `src/components/widgets/index.ts` and mount a demo in the `widgets` tab of `PlaygroundPage`.
- **Add a Page / Route**:
  1. Create `src/pages/<PageName>/` with `<PageName>.tsx`, `<PageName>.styles.ts`, `index.ts` (and `<PageName>.test.tsx` when interactive).
  2. Register the route in `src/app/router.tsx` (wrap with `<RequireAuth>` if private).
  3. Add navigation link in `src/components/layout/AppShell/AppShell.tsx` if needed, and add `en` + `es` keys in `src/i18n/resources.ts`.
- **Add an API Endpoint**:
  1. Create `src/services/<domain>Api.ts` using `baseApi.injectEndpoints(...)`.
  2. Add unit tests using `createAppStore()` from `@/app/store` and mocking `@/services/httpClient`.
- **Add a UI Language**:
  1. Add the locale code to `SupportedLocale` and `APP_CONFIG.supportedLocales` in `src/config/app.config.ts`.
  2. Add the matching translation tree in `src/i18n/resources.ts`.

## 6. Definition of Done

Before concluding any task, run the full verification suite and confirm all checks pass:

```bash
pnpm verify
```

`pnpm verify` executes `lint`, `format:check`, `typecheck`, `test`, and `build` in sequence (matching `.github/workflows/ci.yml`).
