'use client'

import React from 'react'
import ImageUpload from '@/components/ui/ImageUpload'
import { Product } from '@/types'

interface EditProductModalProps {
  showModal: boolean
  formData: {
    name: string
    description: string
    price: string
    category: string
    stock: string
    imageUrl: string
    isActive: boolean
  }
  selectedImage: File | null
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onImageChange: (file: File | null) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  showModal,
  formData,
  selectedImage,
  onInputChange,
  onImageChange,
  onSubmit,
  onClose
}) => {
  if (!showModal) return null

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm overflow-y-auto max-h-screen w-full z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 transform transition-all mx-auto"
        style={{ maxHeight: '90vh' }}
      >
        <div className="bg-gradient-to-r from-[#111111] to-gray-800 rounded-t-xl px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">✏️ Ürün Düzenle</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-[#D4AF37] text-2xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2">
                🏷️ Ürün Adı
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                placeholder="Ürün adını giriniz"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2">
                📝 Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={onInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all resize-none"
                placeholder="Ürün açıklamasını giriniz"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[#111111] mb-2">
                  💰 Fiyat (₺)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={onInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#111111] mb-2">
                  📦 Stok Adedi
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={onInputChange}
                  min="0"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-2">
                📂 Kategori
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={onInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
              >
                <option value="">Kategori Seçin</option>
                <option value="Elektronik">📱 Elektronik</option>
                <option value="Giyim">👕 Giyim</option>
                <option value="Ev & Bahçe">🏠 Ev & Bahçe</option>
                <option value="Spor">⚽ Spor</option>
                <option value="Kitap">📚 Kitap</option>
                <option value="Oyuncak">🧸 Oyuncak</option>
              </select>
            </div>
            
            <ImageUpload
              currentImage={formData.imageUrl}
              onImageChange={onImageChange}
              label="Ürün Resmi"
              required={false}
            />
            
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={onInputChange}
                className="h-5 w-5 text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300 rounded"
              />
              <label className="flex items-center text-sm font-bold text-[#111111]">
                ✅ Ürün Aktif Durumda
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-[#111111] rounded-lg hover:bg-gray-200 transition-all font-bold"
              >
                ❌ İptal
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] text-[#111111] rounded-lg hover:bg-yellow-600 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🔄 Güncelle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProductModal
