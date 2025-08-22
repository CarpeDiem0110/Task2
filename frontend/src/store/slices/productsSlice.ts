import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/config'
import { Product } from '@/types'

interface ProductsState {
  items: Product[]
  filteredItems: Product[]
  selectedProduct: Product | null
  isLoading: boolean
  error: string | null
  filters: {
    category: string
    minPrice: number | null
    maxPrice: number | null
    searchQuery: string
    sortBy: 'name' | 'price' | 'createdAt'
    sortOrder: 'asc' | 'desc'
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const initialState: ProductsState = {
  items: [],
  filteredItems: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  filters: {
    category: '',
    minPrice: null,
    maxPrice: null,
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
}

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Product[]>(API_ENDPOINTS.products.all)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products')
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<Product>(`${API_ENDPOINTS.products.byId}/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product')
    }
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload
      productsSlice.caseReducers.applyFilters(state)
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload
      productsSlice.caseReducers.applyFilters(state)
    },
    setPriceRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.filters.minPrice = action.payload.min
      state.filters.maxPrice = action.payload.max
      productsSlice.caseReducers.applyFilters(state)
    },
    setSortBy: (state, action: PayloadAction<'name' | 'price' | 'createdAt'>) => {
      state.filters.sortBy = action.payload
      productsSlice.caseReducers.applyFilters(state)
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filters.sortOrder = action.payload
      productsSlice.caseReducers.applyFilters(state)
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
      state.filteredItems = state.items
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    applyFilters: (state) => {
      let filtered = [...state.items]

      // Search filter
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase()
        filtered = filtered.filter(
          product =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        )
      }

      // Category filter
      if (state.filters.category) {
        filtered = filtered.filter(product => product.category === state.filters.category)
      }

      // Price range filter
      if (state.filters.minPrice !== null) {
        filtered = filtered.filter(product => product.price >= state.filters.minPrice!)
      }
      if (state.filters.maxPrice !== null) {
        filtered = filtered.filter(product => product.price <= state.filters.maxPrice!)
      }

      // Sort
      filtered.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (state.filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'price':
            aValue = a.price
            bValue = b.price
            break
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
        }

        if (state.filters.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })

      state.filteredItems = filtered
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products cases
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
        state.filteredItems = action.payload
        state.pagination.total = action.payload.length
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch product by ID cases
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setSearchQuery,
  setCategory,
  setPriceRange,
  setSortBy,
  setSortOrder,
  clearFilters,
  setSelectedProduct,
  clearError,
  applyFilters,
} = productsSlice.actions

export default productsSlice.reducer
