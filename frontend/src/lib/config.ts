// API Base URL Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5074/api'

// Application configuration
export const APP_CONFIG = {
  name: 'E-Commerce',
  description: 'Modern e-commerce application',
  defaultLanguage: 'tr',
  supportedLanguages: ['tr', 'en'],
} as const

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    profile: '/auth/profile',
  },
  products: {
    all: '/products/all',
    byId: '/products',
    create: '/products',
    update: '/products',
    delete: '/products',
  },
  categories: {
    all: '/categories',
  },
} as const
