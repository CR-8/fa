"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { products } from "@/data/products"
import { ArrowLeft, Heart, Share, ShoppingCart, Sparkles, Camera, X, Star, Check, Loader2, Coins, RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUserCredits, deductCredit, hasCredits, formatCreditDisplay, getTimeUntilReset } from "@/lib/credits"
import type { CreditInfo } from "@/lib/credits"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = products.find((p) => p.id === params.id)
  const [tryOnResult, setTryOnResult] = useState<any>(null)
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false)
  const [userImages, setUserImages] = useState<string[]>([])
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0] || "")
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null)
  const [showingTryOn, setShowingTryOn] = useState(false) // Track if we're showing try-on vs product image
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryDisabledUntil, setRetryDisabledUntil] = useState<number | null>(null)
  const [retryCountdown, setRetryCountdown] = useState<number>(0)
  const [generationCooldown, setGenerationCooldown] = useState<number>(0)
  const [lastGenerationTime, setLastGenerationTime] = useState<number>(0)

  // Load user images from localStorage
  useEffect(() => {
    const savedImages = localStorage.getItem("userUploadedImages")
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages)
        const validImages = parsedImages.filter(
          (img: string) => img && img !== "/placeholder.svg" && img.includes("cloudinary.com")
        )
        setUserImages(validImages)
      } catch (error) {
        console.warn("Failed to parse saved user images:", error)
      }
    }

    // Load global generation cooldown from localStorage
    const savedCooldown = localStorage.getItem("globalGenerationCooldown")
    if (savedCooldown) {
      const cooldownEnd = parseInt(savedCooldown)
      if (cooldownEnd > Date.now()) {
        setLastGenerationTime(cooldownEnd - 60000) // Reconstruct last generation time
      }
    }
  }, [])

  // Load credits on mount
  useEffect(() => {
    loadCredits()
  }, [])

  // Countdown timer for retry button
  useEffect(() => {
    if (!retryDisabledUntil) {
      setRetryCountdown(0)
      return
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((retryDisabledUntil - Date.now()) / 1000))
      setRetryCountdown(remaining)
      
      if (remaining <= 0) {
        setRetryDisabledUntil(null)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [retryDisabledUntil])

  // Generation cooldown timer (60 seconds)
  useEffect(() => {
    if (lastGenerationTime === 0) {
      setGenerationCooldown(0)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastGenerationTime
      const remaining = Math.max(0, Math.ceil((60000 - elapsed) / 1000))
      setGenerationCooldown(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        localStorage.removeItem("globalGenerationCooldown")
      } else {
        // Save cooldown end time to localStorage for persistence
        localStorage.setItem("globalGenerationCooldown", (lastGenerationTime + 60000).toString())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lastGenerationTime])

  const loadCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const credits = await getUserCredits(user.id)
      setCreditInfo(credits)
    }
  }

  if (!product) {
    notFound()
  }

  const handleTryOn = async () => {
    if (userImages.length === 0) {
      setErrorMessage("Please upload some photos in your profile page first to use the try-on feature.")
      return
    }

    // Check cooldown
    if (generationCooldown > 0) {
      setErrorMessage(`⏳ Please wait ${generationCooldown} seconds before generating another try-on.`)
      return
    }

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMessage('Please sign in to use try-on feature')
      return
    }

    // Check if user has enough credits
    const hasEnough = await hasCredits(user.id)
    if (!hasEnough) {
      setErrorMessage('⚠️ No credits remaining! You get 10 free credits daily. Credits will reset tomorrow.')
      return
    }

    // Clear previous error
    setErrorMessage(null)
    setIsGeneratingTryOn(true)
    setShowingTryOn(true) // Switch to try-on view
    
    const now = Date.now()
    setLastGenerationTime(now) // Start cooldown
    localStorage.setItem("globalGenerationCooldown", (now + 60000).toString())

    try {
      // Deduct credit before API call
      const deductResult = await deductCredit(user.id, 'try-on')
      if (!deductResult.success) {
        setErrorMessage(deductResult.message || 'Failed to deduct credit')
        setIsGeneratingTryOn(false)
        setShowingTryOn(false)
        return
      }

      // Update local credit display
      setCreditInfo(prev => prev ? { ...prev, credits_remaining: deductResult.credits_remaining || 0 } : null)

      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          personImages: userImages,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setTryOnResult(data)
        setErrorMessage(null)
        console.log(`✅ Try-on generated! Credits remaining: ${deductResult.credits_remaining}`)
      } else {
        // AI generation error - show error and enable retry after 30 seconds
        setErrorMessage(
          data.error?.includes('image') || data.error?.includes('generation') || data.error?.includes('STOP')
            ? "⚠️ AI generation encountered an error. Please wait 30-40 seconds before retrying."
            : data.message || "❌ Unexpected error occurred. Please retry in a moment."
        )
        setShowingTryOn(false)
        // Disable retry for 35 seconds (middle of 30-40 range)
        setRetryDisabledUntil(Date.now() + 35000)
        // Reload credits to ensure accuracy
        await loadCredits()
      }
    } catch (error) {
      console.error("Try-on error:", error)
      setErrorMessage("❌ Network error occurred. Please wait 30-40 seconds before retrying.")
      setShowingTryOn(false)
      // Disable retry for 35 seconds
      setRetryDisabledUntil(Date.now() + 35000)
      // Reload credits to ensure accuracy
      await loadCredits()
    } finally {
      setIsGeneratingTryOn(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header with Credits */}
      <div className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-950 border-b-2 border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/shop" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-sm border-2 border-neutral-300 dark:border-neutral-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            {/* Credits Display */}
            {creditInfo && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900 border-2 border-amber-300 dark:border-amber-700 rounded-sm">
                <Coins className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    {formatCreditDisplay(creditInfo)} Credits
                  </span>
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    Resets in {getTimeUntilReset(creditInfo)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images Section */}
          <div className="space-y-6">
            {/* Virtual Try-On Card */}
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <CardHeader className="pb-3 border-b-2 border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                    <Sparkles className="h-5 w-5" />
                    {showingTryOn && tryOnResult ? 'Your Try-On Result' : 'Virtual Try-On'}
                  </CardTitle>
                  {showingTryOn && tryOnResult && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowingTryOn(false)
                        setTryOnResult(null)
                      }}
                      className="border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase text-xs"
                    >
                      Show Product
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="aspect-[3/4] relative rounded-sm overflow-hidden bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700">
                  {isGeneratingTryOn ? (
                    // Loading spinner while generating
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-12 w-12 animate-spin text-neutral-900 dark:text-neutral-100 mb-4" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center font-medium uppercase tracking-wide">
                        Generating your try-on...
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 text-center mt-2">
                        This may take 10-20 seconds
                      </p>
                    </div>
                  ) : showingTryOn && tryOnResult?.generatedImage ? (
                    // Show try-on result
                    <Image
                      src={tryOnResult.generatedImage}
                      alt={`${product.name} try-on result`}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : userImages.length > 0 ? (
                    // Show product image when user has photos
                    <Image
                      src={product.tryOnPreview || product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    // No user photos uploaded
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Camera className="h-12 w-12 text-neutral-500 dark:text-neutral-400 mb-4" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 font-medium">
                        Upload photos to see yourself in this outfit
                      </p>
                      <Button variant="outline" size="sm" asChild className="border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <Link href="/profile">Upload Photos</Link>
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Try-On Button */}
                <div className="space-y-2">
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-800 rounded-sm">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full h-12 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={userImages.length === 0 || isGeneratingTryOn || generationCooldown > 0}
                    onClick={handleTryOn}
                  >
                    {isGeneratingTryOn ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : generationCooldown > 0 ? (
                      <>
                        ⏳ Wait {generationCooldown}s
                      </>
                    ) : userImages.length > 0 ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Try On Now (1 Credit)
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photos First
                      </>
                    )}
                  </Button>

                  {/* Retry Button - Show only when try-on result exists */}
                  {showingTryOn && tryOnResult && !isGeneratingTryOn && (
                    <Button
                      variant="outline"
                      className="w-full h-10 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleTryOn}
                      disabled={isGeneratingTryOn || retryCountdown > 0 || generationCooldown > 0}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {generationCooldown > 0 
                        ? `Wait ${generationCooldown}s` 
                        : retryCountdown > 0 
                        ? `Wait ${retryCountdown}s to Retry` 
                        : 'Retry Generation (1 Credit)'}
                    </Button>
                  )}
                </div>

                {/* Description if try-on result available */}
                {showingTryOn && tryOnResult?.description && (
                  <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-sm border-2 border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                      {tryOnResult.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                  {product.name}
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 font-bold mt-2 uppercase tracking-wide">{product.brand}</p>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">₹{product.price.toLocaleString("en-IN")}</span>
                <span className="text-lg text-neutral-500 dark:text-neutral-400 line-through font-semibold">
                  ₹{(product.price * 1.2).toLocaleString("en-IN")}
                </span>
                <Badge variant="outline" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase">
                  Save ₹{(product.price * 0.2).toLocaleString("en-IN")}
                </Badge>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-neutral-900 dark:text-neutral-100 fill-neutral-900 dark:fill-neutral-100" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.8) • 127 reviews</span>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className={`h-12 transition-all ${
                      selectedSize === size ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground cursor-pointer hover:underline">Size guide</p>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Color</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                      selectedColor === color ? "border-primary scale-110" : "border-muted"
                    }`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            
                        {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full h-12 text-lg bg-white/95 text-black hover:bg-white/40 hover:to-accent/90 shadow-lg transition-all">
                <ShoppingCart className="h-5 w-5 mr-2 text-black" />
                Add to Cart
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-12 hover:bg-primary/10 hover:border-primary/50 transition-all"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                </Button>
                <Button
                  variant="outline"
                  className="h-12 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-3 pt-6 border-t">
              {[
                { label: "Free shipping", icon: <Check className="h-4 w-4 text-green-500" /> },
                { label: "30-day returns", icon: <Check className="h-4 w-4 text-green-500" /> },
                { label: "Authenticity guarantee", icon: <Check className="h-4 w-4 text-green-500" /> },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    {item.icon} {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}