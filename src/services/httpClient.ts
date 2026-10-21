import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getStoredToken } from '../features/auth/authStorage';
import { API_BASE_URL } from '../utils/config';

export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
