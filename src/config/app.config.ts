export type SupportedLocale = 'en' | 'es';

export interface AppConfig {
  /** Human-readable application name shown in the shell and page metadata. */
  name: string;
  /** Prefix used for all browser persistence keys (theme, auth, etc.). */
  storagePrefix: string;
  /** Default locale when no saved preference or browser match is found. */
  defaultLocale: SupportedLocale;
  /** Supported UI locales. */
  supportedLocales: readonly SupportedLocale[];
  /** Default REST API base URL. */
  apiBaseUrl: string;
}

const DEFAULT_API_BASE_URL = import.meta.env.DEV ? '/api/v1' : 'http://localhost:3000/api/v1';
const VITE_API_URL = import.meta.env.VITE_API_URL?.trim();

/**
 * Single configuration point for adapting this template to a new project.
 * Update `name` and `storagePrefix` first when cloning the starter.
 */
export const APP_CONFIG: AppConfig = {
  name: 'Base Vite',
  storagePrefix: 'base-vite',
  defaultLocale: 'en',
  supportedLocales: ['en', 'es'],
  apiBaseUrl: VITE_API_URL || DEFAULT_API_BASE_URL,
};
