const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? '/api/v1'
  : 'http://localhost:3000/api/v1'
const VITE_API_URL = import.meta.env.VITE_API_URL?.trim()

export const env = {
  apiBaseUrl: VITE_API_URL || DEFAULT_API_BASE_URL,
}

export const API_BASE_URL = env.apiBaseUrl