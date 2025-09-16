"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatBubble } from "@/components/chat-bubble"
import { chatHistory } from "@/data/chat"
import { user } from "@/data/user"
import { rateLimiter } from "@/lib/rate-limiter"
import { Send, Sparkles, Bot, User, Zap, Heart, Image as ImageIcon } from "lucide-react"

export default function AIFAPage() {
  const [messages, setMessages] = useState(chatHistory)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [userImages, setUserImages] = useState<string[]>([])

  // Helper function to validate Cloudinary URLs
  const isValidCloudinaryUrl = (url: string): boolean => {
    if (!url || url === "/placeholder.svg") return false
    // Check if it's a Cloudinary URL (contains cloudinary.com)
    return url.includes('cloudinary.com') && (url.startsWith('http://') || url.startsWith('https://'))
  }

  // Load user images from localStorage (uploaded images from profile)
  useEffect(() => {
    const savedImages = localStorage.getItem('userUploadedImages')
    console.log("🔍 Debug - localStorage 'userUploadedImages':", savedImages); // Debug log
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages)
        console.log("🔍 Debug - parsed images:", parsedImages); // Debug log
        const filteredImages = parsedImages.filter((img: string) => img && img !== "/placeholder.svg" && isValidCloudinaryUrl(img))
        console.log("🔍 Debug - filtered valid Cloudinary images:", filteredImages); // Debug log
        setUserImages(filteredImages)
      } catch (error) {
        console.warn('Failed to parse saved user images:', error)
      }
    }

    // Also check for profile images as fallback only if no Cloudinary images
    const profileImages = user.poses?.filter(img => img && img !== "/placeholder.svg") || []
    if (profileImages.length > 0 && userImages.length === 0) {
      console.log("🔍 Debug - using fallback profile images (these are NOT Cloudinary):", profileImages); // Debug log
      // Don't use these as they're old local images, better to ask user to upload
    }
  }, [])

  // Listen for profile image updates
  useEffect(() => {
    const handleStorageChange = () => {
      const savedImages = localStorage.getItem('userUploadedImages')
      console.log("🔍 Debug - Storage change detected, new value:", savedImages); // Debug log
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages)
          const filteredImages = parsedImages.filter((img: string) => img && img !== "/placeholder.svg" && isValidCloudinaryUrl(img))
          console.log("🔍 Debug - Updated filtered Cloudinary images after storage change:", filteredImages); // Debug log
          setUserImages(filteredImages)
        } catch (error) {
          console.warn('Failed to parse saved user images:', error)
        }
      }
    }

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange)
    
    // Also periodically check localStorage since storage events don't fire for same-tab changes
    const interval = setInterval(() => {
      const savedImages = localStorage.getItem('userUploadedImages')
      if (savedImages) {
        try {
          const parsedImages = JSON.parse(savedImages)
          const filteredImages = parsedImages.filter((img: string) => img && img !== "/placeholder.svg" && isValidCloudinaryUrl(img))
          setUserImages(filteredImages)
        } catch (error) {
          console.warn('Failed to parse saved user images:', error)
        }
      }
    }, 2000) // Check every 2 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Check rate limit
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(rateLimiter.getTimeUntilNextRequest() / 1000);
      const rateLimitMessage = {
        id: `m${messages.length + 1}`,
        sender: "ai" as const,
        text: `⏱️ Please wait ${waitTime} seconds before sending another message to avoid overwhelming the AI service.`,
        timestamp: new Date().toISOString(),
        suggestedProducts: [],
      }
      setMessages([...messages, rateLimitMessage])
      return
    }

    const newMessage = {
      id: `m${messages.length + 1}`,
      sender: "user" as const,
      text: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMessage])
    setInputValue("")
    setIsTyping(true)

    // Call Gemini chat API with user images
    try {
      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          userImages: userImages.filter(img => img && img !== "/placeholder.svg")
        })
      })

      if (res.status === 429) {
        const data = await res.json();
        const retryAfter = data.retryAfter || 60;
        const errorMessage = {
          id: `m${messages.length + 2}`,
          sender: "ai" as const,
          text: `🤖 I'm currently receiving too many requests. Please wait ${retryAfter} seconds and try again!`,
          timestamp: new Date().toISOString(),
          suggestedProducts: [],
        }
        setMessages((prev) => [...prev, errorMessage])
      } else if (res.status === 503) {
        const data = await res.json();
        const retryAfter = data.retryAfter || 30;
        const errorMessage = {
          id: `m${messages.length + 2}`,
          sender: "ai" as const,
          text: `🧠 My AI brain is taking a quick break! Please try again in ${retryAfter} seconds.`,
          timestamp: new Date().toISOString(),
          suggestedProducts: [],
        }
        setMessages((prev) => [...prev, errorMessage])
      } else {
        const data = await res.json()
        const aiResponse = {
          id: `m${messages.length + 2}`,
          sender: "ai" as const,
          text: data.reply,
          timestamp: new Date().toISOString(),
          suggestedProducts: data.products,
        }
        setMessages((prev) => [...prev, aiResponse])
      }
    } catch (error) {
      const errorResponse = {
        id: `m${messages.length + 2}`,
        sender: "ai" as const,
        text: "Sorry, I'm having trouble processing your request. Please check your internet connection and try again.",
        timestamp: new Date().toISOString(),
        suggestedProducts: [],
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleTryOn = async (productId: string) => {
    // Check rate limit
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = Math.ceil(rateLimiter.getTimeUntilNextRequest() / 1000);
      const rateLimitMessage = {
        id: `m${messages.length + 1}`,
        sender: "ai" as const,
        text: `⏱️ Please wait ${waitTime} seconds before using the try-on feature to avoid overwhelming the AI service.`,
        timestamp: new Date().toISOString(),
        suggestedProducts: [],
      }
      setMessages([...messages, rateLimitMessage])
      return
    }

    setIsTyping(true)
    try {
      // Use the first available user image for try-on (only Cloudinary URLs)
      const validCloudinaryImages = userImages.filter(img => isValidCloudinaryUrl(img))
      const userImageToUse = validCloudinaryImages.length > 0 ? validCloudinaryImages[0] : "/placeholder.svg";

      console.log("🔍 Debug - userImages array:", userImages); // Debug log to see what's in userImages
      console.log("🔍 Debug - validCloudinaryImages:", validCloudinaryImages); // Debug log to see valid Cloudinary images
      console.log("🔍 Debug - userImages.length:", userImages.length); // Debug log to see array length
      console.log("🔍 Debug - user.poses:", user.poses); // Debug log to see fallback poses
      console.log("Try-on image URL (should be Cloudinary):", userImageToUse); // Debug log to see if Cloudinary URL is being used

      if (userImageToUse === "/placeholder.svg") {
        const errorMessage = {
          id: `m${messages.length + 1}`,
          sender: "ai" as const,
          text: "To use the try-on feature, please upload some photos of yourself in your profile page first. Make sure to upload new photos to get Cloudinary URLs.",
          timestamp: new Date().toISOString(),
          suggestedProducts: [],
        }
        setMessages((prev) => [...prev, errorMessage])
        setIsTyping(false)
        return
      }

      // Add loading message showing we're using their uploaded image
      const loadingMessage = {
        id: `m${messages.length + 1}`,
        sender: "ai" as const,
        text: `🎨 Creating your personalized try-on using your uploaded photo... This may take a moment!`,
        timestamp: new Date().toISOString(),
        suggestedProducts: [],
      }
      setMessages((prev) => [...prev, loadingMessage])

      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userImageUrl: userImageToUse
        })
      })

      if (res.status === 429) {
        const data = await res.json();
        const retryAfter = data.retryAfter || 60;
        const errorMessage = {
          id: `m${messages.length + 1}`,
          sender: "ai" as const,
          text: `🤖 AI service is at capacity. Please wait ${retryAfter} seconds and try the try-on feature again!`,
          timestamp: new Date().toISOString(),
          suggestedProducts: [],
        }
        setMessages((prev) => [...prev, errorMessage])
      } else if (res.status === 503) {
        const data = await res.json();
        const retryAfter = data.retryAfter || 30;
        const errorMessage = {
          id: `m${messages.length + 1}`,
          sender: "ai" as const,
          text: `🧠 AI service is temporarily unavailable. Please try again in ${retryAfter} seconds.`,
          timestamp: new Date().toISOString(),
          suggestedProducts: [],
        }
        setMessages((prev) => [...prev, errorMessage])
      } else {
        const data = await res.json()

        if (data.description && data.success) {
          // Remove the loading message before adding the result
          setMessages((prev) => prev.filter(msg => !msg.text?.includes("Creating your personalized try-on")))
          
          const tryOnMessage = {
            id: `m${messages.length + 1}`,
            sender: "ai" as const,
            type: "tryon-preview" as const,
            description: data.usedFallback
              ? `${data.description}\n\n*Using enhanced styling recommendations*`
              : data.description,
            productName: data.productName,
            productImage: data.productImage,
            userImage: data.userImage,
            generatedImage: data.generatedImage,
            usedFallback: data.usedFallback,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, tryOnMessage])
        } else {
          const errorMessage = {
            id: `m${messages.length + 1}`,
            sender: "ai" as const,
            text: data.error || "Sorry, I couldn't generate the try-on preview. Please try again.",
            timestamp: new Date().toISOString(),
            suggestedProducts: [],
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      }
    } catch (error) {
      const errorMessage = {
        id: `m${messages.length + 1}`,
        sender: "ai" as const,
        text: "Error generating try-on preview. Please try again.",
        timestamp: new Date().toISOString(),
        suggestedProducts: [],
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const quickPrompts = [
    "What should I wear for a date?",
    "Suggest casual weekend outfits",
    "Help me find formal wear",
    "What's trending this season?",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <Bot className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full"></div>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    AI Fashion Assistant
                  </span>
                  <Badge className="bg-accent/10 text-accent border-accent/20">
                    <Zap className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Your personal stylist powered by AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/20 text-primary">
                <Heart className="w-3 h-3 mr-1" />
                Trusted by 10K+ users
              </Badge>
              {userImages.length > 0 ? (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Using {userImages.length} uploaded photo{userImages.length > 1 ? 's' : ''} from Cloudinary
                </Badge>
              ) : (
                <Badge variant="outline" className="border-orange-500/20 text-orange-600">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Upload photos for better recommendations
                </Badge>
              )}
              
              {/* Quota status badge */}
              <Badge variant="outline" className="border-blue-500/20 text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Enhanced Styling Mode
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onTryOn={handleTryOn} />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-muted rounded-2xl px-4 py-3 max-w-xs">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Quick Action Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputValue(prompt)}
                className="whitespace-nowrap border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex-shrink-0"
              >
                {prompt}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask me about fashion, styling, or what to wear..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-12 h-12 bg-background/50 border-border/50 rounded-full"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              size="lg"
              className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Powered by Google Gemini • Get personalized fashion advice instantly</p>
          </div>
        </div>
      </div>
    </div>
  )
}