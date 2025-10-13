"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { user } from "@/data/user"
import { User, Camera, Settings, Construction, Save, Upload, X, Check, Download, Upload as UploadIcon, Sparkles, Ruler } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { uploadImage } from "@/lib/upload"
import { supabase } from "@/lib/supabase"

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
  const [measurements, setMeasurements] = useState({
    height: '',
    shoeSize: '',
    chest: '',
    waist: '',
    hips: ''
  })
  const [avatar, setAvatar] = useState(user.avatar || "/placeholder.svg")
  const [poses, setPoses] = useState(user.poses) // Start with default poses
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validation function for uploaded files
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
    }

    return null;
  }

  // Initialize poses and measurements after component mounts
  useEffect(() => {
    const initialPoses = getInitialPoses()
    setPoses(initialPoses)

    // Load measurements from Supabase
    const loadMeasurements = async () => {
      try {
        const userId = 'user-1' // TODO: Get from auth

        const { data, error } = await supabase
          .from('user_profiles')
          .select('height, shoe_size, measurements')
          .eq('user_id', userId)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading measurements:', error)
          // Fallback to localStorage
          const savedMeasurements = localStorage.getItem('userMeasurements')
          if (savedMeasurements) {
            try {
              const parsed = JSON.parse(savedMeasurements)
              setMeasurements(parsed)
            } catch (error) {
              console.warn('Failed to parse saved measurements:', error)
            }
          }
        } else if (data) {
          // Load from database
          setMeasurements({
            height: data.height || '',
            shoeSize: data.shoe_size || '',
            chest: data.measurements?.chest || '',
            waist: data.measurements?.waist || '',
            hips: data.measurements?.hips || ''
          })
          // Update localStorage as backup
          localStorage.setItem('userMeasurements', JSON.stringify({
            height: data.height || '',
            shoeSize: data.shoe_size || '',
            chest: data.measurements?.chest || '',
            waist: data.measurements?.waist || '',
            hips: data.measurements?.hips || ''
          }))
        } else {
          // No data in database, try localStorage
          const savedMeasurements = localStorage.getItem('userMeasurements')
          if (savedMeasurements) {
            try {
              const parsed = JSON.parse(savedMeasurements)
              setMeasurements(parsed)
            } catch (error) {
              console.warn('Failed to parse saved measurements:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error loading measurements:', error)
        // Fallback to localStorage
        const savedMeasurements = localStorage.getItem('userMeasurements')
        if (savedMeasurements) {
          try {
            const parsed = JSON.parse(savedMeasurements)
            setMeasurements(parsed)
          } catch (error) {
            console.warn('Failed to parse saved measurements:', error)
          }
        }
      }
    }

    loadMeasurements()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    try {
      const userId = 'user-1' // TODO: Get from auth

      // Save measurements to Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          height: measurements.height,
          shoe_size: measurements.shoeSize,
          measurements: {
            chest: measurements.chest,
            waist: measurements.waist,
            hips: measurements.hips
          }
        })

      if (error) {
        console.error('Error saving profile to database:', error)
        // Fallback to localStorage
        localStorage.setItem('userMeasurements', JSON.stringify(measurements))
      } else {
        // Update localStorage as backup
        localStorage.setItem('userMeasurements', JSON.stringify(measurements))
        console.log('Profile saved successfully!')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      // Fallback to localStorage
      localStorage.setItem('userMeasurements', JSON.stringify(measurements))
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setUploading('avatar')
    setUploadError(null)
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
      setUploadError('Failed to upload image. Please try again.');
      setTimeout(() => setUploadError(null), 5000);
    }
    setUploading(null)
  }

  const handlePoseUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setUploading(`pose-${index}`)
    setUploadError(null)
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
      setUploadError('Failed to upload image. Please try again.');
      setTimeout(() => setUploadError(null), 5000);
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

  const exportUserData = () => {
    const userData = {
      name: formData.name,
      email: formData.email,
      avatar,
      poses,
      uploadedImages: JSON.parse(localStorage.getItem('userUploadedImages') || '[]'),
      preferences: user.preferences,
      exportedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'fashion-ai-profile.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importUserData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const userData = JSON.parse(e.target?.result as string)
        
        // Validate the data structure
        if (userData.name && userData.email && userData.avatar && userData.poses) {
          setFormData({ name: userData.name, email: userData.email })
          setAvatar(userData.avatar)
          setPoses(userData.poses)
          
          if (userData.uploadedImages) {
            localStorage.setItem('userUploadedImages', JSON.stringify(userData.uploadedImages))
          }
          
          setUploadSuccess('import')
          setTimeout(() => setUploadSuccess(null), 3000)
        } else {
          setUploadError('Invalid file format')
          setTimeout(() => setUploadError(null), 5000)
        }
      } catch (error) {
        setUploadError('Failed to import data')
        setTimeout(() => setUploadError(null), 5000)
      }
    }
    reader.readAsText(file)
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
          {uploadError && (
            <p className="text-xs text-red-500 text-center mt-1">{uploadError}</p>
          )}
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
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Body Measurements
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Height (cm)</Label>
                    <Input
                      value={measurements.height}
                      onChange={(e) => handleMeasurementChange('height', e.target.value)}
                      placeholder="170"
                      className="text-center text-sm h-8 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Shoe Size</Label>
                    <Input
                      value={measurements.shoeSize}
                      onChange={(e) => handleMeasurementChange('shoeSize', e.target.value)}
                      placeholder="8"
                      className="text-center text-sm h-8 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Chest (inches)</Label>
                    <Input
                      value={measurements.chest}
                      onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                      placeholder="38"
                      className="text-center text-sm h-8 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Waist (inches)</Label>
                    <Input
                      value={measurements.waist}
                      onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                      placeholder="32"
                      className="text-center text-sm h-8 mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Hips (inches)</Label>
                    <Input
                      value={measurements.hips}
                      onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                      placeholder="36"
                      className="text-center text-sm h-8 mt-1"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full mt-6">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>

              {/* Data Management */}
              <div className="border-t pt-4 mt-4">
                <Label className="text-sm font-medium">Data Management</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Export your profile data for backup or import from a previous backup
                </p>
                <div className="flex gap-2">
                  <Button onClick={exportUserData} variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => document.getElementById('import-input')?.click()}>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                    <input
                      id="import-input"
                      type="file"
                      accept=".json"
                      onChange={importUserData}
                      className="hidden"
                    />
                  </div>
                </div>
                {uploadSuccess === 'import' && (
                  <p className="text-xs text-green-600 mt-2">Data imported successfully!</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wardrobe */}
        <Card>
          <CardContent className="py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Construction className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">My Wardrobe</p>
                  <p className="text-xs text-muted-foreground">Manage your clothing collection</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-2 flex-shrink-0" asChild>
                <Link href="/wardrobe">View Wardrobe</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Style Quiz */}
        <Card>
          <CardContent className="py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">Style Quiz</p>
                  <p className="text-xs text-muted-foreground">Take our quiz to get personalized recommendations</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-2 flex-shrink-0" asChild>
                <Link href="/style-quiz">Take Quiz</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
