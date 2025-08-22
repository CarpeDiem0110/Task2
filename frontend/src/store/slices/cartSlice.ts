import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Product } from '@/types'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  maxStock: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isOpen: boolean
  isLoading: boolean
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
  isLoading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload
      const existingItem = state.items.find(item => item.id === product.id)
      
      if (existingItem) {
        if (existingItem.quantity < existingItem.maxStock) {
          existingItem.quantity += 1
        } else {
          // Stok limiti aşılmaya çalışıldığında uyarı verelim
          console.warn(`${product.name} için maksimum stok limiti (${existingItem.maxStock}) aşılmaya çalışıldı`)
        }
      } else {
        if (product.stock > 0) {
          state.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl,
            maxStock: product.stock,
          })
        }
      }
      
      cartSlice.caseReducers.calculateTotals(state)
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      cartSlice.caseReducers.calculateTotals(state)
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id)
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(i => i.id !== action.payload.id)
        } else if (action.payload.quantity <= item.maxStock) {
          item.quantity = action.payload.quantity
        }
      }
      cartSlice.caseReducers.calculateTotals(state)
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      state.itemCount = 0
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen
    },
    openCart: (state) => {
      state.isOpen = true
    },
    closeCart: (state) => {
      state.isOpen = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    calculateTotals: (state) => {
      state.itemCount = state.items.reduce((total, item) => total + item.quantity, 0)
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    },
    // Load cart from localStorage
    loadCartFromStorage: (state) => {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          state.items = parsedCart.items || []
          cartSlice.caseReducers.calculateTotals(state)
        } catch (error) {
          // Clear corrupted cart data
          localStorage.removeItem('cart')
        }
      }
    },
    // Save cart to localStorage
    saveCartToStorage: (state) => {
      localStorage.setItem('cart', JSON.stringify({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      }))
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCart,
  closeCart,
  setLoading,
  calculateTotals,
  loadCartFromStorage,
  saveCartToStorage,
} = cartSlice.actions

export default cartSlice.reducer
