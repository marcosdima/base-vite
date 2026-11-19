# Styling, Design Tokens & Theme Provider

- **Source**: `src/styles/theme.ts`, `src/styles/AppThemeProvider.tsx`, `src/styles/GlobalStyles.ts`, `src/styles/typography.ts`

## Design Tokens (`src/styles/theme.ts`)

Exports `lightTheme`, `darkTheme`, and the `Theme` TypeScript interface (augmented onto `styled-components`'s `DefaultTheme`).

| Token Group   | Keys                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fonts`       | `body`, `mono`                                                                                                                                                                                                                                                                                                                                                                              |
| `fontSizes`   | `xs` (`0.75rem`), `sm` (`0.875rem`), `md` (`1rem`), `lg` (`1.125rem`), `xl` (`1.5rem`), `xxl` (`2rem`)                                                                                                                                                                                                                                                                                      |
| `colors`      | `text`, `textStrong`, `textMuted`, `textSubtle`, `background`, `surface`, `surfaceMuted`, `surfaceOverlay`, `border`, `borderStrong`, `accent`, `accentHover`, `accentText`, `accentSoft`, `accentBorder`, `focusRing`, `successBackground`, `successText`, `warningBackground`, `warningText`, `errorBackground`, `errorText`, `danger`, `dangerHover`, `neutralBackground`, `neutralText` |
| `shadows`     | `card`                                                                                                                                                                                                                                                                                                                                                                                      |
| `radii`       | `small` (`12px`), `medium` (`16px`), `large` (`20px`), `pill` (`999px`)                                                                                                                                                                                                                                                                                                                     |
| `spacing`     | `page` (`48px`), `section` (`24px`), `component` (`16px`), `compact` (`8px`)                                                                                                                                                                                                                                                                                                                |
| `breakpoints` | `sm` (`640px`), `md` (`768px`), `lg` (`1024px`)                                                                                                                                                                                                                                                                                                                                             |
| `zIndex`      | `base` (`1`), `sticky` (`20`), `overlay` (`40`), `modal` (`60`), `toast` (`80`)                                                                                                                                                                                                                                                                                                             |
| `transitions` | `default` (`0.15s ease`)                                                                                                                                                                                                                                                                                                                                                                    |

## Theme Provider (`src/styles/AppThemeProvider.tsx`)

- Persists user choice in `localStorage` under `THEME_STORAGE_KEY` (`${APP_CONFIG.storagePrefix}-theme`).
- Falls back to `window.matchMedia('(prefers-color-scheme: dark)')` when no preference is stored, and listens for OS theme changes.
- Exports `useThemeContext()` returning `{ isDark: boolean; toggleTheme: () => void }`.

## Typography Helpers (`src/styles/typography.ts`)

Reusable styled text elements: `Eyebrow`, `Title`, `SectionTitle`, `Subtitle`, `Paragraph`, `Caption`.

## Styling Conventions

- Every component or page colocates its styles in `ComponentName.styles.ts` inside its own folder.
- Use transient props prefixed with `$` (`$variant`, `$active`, `$isLeading`) so custom styling props are not passed to DOM nodes.
