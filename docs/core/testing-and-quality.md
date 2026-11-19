# Testing & Quality Tooling

- **Source**: `src/test/render.tsx`, `src/test/setup.ts`, `vitest.config.ts`, `eslint.config.js`, `commitlint.config.js`, `package.json`

## Custom Test Renderer (`src/test/render.tsx`)

Always import `render`, `screen`, `fireEvent`, `act`, etc. from `@/test/render` instead of `@testing-library/react`.

`render(ui, options?)` automatically wraps the component under test with:

1. Redux `<Provider store={store}>` (creates a fresh isolated store via `createAppStore(preloadedState)` per test).
2. `<MemoryRouter initialEntries={[route]}>` (defaults to `'/'`).
3. `<ThemeProvider theme={theme}>` (defaults to `lightTheme`).
4. `<I18nextProvider i18n={i18n}>`.

### Options (`CustomRenderOptions`)

```ts
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  route?: string;
  theme?: Theme;
}
```

Returns `{ store, ...rtlRenderResult }` so tests can inspect or dispatch against `store` directly.

## Verification Pipeline (`pnpm verify`)

Before finishing any task, run:

```bash
pnpm verify
```

Executes in sequence (matching `.github/workflows/ci.yml`):

1. `pnpm lint` — ESLint 10 flat config (`js/jsx` + `ts/tsx` + `react-hooks` + `jsx-a11y`).
2. `pnpm format:check` — Prettier formatting verification.
3. `pnpm typecheck` — `tsc --noEmit` (`strict: true`, `noUnusedLocals`, `noUnusedParameters`).
4. `pnpm test` — `vitest run` in `jsdom`.
5. `pnpm build` — Production bundle verification with `vite build`.
