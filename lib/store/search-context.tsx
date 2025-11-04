"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchContextType {
  query: string
  setQuery: (query: string) => void
  performSearch: (query: string) => void
  recentSearches: string[]
  clearRecentSearches: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

const RECENT_SEARCHES_KEY = 'fashionai_recent_searches'
const MAX_RECENT_SEARCHES = 5

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }, [])

  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Update recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== searchQuery.toLowerCase())
      const updated = [searchQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save recent searches:', error)
      }
      return updated
    })

    // Navigate to shop page with search query
    router.push(`/shop?q=${encodeURIComponent(searchQuery)}`)
  }, [router])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    } catch (error) {
      console.error('Failed to clear recent searches:', error)
    }
  }, [])

  const value = {
    query,
    setQuery,
    performSearch,
    recentSearches,
    clearRecentSearches,
  }

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}
