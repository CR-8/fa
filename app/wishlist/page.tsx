"use client"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { products } from "@/data/products"
import { Heart, ShoppingCart } from "lucide-react"
import Link from "next/link"

// Simulate wishlist items (in a real app, this would come from user data)
const wishlistItems = [
  products[0], // Classic White Tee
  products[1], // Blue Denim Jeans
  products[3], // Red Hoodie
]

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              My Wishlist
            </h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length > 0 ? (
          <>
            {/* Quick Actions */}
            <div className="flex gap-4 mb-8">
              <Button 
                className="bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
              <Button 
                variant="outline" 
                className="border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
              >
                Clear Wishlist
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <Card className="max-w-md mx-auto bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                <Heart className="h-10 w-10 text-neutral-400 dark:text-neutral-500" />
              </div>
              <CardTitle className="text-neutral-900 dark:text-neutral-50">Your wishlist is empty</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Start adding items you love to your wishlist
              </p>
              <Button asChild className="bg-neutral-900 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-900">
                <Link href="/shop">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}