import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Product } from '@/types'

interface ProductsState {
  products: Product[]
  filteredProducts: Product[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedCategory: string
  sortBy: 'name' | 'price' | 'newest'
  sortOrder: 'asc' | 'desc'
}

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: '',
  sortBy: 'name',
  sortOrder: 'asc',
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
      state.filteredProducts = action.payload
      state.isLoading = false
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
    },
    setSortBy: (state, action: PayloadAction<'name' | 'price' | 'newest'>) => {
      state.sortBy = action.payload
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload
    },
    filterProducts: (state) => {
      let filtered = [...state.products]

      // Filter by search query
      if (state.searchQuery) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
      }

      // Filter by category
      if (state.selectedCategory) {
        filtered = filtered.filter(product => product.category === state.selectedCategory)
      }

      // Sort products
      filtered.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (state.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'price':
            aValue = a.price
            bValue = b.price
            break
          case 'newest':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
        }

        if (state.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })

      state.filteredProducts = filtered
    },
  },
})

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
  filterProducts,
} = productsSlice.actions

export default productsSlice.reducer
