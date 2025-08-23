'use client'

import React from 'react'
import { Product } from '@/types'

interface ProductTableProps {
  products: Product[]
  isLoading: boolean
  error: string | null
  onEdit: (product: Product) => void
  onToggleStatus: (id: string, currentStatus: boolean) => void
  onDelete: (id: string) => void
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  error,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4 text-lg">❌ {error}</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-[#111111] mb-4 text-lg">📦 Henüz ürün bulunmuyor</div>
        <p className="text-gray-600">İlk ürününüzü eklemek için "Yeni Ürün Ekle" butonunu kullanın.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-[#111111] to-gray-800 text-white">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
              Ürün
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
              Kategori
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
              Fiyat
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
              Stok
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
              Durum
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12">
                    <img
                      className="h-12 w-12 rounded-lg object-cover shadow-sm border border-gray-200"
                      src={product.imageUrl || '/placeholder-image.jpg'}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-semibold text-[#111111]">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-600 truncate max-w-xs">
                      {product.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#D4AF37] bg-opacity-20 text-[#111111] border border-[#D4AF37] border-opacity-30">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#111111]">
                ₺{product.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  product.stock <= 10 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : product.stock <= 50 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {product.stock} adet
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  product.isActive 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {product.isActive ? '✅ Aktif' : '❌ Pasif'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onToggleStatus(product.id, product.isActive)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all duration-200 ${
                      product.isActive 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                    }`}
                  >
                    {product.isActive ? 'Pasif Et' : 'Aktif Et'}
                  </button>
                  <button 
                    onClick={() => onEdit(product)}
                    className="px-3 py-1 rounded-lg font-semibold bg-[#D4AF37] bg-opacity-20 text-[#111111] hover:bg-[#D4AF37] hover:bg-opacity-30 hover:shadow-md transition-all duration-200 border border-[#D4AF37] border-opacity-30"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="px-3 py-1 rounded-lg font-semibold bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md transition-all duration-200 border border-red-200"
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
  )
}

export default ProductTable
