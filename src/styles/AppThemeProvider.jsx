import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from './GlobalStyles'
import { darkTheme, lightTheme } from './theme'

const STORAGE_KEY = 'starter-forge-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') return lightTheme

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark') return darkTheme
  if (stored === 'light') return lightTheme

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? darkTheme
    : lightTheme
}

const ThemeContext = createContext({ isDark: false, toggleTheme: () => {} })

export function useThemeContext() {
  return useContext(ThemeContext)
}


export function AppThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function handleChange(event) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(event.matches ? darkTheme : lightTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  function toggleTheme() {
    setTheme((current) => {
      const next = current.name === 'dark' ? lightTheme : darkTheme
      localStorage.setItem(STORAGE_KEY, next.name)
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ isDark: theme.name === 'dark', toggleTheme }}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}