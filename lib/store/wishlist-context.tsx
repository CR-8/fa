"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface Product {
  id: string
  name: string
  price: number
  brand: string
  images: string[]
  tryOnPreview: string
  tags: string[]
  category?: string
}

interface WishlistContextType {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleItem: (product: Product) => void
  itemCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const WISHLIST_STORAGE_KEY = 'fashionai_wishlist'

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist))
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Failed to save wishlist:', error)
      }
    }
  }, [items, isHydrated])

  const addItem = useCallback((product: Product) => {
    setItems(prevItems => {
      if (prevItems.some(item => item.id === product.id)) {
        return prevItems
      }
      return [...prevItems, product]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId))
  }, [])

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId)
  }, [items])

  const toggleItem = useCallback((product: Product) => {
    setItems(prevItems => {
      const exists = prevItems.some(item => item.id === product.id)
      if (exists) {
        return prevItems.filter(item => item.id !== product.id)
      } else {
        return [...prevItems, product]
      }
    })
  }, [])

  const value = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    toggleItem,
    itemCount: items.length,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
