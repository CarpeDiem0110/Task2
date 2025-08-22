import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  errors?: Record<string, string[]>
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('eTicaret_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Handle 401 unauthorized responses
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('eTicaret_token')
        localStorage.removeItem('eTicaret_user')
        window.location.href = '/auth/login'
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.'
    }

    return Promise.reject(error)
  }
)

// Generic API methods
export const api = {
  get: <T>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.get(url, config),
    
  post: <T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.post(url, data, config),
    
  put: <T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.put(url, data, config),
    
  patch: <T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.patch(url, data, config),
    
  delete: <T>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.delete(url, config),
}

export default apiClient
