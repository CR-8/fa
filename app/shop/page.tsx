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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3 px-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-full">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg md:text-xl">Shop</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="hidden md:flex"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="hidden md:flex"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Search Bar */}
      <div className="p-3 md:p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, brands, or styles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 md:h-10"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-3 md:p-4 border-b">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap text-xs md:text-sm px-3 py-2 h-auto"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filteredProducts.length} products found</span>
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {categories.find((c) => c.id === selectedCategory)?.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-3 md:p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products found matching your criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all")
                setSearchQuery("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4" : "space-y-3 md:space-y-4"}>
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.id}`}>
                <div className={viewMode === "list" ? "flex gap-4" : ""}>
                  <ProductCard product={product} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
