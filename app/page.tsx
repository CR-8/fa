import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"
import { products } from "@/data/products"
import { suggestions } from "@/data/suggestions"
import { Sparkles, Shirt, ArrowRight, Construction } from "lucide-react"
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
      <section className="px-4 pt-8 pb-8">
        {/* Increased bottom padding for better spacing */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 shadow-lg">
          {/* Enhanced gradient and added shadow */}
          <CardContent className="p-8 text-center">
            {/* Increased padding for more spacious feel */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/20 rounded-full">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-balance">AI-Powered Fashion Assistant</h1>{" "}
            {/* Increased font size and margin */}
            <p className="text-muted-foreground mb-6 text-pretty text-lg leading-relaxed">
              {/* Enhanced typography */}
              Discover your perfect style with AI recommendations and virtual try-on technology
            </p>
            <div className="flex gap-3 justify-center">
              {/* Made buttons larger */}
              <Button asChild size="lg">
                <Link href="/ai-fa">Chat with AI-FA</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/shop">Browse Shop</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* AI Suggestions Section */}
      <section className="px-4 pb-8">
        {/* Increased bottom padding */}
        <div className="flex items-center justify-between mb-6">
          {/* Increased margin bottom */}
          <div className="flex items-center gap-3">
            {/* Increased gap */}
            <div className="p-2 bg-primary/10 rounded-lg">
              {/* Added background container for icon */}
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">AI Suggestions</h2> {/* Increased font size and weight */}
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
            {/* Enhanced button styling */}
            <Link href="/ai-fa" className="flex items-center gap-1">
              More <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mb-6 text-lg leading-relaxed">{suggestions[0]?.reasoning}</p>{" "}
        {/* Enhanced typography */}
        <div className="grid grid-cols-2 gap-6">
          {/* Increased gap between cards */}
          {suggestedProducts.map((product) => (
            <ProductCard key={product.id} product={product} showTryOn />
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="px-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              {/* Added background container with accent color */}
              <Shirt className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-2xl font-bold">New Arrivals</h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
            <Link href="/shop" className="flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Wardrobe Section */}
      <section className="px-4 pb-8">
        <Card className="border-dashed border-2 border-muted-foreground/30 shadow-sm">
          {/* Added subtle shadow */}
          <CardContent className="p-8 text-center">
            {/* Increased padding */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-muted rounded-full">
                <Construction className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Your Wardrobe</h3> {/* Enhanced typography */}
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
              Organize and manage your personal wardrobe collection
            </p>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              {/* Made badge larger */}🚧 Coming Soon
            </Badge>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
