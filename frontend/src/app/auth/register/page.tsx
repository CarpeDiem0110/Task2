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
        role: 0 as const // 0 = Customer
      }
      
      console.log('Sending register data:', registerData)
      const result = await dispatch(registerUser(registerData)).unwrap()
      console.log('Register successful:', result)
      router.push('/products')
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
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
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adınız"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Soyadınız"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="E-posta adresiniz"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Şifreniz (en az 6 karakter)"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/auth/login"
              className="text-blue-600 hover:text-blue-500"
            >
              Zaten hesabınız var mı? Giriş yapın
            </Link>
          </div>

          <div className="text-center">
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-500"
            >
              Ana sayfaya dön
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
