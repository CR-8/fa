"use client"

import { useState, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/store/cart-context"
import { useWishlist } from "@/lib/store/wishlist-context"
import { useToast } from "@/lib/store/toast-context"
import { tryOnRateLimiter } from "@/lib/rate-limiter"

interface Product {
  id: string
  name: string
  price: number
  brand: string
  images: string[]
  tryOnPreview: string
  tags: string[]
  category?: string
  description?: string
  sizes?: string[]
  colors?: string[]
}

interface ProductCardProps {
  product: Product
  showTryOn?: boolean
  onTryOn?: (productId: string) => void
}

const ProductCard = memo(({ product, showTryOn = false, onTryOn }: ProductCardProps) => {
  const router = useRouter()
  const { addItem: addToCart } = useCart()
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlist()
  const { showToast } = useToast()

  const [userImages, setUserImages] = useState<string[]>([])
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false)
  const [tryOnResult, setTryOnResult] = useState<string | null>(null)

  const isWishlisted = isInWishlist(product.id)

  useEffect(() => {
    const saved = localStorage.getItem("userUploadedImages")
    if (!saved) return

    try {
      const imgs = JSON.parse(saved).filter(
        (img: string) => img && img.includes("cloudinary.com")
      )
      setUserImages(imgs)
    } catch (err) {
      console.warn("Invalid stored images", err)
    }
  }, [])

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (isAddingToCart) return

      setIsAddingToCart(true)
      addToCart(product, 1)
      showToast("Added to cart!")
      setTimeout(() => setIsAddingToCart(false), 1000)
    },
    [isAddingToCart, addToCart, product, showToast]
  )

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toggleWishlist(product)
      showToast(isWishlisted ? "Removed from wishlist" : "Added to wishlist!")
    },
    [isWishlisted, toggleWishlist, product, showToast]
  )

  const handleTryOn = useCallback(async () => {
    if (userImages.length === 0) {
      showToast("Upload photos in your profile first.", "info")
      return
    }

    if (!tryOnRateLimiter.canMakeRequest()) {
      const wait = Math.ceil(tryOnRateLimiter.getTimeUntilNextRequest() / 1000)
      showToast(`Wait ${wait}s before trying again.`, "info")
      return
    }

    setIsGeneratingTryOn(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, personImages: userImages })
      })
      const data = await res.json()
      if (data.success) {
        setTryOnResult(data.generatedImage)
        showToast("Try-on generated successfully!")
      } else showToast(data.message || "Failed to generate try-on", "error")
    } catch (err) {
      console.error("Try-on error:", err)
      showToast("Error generating try-on", "error")
    } finally {
      setIsGeneratingTryOn(false)
    }
  }, [product.id, userImages, showToast])

  return (
    <Card
      className="w-full group relative overflow-hidden bg-white dark:bg-neutral-900 rounded-sm border-2 border-neutral-200 dark:border-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all"
      role="article"
      aria-labelledby={`product-${product.id}-title`}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden border-b-2 border-neutral-200 dark:border-neutral-800">
          <Link href={`/shop/${product.id}`} aria-label={`View ${product.name}`}>
            <Image
              src={tryOnResult || product.images[0]}
              alt={product.name}
              fill
              priority={false}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Wishlist */}
          <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWishlistToggle}
              className={`h-9 w-9 p-0 border-2 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] transition ${
                isWishlisted
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                  : "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/shop/${product.id}`}>
                <h3
                  id={`product-${product.id}-title`}
                  className="font-bold text-xs sm:text-sm line-clamp-2 text-neutral-900 dark:text-neutral-100 uppercase tracking-tight hover:underline"
                >
                  {product.name}
                </h3>
              </Link>
              <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 sm:mt-1 font-bold uppercase tracking-wide">
                {product.brand}
              </p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 line-through font-semibold whitespace-nowrap">
                ₹{(product.price * 1.2).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isAddingToCart}
              onClick={handleAddToCart}
              className="flex-1 h-9 sm:h-10 px-2 sm:px-3 border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-sm font-bold uppercase text-[10px] sm:text-xs tracking-wide hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all disabled:opacity-50"
            >
              {isAddingToCart ? (
                <span className="flex items-center justify-center gap-1 sm:gap-2">
                  <span className="animate-spin rounded-sm h-3 w-3 border border-white dark:border-neutral-900 border-t-transparent"></span>
                  <span className="hidden xs:inline">ADDED</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1 sm:gap-1.5">
                  <ShoppingCart className="h-3 sm:h-3.5 w-3 sm:w-3.5 flex-shrink-0" />
                  <span className="hidden xs:inline">CART</span>
                </span>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 h-9 sm:h-10 px-2 sm:px-3 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase text-[10px] sm:text-xs tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            >
              <Link href={`/shop/${product.id}`}>
                <span>VIEW</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ProductCard.displayName = "ProductCard"
export { ProductCard }
