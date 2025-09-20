"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { products } from "@/data/products"
import { ArrowLeft, Heart, Share, ShoppingCart, Sparkles, Camera, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { tryOnRateLimiter } from "@/lib/rate-limiter"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = products.find((p) => p.id === params.id)
  const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false)
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

  // Auto-generate try-on image when user images are available
  useEffect(() => {
    if (userImages.length > 0 && !autoTryOnImage && !isGeneratingAutoTryOn) {
      generateAutoTryOn()
    }
  }, [userImages, autoTryOnImage, isGeneratingAutoTryOn])

  if (!product) {
    notFound()
  }

  const generateAutoTryOn = async () => {
    if (userImages.length === 0 || isGeneratingAutoTryOn) return

    setIsGeneratingAutoTryOn(true)

    try {
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userImageUrl: userImages[0] // Use first uploaded image
        })
      })

      const data = await response.json()

      if (data.success && data.generatedImage) {
        setAutoTryOnImage(data.generatedImage)
      }
    } catch (error) {
      console.error("Auto try-on error:", error)
      // Silently fail - will show regular product image
    } finally {
      setIsGeneratingAutoTryOn(false)
    }
  }

  const handleTryOn = async () => {
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
    setTryOnDialogOpen(true)

    try {
      // Add delay to slow down requests
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userImageUrl: userImages[0] // Use first uploaded image
        })
      })

      const data = await response.json()

      if (data.success) {
        setTryOnResult(data)
      } else {
        alert(data.message || "Failed to generate try-on image. Please try again.")
        setTryOnDialogOpen(false)
      }
    } catch (error) {
      console.error("Try-on error:", error)
      alert("Error generating try-on image. Please try again.")
      setTryOnDialogOpen(false)
    } finally {
      setIsGeneratingTryOn(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
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
          src={autoTryOnImage || product.images[0] || "/placeholder.svg"}
          alt={autoTryOnImage ? `Try-on preview: ${product.name}` : product.name}
          fill
          className="object-cover"
          priority
        />
        
        {/* Loading overlay for auto try-on */}
        {isGeneratingAutoTryOn && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              <span className="text-white text-sm font-medium">Generating try-on...</span>
            </div>
          </div>
        )}
        
        {/* Try-on badge */}
        {autoTryOnImage && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary text-white flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Try-On Preview
            </Badge>
          </div>
        )}
        
        {product.tags.includes("new") && !autoTryOnImage && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">New</Badge>
        )}
      </div>

      {/* Try-on Preview */}
      <div className="p-4 border-b">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Virtual Try-On
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[3/4] relative rounded-lg overflow-hidden mb-4 bg-muted">
              {userImages.length > 0 ? (
                autoTryOnImage ? (
                  <Image
                    src={autoTryOnImage}
                    alt={`${product.name} AI try-on preview`}
                    fill
                    className="object-cover"
                  />
                ) : isGeneratingAutoTryOn ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-sm text-muted-foreground text-center">
                      Creating your personalized preview...
                    </p>
                  </div>
                ) : (
                  <Image
                    src={product.tryOnPreview || product.images[0]}
                    alt={`${product.name} try-on preview`}
                    fill
                    className="object-cover"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload photos to see yourself in this outfit
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile">
                      Upload Photos
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <Button 
              className="w-full" 
              disabled={userImages.length === 0}
              onClick={handleTryOn}
            >
              {userImages.length > 0 ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try On Now
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Photos First
                </>
              )}
            </Button>

            {/* Try-on Modal Overlay */}
            {tryOnDialogOpen && (
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
                        onClick={() => setTryOnDialogOpen(false)}
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
                              fill
                              className="object-cover"
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
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
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
