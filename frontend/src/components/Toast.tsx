'use client'

import { useEffect, useState } from 'react'

export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type, duration = 300, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Görünür hale getir
    setIsVisible(true)
    
    // Belirtilen süre sonra kaybol
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => {
        onClose()
      }, 100) // Animation süresi
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-400 text-green-800 shadow-lg'
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800 shadow-lg'
      case 'warning':
        return 'bg-[#D4AF37] bg-opacity-10 border-[#D4AF37] text-[#111111] shadow-lg'
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-800 shadow-lg'
      default:
        return 'bg-gray-50 border-gray-400 text-gray-800 shadow-lg'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div
      className={`max-w-sm w-full transform transition-all duration-500 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div
        className={`border-l-4 p-4 rounded-lg backdrop-blur-sm ${getToastStyles()}`}
        role="alert"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-xl">{getIcon()}</span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              onClick={() => {
                setIsLeaving(true)
                setTimeout(onClose, 300)
              }}
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
