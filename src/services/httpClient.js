import axios from 'axios'
import { getStoredToken } from '../features/auth/authStorage'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    // This keeps the auth header in one place for every REST request.
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})