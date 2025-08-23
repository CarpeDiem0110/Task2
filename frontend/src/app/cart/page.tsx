'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { removeFromCart, updateQuantity, clearCart } from '@/store/slices/cartSlice'
import { initializeAuth } from '@/store/slices/authSlice'

const Cart = () => {
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#D4AF37]"></div>
      </div>
    )
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 0) return
    dispatch(updateQuantity({ id, quantity: newQuantity }))
  }

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id))
    alert('Ürün sepetten kaldırıldı')
  }

  const handleClearCart = () => {
    if (confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
      dispatch(clearCart())
      alert('Sepet temizlendi')
    }
  }

  const handleCheckout = () => {
    alert('Ödeme özelliği henüz geliştirilmemiştir!')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[#111111]">Sepetim</h1>
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">Ana Sayfa</Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-[#111111]">Sepetim</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto max-w-md">
              <div className="mb-6">
                <svg className="mx-auto h-20 w-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#111111] mb-3">Sepetiniz boş</h2>
              <p className="text-gray-600 mb-8 text-lg">Alışverişe başlamak için ürünleri sepetinize ekleyin.</p>
              <Link 
                href="/"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-[#D4AF37] hover:bg-[#B8941F] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                </svg>
                Alışverişe Başla
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-[#111111]">Sepetinizdeki Ürünler ({itemCount})</h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Sepeti Temizle
                    </button>
                  )}
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                      <img
                        src={item.imageUrl || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#111111] mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600">Birim Fiyat: <span className="font-medium">₺{item.price.toFixed(2)}</span></p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#D4AF37] hover:text-white flex items-center justify-center transition-all duration-200 font-semibold"
                        >
                          -
                        </button>
                        
                        <span className="w-12 text-center font-semibold text-[#111111] text-lg">{item.quantity}</span>
                        
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#D4AF37] hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 font-semibold"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right min-w-[120px]">
                        <div className="text-xl font-bold text-[#111111] mb-2">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
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
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-[#111111] mb-6">Sipariş Özeti</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam ({itemCount} ürün)</span>
                    <span className="font-medium">₺{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Kargo</span>
                    <span className="text-green-600 font-medium">Ücretsiz</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-xl font-bold text-[#111111]">
                    <span>Toplam</span>
                    <span>₺{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  disabled={cartItems.length === 0}
                  className="w-full bg-[#D4AF37] hover:bg-[#B8941F] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg mb-4"
                  onClick={handleCheckout}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                    </svg>
                    Siparişi Tamamla
                  </div>
                </button>
                
                <Link
                  href="/"
                  className="block w-full text-center bg-white hover:bg-gray-50 border-2 border-[#D4AF37] text-[#D4AF37] font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Alışverişe Devam Et
                </Link>
                
                <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                  Siparişinizi tamamlayarak{' '}
                  <a href="#" className="text-[#D4AF37] hover:underline">
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

export default Cart
