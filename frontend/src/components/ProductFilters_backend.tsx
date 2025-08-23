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
    // Fiyat validasyonu
    const minPrice = localMinPrice ? parseInt(localMinPrice) : null
    const maxPrice = localMaxPrice ? parseInt(localMaxPrice) : null
    
    // Negatif fiyat kontrolü
    if (minPrice && minPrice < 0) {
      alert('Minimum fiyat negatif olamaz!')
      return
    }
    
    if (maxPrice && maxPrice < 0) {
      alert('Maksimum fiyat negatif olamaz!')
      return
    }
    
    // Min > Max kontrolü
    if (minPrice && maxPrice && minPrice > maxPrice) {
      alert('Minimum fiyat, maksimum fiyattan büyük olamaz!')
      return
    }
    
    const filterParams: FilterParams = {}
    
    if (localCategory) filterParams.category = localCategory
    if (minPrice) filterParams.minPrice = minPrice
    if (maxPrice) filterParams.maxPrice = maxPrice
    
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
    <div className="bg-white p-6 mb-6 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Kategori */}
        <div>
          <label className="block text-sm font-medium text-[#111111] mb-2">
            Kategori
          </label>
          <select
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-[#111111]"
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
          <label className="block text-sm font-medium text-[#111111] mb-2">
            Fiyat Aralığı (TL)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-[#111111]"
            />
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-[#111111]"
            />
          </div>
        </div>

        {/* Sıralama */}
        <div>
          <label className="block text-sm font-medium text-[#111111] mb-2">
            Sıralama
          </label>
          <select
            value={`${localSortBy}-${localSortDesc ? 'desc' : 'asc'}`}
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split('-') as ['price' | 'date', 'asc' | 'desc']
              setLocalSortBy(sortBy)
              setLocalSortDesc(order === 'desc')
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#D4AF37] focus:border-[#D4AF37] text-[#111111]"
          >
            <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
            <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
            <option value="date-desc">Tarih (Yeni)</option>
            <option value="date-asc">Tarih (Eski)</option>
          </select>
        </div>
      </div>

      {/* Butonlar - Alt kısımda ortalanmış */}
      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={applyFilters}
          className="bg-[#D4AF37]  text-black font-medium py-2 px-7 rounded-xl transition-colors"
        >
          🔍 Filtrele
        </button>
        <button
          onClick={clearAllFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-7 rounded-xl transition-shadow"
        >
          🗑️ Temizle
        </button>
      </div>
      

      {/* Aktif Filtreler */}
      {(localCategory || localMinPrice || localMaxPrice || localSortDesc) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {localCategory && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37] bg-opacity-20 text-[#111111]">
              Kategori: {localCategory}
            </span>
          )}
          {(localMinPrice || localMaxPrice) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37] bg-opacity-20 text-[#111111]">
              Fiyat: {localMinPrice || '∞'} - {localMaxPrice || '∞'} TL
            </span>
          )}
          {localSortDesc && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37] bg-opacity-20 text-[#111111]">
              Sıralama: {localSortBy} {localSortDesc ? '↓' : '↑'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
