import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"
import { products } from "@/data/products"
import { suggestions } from "@/data/suggestions"
import { Sparkles, Shirt, ArrowRight, Construction, Star, Shield, Truck, RotateCcw } from "lucide-react"
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 pt-8 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            FashionAI
          </h1>
          <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
            Discover your perfect style with AI-powered recommendations and virtual try-on technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/ai-fa" className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Stylist
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/shop" className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Suggestions Section */}
      <section className="px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ai-fa">
                View All
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {suggestedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showTryOn />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="px-4 pb-12 bg-muted/20">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/shop">
                View All
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
