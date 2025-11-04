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
  description?: string
  sizes?: string[]
  colors?: string[]
}

interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  total: number
  shipping: number
  tax: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'fashionai_cart'
const FREE_SHIPPING_THRESHOLD = 999 // ₹999 for free shipping
const SHIPPING_COST = 99 // ₹99 shipping
const TAX_RATE = 0.18 // 18% GST

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error('Failed to save cart:', error)
      }
    }
  }, [items, isHydrated])

  const addItem = useCallback((product: Product, quantity = 1, size?: string, color?: string) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && 
                item.selectedSize === size && 
                item.selectedColor === color
      )

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newItems = [...prevItems]
        newItems[existingItemIndex].quantity += quantity
        return newItems
      } else {
        // Add new item
        return [...prevItems, { product, quantity, selectedSize: size, selectedColor: color }]
      }
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity === 0) {
      removeItem(productId)
    } else {
      setItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // Calculate cart totals
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const tax = subtotal * TAX_RATE
  const total = subtotal + shipping + tax
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    total,
    shipping,
    tax,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
