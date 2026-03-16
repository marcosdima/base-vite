import axios from 'axios'
import { getStoredToken } from '../features/auth/authStorage'
import { API_BASE_URL } from '../utils/config'

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