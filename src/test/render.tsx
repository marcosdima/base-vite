import { render as rtlRender, type RenderOptions } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { createAppStore, type AppStore, type RootState } from '@/app/store';
import i18n from '@/i18n';
import { lightTheme, type Theme } from '@/styles/theme';

export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  route?: string;
  theme?: Theme;
}

export function render(
  ui: React.ReactElement,
  {
    preloadedState,
    store = createAppStore(preloadedState),
    route = '/',
    theme = lightTheme,
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  function AllTheProviders({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <ThemeProvider theme={theme}>
            <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...rtlRender(ui, { wrapper: AllTheProviders, ...renderOptions }),
  };
}

export * from '@testing-library/react';
