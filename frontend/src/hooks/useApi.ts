import axios, { AxiosInstance } from 'axios'
import { useAppSelector } from './useRedux'

const createApiClient = (token?: string): AxiosInstance => {
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
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
