"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Sparkles, Camera, X } from "lucide-react"
import Link from "next/link"
import { tryOnRateLimiter } from "@/lib/rate-limiter"

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
  const [showTryOnModal, setShowTryOnModal] = useState(false)
  const [tryOnResult, setTryOnResult] = useState<any>(null)
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false)
  const [userImages, setUserImages] = useState<string[]>([])
  const [autoTryOnImage, setAutoTryOnImage] = useState<string | null>(null)
  const [isGeneratingAutoTryOn, setIsGeneratingAutoTryOn] = useState(false)

  // Load user images from localStorage
  useEffect(() => {
    const savedImages = localStorage.getItem('userUploadedImages')
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages)
        const validImages = parsedImages.filter((img: string) => 
          img && img !== "/placeholder.svg" && img.includes('cloudinary.com')
        )
        setUserImages(validImages)
      } catch (error) {
        console.warn('Failed to parse saved user images:', error)
      }
    }
  }, [])

  // DISABLED: Auto-generate try-on on shop page to prevent API quota exhaustion
  // Try-on images are now only generated on the individual product detail page
  // useEffect(() => {
  //   if (userImages.length > 0 && !autoTryOnImage && !isGeneratingAutoTryOn) {
  //     if (tryOnRateLimiter.canMakeRequest()) {
  //       generateAutoTryOn()
  //     } else {
  //       console.log("Rate limit reached for auto try-on generation")
  //     }
  //   }
  // }, [userImages, autoTryOnImage, isGeneratingAutoTryOn])

  // DISABLED: Auto try-on generation function - only used on product detail page now
  // const generateAutoTryOn = async () => {
  //   if (userImages.length === 0 || isGeneratingAutoTryOn) return
  //   setIsGeneratingAutoTryOn(true)
  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 2000))
  //     const response = await fetch("/api/try-on", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         productId: product.id,
  //         userImageUrl: userImages[0]
  //       })
  //     })
  //     const data = await response.json()
  //     if (data.success && data.generatedImage) {
  //       setAutoTryOnImage(data.generatedImage)
  //     }
  //   } catch (error) {
  //     console.error("Auto try-on error:", error)
  //   } finally {
  //     setIsGeneratingAutoTryOn(false)
  //   }
  // }

  const handleTryOn = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to product page
    e.stopPropagation()

    if (userImages.length === 0) {
      alert("Please upload some photos in your profile page first to use the try-on feature.")
      return
    }

    // Check rate limit before making request
    if (!tryOnRateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(tryOnRateLimiter.getTimeUntilNextRequest() / 1000);
      alert(`Please wait ${waitTime} seconds before trying on another item to avoid overwhelming the AI service.`)
      return
    }

    setIsGeneratingTryOn(true)
    setShowTryOnModal(true)

    try {
      // Add delay to slow down requests
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          personImages: userImages // Pass all user photos for better results
        })
      })

      const data = await response.json()

      if (data.success) {
        setTryOnResult(data)
      } else {
        alert(data.message || "Failed to generate try-on image. Please try again.")
        setShowTryOnModal(false)
      }
    } catch (error) {
      console.error("Try-on error:", error)
      alert("Error generating try-on image. Please try again.")
      setShowTryOnModal(false)
    } finally {
      setIsGeneratingTryOn(false)
    }
  }

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card" role="article" aria-labelledby={`product-${product.id}-title`}>
      <CardContent className="p-0 h-[50vh]">
        {/* Product Image */}
        <div className="relative h-[38vh] -mt-8 overflow-hidden w-full">
          <Link href={`/shop/${product.id}`} aria-label={`View details for ${product.name}`}>
            <Image
              src={autoTryOnImage || product.images[0]}
              alt={autoTryOnImage ? `Try-on preview: ${product.name}` : product.name}
              fill
              className="object-cover w-full h-full"
            />
            
            {/* Loading overlay for auto try-on */}
            {isGeneratingAutoTryOn && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center" aria-live="polite">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" aria-hidden="true"></div>
                  <span className="text-white text-xs font-medium">Generating try-on...</span>
                </div>
              </div>
            )}          
          </Link>

          {/* Overlay with actions - Hidden on mobile, visible on desktop hover */}
          <div className="absolute inset-0 bg-black/20 opacity-0 md:group-hover:opacity-100">
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white text-black"
                aria-label={`Add ${product.name} to wishlist`}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-4 space-x-1">
          <div className="flex items-start justify-between h-[6vh]">
            <div className="flex-1 min-w-0">
              <Link href={`/shop/${product.id}`}>
                <h3 id={`product-${product.id}-title`} className="font-semibold text-sm line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">{product.brand}</p>
            </div>
            <div className="flex flex-col items-end ml-2">
              <span className="font-bold text-base text-neutral-900 dark:text-neutral-50" aria-label={`Price: ₹${product.price.toLocaleString('en-IN')}`}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-muted-foreground line-through" aria-label="Original price before discount">
                ₹{(product.price * 1.2).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 py-4">
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
          </div>
        </div>
      </CardContent>

      {/* Try-on Modal Overlay */}
      {showTryOnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Virtual Try-On Result
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTryOnModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {isGeneratingTryOn ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-sm text-muted-foreground text-center">
                    Generating your personalized try-on image...
                  </p>
                </div>
              ) : tryOnResult ? (
                <div className="space-y-4">
                  <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                    {tryOnResult.generatedImage ? (
                      <Image
                        src={tryOnResult.generatedImage}
                        alt="AI generated try-on"
                        className="object-cover aspect-square"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted p-4">
                        <p className="text-sm text-muted-foreground text-center">
                          {tryOnResult.description}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">{tryOnResult.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {tryOnResult.description}
                    </p>
                    {tryOnResult.usedFallback && (
                      <Badge variant="secondary" className="text-xs">
                        Enhanced Styling Mode
                      </Badge>
                    )}
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/shop/${product.id}`}>
                      View Full Details
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
