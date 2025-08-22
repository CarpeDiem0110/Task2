'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppSelector } from '@/store'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import { apiClient } from '@/lib/api-client'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated) {
      alert('Bu sayfaya erişmek için giriş yapmanız gerekiyor!')
      router.push('/auth/login')
      return
    }

    if (user?.role !== 'Admin') {
      alert('Bu sayfaya erişim yetkiniz yok!')
      router.push('/')
      return
    }

    fetchProducts()
  }, [isAuthenticated, user, router])

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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
  }

  if (!isAuthenticated || user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Yetki kontrol ediliyor...</p>
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
              <Link href="/" className="text-2xl font-bold text-purple-600">
                Admin Panel
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Ana Sayfa
                </Link>
                <Link href="/admin" className="text-purple-600 font-medium">
                  Admin Panel
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hoş geldin, {user?.firstName}! (Admin)
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Çıkış
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
                  {products.filter(p => p.stock === 0).length}
                </div>
                <div className="text-sm text-gray-600">Stokta Yok</div>
              </div>
            </div>
            
            <Link
              href="/admin/products/new"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Yeni Ürün Ekle
            </Link>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Ürünler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-4">❌</div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.imageUrl || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{product.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          product.stock > 10 ? 'text-green-600' :
                          product.stock > 0 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Düzenle
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(product.id, product.isActive)}
                          className="text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          {product.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          Sil
                        </button>
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
