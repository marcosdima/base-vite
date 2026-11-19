# Routing, Layout & Error Resilience

- **Source**: `src/app/router.tsx`, `src/components/layout/AppShell/`, `src/components/layout/ErrorBoundary/`, `src/pages/`

## Route Map (`src/app/router.tsx`)

Built with React Router v7 `createBrowserRouter`. All routes render inside `<AppShell />` and are protected by `errorElement: <RouteErrorFallback />`.

| Path          | Page Component                                 | Access                      | Purpose                                                                  |
| ------------- | ---------------------------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| `/`           | `HomePage` (`src/pages/HomePage/`)             | Public                      | Minimal landing view ready for project features.                         |
| `/playground` | `PlaygroundPage` (`src/pages/PlaygroundPage/`) | Public                      | Categorized visual testbench for tokens, primitives, hooks, and widgets. |
| `/login`      | `LoginPage` (`src/pages/LoginPage.tsx`)        | Public                      | Renders `<AuthFormCard mode="login" />`.                                 |
| `/signin`     | `SignInPage` (`src/pages/SignInPage.tsx`)      | Public                      | Renders `<AuthFormCard mode="signin" />`.                                |
| `/dashboard`  | `DashboardPage` (`src/pages/DashboardPage/`)   | Protected (`<RequireAuth>`) | Authenticated user profile and session overview.                         |
| `*`           | `NotFoundPage` (`src/pages/NotFoundPage/`)     | Public                      | 404 fallback with link back to `/`.                                      |

## Layout Components

### `AppShell` (`src/components/layout/AppShell/`)

Sticky top navigation bar displaying `APP_CONFIG.name`, primary navigation links (`primaryLinks`), conditional guest links (`secondaryLinks`), `<LanguageSwitcher />`, `<ThemeChanger />`, logout action when authenticated, and `<main><Outlet /></main>`.

### `ErrorBoundary` & `RouteErrorFallback` (`src/components/layout/ErrorBoundary/`)

- `ErrorBoundary`: React class error boundary wrapping `<Provider>` and `<RouterProvider>` in `src/main.tsx`. Catches unexpected render errors and provides Retry / Go Home actions.
- `RouteErrorFallback`: Mounted as `errorElement` on the root route in `src/app/router.tsx` to catch router loader/action/render errors with the same themed card UI.

## Adding a New Page

1. Create `src/pages/<PageName>/` with `<PageName>.tsx`, `<PageName>.styles.ts`, and `index.ts`.
2. Register the route in `src/app/router.tsx` (wrap in `<RequireAuth>` if private).
3. Add a link to `primaryLinks` in `src/components/layout/AppShell/AppShell.tsx` and add `en` + `es` labels in `src/i18n/resources.ts`.
