import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './GlobalStyles';
import { darkTheme, lightTheme, type Theme } from './theme';

const STORAGE_KEY = 'starter-forge-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return lightTheme;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return darkTheme;
  if (stored === 'light') return lightTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? darkTheme
    : lightTheme;
}

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
});

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange(event: MediaQueryListEvent) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(event.matches ? darkTheme : lightTheme);
      }
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  function toggleTheme() {
    setTheme((current) => {
      const next: Theme = current.name === 'dark' ? lightTheme : darkTheme;
      localStorage.setItem(STORAGE_KEY, next.name);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ isDark: theme.name === 'dark', toggleTheme }}>
      <ThemeProvider theme={theme}>
        <GlobalStyles theme={theme} />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}