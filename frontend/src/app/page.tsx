'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { fetchProducts } from '@/store/slices/productsSlice'
import { addToCart } from '@/store/slices/cartSlice'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const { items: products, isLoading } = useAppSelector((state) => state.products)
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { itemCount, items: cartItems } = useAppSelector((state) => state.cart)

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
      // Sepetteki mevcut miktarı kontrol et
      const cartItem = cartItems.find(item => item.id === productId)
      const currentQuantityInCart = cartItem ? cartItem.quantity : 0
      
      if (currentQuantityInCart >= product.stock) {
        alert(`${product.name} için maksimum stok limiti (${product.stock} adet) sepetinizde zaten mevcut!`)
        return
      }
      
      dispatch(addToCart(product))
      
      // Başarılı ekleme bildirimi
      const newQuantity = currentQuantityInCart + 1
      alert(`${product.name} sepete eklendi! (Sepetteki miktar: ${newQuantity}/${product.stock})`)
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
      <header className="bg-white shadow-sm sticky top-0 z-10">
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
                <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Tüm Ürünler
                </Link>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            En İyi Ürünler
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Kaliteli ürünleri en uygun fiyatlarla keşfedin
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="#products"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Ürünleri İncele
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Öne Çıkan Ürünler</h2>
          <p className="text-gray-600 text-lg">
            En popüler ve kaliteli ürünlerimizi keşfedin
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📦</div>
            <p className="text-gray-600 text-lg">Henüz ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-w-1 aspect-h-1 relative overflow-hidden">
                    <img
                      src={product.imageUrl || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        Son {product.stock} adet!
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">Stokta Yok</span>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-6">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        ₺{product.price.toFixed(2)}
                      </span>
                      <div className="text-sm text-gray-500">
                        Stok: {product.stock}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg text-center transition-colors"
                    >
                      Detay
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
                        product.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length > 8 && (
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Tüm Ürünleri Görüntüle
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">E-Ticaret</h3>
            <p className="text-gray-400 mb-4">
              Kaliteli ürünler, güvenilir hizmet
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                Ürünler
              </Link>
              <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                Giriş
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
