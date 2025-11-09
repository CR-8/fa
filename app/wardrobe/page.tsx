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
import { Shirt, Plus, X, Save, Loader2, ArrowLeft, Coins, RotateCcw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase, WardrobeItem } from "@/lib/supabase"
import { rateLimiter } from "@/lib/rate-limiter"
import { uploadImage } from "@/lib/upload"
import { getUserCredits, deductCredit, hasCredits, formatCreditDisplay, getTimeUntilReset } from "@/lib/credits"
import type { CreditInfo } from "@/lib/credits"

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
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null)
  const [tryOnDescriptions, setTryOnDescriptions] = useState<{[key: string]: string}>({})
  const [generatingTryOn, setGeneratingTryOn] = useState<{[key: string]: boolean}>({})
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [tryOnErrors, setTryOnErrors] = useState<{[key: string]: string}>({})
  const [retryDisabledUntil, setRetryDisabledUntil] = useState<{[key: string]: number}>({})
  const [retryCountdowns, setRetryCountdowns] = useState<{[key: string]: number}>({})
  const [globalGenerationCooldown, setGlobalGenerationCooldown] = useState<number>(0)
  const [lastGlobalGenerationTime, setLastGlobalGenerationTime] = useState<number>(0)

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
    loadCredits()
    
    // Load global generation cooldown from localStorage
    const savedCooldown = localStorage.getItem("globalGenerationCooldown")
    if (savedCooldown) {
      const cooldownEnd = parseInt(savedCooldown)
      if (cooldownEnd > Date.now()) {
        setLastGlobalGenerationTime(cooldownEnd - 60000) // Reconstruct last generation time
      }
    }
  }, [])

  // Countdown timer for retry buttons
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []
    
    Object.entries(retryDisabledUntil).forEach(([outfitKey, disabledUntil]) => {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((disabledUntil - Date.now()) / 1000))
        setRetryCountdowns(prev => ({ ...prev, [outfitKey]: remaining }))
        
        if (remaining <= 0) {
          setRetryDisabledUntil(prev => {
            const updated = { ...prev }
            delete updated[outfitKey]
            return updated
          })
          clearInterval(interval)
        }
      }, 1000)
      
      intervals.push(interval)
    })

    return () => intervals.forEach(interval => clearInterval(interval))
  }, [retryDisabledUntil])

  // Global generation cooldown timer (60 seconds)
  useEffect(() => {
    if (lastGlobalGenerationTime === 0) {
      setGlobalGenerationCooldown(0)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastGlobalGenerationTime
      const remaining = Math.max(0, Math.ceil((60000 - elapsed) / 1000))
      setGlobalGenerationCooldown(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        localStorage.removeItem("globalGenerationCooldown")
      } else {
        // Save cooldown end time to localStorage for persistence
        localStorage.setItem("globalGenerationCooldown", (lastGlobalGenerationTime + 60000).toString())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lastGlobalGenerationTime])

  const loadCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const credits = await getUserCredits(user.id)
      setCreditInfo(credits)
    }
  }

  const loadWardrobeItems = async () => {
    try {
      setLoading(true)

      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.warn('No authenticated user found')
        setLoading(false)
        return
      }
      const userId = user.id

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

      if (!response.ok) {
        console.warn('Analysis API returned error, using fallback')
      }

      const data = await response.json()
      
      // Check if fallback was used
      if (data.usedFallback) {
        console.log('AI analysis used fallback:', data.fallbackReason || 'Service unavailable')
      }
      
      return data.metadata || {}
    } catch (error) {
      console.error('AI analysis error:', error)
    }
  }

  const handleSaveItem = async () => {
    if (!formData.imageUrl || !formData.category) {
      alert('Please upload an image and select a category')
      return
    }

    setAnalyzing(true)
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("Please sign in first.")
        setAnalyzing(false)
        return
      }
      const userId = user.id

      // Analyze with AI
      const metadata = await analyzeClothingWithAI(formData.imageUrl, formData.description)

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

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg("Please sign in first.")
      return
    }
    const userId = user.id

    if (!rateLimiter.canMakeRequest()) {
      const waitMs = rateLimiter.getTimeUntilNextRequest()
      const secs = Math.ceil(waitMs / 1000)
      setErrorMsg(`Please wait ${secs}s before requesting again.`)
      return
    }

    // Clear previous try-on images and descriptions when requesting new recommendations
    setTryOnImages({})
    setTryOnDescriptions({})
    setGeneratingTryOn({})

    setRecsLoading(true)
    try {
      const response = await fetch('/api/wardrobe-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion, userId })
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
    
    // Check global cooldown
    if (globalGenerationCooldown > 0) {
      setTryOnErrors(prev => ({ 
        ...prev, 
        [outfitKey]: `⏳ Please wait ${globalGenerationCooldown} seconds before generating another try-on.` 
      }))
      return
    }

    // Check credits before starting
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please sign in to use try-on feature')
      return
    }

    // Check if user has enough credits
    const hasEnough = await hasCredits(user.id)
    if (!hasEnough) {
      setTryOnErrors(prev => ({ ...prev, [outfitKey]: '⚠️ No credits remaining! You get 10 free credits daily. Credits will reset tomorrow.' }))
      return
    }

    // Clear previous error for this outfit
    setTryOnErrors(prev => {
      const updated = { ...prev }
      delete updated[outfitKey]
      return updated
    })

    setGeneratingTryOn(prev => ({ ...prev, [outfitKey]: true }))
    
    const now = Date.now()
    setLastGlobalGenerationTime(now) // Start global cooldown
    localStorage.setItem("globalGenerationCooldown", (now + 60000).toString())

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
        setTryOnErrors(prev => ({ ...prev, [outfitKey]: 'Please upload some photos of yourself in your profile first to use the try-on feature!' }))
        return
      }

      // Deduct credit before API call
      const deductResult = await deductCredit(user.id, 'try-on')
      if (!deductResult.success) {
        setTryOnErrors(prev => ({ ...prev, [outfitKey]: deductResult.message || 'Failed to deduct credit' }))
        return
      }

      // Update local credit display
      setCreditInfo(prev => prev ? { ...prev, credits_remaining: deductResult.credits_remaining || 0 } : null)

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
          category: items[0].category,
          occasion: occasion || undefined // Pass the occasion/vibe context
        })
      })

      if (!response.ok) throw new Error('Failed to generate try-on')

      const data = await response.json()
      console.log('📦 Try-on response:', { success: data.success, hasImage: !!data.generatedImage, outfitKey })
      
      if (!data.success) {
        // AI generation error - show error and enable retry after 35 seconds
        setTryOnErrors(prev => ({ 
          ...prev, 
          [outfitKey]: data.error?.includes('image') || data.error?.includes('generation') || data.error?.includes('STOP')
            ? "⚠️ AI generation encountered an error. Please wait 30-40 seconds before retrying."
            : data.message || "❌ Unexpected error occurred. Please retry in a moment."
        }))
        // Disable retry for 35 seconds (middle of 30-40 range)
        setRetryDisabledUntil(prev => ({ ...prev, [outfitKey]: Date.now() + 35000 }))
        await loadCredits()
        return
      }
      
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
      
      // Show success message with credit info
      if (data.generatedImage) {
        console.log(`✅ Try-on generated! Credits remaining: ${deductResult.credits_remaining}`)
      }
    } catch (error) {
      console.error('Try-on generation error:', error)
      setTryOnErrors(prev => ({ 
        ...prev, 
        [outfitKey]: "❌ Network error occurred. Please wait 30-40 seconds before retrying."
      }))
      // Disable retry for 35 seconds
      setRetryDisabledUntil(prev => ({ ...prev, [outfitKey]: Date.now() + 35000 }))
      // Reload credits to ensure accuracy
      await loadCredits()
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-neutral-50 dark:bg-neutral-950 border-b-2 border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/profile" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-sm border-2 border-neutral-300 dark:border-neutral-600">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="p-3 bg-neutral-900 dark:bg-neutral-100 rounded-sm border-2 border-neutral-900 dark:border-neutral-100">
                <Shirt className="h-6 w-6 text-neutral-50 dark:text-neutral-900" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">My Wardrobe</h1>
            </div>
            
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

      <div className="container mx-auto px-6 lg:px-8 py-10 max-w-6xl">
        {/* Add Item Button */}
        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto h-12 px-6 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide">
                <Plus className="h-4 w-4 mr-2" />
                Add Clothing Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[90vh] overflow-y-auto bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm">
              <DialogHeader>
                <DialogTitle className="text-neutral-900 dark:text-neutral-100 font-bold uppercase tracking-wide text-xl sm:text-2xl">Add to Wardrobe</DialogTitle>
                <DialogDescription className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Upload a photo of your clothing item and add details to build your digital wardrobe.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label className="font-bold uppercase text-sm tracking-wide">Photo</Label>
                  <div className="mt-2">
                    {formData.imageUrl ? (
                      <div className="relative">
                        <Image
                          src={formData.imageUrl}
                          alt="Clothing item"
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover rounded-sm border-2 border-neutral-200 dark:border-neutral-700"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 rounded-sm"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-sm p-8 text-center">
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
                            <Plus className="h-8 w-8 mx-auto mb-2 text-neutral-500 dark:text-neutral-400" />
                          )}
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium uppercase">
                            {uploading ? 'Uploading...' : 'Click to upload photo'}
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="font-bold uppercase text-sm tracking-wide">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as WardrobeItem['category'] }))}>
                    <SelectTrigger className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold">
                      <SelectValue placeholder="SELECT CATEGORY" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm">
                      <SelectItem value="shirt" className="font-semibold uppercase">Shirt</SelectItem>
                      <SelectItem value="pants" className="font-semibold uppercase">Pants</SelectItem>
                      <SelectItem value="suit" className="font-semibold uppercase">Suit</SelectItem>
                      <SelectItem value="t-shirt" className="font-semibold uppercase">T-Shirt</SelectItem>
                      <SelectItem value="other" className="font-semibold uppercase">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name" className="font-bold uppercase text-sm tracking-wide">Name (Optional)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="E.G., BLUE COTTON SHIRT"
                    className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold placeholder:text-neutral-500 uppercase"
                  />
                </div>

                {/* Color */}
                <div>
                  <Label htmlFor="color" className="font-bold uppercase text-sm tracking-wide">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="E.G., BLUE"
                    className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold placeholder:text-neutral-500 uppercase"
                  />
                </div>

                {/* Size */}
                <div>
                  <Label htmlFor="size" className="font-bold uppercase text-sm tracking-wide">Size</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="E.G., M"
                    className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold placeholder:text-neutral-500 uppercase"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="font-bold uppercase text-sm tracking-wide">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="BRIEF DESCRIPTION OF THE ITEM..."
                    rows={3}
                    className="border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-medium placeholder:text-neutral-500"
                  />
                </div>

                <Button
                  onClick={handleSaveItem}
                  disabled={analyzing || !formData.imageUrl || !formData.category}
                  className="w-full h-12 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide"
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
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <Label htmlFor="occasion" className="font-bold uppercase text-sm tracking-wide">Occasion</Label>
            <Input
              id="occasion"
              placeholder="E.G., SUGGEST AN OUTFIT FOR A PARTY"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="h-12 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-semibold placeholder:text-neutral-500 uppercase"
            />
          </div>
          <div>
            <Button className="w-full h-12 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide" onClick={requestRecommendations} disabled={recsLoading || wardrobeItems.length === 0}>
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
            <div className="md:col-span-3 text-sm text-neutral-900 dark:text-neutral-100 font-semibold uppercase">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Wardrobe Items */}
        {wardrobeItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-6 h-20 w-20 rounded-sm bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-2 border-neutral-300 dark:border-neutral-700">
              <Shirt className="h-10 w-10 text-neutral-500 dark:text-neutral-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Your wardrobe is empty</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 font-medium">
              Start building your digital wardrobe by adding your clothing items
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {wardrobeItems.map((item) => (
              <Card key={item.id} className="group cursor-pointer bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-sm border-b-2 border-neutral-200 dark:border-neutral-800">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="text-xs px-2 py-1 border-2 border-neutral-900 dark:border-neutral-100 bg-white dark:bg-neutral-900 rounded-sm font-bold uppercase">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm truncate uppercase tracking-wide text-neutral-900 dark:text-neutral-100">{item.name}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase">{item.color} • {item.size}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recommendations display */}
        {recommendations && recommendations.recommendations?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">Recommended Outfits for "{recommendations.occasion}"</h2>
            <div className="space-y-8">
              {recommendations.recommendations.map((rec, idx) => {
                const outfitKey = `rec-${idx}`
                return (
                  <Card key={idx} className="overflow-hidden bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                    <CardHeader className="pb-4 border-b-2 border-neutral-200 dark:border-neutral-800">
                      <CardTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">{rec.title}</CardTitle>
                      {rec.why && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-medium">{rec.why}</p>}
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {/* Outfit Items + Try-on Flow */}
                      <div className="flex flex-col lg:flex-row items-center gap-4">
                        {/* Individual Items */}
                        <div className="flex flex-wrap items-center gap-2 justify-center">
                          {rec.items.map((it, itemIdx) => {
                            const full = wardrobeItems.find(w => w.id === it.id)
                            return (
                              <div key={it.id} className="flex items-center gap-2">
                                <div className="relative">
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm overflow-hidden border-2 border-neutral-300 dark:border-neutral-600">
                                    {full?.image_url ? (
                                      <Image
                                        src={full.image_url}
                                        alt={it.name || full.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800">
                                        <Shirt className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
                                      </div>
                                    )}
                                  </div>
                                  {/* Label overlay */}
                                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                    <Badge variant="default" className="text-xs px-2 py-0.5 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 rounded-sm border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase">
                                      {it.category || full?.category}
                                    </Badge>
                                  </div>
                                </div>
                                {itemIdx < rec.items.length - 1 && (
                                  <div className="text-2xl font-bold text-neutral-500 dark:text-neutral-400">+</div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Equals Sign */}
                        <div className="text-3xl font-bold text-neutral-500 dark:text-neutral-400">=</div>

                        {/* Try-on Result */}
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative">
                            <div className="w-32 h-48 sm:w-40 sm:h-60 rounded-sm overflow-hidden border-2 border-neutral-900 dark:border-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                              {tryOnImages[outfitKey] ? (
                                <Image
                                  src={tryOnImages[outfitKey]}
                                  alt="Try-on result"
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-200 dark:bg-neutral-800">
                                  {generatingTryOn[outfitKey] ? (
                                    <>
                                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                      <span className="text-xs text-center font-semibold uppercase">Generating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Shirt className="h-8 w-8 text-neutral-500 dark:text-neutral-400 mb-2" />
                                      <span className="text-xs text-center font-semibold uppercase">Try-on</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                              <Badge variant="default" className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 border-2 border-neutral-900 dark:border-neutral-100 rounded-sm font-bold uppercase">
                                Try-on
                              </Badge>
                            </div>
                          </div>

                          {/* Error Message */}
                          {tryOnErrors[outfitKey] && (
                            <div className="px-3 py-2 bg-red-50 dark:bg-red-950 border-2 border-red-300 dark:border-red-800 rounded-sm max-w-xs">
                              <p className="text-xs text-red-800 dark:text-red-200 font-medium text-center">
                                {tryOnErrors[outfitKey]}
                              </p>
                            </div>
                          )}

                          {!tryOnImages[outfitKey] && !generatingTryOn[outfitKey] && (
                            <Button
                              size="sm"
                              onClick={() => generateOutfitTryOn(idx, rec.items)}
                              disabled={retryCountdowns[outfitKey] > 0 || globalGenerationCooldown > 0}
                              className="text-xs h-10 px-4 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {globalGenerationCooldown > 0 
                                ? `⏳ Wait ${globalGenerationCooldown}s` 
                                : retryCountdowns[outfitKey] > 0 
                                ? `Wait ${retryCountdowns[outfitKey]}s` 
                                : 'Generate Try-on (1 Credit)'}
                            </Button>
                          )}
                          
                          {/* Retry Button - Show only when try-on exists and not generating */}
                          {tryOnImages[outfitKey] && !generatingTryOn[outfitKey] && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateOutfitTryOn(idx, rec.items)}
                              disabled={retryCountdowns[outfitKey] > 0 || globalGenerationCooldown > 0}
                              className="text-xs h-10 px-4 border-2 border-neutral-300 dark:border-neutral-600 rounded-sm font-bold uppercase tracking-wide hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <RotateCcw className="h-3 w-3 mr-2" />
                              {globalGenerationCooldown > 0 
                                ? `⏳ Wait ${globalGenerationCooldown}s` 
                                : retryCountdowns[outfitKey] > 0 
                                ? `Wait ${retryCountdowns[outfitKey]}s to Retry` 
                                : 'Retry (1 Credit)'}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t-2 border-neutral-200 dark:border-neutral-800">
                        {rec.items.map((it) => {
                          const full = wardrobeItems.find(w => w.id === it.id)
                          return (
                            <div key={it.id} className="flex items-center gap-3 p-3 rounded-sm bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700">
                              <div className="w-12 h-12 rounded-sm overflow-hidden flex-shrink-0 border-2 border-neutral-300 dark:border-neutral-600">
                                {full?.image_url ? (
                                  <Image
                                    src={full.image_url}
                                    alt={it.name || full.name}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-700">
                                    <Shirt className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-sm truncate text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                                  {it.name || full?.name || 'Item'}
                                </div>
                                <div className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold uppercase">
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