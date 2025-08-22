import axios, { AxiosInstance, AxiosError } from 'axios'
import { API_BASE_URL } from '@/lib/config'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  public get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config)
  }

  public post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config)
  }

  public put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config)
  }

  public delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config)
  }
}

export const apiClient = new ApiClient()
