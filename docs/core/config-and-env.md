# Configuration & Environment (`APP_CONFIG`)

- **Source**: `src/config/app.config.ts`, `src/utils/config.ts`, `.env.example`

## Purpose

Centralizes all project-identity settings so adapting `base-vite` to a new application requires editing one file instead of searching for hardcoded strings across providers and components.

## Exports

### `src/config/app.config.ts`

```ts
export type SupportedLocale = 'en' | 'es';

export interface AppConfig {
  name: string;
  storagePrefix: string;
  defaultLocale: SupportedLocale;
  supportedLocales: readonly SupportedLocale[];
  apiBaseUrl: string;
}

export const APP_CONFIG: AppConfig;
```

- `APP_CONFIG.name`: Rendered in `AppShell` brand header.
- `APP_CONFIG.storagePrefix`: Prefix for all `localStorage` keys:
  - Theme key: `${APP_CONFIG.storagePrefix}-theme` (`src/styles/AppThemeProvider.tsx`)
  - Auth key: `${APP_CONFIG.storagePrefix}-auth` (`src/features/auth/authStorage.ts`)
  - Language key: `${APP_CONFIG.storagePrefix}-lang` (`src/i18n/index.ts`)
- `APP_CONFIG.defaultLocale` / `APP_CONFIG.supportedLocales`: Drives `i18next` initialization and `LanguageSwitcher` buttons.
- `APP_CONFIG.apiBaseUrl`: Resolved from `import.meta.env.VITE_API_URL` (fallback: `/api/v1` in dev, `http://localhost:3000/api/v1` in prod).

### `src/utils/config.ts`

Re-exports `env.apiBaseUrl` and `API_BASE_URL` from `APP_CONFIG.apiBaseUrl` for `httpClient`.

## Environment Variables (`.env`)

| Variable                | Description                                            | Default                 |
| ----------------------- | ------------------------------------------------------ | ----------------------- |
| `VITE_API_URL`          | Base URL used by Axios `httpClient`                    | `/api/v1`               |
| `VITE_API_PROXY_TARGET` | Dev server proxy target for `/api` in `vite.config.js` | `http://localhost:8000` |
