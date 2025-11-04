"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { products, categories } from "@/data/products"
import { Search, Filter, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import dynamic from "next/dynamic"

// Lazy load ProductCard for better performance
const ProductCard = dynamic(() => import("@/components/product-card").then(mod => ({ default: mod.ProductCard })), {
  loading: () => (
    <div className="animate-pulse">
      <Card className="border-border/50 bg-card">
        <div className="p-0 h-[50vh]">
          <div className="h-[38vh] bg-muted -mt-8"></div>
          <div className="p-4 space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    </div>
  )
})

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")

  // Filter and sort products based on category, search, and sort
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
          return new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime()
        default:
          return 0 // featured - keep original order
      }
    })

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">

      {/* Category Filters */}
      <div className="px-6 lg:px-8 py-6 border-b-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap text-xs px-6 py-3 h-auto font-bold rounded-sm border-2 uppercase tracking-wide transition-all ${
                  selectedCategory === category.id
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                    : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                aria-label={`Filter products by ${category.name} category`}
                aria-pressed={selectedCategory === category.id}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="px-6 lg:px-8 py-6 bg-neutral-100 dark:bg-neutral-900 border-b-2 border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
              {selectedCategory !== "all" && (
                <Badge variant="outline" className="text-xs px-3 py-1.5 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-bold uppercase">
              <span>SORT:</span>
              <Button
                variant={sortBy === "featured" ? "default" : "ghost"}
                size="sm"
                className={`h-auto px-3 py-1.5 text-xs font-bold rounded-sm ${
                  sortBy === "featured" 
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
                onClick={() => setSortBy("featured")}
                aria-label="Sort products by featured order"
                aria-pressed={sortBy === "featured"}
              >
                FEATURED
              </Button>
              <Button
                variant={sortBy === "price-low" ? "default" : "ghost"}
                size="sm"
                className={`h-auto px-3 py-1.5 text-xs font-bold rounded-sm ${
                  sortBy === "price-low" 
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
                onClick={() => setSortBy("price-low")}
                aria-label="Sort products by price low to high"
                aria-pressed={sortBy === "price-low"}
              >
                PRICE ↑
              </Button>
              <Button
                variant={sortBy === "price-high" ? "default" : "ghost"}
                size="sm"
                className={`h-auto px-3 py-1.5 text-xs font-bold rounded-sm ${
                  sortBy === "price-high" 
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
                onClick={() => setSortBy("price-high")}
                aria-label="Sort products by price high to low"
                aria-pressed={sortBy === "price-high"}
              >
                PRICE ↓
              </Button>
              <Button
                variant={sortBy === "newest" ? "default" : "ghost"}
                size="sm"
                className={`h-auto px-3 py-1.5 text-xs font-bold rounded-sm ${
                  sortBy === "newest" 
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
                onClick={() => setSortBy("newest")}
                aria-label="Sort products by newest arrivals"
                aria-pressed={sortBy === "newest"}
              >
                NEWEST
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-6 lg:px-8 py-10">
        <div className="mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto space-y-6">
                <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-sm flex items-center justify-center mx-auto border-2 border-neutral-300 dark:border-neutral-700">
                  <Search className="h-10 w-10 text-neutral-500 dark:text-neutral-400" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tight text-neutral-900 dark:text-neutral-100">No Products Found</h3>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Try adjusting your search or browse our full collection
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("all")
                    setSearchQuery("")
                  }}
                  className="mt-6 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className={viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
              : "space-y-6"
            }>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
