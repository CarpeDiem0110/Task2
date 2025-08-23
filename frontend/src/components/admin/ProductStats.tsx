'use client'

import React from 'react'

interface ProductStatsProps {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  onAddProduct: () => void
}

const ProductStats: React.FC<ProductStatsProps> = ({
  totalProducts,
  activeProducts,
  lowStockProducts,
  onAddProduct
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-[#D4AF37] mb-2">{totalProducts}</div>
            <div className="text-sm text-gray-600 font-medium">Toplam Ürün</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-green-600 mb-2">{activeProducts}</div>
            <div className="text-sm text-gray-600 font-medium">Aktif Ürün</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-red-600 mb-2">{lowStockProducts}</div>
            <div className="text-sm text-gray-600 font-medium">Düşük Stok</div>
          </div>
        </div>
        
        <button 
          onClick={onAddProduct}
          className="bg-[#D4AF37] hover:bg-yellow-600 text-[#111111] font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="flex items-center space-x-2">
            <span className="text-xl">+</span>
            <span>Yeni Ürün Ekle</span>
          </span>
        </button>
      </div>
    </div>
  )
}

export default ProductStats
