import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import i18n from '../i18n';
import { lightTheme } from '../styles/theme';
import { osReducer, type OsState } from '../features/os/osSlice';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ThemeProvider theme={lightTheme}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </ThemeProvider>
  </MemoryRouter>
);

const customRender = (ui: React.ReactNode, options?: RenderOptions) =>
  rtlRender(ui, { wrapper: AllTheProviders, ...options });

/**
 * Store mínimo con la feature `os` para probar sus componentes de forma aislada.
 * Replica la configuración del store de la app (reloj del filesystem incluido).
 */
export function createOsStore() {
  return configureStore({
    reducer: { os: osReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: { ignoredPaths: ['os.fs.now'] } }),
  });
}

export type OsStore = ReturnType<typeof createOsStore>;
export type OsTestState = { os: OsState };

export * from '@testing-library/react';
export { customRender as render };
