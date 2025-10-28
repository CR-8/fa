"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Shirt, Plus, X, Save, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase, WardrobeItem } from "@/lib/supabase"
import { rateLimiter } from "@/lib/rate-limiter"
import { uploadImage } from "@/lib/upload"

export default function WardrobePage() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [occasion, setOccasion] = useState<string>("")
  const [recsLoading, setRecsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<{
    occasion: string
    recommendations: { title: string; items: { id: string; name: string; category: string }[]; why: string }[]
  } | null>(null)
  const [tryOnImages, setTryOnImages] = useState<{[key: string]: string}>({})
  const [tryOnDescriptions, setTryOnDescriptions] = useState<{[key: string]: string}>({})
  const [generatingTryOn, setGeneratingTryOn] = useState<{[key: string]: boolean}>({})
  const [errorMsg, setErrorMsg] = useState<string>("")

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '' as WardrobeItem['category'],
    color: '',
    size: '',
    description: '',
    imageUrl: ''
  })

  // Load wardrobe items
  useEffect(() => {
    loadWardrobeItems()
  }, [])

  const loadWardrobeItems = async () => {
    try {
      setLoading(true)

      // For now, use a temporary user ID (replace with actual auth later)
      const userId = 'user-1' // TODO: Get from auth

      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading wardrobe items:', error)
        // Fallback to localStorage if database fails
        const saved = localStorage.getItem('wardrobeItems')
        if (saved) {
          setWardrobeItems(JSON.parse(saved))
        }
      } else {
        setWardrobeItems(data || [])
        // Update localStorage as backup
        localStorage.setItem('wardrobeItems', JSON.stringify(data || []))
      }
    } catch (error) {
      console.error('Error loading wardrobe items:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('wardrobeItems')
      if (saved) {
        setWardrobeItems(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const result = await uploadImage(file)
      if (result && result.url) {
        setFormData(prev => ({ ...prev, imageUrl: result.url }))
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const analyzeClothingWithAI = async (imageUrl: string, description: string): Promise<WardrobeItem['metadata']> => {
    try {
      const response = await fetch('/api/analyze-clothing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, description })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      return data.metadata
    } catch (error) {
      console.error('AI analysis error:', error)
      return {}
    }
  }

  const handleSaveItem = async () => {
    if (!formData.imageUrl || !formData.category) {
      alert('Please upload an image and select a category')
      return
    }

    setAnalyzing(true)
    try {
      // Analyze with AI
      const metadata = await analyzeClothingWithAI(formData.imageUrl, formData.description)

      const userId = 'user-1' // TODO: Get from auth

      const newItem: WardrobeItem = {
        user_id: userId,
        name: formData.name || `${formData.category} item`,
        category: formData.category,
        color: formData.color,
        size: formData.size,
        description: formData.description,
        image_url: formData.imageUrl,
        metadata,
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('wardrobe_items')
        .insert(newItem)
        .select()
        .single()

      if (error) {
        console.error('Error saving to database:', error)
        throw error
      }

      // Update local state
      setWardrobeItems(prev => [data, ...prev])

      // Update localStorage as backup
      const updatedItems = [data, ...wardrobeItems]
      localStorage.setItem('wardrobeItems', JSON.stringify(updatedItems))

      // Reset form
      setFormData({
        name: '',
        category: '' as WardrobeItem['category'],
        color: '',
        size: '',
        description: '',
        imageUrl: ''
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Failed to save item. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    return <Shirt className="h-4 w-4" />
  }

  const requestRecommendations = async () => {
    setErrorMsg("")
    if (!occasion || occasion.trim().length === 0) {
      setErrorMsg("Please enter an occasion, e.g., 'party'.")
      return
    }

    if (!rateLimiter.canMakeRequest()) {
      const waitMs = rateLimiter.getTimeUntilNextRequest()
      const secs = Math.ceil(waitMs / 1000)
      setErrorMsg(`Please wait ${secs}s before requesting again.`)
      return
    }

    setRecsLoading(true)
    try {
      const response = await fetch('/api/wardrobe-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion, userId: 'user-1' }) // TODO: replace with auth user id
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to get recommendations')
      }
      const data = await response.json()
      setRecommendations(data)
    } catch (err: any) {
      console.error('Recommendation error:', err)
      setErrorMsg(err.message || 'Failed to get recommendations')
    } finally {
      setRecsLoading(false)
    }
  }

  const generateOutfitTryOn = async (recIndex: number, outfitItems: { id: string; name: string; category: string }[]) => {
    const outfitKey = `rec-${recIndex}`
    console.log('🎬 Starting try-on generation for outfit:', outfitKey)
    setGeneratingTryOn(prev => ({ ...prev, [outfitKey]: true }))

    try {
      // Get user photos from localStorage (same logic as profile page)
      const getUserPhotos = () => {
        try {
          const storedImages = JSON.parse(localStorage.getItem('userUploadedImages') || '[]')
          const validImages = storedImages.filter((img: string) => 
            img && 
            img !== "/placeholder.svg" && 
            img.includes('cloudinary.com') && 
            (img.startsWith('http://') || img.startsWith('https://'))
          )
          return validImages
        } catch (error) {
          return []
        }
      }

      const userPhotos = getUserPhotos()

      if (userPhotos.length === 0) {
        alert('Please upload some photos of yourself in your profile first to use the try-on feature!')
        return
      }

      // Get the actual wardrobe items
      const items = outfitItems.map(it => wardrobeItems.find(w => w.id === it.id)).filter((item): item is WardrobeItem => item !== undefined)

      if (items.length === 0) return

      // Collect ALL images from ALL wardrobe items in the outfit
      const clothingImages = items.map(item => item.image_url).filter(Boolean)

      console.log('📸 Try-on generation with:', {
        userPhotos: userPhotos.length,
        outfitItems: items.length,
        clothingImages: clothingImages.length,
        itemDetails: items.map(item => ({ name: item.name, category: item.category, image: item.image_url }))
      })
      
      console.log('🎯 Sending these clothing images to API:', clothingImages)

      // Generate try-on with ALL user photos and ALL clothing images for best accuracy
      const response = await fetch('/api/try-on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personImages: userPhotos, // Pass all user photos
          clothingImages: clothingImages, // Pass all clothing images from outfit
          category: items[0].category
        })
      })

      if (!response.ok) throw new Error('Failed to generate try-on')

      const data = await response.json()
      console.log('📦 Try-on response:', { success: data.success, hasImage: !!data.generatedImage, outfitKey })
      
      // Store both the generated image (if available) and description
      if (data.generatedImage) {
        setTryOnImages(prev => {
          const updated = { ...prev, [outfitKey]: data.generatedImage }
          console.log('✅ Try-on images updated:', updated)
          return updated
        })
      }
      
      // Always store the styling description
      if (data.description) {
        setTryOnDescriptions(prev => ({ ...prev, [outfitKey]: data.description }))
      }
      
      // Show success message with appropriate info
      if (!data.generatedImage && data.description) {
        console.log('ℹ️ Generated styling advice (no image)')
      }
    } catch (error) {
      console.error('Try-on generation error:', error)
      alert('Failed to generate try-on. Please try again.')
    } finally {
      setGeneratingTryOn(prev => ({ ...prev, [outfitKey]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/profile" className="p-1.5 sm:p-2 hover:bg-muted rounded-full">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
              <Shirt className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold">My Wardrobe</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Add Item Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Clothing Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add to Wardrobe</DialogTitle>
                <DialogDescription>
                  Upload a photo of your clothing item and add details to build your digital wardrobe.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label>Photo</Label>
                  <div className="mt-2">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <Image
                          src={formData.imageUrl}
                          alt="Clothing item"
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="wardrobe-image"
                        />
                        <label htmlFor="wardrobe-image" className="cursor-pointer">
                          {uploading ? (
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          ) : (
                            <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground">
                            {uploading ? 'Uploading...' : 'Click to upload photo'}
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as WardrobeItem['category'] }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shirt">Shirt</SelectItem>
                      <SelectItem value="pants">Pants</SelectItem>
                      <SelectItem value="suit">Suit</SelectItem>
                      <SelectItem value="t-shirt">T-Shirt</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Blue Cotton Shirt"
                  />
                </div>

                {/* Color */}
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="e.g., Blue"
                  />
                </div>

                {/* Size */}
                <div>
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="e.g., M"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the item..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSaveItem}
                  disabled={analyzing || !formData.imageUrl || !formData.category}
                  className="w-full"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Item
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Occasion prompt and recommendations trigger */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="occasion">Occasion</Label>
            <Input
              id="occasion"
              placeholder="e.g., Suggest an outfit for a party"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
            />
          </div>
          <div>
            <Button className="w-full" onClick={requestRecommendations} disabled={recsLoading || wardrobeItems.length === 0}>
              {recsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting outfits...
                </>
              ) : (
                'Get AI Outfits'
              )}
            </Button>
          </div>
          {errorMsg && (
            <div className="md:col-span-3 text-sm text-red-500">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Wardrobe Items */}
        {wardrobeItems.length === 0 ? (
          <div className="text-center py-16">
            <Shirt className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Your wardrobe is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start building your digital wardrobe by adding your clothing items
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {wardrobeItems.map((item) => (
              <Card key={item.id} className="group cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.color} • {item.size}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recommendations display */}
        {recommendations && recommendations.recommendations?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-6">Recommended Outfits for "{recommendations.occasion}"</h2>
            <div className="space-y-8">
              {recommendations.recommendations.map((rec, idx) => {
                const outfitKey = `rec-${idx}`
                return (
                  <Card key={idx} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      {rec.why && <p className="text-sm text-muted-foreground mt-2">{rec.why}</p>}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Outfit Items + Try-on Flow */}
                      <div className="flex flex-col lg:flex-row items-center gap-4">
                        {/* Individual Items */}
                        <div className="flex flex-wrap items-center gap-2 justify-center">
                          {rec.items.map((it, itemIdx) => {
                            const full = wardrobeItems.find(w => w.id === it.id)
                            return (
                              <div key={it.id} className="flex items-center gap-2">
                                <div className="relative">
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-muted">
                                    {full?.image_url ? (
                                      <Image
                                        src={full.image_url}
                                        alt={it.name || full.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Shirt className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  {/* Label overlay */}
                                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                    <Badge variant="default" className="text-xs px-2 py-0.5">
                                      {it.category || full?.category}
                                    </Badge>
                                  </div>
                                </div>
                                {itemIdx < rec.items.length - 1 && (
                                  <div className="text-2xl font-bold text-muted-foreground">+</div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Equals Sign */}
                        <div className="text-3xl font-bold text-muted-foreground">=</div>

                        {/* Try-on Result */}
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative">
                            <div className="w-32 h-48 sm:w-40 sm:h-60 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
                              {tryOnImages[outfitKey] ? (
                                <Image
                                  src={tryOnImages[outfitKey]}
                                  alt="Try-on result"
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                                  {generatingTryOn[outfitKey] ? (
                                    <>
                                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                      <span className="text-xs text-center">Generating try-on...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Shirt className="h-8 w-8 text-muted-foreground mb-2" />
                                      <span className="text-xs text-center">Click to generate try-on</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                              <Badge variant="default" className="bg-primary text-primary-foreground">
                                Try-on
                              </Badge>
                            </div>
                          </div>

                          {!tryOnImages[outfitKey] && !generatingTryOn[outfitKey] && (
                            <Button
                              size="sm"
                              onClick={() => generateOutfitTryOn(idx, rec.items)}
                              className="text-xs"
                            >
                              Generate Try-on
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t">
                        {rec.items.map((it) => {
                          const full = wardrobeItems.find(w => w.id === it.id)
                          return (
                            <div key={it.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                {full?.image_url ? (
                                  <Image
                                    src={full.image_url}
                                    alt={it.name || full.name}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted">
                                    <Shirt className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">
                                  {it.name || full?.name || 'Item'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {full?.color} • {full?.size}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}