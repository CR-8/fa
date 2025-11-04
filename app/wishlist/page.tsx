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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
      <div className="container mx-auto px-6 lg:px-8 py-10 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-neutral-900 dark:bg-neutral-100 rounded-sm border-2 border-neutral-900 dark:border-neutral-100">
              <Heart className="h-8 w-8 text-neutral-50 dark:text-neutral-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                My Wishlist
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 font-medium uppercase text-sm tracking-wide">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length > 0 ? (
          <>
            {/* Quick Actions */}
            <div className="flex gap-4 mb-8">
              <Button 
                className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 h-12 px-6 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 h-12 px-6 rounded-sm font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Clear Wishlist
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {wishlistItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <Card className="max-w-md mx-auto bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-6 h-20 w-20 rounded-sm bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-2 border-neutral-300 dark:border-neutral-700">
                <Heart className="h-10 w-10 text-neutral-500 dark:text-neutral-400" />
              </div>
              <CardTitle className="text-neutral-900 dark:text-neutral-100 font-bold uppercase tracking-tight text-2xl">Your wishlist is empty</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 font-medium">
                Start adding items you love to your wishlist
              </p>
              <Button asChild className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 h-12 px-8 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide">
                <Link href="/shop">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}