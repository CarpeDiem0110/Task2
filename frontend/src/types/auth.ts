// User interface
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'Admin' | 'Customer'
  createdAt: string
  updatedAt: string
}

// Login request interface
export interface LoginRequest {
  email: string
  password: string
}

// Register request interface
export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: 'Admin' | 'Customer'
}

// Auth response interfaces
export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresAt: string
}

export interface RegisterResponse {
  user: User
  token: string
  refreshToken: string
  expiresAt: string
}

// Auth state interface
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// JWT Token payload interface
export interface TokenPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
  jti: string
}

// Password reset interfaces
export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}

// Update profile interfaces
export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
