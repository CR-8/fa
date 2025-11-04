"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { products } from "@/data/products"
import { ArrowLeft, Heart, Share, ShoppingCart, Sparkles, Camera, X, Star, Check } from "lucide-react"
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
  const [tryOnDialogOpen, setTryOnDialogOpen] = useState(false)
  const [tryOnResult, setTryOnResult] = useState<any>(null)
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false)
  const [userImages, setUserImages] = useState<string[]>([])
  const [autoTryOnImage, setAutoTryOnImage] = useState<string | null>(null)
  const [isGeneratingAutoTryOn, setIsGeneratingAutoTryOn] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0] || "")

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
          personImages: userImages, // Pass all user photos for better results
        }),
      })
      const data = await response.json()
      if (data.success && data.generatedImage) {
        setAutoTryOnImage(data.generatedImage)
      }
    } catch (error) {
      console.error("Auto try-on error:", error)
    } finally {
      setIsGeneratingAutoTryOn(false)
    }
  }

  const handleTryOn = async () => {
    if (userImages.length === 0) {
      alert("Please upload some photos in your profile page first to use the try-on feature.")
      return
    }
    setIsGeneratingTryOn(true)
    setTryOnDialogOpen(true)
    try {
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          personImages: userImages, // Pass all user photos for better results
        }),
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">


      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images Section */}
          <div className="space-y-6">
            {/* Virtual Try-On Card */}
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
              <CardHeader className="pb-3 border-b-2 border-neutral-200 dark:border-neutral-800">
                <CardTitle className="text-lg flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                  <Sparkles className="h-5 w-5" />
                  Virtual Try-On
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="aspect-[3/4] relative rounded-sm overflow-hidden bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700">
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
                        <div className="animate-spin rounded-sm h-8 w-8 border-2 border-neutral-900 dark:border-neutral-100 border-t-transparent mb-4"></div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center font-medium uppercase tracking-wide">
                          Creating your personalized preview...
                        </p>
                      </div>
                    ) : (
                      <Image
                        src={product.tryOnPreview || product.images[0]}
                        alt={`${product.name} try-on preview`}
                        fill
                        className="object-cover"
                        priority
                      />
                    )
                  ) : (
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
                <Button
                  className="w-full h-12 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide"
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

      {/* Try-on Modal Overlay */}
      {tryOnDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Virtual Try-On Result
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTryOnDialogOpen(false)}
                  className="hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              {isGeneratingTryOn ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-primary border-t-transparent mb-4"></div>
                  <p className="text-lg font-medium text-center mb-2">Generating your personalized try-on image...</p>
                  <p className="text-sm text-muted-foreground text-center">This may take 10-20 seconds</p>
                </div>
              ) : tryOnResult ? (
                <div className="space-y-6">
                  <div className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-lg">
                    {tryOnResult.generatedImage ? (
                      <Image
                        src={tryOnResult.generatedImage}
                        alt="AI generated try-on"
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted p-6 rounded-xl">
                        <p className="text-muted-foreground text-center">{tryOnResult.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xl font-bold">{tryOnResult.productName}</h4>
                    <p className="text-muted-foreground leading-relaxed">{tryOnResult.description}</p>
                    {tryOnResult.usedFallback && (
                      <Badge variant="secondary" className="w-fit">
                        Enhanced Styling Mode
                      </Badge>
                    )}
                  </div>
                  <Button className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}