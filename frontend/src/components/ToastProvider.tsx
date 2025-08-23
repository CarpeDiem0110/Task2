'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Toast, { ToastProps } from './Toast'

interface ToastContextType {
  showToast: (message: string, type: ToastProps['type']) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: number
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = (message: string, type: ToastProps['type']) => {
    const id = Date.now()
    const newToast: ToastItem = {
      id,
      message,
      type,
      duration: 1000
    }
    
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={`transform transition-all duration-300`}
            style={{ 
              transform: `translateY(${index * 80}px)`,
              zIndex: 1000 + index 
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
