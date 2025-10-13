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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">

      {/* Search Bar */}
      <div className="px-4 md:px-6 py-4 md:py-6 bg-background/30">
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-background border-border/50 rounded-full"
              aria-label="Search products by name, brand, or tags"
            />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-4 md:p-6 border-b border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap text-xs md:text-sm px-4 py-2 h-auto font-medium hover:shadow-md transition-all duration-200"
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
      <div className="px-4 md:px-6 py-4 md:py-6 bg-background/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm md:text-base text-muted-foreground font-medium">
                {filteredProducts.length} premium {filteredProducts.length === 1 ? 'item' : 'items'} found
              </span>
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="text-xs md:text-sm px-3 py-1">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </Badge>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sort by:</span>
              <Button
                variant={sortBy === "featured" ? "default" : "ghost"}
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setSortBy("featured")}
                aria-label="Sort products by featured order"
                aria-pressed={sortBy === "featured"}
              >
                Featured
              </Button>
              <Button
                variant={sortBy === "price-low" ? "default" : "ghost"}
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setSortBy("price-low")}
                aria-label="Sort products by price low to high"
                aria-pressed={sortBy === "price-low"}
              >
                Price: Low to High
              </Button>
              <Button
                variant={sortBy === "price-high" ? "default" : "ghost"}
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setSortBy("price-high")}
                aria-label="Sort products by price high to low"
                aria-pressed={sortBy === "price-high"}
              >
                Price: High to Low
              </Button>
              <Button
                variant={sortBy === "newest" ? "default" : "ghost"}
                size="sm"
                className="h-auto p-1 text-xs"
                onClick={() => setSortBy("newest")}
                aria-label="Sort products by newest arrivals"
                aria-pressed={sortBy === "newest"}
              >
                Newest
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or browse our full collection
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("all")
                    setSearchQuery("")
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className={viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
              : "space-y-4 md:space-y-6"
            }>
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} className="group">
                  <div className={viewMode === "list" ? "flex gap-6 p-4 border border-border/50 rounded-lg hover:shadow-md transition-shadow" : ""}>
                    <ProductCard product={product} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
