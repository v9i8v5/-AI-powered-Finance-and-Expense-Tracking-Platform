import axios, { AxiosInstance } from 'axios'
import { useAppSelector } from './useRedux'

/**
 * Backend routes are all prefixed with /api (e.g. /api/expenses, /api/auth/login).
 * Vite dev server proxies /api/* → http://localhost:8000/api/*.
 * We set baseURL to '' so component calls like api.get('/expenses') become
 * api.get('/api/expenses') after we prepend /api in the request interceptor.
 *
 * Actually simpler: set baseURL to empty and call full paths including /api,
 * OR set baseURL to '' and use a request interceptor to prepend /api.
 * 
 * Cleanest: baseURL = '' and components call /api/expenses directly.
 * We handle that by setting baseURL = '/api' and components drop the /api prefix.
 *
 * Routes used in components: /expenses, /income, /budgets, /analytics/*, /ai/*, /auth/*
 * Vite proxy: /api/* -> backend /api/*
 * So we need axios baseURL = '/api' and component paths to NOT include /api.
 * Backend router prefixes already include /api so the vite proxy passes them through unchanged.
 */

const createApiClient = (token?: string): AxiosInstance => {
  const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
  })

  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return api
}

export const useApi = (): AxiosInstance => {
  const token = useAppSelector(state => state.auth.token)
  return createApiClient(token || undefined)
}
