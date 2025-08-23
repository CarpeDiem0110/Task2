'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchProducts } from '@/store/slices/productsSlice'
import { addToCart } from '@/store/slices/cartSlice'
import { initializeAuth } from '@/store/slices/authSlice'
import ProductFilters from '@/components/ProductFilters_backend'
import { useToast } from '@/components/ToastProvider'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { items: products, isLoading } = useAppSelector((state) => state.products)
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { itemCount, items: cartItems } = useAppSelector((state) => state.cart)
  const { showToast } = useToast()

  useEffect(() => {
    // Auth durumunu localStorage'dan yükle
    dispatch(initializeAuth())
    dispatch(fetchProducts())
  }, [dispatch])

  // Admin otomatik yönlendirmesi kaldırıldı - sadece navigation'da buton var

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) {
      showToast('Sepete ürün eklemek için giriş yapmanız gerekiyor!', 'warning')
      return
    }
    
    const product = products.find(p => p.id === productId)
    if (product) {
      // Sepetteki mevcut miktarı kontrol et
      const cartItem = cartItems.find(item => item.id === productId)
      const currentQuantityInCart = cartItem ? cartItem.quantity : 0
      
      if (currentQuantityInCart >= product.stock) {
        showToast(`${product.name} için maksimum stok limiti (${product.stock} adet) sepetinizde zaten mevcut!`, 'error')
        return
      }
      
      dispatch(addToCart(product))
      
      // Başarılı ekleme bildirimi
      const newQuantity = currentQuantityInCart + 1
      showToast(`${product.name} sepete eklendi! (${newQuantity}/${product.stock})`, 'success')
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
          {/* Header Skeleton */}
          <div className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="h-8 bg-gray-300 rounded w-48"></div>
            </div>
          </div>
          {/* Products Skeleton */}
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                <Link href="#products" className="text-[#111111] hover:text-[#D4AF37] font-medium transition-colors">
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
                    className=" hover:text-[#D4AF37]  text-[#111111] font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#111111]">
            Kaliteli Ürünler, <span className="text-[#D4AF37]">Uygun Fiyatlar</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-600 max-w-3xl mx-auto">
            İhtiyacınız olan her şeyi en uygun fiyatlarla bulabileceğiniz güvenilir e-ticaret platformu
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="#products"
              className="bg-[#D4AF37] hover:bg-yellow-600 text-[#111111] font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="bg-white py-16">
        <div className="container mx-auto px-4">
          {/* Filtreleme Bileşeni */}
          <ProductFilters />

          {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📦</div>
            <p className="text-gray-600 text-lg">Henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-w-1 aspect-h-1 relative overflow-hidden">
                    <img
                      src={product.imageUrl || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {(() => {
                      const cartItem = cartItems.find(item => item.id === product.id)
                      const inCartQuantity = cartItem ? cartItem.quantity : 0
                      const availableStock = product.stock - inCartQuantity
                      
                      return availableStock <= 5 && availableStock > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          Son {availableStock} adet!
                        </div>
                      )
                    })()}
                    {(() => {
                      const cartItem = cartItems.find(item => item.id === product.id)
                      const inCartQuantity = cartItem ? cartItem.quantity : 0
                      const availableStock = product.stock - inCartQuantity
                      
                      return (product.stock === 0 || availableStock === 0) && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">Stokta Yok</span>
                        </div>
                      )
                    })()}
                  </div>
                </Link>
                
                <div className="p-6">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold text-[#111111] mb-2  transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        ₺{product.price.toFixed(2)}
                      </span>
                      <div className="text-sm text-gray-500">
                        {(() => {
                          const cartItem = cartItems.find(item => item.id === product.id)
                          const inCartQuantity = cartItem ? cartItem.quantity : 0
                          const availableStock = product.stock - inCartQuantity
                          return `Stok: ${availableStock}`
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold py-2 px-4 rounded-lg text-center transition-colors"
                    >
                      Detay
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={(() => {
                        const cartItem = cartItems.find(item => item.id === product.id)
                        const inCartQuantity = cartItem ? cartItem.quantity : 0
                        const availableStock = product.stock - inCartQuantity
                        return product.stock === 0 || availableStock <= 0
                      })()}
                      className={`flex-1 font-bold py-2 px-4 rounded-lg transition-colors ${
                        (() => {
                          const cartItem = cartItems.find(item => item.id === product.id)
                          const inCartQuantity = cartItem ? cartItem.quantity : 0
                          const availableStock = product.stock - inCartQuantity
                          
                          if (product.stock === 0 || availableStock <= 0) {
                            return 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }
                          return 'bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold'
                        })()
                      }`}
                    >
                      {(() => {
                        const cartItem = cartItems.find(item => item.id === product.id)
                        const inCartQuantity = cartItem ? cartItem.quantity : 0
                        const availableStock = product.stock - inCartQuantity
                        
                        if (product.stock === 0 || availableStock <= 0) {
                          return 'Stokta Yok'
                        }
                        return 'Sepete Ekle'
                      })()}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </section>


      
      {/* Footer */}
      <footer className="bg-[#111111] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-[#D4AF37]">ShopMax</h3>
            <p className="text-gray-400 mb-4">
              Kaliteli ürünler, güvenilir hizmet
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/auth/login" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                Giriş
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
