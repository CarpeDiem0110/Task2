'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store'
import { logout, initializeAuth } from '@/store/slices/authSlice'
import { Product } from '@/types'
import { apiClient } from '@/lib/api-client'

// Import components
import AdminHeader from '@/components/admin/AdminHeader'
import ProductStats from '@/components/admin/ProductStats'
import ProductTable from '@/components/admin/ProductTable'
import AddProductModal from '@/components/admin/AddProductModal'
import EditProductModal from '@/components/admin/EditProductModal'

const AdminPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
    isActive: true
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (!isAuthenticated && token && storedUser) {
      dispatch(initializeAuth())
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModals()
      }
    }

    if (showAddModal || showEditModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showAddModal, showEditModal])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/products')
        setProducts(response.data as Product[])
      } catch (error: any) {
        setError(error.response?.data?.message || 'Ürünler yüklenemedi')
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchProducts()
    }

    return () => {
      setProducts([])
      setError(null)
      setIsLoading(true)
    }
  }, [isAuthenticated])

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    
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

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      imageUrl: '',
      isActive: true
    })
    setShowAddModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || '',
      isActive: product.isActive
    })
    setShowEditModal(true)
  }

  const closeModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setEditingProduct(null)
    setSelectedImage(null)
    setEditSelectedImage(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      imageUrl: '',
      isActive: true
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleImageChange = (file: File | null) => {
    setSelectedImage(file)
  }

  const handleEditImageChange = (file: File | null) => {
    setEditSelectedImage(file)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      console.log('Token:', token) // Debug için
      
      // Token decode test
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('Token payload:', payload)
        console.log('Role:', payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'])
      }
      
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price)
      submitData.append('category', formData.category)
      submitData.append('stock', formData.stock)
      submitData.append('isActive', formData.isActive.toString())
      
      if (selectedImage) {
        submitData.append('imageFile', selectedImage)
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      if (response.ok) {
        const newProduct = await response.json()
        setProducts([...products, newProduct])
        closeModals()
        alert('Ürün başarıyla eklendi!')
      } else {
        const error = await response.text()
        alert(error || 'Ürün eklenemedi')
      }
    } catch (error: any) {
      console.error('Ürün ekleme hatası:', error)
      alert('Bir hata oluştu!')
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProduct) return
    
    try {
      const token = localStorage.getItem('token')
      console.log('Edit Token:', token) // Debug için
      
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price)
      submitData.append('category', formData.category)
      submitData.append('stock', formData.stock)
      submitData.append('isActive', formData.isActive.toString())
      
      if (editSelectedImage) {
        submitData.append('imageFile', editSelectedImage)
      } else if (formData.imageUrl) {
        submitData.append('imageUrl', formData.imageUrl)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      if (response.ok) {
        const updatedProduct = await response.json()
        setProducts(products.map(p => 
          p.id === editingProduct.id ? updatedProduct : p
        ))
        closeModals()
        alert('Ürün başarıyla güncellendi!')
      } else {
        const error = await response.text()
        alert(error || 'Ürün güncellenemedi')
      }
    } catch (error: any) {
      console.error('Ürün güncelleme hatası:', error)
      alert('Bir hata oluştu!')
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
      <AdminHeader user={user} onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-8">
        <ProductStats 
          totalProducts={products.length}
          activeProducts={products.filter(p => p.isActive).length}
          lowStockProducts={products.filter(p => p.stock <= 10).length}
          onAddProduct={openAddModal}
        />

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ProductTable 
            products={products}
            isLoading={isLoading}
            error={error}
            onEdit={openEditModal}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteProduct}
          />
        </div>
      </div>

      <AddProductModal 
        showModal={showAddModal}
        formData={formData}
        selectedImage={selectedImage}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSubmit={handleAddProduct}
        onClose={closeModals}
      />

      <EditProductModal 
        showModal={showEditModal}
        formData={formData}
        selectedImage={editSelectedImage}
        onInputChange={handleInputChange}
        onImageChange={handleEditImageChange}
        onSubmit={handleEditProduct}
        onClose={closeModals}
      />
    </div>
  )
}

export default AdminPage
