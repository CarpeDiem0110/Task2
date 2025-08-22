'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store'
import { 
  setCategory, 
  setPriceRange, 
  setSortBy, 
  setSortOrder,
  clearFilters, 
  fetchFilteredProducts,
  fetchProducts,
  FilterParams
} from '@/store/slices/productsSlice'

// Mevcut kategoriler - backend'den gelecek
const CATEGORIES = [
  'Elektrik',
  'Giyim',
  'Kitap', 
  'Spor',
  'Ev & Yaşam',
  'Kozmetik'
]

export default function ProductFilters() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { filters } = useAppSelector((state) => state.products)
  
  const [localMinPrice, setLocalMinPrice] = useState<string>('')
  const [localMaxPrice, setLocalMaxPrice] = useState<string>('')
  const [localCategory, setLocalCategory] = useState<string>('')
  const [localSortBy, setLocalSortBy] = useState<'price' | 'date'>('price')
  const [localSortDesc, setLocalSortDesc] = useState<boolean>(false)

  // URL'i güncelle
  const updateURL = (filterParams: FilterParams) => {
    const params = new URLSearchParams()
    
    if (filterParams.category) params.set('category', filterParams.category)
    if (filterParams.minPrice !== undefined) params.set('minPrice', filterParams.minPrice.toString())
    if (filterParams.maxPrice !== undefined) params.set('maxPrice', filterParams.maxPrice.toString())
    if (filterParams.sortBy) params.set('sortBy', filterParams.sortBy)
    if (filterParams.sortDescending) params.set('sortDesc', 'true')

    const queryString = params.toString()
    const newURL = queryString ? `/?${queryString}` : '/'
    
    router.push(newURL, { scroll: false })
  }

  // Filtreleri uygula
  const applyFilters = () => {
    const filterParams: FilterParams = {}
    
    if (localCategory) filterParams.category = localCategory
    if (localMinPrice) filterParams.minPrice = parseInt(localMinPrice)
    if (localMaxPrice) filterParams.maxPrice = parseInt(localMaxPrice)
    
    // Sıralama her zaman ekle
    filterParams.sortBy = localSortBy
    filterParams.sortDescending = localSortDesc
    
    console.log('🔍 Filter Params:', {
      sortBy: filterParams.sortBy,
      sortDescending: filterParams.sortDescending,
      localSortBy,
      localSortDesc
    })

    // Redux state'i güncelle
    dispatch(setCategory(localCategory))
    if (localMinPrice || localMaxPrice) {
      dispatch(setPriceRange({ 
        min: localMinPrice ? parseInt(localMinPrice) : null, 
        max: localMaxPrice ? parseInt(localMaxPrice) : null 
      }))
    }
    // Backend date kullanırken Redux createdAt kullanıyor - mapping yapalım
    const reduxSortBy = localSortBy === 'date' ? 'createdAt' : localSortBy as 'name' | 'price' | 'createdAt'
    dispatch(setSortBy(reduxSortBy))
    dispatch(setSortOrder(localSortDesc ? 'desc' : 'asc'))
    
    // URL'i güncelle
    updateURL(filterParams)
    
    // Backend'den filtrelenmiş ürünleri getir
    const hasFilters = Object.keys(filterParams).length > 0
    if (hasFilters) {
      console.log('🔍 Filtreler uygulanıyor:', filterParams)
      dispatch(fetchFilteredProducts(filterParams))
    } else {
      console.log('📦 Tüm ürünler getiriliyor')
      dispatch(fetchProducts())
    }
  }

  // Filtreleri temizle
  const clearAllFilters = () => {
    setLocalCategory('')
    setLocalMinPrice('')
    setLocalMaxPrice('')
    setLocalSortBy('price')
    setLocalSortDesc(false)
    
    dispatch(clearFilters())
    router.push('/', { scroll: false })
    dispatch(fetchProducts())
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori
          </label>
          <select
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tüm Kategoriler</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Fiyat Aralığı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fiyat Aralığı (TL)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sıralama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sıralama
          </label>
          <select
            value={`${localSortBy}-${localSortDesc ? 'desc' : 'asc'}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split('-') as ['price' | 'date', 'asc' | 'desc']
              setLocalSortBy(sortBy)
              setLocalSortDesc(order === 'desc')
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
            <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
            <option value="date-desc">Tarih (Yeni)</option>
            <option value="date-asc">Tarih (Eski)</option>
          </select>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={applyFilters}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            🔍 Filtrele
          </button>
          <button
            onClick={clearAllFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            🗑️ Temizle
          </button>
        </div>
      </div>

      {/* Aktif Filtreler */}
      {(localCategory || localMinPrice || localMaxPrice || localSortDesc) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {localCategory && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Kategori: {localCategory}
            </span>
          )}
          {(localMinPrice || localMaxPrice) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Fiyat: {localMinPrice || '∞'} - {localMaxPrice || '∞'} TL
            </span>
          )}
          {localSortDesc && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Sıralama: {localSortBy} {localSortDesc ? '↓' : '↑'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
