'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { loginUser } from '@/store/slices/authSlice'

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('Sending login data:', credentials)
      const result = await dispatch(loginUser(credentials)).unwrap()
      console.log('Login successful:', result)
      router.push('/')
    } catch (error: any) {
      console.error('Login failed:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">ShopMax</h1>
          <h2 className="text-2xl font-bold text-white">
            Hesabınıza giriş yapın
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="E-posta adresiniz"
                value={credentials.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="Şifreniz"
                value={credentials.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-lg text-[#111111] bg-[#D4AF37] hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          <div className="text-center space-y-3">
            <Link 
              href="/auth/register"
              className="block text-[#D4AF37] hover:text-yellow-600 font-medium transition-colors"
            >
              Hesabınız yok mu? Kayıt olun
            </Link>
            <Link 
              href="/"
              className="block text-gray-300 hover:text-white font-medium transition-colors"
            >
              ← Ana sayfaya dön
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
