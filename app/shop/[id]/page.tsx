import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { products } from "@/data/products"
import { ArrowLeft, Heart, Share, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = products.find((p) => p.id === params.id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-10 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="aspect-square relative">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
        {product.tags.includes("new") && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">New</Badge>
        )}
      </div>

      {/* Try-on Preview */}
      <div className="p-4 border-b">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Virtual Try-On</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden mb-4">
              <Image
                src={product.tryOnPreview || "/placeholder.svg"}
                alt={`${product.name} try-on preview`}
                fill
                className="object-cover"
              />
            </div>
            <Button className="w-full">Try Different Poses</Button>
          </CardContent>
        </Card>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{product.name}</h1>
            <p className="text-muted-foreground">{product.brand}</p>
          </div>
          <p className="text-2xl font-bold text-primary">${product.price}</p>
        </div>

        <p className="text-muted-foreground mb-6">{product.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Sizes */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Available Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <Button key={size} variant="outline" size="sm">
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Available Colors</h3>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <Badge key={color} variant="outline" className="capitalize">
                {color}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full" size="lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
          <Button variant="outline" className="w-full bg-transparent" size="lg">
            Save to Wishlist
          </Button>
        </div>
      </div>
    </div>
  )
}
