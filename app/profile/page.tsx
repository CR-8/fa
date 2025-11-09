"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { user } from "@/data/user"
import { User, Camera, Settings, Construction, Save, Upload, X, Check, Download, Upload as UploadIcon, Sparkles, Ruler, Crown, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { uploadImage } from "@/lib/upload"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { getUserProfile, updateUserProfile } from "@/lib/supabase"
import { PLAN_FEATURES, formatCreditDisplay, getTimeUntilReset } from "@/lib/credits"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, profile, credits, loading, refreshCredits } = useAuth()
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login?next=/profile')
    }
  }, [authUser, loading, router])

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
    name: profile?.name || authUser?.user_metadata?.name || authUser?.user_metadata?.full_name || '',
    email: profile?.email || authUser?.email || '',
  })
  const [measurements, setMeasurements] = useState({
    height: '',
    shoeSize: '',
    chest: '',
    waist: '',
    hips: ''
  })
  const [avatar, setAvatar] = useState(
    profile?.avatar_url || 
    authUser?.user_metadata?.avatar_url || 
    authUser?.user_metadata?.picture || 
    "/placeholder.svg"
  )
  const [poses, setPoses] = useState(user.poses) // Start with default poses
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
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

  // Sync form data with Google OAuth user data
  useEffect(() => {
    if (profile || authUser) {
      setFormData({
        name: profile?.name || authUser?.user_metadata?.name || authUser?.user_metadata?.full_name || '',
        email: profile?.email || authUser?.email || '',
      })
      
      setAvatar(
        profile?.avatar_url || 
        authUser?.user_metadata?.avatar_url || 
        authUser?.user_metadata?.picture || 
        "/placeholder.svg"
      )
    }
  }, [profile, authUser])

  // Initialize poses and measurements after component mounts
  useEffect(() => {
    if (!authUser) return

    const initialPoses = getInitialPoses()
    setPoses(initialPoses)

    // Load measurements from Supabase
    const loadMeasurements = async () => {
      try {
        // For now, measurements are only stored in localStorage
        // The profiles table doesn't have measurement fields yet
        const savedMeasurements = localStorage.getItem('userMeasurements')
        if (savedMeasurements) {
          try {
            const parsed = JSON.parse(savedMeasurements)
            setMeasurements(parsed)
          } catch (error) {
            console.warn('Failed to parse saved measurements:', error)
          }
        }
      } catch (error) {
        console.error('Error loading measurements:', error)
      }
    }

    loadMeasurements()
  }, [authUser])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    if (!authUser) return
    
    setSaving(true)
    try {
      const userId = authUser.id

      // Update profile in profiles table
      await updateUserProfile(userId, {
        name: formData.name,
        avatar_url: avatar,
      })

      // Save measurements to localStorage (profiles table doesn't support measurements yet)
      localStorage.setItem('userMeasurements', JSON.stringify(measurements))
      
      setUploadSuccess('profile-saved')
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      // Fallback to localStorage
      localStorage.setItem('userMeasurements', JSON.stringify(measurements))
      setUploadError('Failed to save profile')
      setTimeout(() => setUploadError(null), 3000)
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-sm h-12 w-12 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100"></div>
        </div>
      ) : !authUser ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md p-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-900 rounded-sm flex items-center justify-center">
              <User className="h-10 w-10 text-neutral-400 dark:text-neutral-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-neutral-900 dark:text-neutral-100">Welcome Back</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-sm">Please sign in to access your profile and continue your fashion journey</p>
            <Button asChild size="lg" className="w-full bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm font-semibold">
              <Link href="/login">Sign In with Google</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* Hero Header Section */}
          <div className="relative w-full bg-white dark:bg-neutral-900 border-b-2 border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-sm overflow-hidden border-2 border-neutral-900 dark:border-neutral-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <Image
                      src={avatar}
                      alt={formData.name || 'User'}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      priority
                    />
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-sm w-10 h-10 p-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 border-2 border-neutral-900 dark:border-neutral-100"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading === 'avatar'}
                  >
                    {uploading === 'avatar' ? (
                      <div className="animate-spin rounded-sm h-4 w-4 border-2 border-neutral-100 dark:border-neutral-900 border-t-transparent" />
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

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{formData.name || 'User'}</h1>
                    <Badge variant="outline" className="text-xs border-2 border-neutral-900 dark:border-neutral-100 bg-white dark:bg-black rounded-sm px-2 py-1">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      VERIFIED
                    </Badge>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-sm font-medium">{formData.email}</p>
                  
                  {/* Plan & Credits Quick View */}
                  <div className="flex flex-wrap gap-3">
                    <Badge 
                      variant="outline" 
                      className="px-4 py-2.5 text-sm border-2 border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 rounded-sm font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.25)]"
                    >
                      {profile?.plan_tier === 'elite' && <Crown className="h-4 w-4 mr-2" />}
                      {profile?.plan_tier === 'pro' && <Crown className="h-4 w-4 mr-2" />}
                      {PLAN_FEATURES[profile?.plan_tier || 'free'].name.toUpperCase()} PLAN
                    </Badge>
                    
                    <Badge variant="outline" className="px-4 py-2.5 text-sm border-2 border-neutral-300 dark:border-neutral-700 rounded-sm font-semibold">
                      <CreditCard className="h-4 w-4 mr-2" />
                      {credits ? formatCreditDisplay(credits) : '0/0'} CREDITS
                    </Badge>
                    
                    {profile?.plan_tier === 'free' && (
                      <Button asChild size="sm" className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm border-2 border-neutral-900 dark:border-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] font-semibold">
                        <Link href="/pricing">
                          <Sparkles className="h-4 w-4 mr-2" />
                          UPGRADE
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Sidebar - Credits & Quick Actions */}
              <div className="lg:col-span-1 space-y-6">

                
                {/* Credits Card */}
                <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                      <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                        <CreditCard className="h-5 w-5 text-black dark:text-white" />
                      </div>
                      AI Credits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <p className="text-5xl font-bold text-black dark:text-white">
                        {credits ? credits.credits_remaining : 0}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                        of {credits ? credits.credits_total : 0} daily credits
                      </p>
                    </div>
                    
                    {credits && (
                      <div className="space-y-2">
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-sm h-2 overflow-hidden">
                          <div
                            className="h-full bg-black dark:bg-white transition-all duration-500"
                            style={{
                              width: `${(credits.credits_remaining / credits.credits_total) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
                          <span>Resets in {getTimeUntilReset(credits)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-auto p-0 text-xs hover:text-black dark:hover:text-white"
                            onClick={refreshCredits}
                          >
                            Refresh
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Virtual Try-On</span>
                        <Badge variant="outline" className="border-neutral-300 dark:border-neutral-600">1 credit</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Outfit Suggestions</span>
                        <Badge variant="outline" className="border-neutral-300 dark:border-neutral-600">2 credits</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">Style Analysis</span>
                        <Badge variant="outline" className="border-neutral-300 dark:border-neutral-600">1 credit</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800 pb-4">
                    <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100 font-bold tracking-tight uppercase">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-6">
                    <Button asChild variant="outline" className="w-full justify-start border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm font-semibold" size="lg">
                      <Link href="/wardrobe">
                        <Construction className="h-5 w-5 mr-3" />
                        MY WARDROBE
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm font-semibold" size="lg">
                      <Link href="/style-quiz">
                        <Sparkles className="h-5 w-5 mr-3" />
                        STYLE QUIZ
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm font-semibold" size="lg">
                      <Link href="/ai-fa">
                        <Sparkles className="h-5 w-5 mr-3" />
                        AI ASSISTANT
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Data Management */}
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800 pb-4">
                    <CardTitle className="text-lg text-neutral-900 dark:text-neutral-100 font-bold tracking-tight uppercase">Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-6">
                    <Button 
                      onClick={exportUserData} 
                      variant="outline" 
                      className="w-full justify-start border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm font-semibold"
                      size="lg"
                    >
                      <Download className="h-5 w-5 mr-3" />
                      EXPORT PROFILE
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-2 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm font-semibold"
                      size="lg"
                      onClick={() => document.getElementById('import-input')?.click()}
                    >
                      <UploadIcon className="h-5 w-5 mr-3" />
                      IMPORT PROFILE
                    </Button>
                    <input
                      id="import-input"
                      type="file"
                      accept=".json"
                      onChange={importUserData}
                      className="hidden"
                    />
                    {uploadSuccess === 'import' && (
                      <p className="text-xs text-green-600 dark:text-green-500 mt-2 font-semibold uppercase">Data imported successfully!</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Main Content - Profile Settings */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Personal Information */}
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800 pb-4">
                    <CardTitle className="flex items-center gap-3 text-neutral-900 dark:text-neutral-100">
                      <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-sm border border-neutral-200 dark:border-neutral-700">
                        <User className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                      </div>
                      <span className="font-bold tracking-tight uppercase">Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-xs font-bold mb-2 block uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                          className="h-12 rounded-sm border-2 border-neutral-300 dark:border-neutral-600 font-medium"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-xs font-bold mb-2 block uppercase tracking-wide text-neutral-700 dark:text-neutral-300">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter your email"
                          className="h-12 rounded-sm border-2 border-neutral-300 dark:border-neutral-600 font-medium"
                          disabled
                        />
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1.5 font-medium uppercase tracking-wide">
                          Linked to your Google account
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Gallery */}
                <Card className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                  <CardHeader className="border-b-2 border-neutral-200 dark:border-neutral-800 pb-4">
                    <CardTitle className="flex items-center gap-3 text-neutral-900 dark:text-neutral-100">
                      <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-sm border border-neutral-200 dark:border-neutral-700">
                        <Camera className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
                      </div>
                      <span className="font-bold tracking-tight uppercase">Photo Gallery</span>
                    </CardTitle>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 font-medium">
                      Upload photos in different poses for better AI recommendations
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {poses.map((pose, index) => (
                        <div
                          key={index}
                          className={`group relative aspect-[3/4] rounded-sm overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                            uploadSuccess === `pose-${index}`
                              ? 'border-green-600 shadow-[4px_4px_0px_0px_rgba(22,163,74,0.5)]'
                              : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-900 dark:hover:border-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]'
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
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                                <p className="text-white text-sm">Uploading...</p>
                              </div>
                            </div>
                          )}

                          {uploadSuccess === `pose-${index}` && (
                            <div className="absolute inset-0 bg-green-500/90 flex items-center justify-center">
                              <div className="text-center text-white">
                                <Check className="h-12 w-12 mx-auto mb-2" />
                                <p className="text-sm font-medium">Uploaded!</p>
                              </div>
                            </div>
                          )}

                          {pose === "/placeholder.svg" && !uploading && uploadSuccess !== `pose-${index}` && (
                            <div className="absolute inset-0 bg-neutral-900 dark:bg-neutral-100 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="text-center text-neutral-50 dark:text-neutral-900">
                                <Upload className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm font-bold uppercase tracking-wide">Upload Photo</p>
                              </div>
                            </div>
                          )}

                          {pose !== "/placeholder.svg" && !uploading && uploadSuccess !== `pose-${index}` && (
                            <>
                              <div className="absolute inset-0 bg-neutral-900 dark:bg-neutral-100 opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2 rounded-sm w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-md bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 border-2 border-neutral-900 dark:border-neutral-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removePose(index)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
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
                    {uploadError && (
                      <p className="text-sm text-red-500 mt-4 text-center">{uploadError}</p>
                    )}
                  </CardContent>
                </Card>

 


                {/* Save Button */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveProfile} 
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100" 
                    size="lg"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-black border-t-transparent mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save All Changes
                      </>
                    )}
                  </Button>
                  {uploadSuccess === 'profile-saved' && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500 px-4">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">Saved!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
