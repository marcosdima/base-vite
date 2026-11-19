# base-vite

AI-agent-first starter template built with **Vite 8 + React 19 + TypeScript**.

Designed to launch new React applications quickly with minimal boilerplate, strict quality guardrails, clear architectural conventions, and a categorized `/playground` for visual testing.

## Stack

| Layer                   | Technology                                                                                            | Version |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ------- |
| Build tool              | [Vite](https://vitejs.dev/)                                                                           | ^8.3.4  |
| Framework               | [React](https://react.dev/)                                                                           | ^19.3.1 |
| Router                  | [React Router](https://reactrouter.com/)                                                              | ^7.18.4 |
| Global state            | [Redux Toolkit](https://redux-toolkit.js.org/)                                                        | ^2.13.0 |
| API / Data fetching     | [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) + [Axios](https://axios-http.com/)       | ^1.20.0 |
| Internationalization    | [i18next](https://www.i18next.com/) (`en` + `es`)                                                     | ^26.5.3 |
| Animation               | [Motion](https://motion.dev/)                                                                         | ^14.4.0 |
| Styling & Accessible UI | [Styled Components](https://styled-components.com/) + [Radix UI](https://www.radix-ui.com/primitives) | ^6.6.0  |
| Icons                   | [React Icons](https://react-icons.github.io/react-icons/)                                             | ^5.7.0  |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start the dev server
pnpm dev
```

Open `/playground` in the running app to switch between **UI Primitives**, **Design Tokens**, **Headless Hooks**, and **Widgets** in both light and dark modes.

## Adapting the Template to a New Project

1. Edit [`src/config/app.config.ts`](src/config/app.config.ts) to set `name`, `storagePrefix`, `defaultLocale`, and `supportedLocales`.
2. Update `<title>` in [`index.html`](index.html).
3. Customize palette, fonts, spacing, and radii in [`src/styles/theme.ts`](src/styles/theme.ts).
4. Point `VITE_API_URL` / `VITE_API_PROXY_TARGET` in `.env` to your backend.

## Available Commands

```bash
pnpm dev           # Start Vite dev server
pnpm build         # Production build
pnpm preview       # Preview production build
pnpm lint          # Run ESLint
pnpm lint:fix      # Run ESLint with auto-fix
pnpm format        # Format files with Prettier
pnpm format:check  # Check formatting with Prettier
pnpm typecheck     # Run TypeScript compiler check
pnpm test          # Run Vitest unit tests once
pnpm test:watch    # Run Vitest in watch mode
pnpm verify        # Full CI check: lint + format:check + typecheck + test + build
```

## Project Structure

```text
src/
├── app/                 # Store factory (createAppStore), typed hooks, React Router config
├── components/
│   ├── auth/            # AuthFormCard and RequireAuth route guard
│   ├── layout/          # AppShell and ErrorBoundary / RouteErrorFallback
│   ├── switches/        # LanguageSwitcher and ThemeChanger
│   ├── ui/              # Core token-driven primitives (Badge, Button, Card, Input, Stack, Tabs)
│   └── widgets/         # Optional plug-and-play widgets (Terminal)
├── config/              # Central project configuration (app.config.ts)
├── features/            # Domain Redux slices and storage helpers (auth/)
├── hooks/               # Reusable headless hooks (usePlayback, usePoll)
├── i18n/                # i18next initialization and en/es translation resources
├── pages/               # Route pages (HomePage, PlaygroundPage, DashboardPage, LoginPage, SignInPage, NotFoundPage)
├── services/            # Axios client, shared baseApi, and injected RTK Query endpoints
├── styles/              # Theme tokens (light/dark), GlobalStyles, typography, AppThemeProvider
├── test/                # Vitest setup and custom render() wrapper with Redux, Router, Theme, i18n
└── utils/               # Pure, domain-agnostic utilities
```

## Environment Variables

| Variable                | Description                             | Default                 |
| ----------------------- | --------------------------------------- | ----------------------- |
| `VITE_API_URL`          | Base REST API URL                       | `/api/v1` (dev)         |
| `VITE_API_PROXY_TARGET` | Vite dev server proxy target for `/api` | `http://localhost:8000` |

## Code Quality & Dependency Policy

- **AI Agent Rules**: See [`AGENTS.md`](AGENTS.md) for canonical conventions, folder ownership, and task recipes.
- **Detailed Element Documentation**: See [`docs/INDEX.md`](docs/INDEX.md) for categorized documentation of every core subsystem, UI primitive, headless hook, widget, and utility.
- **Next Steps & Backlog**: See [`ROADMAP.md`](ROADMAP.md) for tracked backlog and future enhancements.
- **Quality Gates**: TypeScript strict mode, ESLint 10 flat config (`js/jsx` + `ts/tsx` + `jsx-a11y`), Prettier, Vitest + Testing Library, Husky pre-commit (`lint-staged`), and Commitlint (conventional commits).
- **Commit Convention**: Follow `<type>(<optional-scope>): <imperative lowercase summary>` (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`), enforced by Commitlint (`commitlint.config.js`).
- **pnpm 12 Release Age Policy**: `pnpm 12` enforces `minimumReleaseAge: 1440` (24 hours) by default. If `pnpm install` fails with `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, wait until the package passes the 24-hour window or select an older version rather than disabling the safeguard.
- **Workspace Peer Rules**: `pnpm-workspace.yaml` only configures `peerDependencyRules.allowedVersions` for `eslint-plugin-react` and `eslint-plugin-jsx-a11y` compatibility with ESLint 10.
