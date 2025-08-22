'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchProducts } from '@/store/slices/productsSlice'
import { addToCart } from '@/store/slices/cartSlice'

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const { items: products, isLoading, error } = useAppSelector((state) => state.products)
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      alert('Sepete ürün eklemek için giriş yapmanız gerekiyor!')
      return
    }
    
    const product = products.find(p => p.id === productId)
    if (product) {
      dispatch(addToCart(product))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <h2 className="font-bold">Hata</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => dispatch(fetchProducts())}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/cart"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Sepetim
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token')
                      localStorage.removeItem('user')
                      window.location.reload()
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Çıkış
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={product.imageUrl || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      ₺{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stok: {product.stock}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0}
                    className={`w-full py-2 px-4 rounded font-semibold transition-colors ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
