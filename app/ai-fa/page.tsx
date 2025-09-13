"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatBubble } from "@/components/chat-bubble"
import { chatHistory } from "@/data/chat"
import { Send, Sparkles, Bot, User, Zap, Heart } from "lucide-react"

export default function AIFAPage() {
  const [messages, setMessages] = useState(chatHistory)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: `m${messages.length + 1}`,
      sender: "user" as const,
      text: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMessage])
    setInputValue("")
    setIsTyping(true)

    // Call Gemini chat API
    try {
      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputValue })
      })
      const data = await res.json()

      const aiResponse = {
        id: `m${messages.length + 2}`,
        sender: "ai" as const,
        text: data.reply,
        timestamp: new Date().toISOString(),
        suggestedProducts: data.products,
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      const errorResponse = {
        id: `m${messages.length + 2}`,
        sender: "ai" as const,
        text: "Sorry, I'm having trouble processing your request. Please try again.",
        timestamp: new Date().toISOString(),
        suggestedProducts: [],
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleTryOn = async (productId: string) => {
    setIsTyping(true)
    try {
      const res = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, poseIndex: 0 })
      })
      const data = await res.json()
      if (data.description) {
        const tryOnMessage = {
          id: `m${messages.length + 1}`,
          sender: "ai" as const,
          type: "tryon-preview" as const,
          description: data.description,
          productName: data.productName,
          productImage: data.productImage,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, tryOnMessage])
      } else {
        const errorMessage = {
          id: `m${messages.length + 1}`,
          sender: "ai" as const,
          text: "Sorry, I couldn't generate the try-on preview. Please try again.",
          timestamp: new Date().toISOString(),
          suggestedProducts: [],
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage = {
        id: `m${messages.length + 1}`,
        sender: "ai" as const,
        text: "Error generating try-on preview.",
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