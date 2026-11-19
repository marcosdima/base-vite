# Internationalization (i18n) & Global Switches

- **Source**: `src/i18n/index.ts`, `src/i18n/resources.ts`, `src/components/switches/`
- **Tests**: `src/components/switches/LanguageSwitcher.test.tsx`, `src/components/switches/ThemeChanger.test.tsx`

## i18next Configuration (`src/i18n/`)

- Configured in `src/i18n/index.ts` with `i18next-browser-languagedetector` and `react-i18next`.
- Reads `fallbackLng: APP_CONFIG.defaultLocale` (`'en'`) and `supportedLngs: APP_CONFIG.supportedLocales` (`['en', 'es']`).
- Persists selected locale in `localStorage` under `${APP_CONFIG.storagePrefix}-lang`.
- All translation strings live in `src/i18n/resources.ts` organized by namespace section (`nav`, `layout`, `notFound`, `errorBoundary`, `home`, `auth`, `dashboard`, `playground`).

## Rules for Adding UI Text

1. Never hardcode user-visible strings in components or pages.
2. Add every new key to **both** `en.translation` and `es.translation` in `src/i18n/resources.ts`.
3. Consume strings via `const { t } = useTranslation();`.

## Adding a New Locale

1. Add the locale code (e.g., `'pt'`) to `SupportedLocale` and `APP_CONFIG.supportedLocales` in `src/config/app.config.ts`.
2. Add the matching translation tree to `Resources` and `resources` in `src/i18n/resources.ts`.
3. `LanguageSwitcher` automatically renders a button for every locale in `APP_CONFIG.supportedLocales`.

## Global Switches (`src/components/switches/`)

- `LanguageSwitcher`: Accessible button group (`role="group"`) rendering a button per locale in `APP_CONFIG.supportedLocales` and calling `i18n.changeLanguage(code)`.
- `ThemeChanger`: Accessible icon button toggling light/dark theme via `useThemeContext()`.
