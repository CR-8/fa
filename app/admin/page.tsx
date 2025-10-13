"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { products, categories } from "@/data/products"
import { Upload, Plus, X, Save, BarChart3, Users, ShoppingBag, TrendingUp } from "lucide-react"

const newProductTemplate = {
  name: "",
  price: "",
  brand: "",
  category: "",
  description: "",
  images: [] as string[],
  tryOnPreview: "",
}

export default function AdminPage() {
  const [productData, setProductData] = useState(newProductTemplate)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [newSize, setNewSize] = useState("")
  const [newColor, setNewColor] = useState("")

  const handleInputChange = (field: string, value: string | number) => {
    setProductData((prev) => ({ ...prev, [field]: value }))
  }

  const addSize = () => {
    if (newSize && !selectedSizes.includes(newSize)) {
      setSelectedSizes([...selectedSizes, newSize])
      setNewSize("")
    }
  }

  const removeSize = (size: string) => {
    setSelectedSizes(selectedSizes.filter((s) => s !== size))
  }

  const addColor = () => {
    if (newColor && !selectedColors.includes(newColor)) {
      setSelectedColors([...selectedColors, newColor])
      setNewColor("")
    }
  }

  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter((c) => c !== color))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalProductData = {
      ...productData,
      sizes: selectedSizes,
      colors: selectedColors,
      price: Number(productData.price),
    }

    console.log("Product Upload Data:", finalProductData)

    // Reset form
    setProductData(newProductTemplate)
    setSelectedSizes([])
    setSelectedColors([])

    alert("Product data logged to console! Check developer tools.")
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-full">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            Admin Dashboard
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Analytics Cards */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">
                    {typeof window !== 'undefined' && localStorage.getItem('userUploadedImages') ? '1' : '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{categories.filter(c => c.id !== 'all').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Product Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Brand */}
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={productData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="Enter brand name"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => cat.id !== "all")
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={productData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="imageUrl">Product Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => {
                    const images = e.target.value ? [e.target.value] : []
                    setProductData((prev) => ({ ...prev, images }))
                  }}
                />
              </div>

              {/* Try-on Preview URL */}
              <div>
                <Label htmlFor="tryOnUrl">Try-on Preview URL</Label>
                <Input
                  id="tryOnUrl"
                  type="url"
                  placeholder="https://example.com/tryon-preview.jpg"
                  onChange={(e) => {
                    setProductData((prev) => ({ ...prev, tryOnPreview: e.target.value }))
                  }}
                />
              </div>

              {/* Sizes */}
              <div>
                <Label>Available Sizes</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add size (e.g., S, M, L)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSize} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSizes.map((size) => (
                    <Badge key={size} variant="secondary" className="flex items-center gap-1">
                      {size}
                      <button type="button" onClick={() => removeSize(size)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <Label>Available Colors</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add color (e.g., red, blue)"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addColor} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map((color) => (
                    <Badge key={color} variant="secondary" className="flex items-center gap-1 capitalize">
                      {color}
                      <button type="button" onClick={() => removeColor(color)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg">
                <Save className="h-4 w-4 mr-2" />
                Upload Product
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
