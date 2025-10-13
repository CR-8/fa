"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Shirt, Plus, X, Save, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase, WardrobeItem } from "@/lib/supabase"
import { uploadImage } from "@/lib/upload"

export default function WardrobePage() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

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
      </div>
    </div>
  )
}