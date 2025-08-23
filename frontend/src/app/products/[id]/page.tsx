'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { addToCart } from '@/store/slices/cartSlice'
import { initializeAuth } from '@/store/slices/authSlice'
import { Product } from '@/types'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/ToastProvider'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { itemCount, items: cartItems } = useAppSelector((state) => state.cart)

  // Auth durumunu localStorage'dan yükle
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get<Product>(`/products/${id}`)
        setProduct(response.data)
      } catch (error: any) {
        setError(error.response?.data?.message || 'Ürün bulunamadı')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  // Product ve cart items değiştiğinde quantity'yi güncelle
  useEffect(() => {
    if (product) {
      const cartItem = cartItems.find(item => item.id === product.id)
      const inCartQuantity = cartItem ? cartItem.quantity : 0
      const availableStock = product.stock - inCartQuantity
      
      if (quantity > availableStock && availableStock > 0) {
        setQuantity(availableStock)
      } else if (availableStock === 0) {
        setQuantity(1) // Stok yoksa da 1 olarak bırak ama disabled olacak
      }
    }
  }, [product, cartItems, quantity])

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToast('Sepete ürün eklemek için giriş yapmanız gerekiyor!', 'warning')
      return
    }
    
    if (product) {
      // Sepetteki mevcut miktarı kontrol et
      const cartItem = cartItems.find(item => item.id === product.id)
      const currentQuantityInCart = cartItem ? cartItem.quantity : 0
      const availableStock = product.stock - currentQuantityInCart
      
      if (currentQuantityInCart >= product.stock) {
        showToast(`${product.name} için maksimum stok limiti (${product.stock} adet) sepetinizde zaten mevcut!`, 'error')
        return
      }
      
      if (quantity > availableStock) {
        showToast(`Sadece ${availableStock} adet ekleyebilirsiniz. (Sepetinizde zaten ${currentQuantityInCart} adet var)`, 'warning')
        return
      }
      
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(product))
      }
      showToast(`${quantity} adet ${product.name} sepete eklendi!`, 'success')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="h-8 bg-gray-300 rounded w-48"></div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-300 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">❌</div>
          <h2 className="text-2xl font-bold text-[#111111] mb-4">Ürün Bulunamadı</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-[#D4AF37] hover:bg-yellow-600 text-[#111111] font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-3xl font-bold text-[#D4AF37] hover:text-yellow-600 transition-colors">
                ShopMax
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-[#111111] hover:text-[#D4AF37] font-medium transition-colors">
                  Anasayfa
                </Link>
                <Link href="/#products" className="text-[#111111] hover:text-[#D4AF37] font-medium transition-colors">
                  Ürünler
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-[#111111]">
                    Merhaba, {user?.firstName}!
                  </span>
                  {user?.role === 'Admin' && (
                    <Link
                      href="/admin"
                      className="bg-[#D4AF37] hover:bg-yellow-600 text-[#111111] font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/cart"
                    className="relative bg-[#D4AF37] hover:bg-yellow-600 text-[#111111] font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                    </svg>
                    <span className="hidden sm:inline">Sepet</span>
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-[#111111] hover:text-red-600 font-medium transition-colors"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-[#D4AF37] hover:text-yellow-600 font-medium transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-[#D4AF37] hover:bg-yellow-600 text-[#111111] font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-[#111111] font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={product.imageUrl || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-96 md:h-[500px] object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-green-600">
                  ₺{product.price.toFixed(2)}
                </span>
                {(() => {
                  const cartItem = cartItems.find(item => item.id === product.id)
                  const inCartQuantity = cartItem ? cartItem.quantity : 0
                  const availableStock = product.stock - inCartQuantity
                  
                  return (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      availableStock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : availableStock > 0 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {availableStock > 10 
                        ? `Stokta Var (${availableStock})` 
                        : availableStock > 0 
                        ? `Son ${availableStock} adet!` 
                        : 'Stokta Yok'}
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className="border-t border-b py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ürün Açıklaması</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">
                  Adet
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-[#D4AF37] hover:text-[#111111] flex items-center justify-center transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-lg text-[#111111]">{quantity}</span>
                  <button
                    onClick={() => {
                      const cartItem = cartItems.find(item => item.id === product.id)
                      const inCartQuantity = cartItem ? cartItem.quantity : 0
                      const availableStock = product.stock - inCartQuantity
                      setQuantity(Math.min(availableStock, quantity + 1))
                    }}
                    disabled={(() => {
                      const cartItem = cartItems.find(item => item.id === product.id)
                      const inCartQuantity = cartItem ? cartItem.quantity : 0
                      const availableStock = product.stock - inCartQuantity
                      return quantity >= availableStock
                    })()}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-[#D4AF37] hover:text-[#111111] disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center transition-colors font-bold"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 ml-4">
                    {(() => {
                      const cartItem = cartItems.find(item => item.id === product.id)
                      const inCartQuantity = cartItem ? cartItem.quantity : 0
                      const availableStock = product.stock - inCartQuantity
                      return `(Maksimum ${availableStock} adet${inCartQuantity > 0 ? `, sepetinizde: ${inCartQuantity}` : ''})`
                    })()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={(() => {
                    const cartItem = cartItems.find(item => item.id === product.id)
                    const inCartQuantity = cartItem ? cartItem.quantity : 0
                    const availableStock = product.stock - inCartQuantity
                    return product.stock === 0 || availableStock === 0
                  })()}
                  className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-colors ${
                    (() => {
                      const cartItem = cartItems.find(item => item.id === product.id)
                      const inCartQuantity = cartItem ? cartItem.quantity : 0
                      const availableStock = product.stock - inCartQuantity
                      
                      if (product.stock === 0 || availableStock === 0) {
                        return 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                      return 'bg-[#D4AF37] hover:bg-yellow-600 text-[#111111]'
                    })()
                  }`}
                >
                  {(() => {
                    const cartItem = cartItems.find(item => item.id === product.id)
                    const inCartQuantity = cartItem ? cartItem.quantity : 0
                    const availableStock = product.stock - inCartQuantity
                    
                    if (product.stock === 0 || availableStock === 0) {
                      return 'Stokta Yok'
                    }
                    return `Sepete Ekle (${quantity} adet)`
                  })()}
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="font-semibold text-[#111111] mb-2">Ürün Bilgileri</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><span className="font-medium text-[#111111]">Kategori:</span> {product.category}</li>
                <li><span className="font-medium text-[#111111]">Stok Kodu:</span> #{product.id}</li>
                <li><span className="font-medium text-[#111111]">Durum:</span> {product.isActive ? 'Aktif' : 'Pasif'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
