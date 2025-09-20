"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"
import { products, categories } from "@/data/products"
import { Search, Filter, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter products based on category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">



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
              <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                Featured
              </Button>
              <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                Price: Low to High
              </Button>
              <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
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
