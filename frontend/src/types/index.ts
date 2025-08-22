// Type definitions for API responses
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  errors?: string[]
  isSuccess: boolean
}

// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'Admin' | 'Customer'
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Product types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  stock: number
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string
}

// Cart types
export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}
