"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Sparkles } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  brand: string
  images: string[]
  tryOnPreview: string
  tags: string[]
}

interface ProductCardProps {
  product: Product
  showTryOn?: boolean
  onTryOn?: (productId: string) => void
}

export function ProductCard({ product, showTryOn = false, onTryOn }: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden w-full">
          <Link href={`/shop/${product.id}`}>
            <Image
              src={showTryOn ? product.tryOnPreview : product.images[0]}
              alt={product.name}
              fill
              className="object-cover w-full h-full"
            />
          </Link>

          {/* Overlay with actions - Hidden on mobile, visible on desktop hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100">
            <div className="absolute right-3 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white text-black"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <Button
                size="sm"
                className="w-full bg-primary text-white"
                onClick={() => showTryOn && onTryOn ? onTryOn(product.id) : null}
              >
                {showTryOn ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Try On
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Badges */}
          {product.tags.includes("new") && (
            <Badge className="absolute top-3 left-3 bg-accent text-white">
              New
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link href={`/shop/${product.id}`}>
                <h3 className="font-semibold text-sm line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">{product.brand}</p>
            </div>
            <div className="flex flex-col items-end ml-2">
              <span className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                ₹{(product.price * 1.2).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-neutral-300 dark:border-neutral-600"
              asChild
            >
              <Link href={`/shop/${product.id}`}>
                View Details
              </Link>
            </Button>
            {showTryOn && onTryOn && (
              <Button
                size="sm"
                variant="ghost"
                className="px-3"
                onClick={() => onTryOn(product.id)}
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
