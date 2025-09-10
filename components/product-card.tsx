import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
}

export function ProductCard({ product, showTryOn = false }: ProductCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <Link href={`/shop/${product.id}`}>
          <div className="relative aspect-square">
            <Image
              src={showTryOn ? product.tryOnPreview : product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.tags.includes("new") && (
              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">New</Badge>
            )}
          </div>
        </Link>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.brand}</p>
            </div>
            <p className="font-bold text-sm">${product.price}</p>
          </div>
          <Button asChild size="sm" className="w-full">
            <Link href={`/shop/${product.id}`}>{showTryOn ? "Try On" : "View Details"}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
