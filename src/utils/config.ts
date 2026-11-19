import { APP_CONFIG } from '@/config/app.config';

interface EnvConfig {
  apiBaseUrl: string;
}

export const env: EnvConfig = {
  apiBaseUrl: APP_CONFIG.apiBaseUrl,
};

export const API_BASE_URL = env.apiBaseUrl;
