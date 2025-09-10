"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatBubble } from "@/components/chat-bubble"
import { chatHistory } from "@/data/chat"
import { Send, Sparkles } from "lucide-react"

export default function AIFAPage() {
  const [messages, setMessages] = useState(chatHistory)
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage = {
      id: `m${messages.length + 1}`,
      sender: "user" as const,
      text: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMessage])
    setInputValue("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: `m${messages.length + 2}`,
        sender: "ai" as const,
        text: "Great question! Based on your style preferences, I'd recommend checking out these items that would look amazing on you.",
        timestamp: new Date().toISOString(),
        suggestedProducts: ["p1", "p3"],
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-primary/20 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            AI Fashion Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your personal style advisor powered by AI</p>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask me about fashion, styling, or what to wear..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue("What should I wear for a casual day out?")}
            className="whitespace-nowrap"
          >
            Casual outfit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue("Suggest formal wear for work")}
            className="whitespace-nowrap"
          >
            Work attire
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputValue("Show me trendy streetwear")}
            className="whitespace-nowrap"
          >
            Streetwear
          </Button>
        </div>
      </div>
    </div>
  )
}
