import { useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles } from './GlobalStyles'
import { darkTheme, lightTheme } from './theme'

function getPreferredTheme() {
  if (typeof window === 'undefined') {
    return lightTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? darkTheme
    : lightTheme
}


export function AppThemeProvider({ children }) {
  const [theme, setTheme] = useState(getPreferredTheme)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function handleChange(event) {
      setTheme(event.matches ? darkTheme : lightTheme)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  )
}