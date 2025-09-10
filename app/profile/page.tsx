"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { user } from "@/data/user"
import { User, Camera, Settings, Construction, Save } from "lucide-react"
import Image from "next/image"

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  })
  const [showComingSoon, setShowComingSoon] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
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
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt="Profile avatar"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                  <Camera className="h-4 w-4" />
                </Button>
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
                  {user.poses.map((pose, index) => (
                    <div
                      key={index}
                      className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30"
                    >
                      <Image src={pose || "/placeholder.svg"} alt={`Pose ${index + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
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
