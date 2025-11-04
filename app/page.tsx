'use client';

import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { products } from "@/data/products"
import { suggestions } from "@/data/suggestions"
import { Sparkles, Shirt } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  // Get suggested products
  const suggestedProductIds = suggestions[0]?.recommendedProducts || []
  const suggestedProducts = products.filter((p) => suggestedProductIds.includes(p.id))

  // Get new arrivals (latest 6 products)
  const newArrivals = products
    .sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime())
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero Section */}
      <section className="px-6 lg:px-8 pt-10 pb-12">
        <div className="max-w-7xl mx-auto text-center p-8 md:p-12 lg:p-16 rounded-sm border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-neutral-900 dark:bg-neutral-100 rounded-sm border-2 border-neutral-900 dark:border-neutral-100">
              <Sparkles className="h-12 w-12 text-neutral-50 dark:text-neutral-900" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
            Your Wardrobe Reinvented
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg max-w-2xl mx-auto font-medium">
            Discover AI-powered fashion recommendations, style analytics, and virtual try-ons — all from your own wardrobe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-6 border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm font-bold uppercase tracking-wide">
              <Link href="/wardrobe" className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Explore Wardrobe
              </Link>
            </Button>
            <Button variant="ghost" asChild size="lg" className="h-12 px-6 border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm font-bold uppercase tracking-wide">
              <Link href="/shop">Shop Now</Link>
            </Button>
          </div> 
        </div>
      </section>


      {/* AI Suggestions Section */}
      <section className="px-6 lg:px-8 pb-12">
        <div className="mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Recommended for You</h2>
            <Button variant="ghost" size="sm" asChild className="font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm">
              <Link href="/ai-fa">
                View All
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {suggestedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showTryOn />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="px-6 lg:px-8 pb-12 bg-neutral-100 dark:bg-neutral-900 border-y-2 border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">New Arrivals</h2>
            <Button variant="ghost" size="sm" asChild className="font-bold uppercase tracking-wide hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm">
              <Link href="/shop">
                View All
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
