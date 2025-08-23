'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/store'
import { registerUser } from '@/store/slices/authSlice'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [validationError, setValidationError] = useState('')
  
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Şifreler eşleşmiyor')
      return
    }
    
    if (formData.password.length < 6) {
      setValidationError('Şifre en az 6 karakter olmalıdır')
      return
    }
    
    try {
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 0 as const // Her zaman Customer (0)
      }
      
      console.log('Sending register data:', registerData)
      const result = await dispatch(registerUser(registerData)).unwrap()
      console.log('Register successful:', result)
      router.push('/')
    } catch (error: any) {
      console.error('Registration failed:', error)
      setValidationError(error?.message || 'Kayıt sırasında bir hata oluştu')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
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
            Yeni hesap oluşturun
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || validationError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || validationError}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                Ad
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="block w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="Adınız"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                Soyad
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="block w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="Soyadınız"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
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
                value={formData.email}
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
                placeholder="Şifreniz (en az 6 karakter)"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Şifre Tekrarı
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="block w-full px-4 py-3 border border-gray-600 rounded-lg text-white placeholder-gray-400 bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
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
              {isLoading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <div className="text-center space-y-3">
            <Link 
              href="/auth/login"
              className="block text-[#D4AF37] hover:text-yellow-600 font-medium transition-colors"
            >
              Zaten hesabınız var mı? Giriş yapın
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
