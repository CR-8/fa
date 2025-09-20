"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { user } from "@/data/user"
import { User, Camera, Settings, Construction, Save, Upload, X, Check } from "lucide-react"
import Image from "next/image"
import { uploadImage } from "@/lib/upload"

export default function ProfilePage() {
  // Helper function to validate Cloudinary URLs
  const isValidCloudinaryUrl = (url: string): boolean => {
    if (!url || url === "/placeholder.svg") return false
    // Check if it's a Cloudinary URL (contains cloudinary.com)
    return url.includes('cloudinary.com') && (url.startsWith('http://') || url.startsWith('https://'))
  }

  // Initialize poses from localStorage if available, otherwise use default poses
  const getInitialPoses = () => {
    // Check if we're in the browser (client-side)
    if (typeof window === 'undefined') {
      return user.poses // Server-side: use default poses
    }
    
    try {
      const storedImages = JSON.parse(localStorage.getItem('userUploadedImages') || '[]')
      const validImages = storedImages.filter((img: string) => img && img !== "/placeholder.svg" && isValidCloudinaryUrl(img))
      
      // If we have valid Cloudinary images, use them for poses, otherwise use defaults
      if (validImages.length > 0) {
        // Fill with Cloudinary images, then pad with placeholders if needed
        const poses = [...validImages]
        while (poses.length < 3) {
          poses.push("/placeholder.svg")
        }
        return poses.slice(0, 3) // Ensure exactly 3 poses
      }
    } catch (error) {
      // Handle localStorage parsing error gracefully
    }
    
    return user.poses // Fall back to default poses
  }

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  })
  const [avatar, setAvatar] = useState(user.avatar || "/placeholder.svg")
  const [poses, setPoses] = useState(user.poses) // Start with default poses
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize poses from localStorage after component mounts
  useEffect(() => {
    const initialPoses = getInitialPoses()
    setPoses(initialPoses)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    // In a real app, this would save to a backend
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading('avatar')
    const result = await uploadImage(file)
    if (result && result.url && isValidCloudinaryUrl(result.url)) {
      setAvatar(result.url)
      setUploadSuccess('avatar')
      setTimeout(() => setUploadSuccess(null), 3000)

      // Update localStorage with avatar URL included in user images array
      const currentImages = JSON.parse(localStorage.getItem('userUploadedImages') || '[]')
      const validImages = currentImages.filter((img: string) => img && img !== "/placeholder.svg" && isValidCloudinaryUrl(img))
      
      // Add avatar if it's not already in the array
      if (!validImages.includes(result.url)) {
        validImages.push(result.url)
      }
      
      localStorage.setItem('userUploadedImages', JSON.stringify(validImages))
    } else {
      // Handle invalid URL gracefully
    }
    setUploading(null)
  }

  const handlePoseUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(`pose-${index}`)
    const result = await uploadImage(file)
    if (result && result.url && isValidCloudinaryUrl(result.url)) {
      const newPoses = [...poses]
      newPoses[index] = result.url
      setPoses(newPoses)
      setUploadSuccess(`pose-${index}`)
      setTimeout(() => setUploadSuccess(null), 3000)

      // Update localStorage with all valid Cloudinary URLs from poses
      const validCloudinaryUrls = newPoses.filter(pose => pose !== "/placeholder.svg" && isValidCloudinaryUrl(pose))
      localStorage.setItem('userUploadedImages', JSON.stringify(validCloudinaryUrls))
    } else {
      // Handle invalid URL gracefully
    }
    setUploading(null)
  }

  const removePose = (index: number) => {
    const newPoses = [...poses]
    const removedUrl = newPoses[index]
    newPoses[index] = "/placeholder.svg"
    setPoses(newPoses)

    // Update localStorage with remaining valid Cloudinary URLs
    const validCloudinaryUrls = newPoses.filter(pose => pose !== "/placeholder.svg" && isValidCloudinaryUrl(pose))
    localStorage.setItem('userUploadedImages', JSON.stringify(validCloudinaryUrls))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-full">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold">Profile Settings</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl">
        <div className="space-y-4 sm:space-y-6">
        {/* User Setup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              User Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
        {/* Profile Avatar */}
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          <div className="relative">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-200 ${
              uploadSuccess === 'avatar'
                ? 'border-green-500 shadow-md'
                : 'border-muted-foreground/20'
            }`}>
              <Image
                src={avatar}
                alt="Profile avatar"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
              {uploading === 'avatar' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                </div>
              )}
              {uploadSuccess === 'avatar' && (
                <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 sm:w-7 sm:h-7 p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading === 'avatar'}
            >
              <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-center">Click to change avatar</p>
        </div>

            {/* Basic Information */}
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Upload 3 Images Section */}
              <div>
                <Label className="text-sm font-medium">Your Photos (3 poses)</Label>
                <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                  Upload photos in different poses for better AI recommendations
                </p>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {poses.map((pose, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-md sm:rounded-lg overflow-hidden border transition-all duration-200 cursor-pointer ${
                        uploadSuccess === `pose-${index}`
                          ? 'border-green-500 shadow-md'
                          : 'border-muted-foreground/20 hover:border-primary/50'
                      }`}
                      onClick={() => !uploading && document.getElementById(`pose-${index}`)?.click()}
                    >
                      <Image
                        src={pose}
                        alt={`Pose ${index + 1}`}
                        fill
                        className="object-cover"
                      />

                      {uploading === `pose-${index}` && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}

                      {uploadSuccess === `pose-${index}` && (
                        <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}

                      {pose === "/placeholder.svg" && !uploading && uploadSuccess !== `pose-${index}` && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <Upload className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                      )}

                      {pose !== "/placeholder.svg" && !uploading && uploadSuccess !== `pose-${index}` && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 rounded-full w-4 h-4 sm:w-5 sm:h-5 p-0 opacity-0 hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePose(index)
                          }}
                        >
                          <X className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                        </Button>
                      )}

                      <input
                        id={`pose-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePoseUpload(index, e)}
                        className="hidden"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Style Preferences */}
              <div>
                <Label className="text-sm font-medium">Style Preferences</Label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                  {user.preferences.styles.map((style) => (
                    <Badge key={style} variant="secondary" className="text-xs capitalize px-2 py-1">
                      {style}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                    + Add
                  </Button>
                </div>
              </div>

              {/* Size Information */}
              <div>
                <Label className="text-sm font-medium">Size Information</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2 mt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Top</Label>
                    <Input value={user.preferences.sizes.top} readOnly className="text-center text-sm h-8 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bottom</Label>
                    <Input value={user.preferences.sizes.bottom} readOnly className="text-center text-sm h-8 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Shoes</Label>
                    <Input value={user.preferences.sizes.shoes} readOnly className="text-center text-sm h-8 mt-1" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full mt-6">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wardrobe Setup - Coming Soon */}
        <Card className="border-dashed">
          <CardContent className="py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Construction className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">Wardrobe Management</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled className="ml-2 flex-shrink-0">
                Setup
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
