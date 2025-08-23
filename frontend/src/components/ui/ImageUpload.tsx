'use client'

import React, { useState, useRef } from 'react'

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (file: File | null) => void
  label?: string
  required?: boolean
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  label = "Resim",
  required = false
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Dosya türü kontrolü
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        alert('Sadece JPG, JPEG, PNG ve GIF dosyaları yükleyebilirsiniz.')
        return
      }

      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır.')
        return
      }

      // Preview oluştur
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      onImageChange(file)
    } else {
      setPreview(null)
      onImageChange(null)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileChange(files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        🖼️ {label} {required && '*'}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
          required={required && !preview}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-32 mx-auto rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="py-4">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Resim yüklemek için tıklayın</span>
              <br />
              veya dosyayı buraya sürükleyin
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF (max. 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUpload
