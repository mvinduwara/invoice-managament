import React, { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm:  'max-w-md',
    md:  'max-w-2xl',
    lg:  'max-w-4xl',
    xl:  'max-w-6xl',
    full:'max-w-full mx-4',
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full ${sizes[size]} glass-card shadow-2xl animate-in`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 
                       p-1.5 rounded-lg transition-all duration-200"
          >
            <FiX size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}