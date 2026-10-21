import { createGlobalStyle, type DefaultTheme } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.body};
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
    background: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
    color-scheme: ${({ theme }: { theme: DefaultTheme }) => theme.name};
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
  }

  body {
    margin: 0;
    font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.body};
    font-size: 1rem;
    line-height: 1.5;
    color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
    background:
      radial-gradient(circle at top, rgba(37, 99, 235, 0.12), transparent 30%),
      ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
  }

  #app {
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input {
    font: inherit;
  }

  img,
  svg {
    display: block;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }
`;