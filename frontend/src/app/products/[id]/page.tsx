'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { addToCart } from '@/store/slices/cartSlice'
import { initializeAuth } from '@/store/slices/authSlice'
import { Product } from '@/types'
import { apiClient } from '@/lib/api-client'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { itemCount } = useAppSelector((state) => state.cart)

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

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Sepete ürün eklemek için giriş yapmanız gerekiyor!')
      return
    }
    
    if (product) {
      for (let i = 0; i < quantity; i++) {
        dispatch(addToCart(product))
      }
      alert(`${quantity} adet ${product.name} sepete eklendi!`)
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ürün Bulunamadı</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
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
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                E-Ticaret
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Ana Sayfa
                </Link>
                <span className="text-gray-900">Ürün Detayı</span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Merhaba, {user?.firstName}!
                  </span>
                  {user?.role === 'Admin' && (
                    <Link
                      href="/admin"
                      className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/cart"
                    className="relative bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Sepet
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 font-medium transition-colors"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
            <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  ₺{product.price.toFixed(2)}
                </span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 10 
                    ? 'bg-green-100 text-green-800' 
                    : product.stock > 0 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 10 
                    ? 'Stokta Var' 
                    : product.stock > 0 
                    ? `Son ${product.stock} adet!` 
                    : 'Stokta Yok'}
                </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adet
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 ml-4">
                    (Maksimum {product.stock} adet)
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {product.stock === 0 ? 'Stokta Yok' : `Sepete Ekle (${quantity} adet)`}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Ürün Bilgileri</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><span className="font-medium">Kategori:</span> {product.category}</li>
                <li><span className="font-medium">Stok Kodu:</span> #{product.id}</li>
                <li><span className="font-medium">Durum:</span> {product.isActive ? 'Aktif' : 'Pasif'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
