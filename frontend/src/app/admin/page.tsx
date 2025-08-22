'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store'
import { logout, initializeAuth } from '@/store/slices/authSlice'
import { Product } from '@/types'
import { apiClient } from '@/lib/api-client'

console.log('AdminPage component loading...')

const AdminPage = () => {
  console.log('AdminPage function started')
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('=== ADMIN PAGE AUTH DEBUG ===')
    console.log('isAuthenticated:', isAuthenticated)
    console.log('user:', user)
    console.log('localStorage token:', localStorage.getItem('token'))
    console.log('localStorage user:', localStorage.getItem('user'))
    console.log('==============================')

    // LocalStorage kontrolü ekle - eğer Redux store boşsa ama localStorage doluysa
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (!isAuthenticated && token && storedUser) {
      console.log('🔄 Redux store boş ama localStorage dolu - initialize ediliyor...')
      // Redux store'a yükle
      dispatch(initializeAuth())
      return
    }

    // Redux store'dan user kontrolü
    if (!isAuthenticated || !user) {
      console.log('❌ Auth failed, redirecting to login')
      router.push('/auth/login')
      return
    }
    
    if (user.role !== 'Admin') {
      console.log('❌ Not admin role:', user.role)
      alert('Bu sayfaya erişim yetkiniz yok! Admin yetkisi gerekiyor.')
      router.push('/')
      return
    }
    
    console.log('✅ Admin auth successful')
    fetchProducts()
  }, [isAuthenticated, user, router, dispatch])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get<Product[]>('/products/all')
      setProducts(response.data)
    } catch (error: any) {
      setError(error.response?.data?.message || 'Ürünler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await apiClient.delete(`/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
      alert('Ürün başarıyla silindi!')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ürün silinemedi')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const product = products.find(p => p.id === id)
      if (!product) return

      const updatedProduct = { ...product, isActive: !currentStatus }
      await apiClient.put(`/products/${id}`, updatedProduct)
      
      setProducts(products.map(p => 
        p.id === id ? { ...p, isActive: !currentStatus } : p
      ))
      
      alert(`Ürün ${!currentStatus ? 'aktif' : 'pasif'} edildi!`)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Ürün durumu değiştirilemedi')
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    router.push('/')
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
              <Link href="/admin" className="text-2xl font-bold text-red-600">
                Admin Panel
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Ana Sayfa
                </Link>
                <Link href="/admin" className="text-red-600 font-medium">
                  Dashboard
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hoş geldin, {user?.firstName}! (Admin)
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Dashboard */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ürün Yönetimi</h1>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-600">Toplam Ürün</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Aktif Ürün</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock <= 10).length}
                </div>
                <div className="text-sm text-gray-600">Düşük Stok</div>
              </div>
            </div>
            
            <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Yeni Ürün Ekle
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Ürünler yükleniyor...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-600 mb-2">❌</div>
                <div className="text-red-600">{error}</div>
                <button
                  onClick={fetchProducts}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <div>Henüz hiç ürün yok</div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded object-cover"
                              src={product.imageUrl || '/placeholder-image.jpg'}
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock <= 10 ? 'bg-red-100 text-red-800' :
                          product.stock <= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.stock} adet
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(product.id, product.isActive)}
                            className={`${
                              product.isActive 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            } font-medium transition-colors`}
                          >
                            {product.isActive ? 'Pasif Et' : 'Aktif Et'}
                          </button>
                          <span className="text-gray-300">|</span>
                          <button className="text-blue-600 hover:text-blue-900 font-medium transition-colors">
                            Düzenle
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 font-medium transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPage;


