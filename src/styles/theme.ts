export interface ThemeColors {
  text: string;
  textStrong: string;
  textMuted: string;
  textSubtle: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceOverlay: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentBorder: string;
  successBackground: string;
  successText: string;
  errorBackground: string;
  errorText: string;
  neutralBackground: string;
  neutralText: string;
}

export interface ThemeShadows {
  card: string;
}

export interface ThemeRadii {
  small: string;
  medium: string;
  large: string;
  pill: string;
}

export interface ThemeSpacing {
  page: string;
  section: string;
  component: string;
  compact: string;
}

export interface ThemeTransitions {
  default: string;
}

export interface ThemeFonts {
  body: string;
}

export interface Theme {
  name: 'light' | 'dark';
  fonts: ThemeFonts;
  colors: ThemeColors;
  shadows: ThemeShadows;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  transitions: ThemeTransitions;
}

export const lightTheme: Theme = {
  name: 'light',
  fonts: {
    body: "'Space Grotesk', 'Segoe UI', sans-serif",
  },
  colors: {
    text: '#1f2937',
    textStrong: '#111827',
    textMuted: '#6b7280',
    textSubtle: '#9ca3af',
    background: '#f4f7fb',
    surface: '#ffffff',
    surfaceMuted: '#f8fafc',
    surfaceOverlay: 'rgba(255, 255, 255, 0.84)',
    border: '#dbe4f0',
    borderStrong: '#cbd5e1',
    accent: '#2563eb',
    accentHover: '#1d4ed8',
    accentSoft: '#dbeafe',
    accentBorder: '#bfdbfe',
    successBackground: '#ecfdf5',
    successText: '#047857',
    errorBackground: '#fef2f2',
    errorText: '#b91c1c',
    neutralBackground: '#eef2f7',
    neutralText: '#475569',
  },
  shadows: {
    card: '0 18px 45px rgba(15, 23, 42, 0.08)',
  },
  radii: {
    small: '12px',
    medium: '16px',
    large: '20px',
    pill: '999px',
  },
  spacing: {
    page: '48px',
    section: '24px',
    component: '16px',
    compact: '8px',
  },
  transitions: {
    default: '0.15s ease',
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  name: 'dark',
  colors: {
    text: '#dbe5f3',
    textStrong: '#f8fafc',
    textMuted: '#94a3b8',
    textSubtle: '#64748b',
    background: '#08111f',
    surface: '#0f172a',
    surfaceMuted: '#162133',
    surfaceOverlay: 'rgba(15, 23, 42, 0.84)',
    border: '#223047',
    borderStrong: '#31415f',
    accent: '#60a5fa',
    accentHover: '#93c5fd',
    accentSoft: 'rgba(96, 165, 250, 0.16)',
    accentBorder: 'rgba(147, 197, 253, 0.32)',
    successBackground: 'rgba(6, 95, 70, 0.24)',
    successText: '#6ee7b7',
    errorBackground: 'rgba(185, 28, 28, 0.22)',
    errorText: '#fca5a5',
    neutralBackground: '#162133',
    neutralText: '#cbd5e1',
  },
  shadows: {
    card: '0 18px 48px rgba(2, 6, 23, 0.4)',
  },
};

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
