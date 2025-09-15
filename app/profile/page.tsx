"use client"

import { useState, useRef } from "react"
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
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  })
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [avatar, setAvatar] = useState(user.avatar || "/placeholder.svg")
  const [poses, setPoses] = useState(user.poses)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    console.log("Profile saved:", formData)
    // In a real app, this would save to a backend
  }

  const handleWardrobeSetup = () => {
    setShowComingSoon(true)
    setTimeout(() => setShowComingSoon(false), 3000)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading('avatar')
    const result = await uploadImage(file)
    if (result) {
      setAvatar(result.url)
      setUploadSuccess('avatar')
      setTimeout(() => setUploadSuccess(null), 3000)

      // Update localStorage for AI chat access
      const currentImages = JSON.parse(localStorage.getItem('userUploadedImages') || '[]')
      localStorage.setItem('userUploadedImages', JSON.stringify([...currentImages.filter((img: string) => !img.includes('avatar')), result.url]))
    }
    setUploading(null)
  }

  const handlePoseUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(`pose-${index}`)
    const result = await uploadImage(file)
    if (result) {
      const newPoses = [...poses]
      newPoses[index] = result.url
      setPoses(newPoses)
      setUploadSuccess(`pose-${index}`)
      setTimeout(() => setUploadSuccess(null), 3000)

      // Update localStorage for AI chat access
      const currentImages = JSON.parse(localStorage.getItem('userUploadedImages') || '[]')
      const updatedImages = [...currentImages]
      updatedImages[index] = result.url
      localStorage.setItem('userUploadedImages', JSON.stringify(updatedImages))
    }
    setUploading(null)
  }

  const removePose = (index: number) => {
    const newPoses = [...poses]
    newPoses[index] = "/placeholder.svg"
    setPoses(newPoses)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            Profile
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="p-4 space-y-6">
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
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                  uploadSuccess === 'avatar'
                    ? 'border-green-500 shadow-lg shadow-green-500/25'
                    : 'border-primary/20'
                }`}>
                  <Image
                    src={avatar}
                    alt="Profile avatar"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                  {/* Upload Overlay */}
                  {uploading === 'avatar' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span className="text-white text-xs font-medium">Uploading...</span>
                      </div>
                    </div>
                  )}
                  {/* Success Overlay */}
                  {uploadSuccess === 'avatar' && (
                    <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center animate-in fade-in duration-300">
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-white rounded-full p-2 animate-in zoom-in duration-300">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-white text-xs font-medium">Uploaded!</span>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 transition-all duration-200 hover:scale-110"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading === 'avatar'}
                >
                  {uploading === 'avatar' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              {/* Upload 3 Images Section */}
              <div>
                <Label>Upload Your Photos (3 poses)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload photos in different poses for better AI recommendations
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {poses.map((pose, index) => (
                    <div
                      key={index}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                        uploadSuccess === `pose-${index}`
                          ? 'border-green-500 shadow-lg shadow-green-500/25'
                          : 'border-dashed border-muted-foreground/30 hover:border-primary/50'
                      }`}
                      onClick={() => !uploading && document.getElementById(`pose-${index}`)?.click()}
                    >
                      <Image
                        src={pose}
                        alt={`Pose ${index + 1}`}
                        fill
                        className="object-cover"
                      />

                      {/* Upload Overlay */}
                      {uploading === `pose-${index}` && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-in fade-in duration-300">
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                            <span className="text-white text-sm font-medium">Uploading...</span>
                          </div>
                        </div>
                      )}

                      {/* Success Overlay */}
                      {uploadSuccess === `pose-${index}` && (
                        <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center animate-in fade-in duration-300">
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-white rounded-full p-3 animate-in zoom-in duration-300 delay-150">
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-white text-sm font-medium">Uploaded!</span>
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay for Empty State */}
                      {pose === "/placeholder.svg" && !uploading && uploadSuccess !== `pose-${index}` && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-white/90 rounded-full p-3">
                              <Upload className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="text-white text-sm font-medium">Click to upload</span>
                          </div>
                        </div>
                      )}

                      {/* Remove Button */}
                      {pose !== "/placeholder.svg" && !uploading && uploadSuccess !== `pose-${index}` && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 rounded-full w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            removePose(index)
                          }}
                        >
                          <X className="h-3 w-3" />
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
                <Label>Style Preferences</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.preferences.styles.map((style) => (
                    <Badge key={style} variant="secondary" className="capitalize">
                      {style}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                    + Add Style
                  </Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <Label>Size Information</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Top</Label>
                    <Input value={user.preferences.sizes.top} readOnly className="text-center" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Bottom</Label>
                    <Input value={user.preferences.sizes.bottom} readOnly className="text-center" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Shoes</Label>
                    <Input value={user.preferences.sizes.shoes} readOnly className="text-center" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wardrobe Setup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Construction className="h-5 w-5" />
              Wardrobe Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Organize and manage your personal wardrobe collection with AI-powered categorization
            </p>
            <Button onClick={handleWardrobeSetup} className="w-full" disabled={showComingSoon}>
              {showComingSoon ? "🚧 Coming Soon" : "Setup My Wardrobe"}
            </Button>
            {showComingSoon && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                This feature is currently under development
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
