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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınıza giriş yapın
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                placeholder="E-posta adresiniz"
                value={credentials.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/auth/register"
              className="text-blue-600 hover:text-blue-500"
            >
              Hesabınız yok mu? Kayıt olun
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
