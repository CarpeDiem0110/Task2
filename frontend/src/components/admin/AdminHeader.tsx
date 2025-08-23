'use client'

import React from 'react'
import Link from 'next/link'
import { User } from '@/types'

interface AdminHeaderProps {
  user: User
  onLogout: () => void
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-3xl font-bold text-[#D4AF37] hover:text-yellow-600 transition-colors">
              ShopMax Admin
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-[#111111] hover:text-[#D4AF37] font-medium transition-colors">
                Ana Sayfa
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-[#111111]">
              Merhaba, <span className="font-semibold text-[#D4AF37]">{user.firstName} {user.lastName}</span>
            </span>
            <button
              onClick={onLogout}
              className="bg-[#111111] hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
