import { apiClient } from './client'
import { User, LoginRequest, RegisterRequest } from '../types/auth'

export class AuthService {
  private static TOKEN_KEY = 'eTicaret_token'
  private static USER_KEY = 'eTicaret_user'

  static async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      
      if (response.data.success) {
        const { user, token } = response.data.data
        this.setToken(token)
        this.setUser(user)
        return { user, token }
      }
      
      throw new Error(response.data.message || 'Login failed')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  static async register(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/register', userData)
      
      if (response.data.success) {
        const { user, token } = response.data.data
        this.setToken(token)
        this.setUser(user)
        return { user, token }
      }
      
      throw new Error(response.data.message || 'Registration failed')
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await apiClient.get('/auth/me')
      
      if (response.data.success) {
        const user = response.data.data
        this.setUser(user)
        return user
      }
      
      return null
    } catch (error) {
      console.error('Failed to get current user:', error)
      this.clearAuth()
      return null
    }
  }

  static async refreshToken(): Promise<string | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await apiClient.post('/auth/refresh', { token })
      
      if (response.data.success) {
        const newToken = response.data.data.token
        this.setToken(newToken)
        return newToken
      }
      
      return null
    } catch (error) {
      console.error('Failed to refresh token:', error)
      this.clearAuth()
      return null
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuth()
    }
  }

  // Token management
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
    }
  }

  // User data management
  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.USER_KEY)
      return user ? JSON.parse(user) : null
    }
    return null
  }

  static removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY)
    }
  }

  // Clear all auth data
  static clearAuth(): void {
    this.removeToken()
    this.removeUser()
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  // Check token expiration
  static isTokenExpired(): boolean {
    const token = this.getToken()
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  // Get token payload
  static getTokenPayload(): any | null {
    const token = this.getToken()
    if (!token) return null

    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (error) {
      return null
    }
  }

  // Check user role
  static hasRole(role: string): boolean {
    const user = this.getUser()
    return user?.role === role
  }

  // Check if user is admin
  static isAdmin(): boolean {
    return this.hasRole('Admin')
  }
}
