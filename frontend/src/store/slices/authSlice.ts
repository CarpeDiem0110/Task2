import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/config'
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    console.log('🚀 LOGINUSER THUNK BAŞLADI!')
    console.log('📝 Credentials:', credentials)
    console.log('🌐 API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('🎯 Login endpoint:', API_ENDPOINTS.auth.login)
    
    try {
      console.log('📡 API call yapılıyor...')
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials)
      console.log('✅ API Response:', response)
      console.log('📊 Response data:', response.data)
      
      const { token, user } = response.data
      
      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      console.log('💾 LocalStorage kaydedildi')
      return { token, user }
    } catch (error: any) {
      console.error('❌ LOGIN HATA:', error)
      console.error('🔍 Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, userData)
      const { token, user } = response.data
      
      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { token, user }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    initializeAuth: (state) => {
      // Initialize from localStorage on app start
      const token = localStorage.getItem('token')
      const userString = localStorage.getItem('user')
      
      if (token && userString) {
        try {
          const user = JSON.parse(userString)
          state.user = user
          state.token = token
          state.isAuthenticated = true
        } catch (error) {
          // Clear corrupted data
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setUser, logout, clearError, setLoading, initializeAuth } = authSlice.actions
export default authSlice.reducer
