'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { removeFromCart, updateQuantity, clearCart } from '@/store/slices/cartSlice'
import { initializeAuth } from '@/store/slices/authSlice'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const { items: cartItems, total, itemCount } = useAppSelector((state) => state.cart)
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  // Auth durumunu localStorage'dan yükle
  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      alert('Sepete erişmek için giriş yapmanız gerekiyor!')
      window.location.href = '/auth/login'
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Sepete erişmek için giriş yapmanız gerekiyor...</p>
        </div>
      </div>
    )
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return
    dispatch(updateQuantity({ id, quantity: newQuantity }))
  }

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id))
  }

  const handleClearCart = () => {
    if (confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
      dispatch(clearCart())
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Sepetim ({itemCount} ürün)
            </h1>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Alışverişe Devam Et
              </Link>
              
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Ana Sayfa
              </Link>
              
              <div className="text-sm text-gray-600">
                Hoş geldin, {user?.firstName}!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
              <div className="text-6xl text-gray-300 mb-4">🛒</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sepetiniz Boş</h2>
              <p className="text-gray-600 mb-6">
                Henüz sepetinizde ürün bulunmuyor. Alışverişe başlamak için ürünler sayfasını ziyaret edin.
              </p>
              <Link
                href="/"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Alışverişe Başla
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Sepetinizdeki Ürünler</h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Sepeti Temizle
                    </button>
                  )}
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 flex items-center space-x-4">
                      <img
                        src={item.imageUrl || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">Birim Fiyat: ₺{item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        >
                          -
                        </button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Sipariş Özeti</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam ({itemCount} ürün)</span>
                    <span>₺{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo</span>
                    <span className="text-green-600">Ücretsiz</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Toplam</span>
                    <span>₺{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  disabled={cartItems.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  onClick={() => alert('Ödeme özelliği henüz geliştirilmemiştir!')}
                >
                  Siparişi Tamamla
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  Siparişinizi tamamlayarak{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    şartlar ve koşulları
                  </a>{' '}
                  kabul etmiş olursunuz.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
