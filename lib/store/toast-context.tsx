"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-24 lg:bottom-6 right-6 z-[100] space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto animate-in slide-in-from-right duration-300
              px-6 py-3 rounded-sm border-2 font-bold uppercase text-sm tracking-wide
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]
              ${toast.type === 'success' ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100' : ''}
              ${toast.type === 'error' ? 'bg-red-600 dark:bg-red-500 text-white border-red-600 dark:border-red-500' : ''}
              ${toast.type === 'info' ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500' : ''}
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
