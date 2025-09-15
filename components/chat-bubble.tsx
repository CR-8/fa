import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { products } from "@/data/products"
import { Bot, User } from "lucide-react"
import Image from "next/image"

interface ChatMessage {
  id: string
  sender: "user" | "ai"
  text?: string
  timestamp: string
  suggestedProducts?: string[]
  type?: "tryon-preview"
  image?: string
  description?: string
  productName?: string
  productImage?: string
  userImage?: string
  generatedImage?: string
  usedFallback?: boolean
  provider?: string
  message?: string
}

interface ChatBubbleProps {
  message: ChatMessage
  onTryOn?: (productId: string) => void
}

export function ChatBubble({ message, onTryOn }: ChatBubbleProps) {
  const isUser = message.sender === "user"
  const isAI = message.sender === "ai"

  if (message.type === "tryon-preview") {
    return (
      <div className="flex justify-center mb-4">
        <Card className="max-w-md">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 text-center flex items-center gap-2">
              {message.generatedImage ? "🖼️ AI Generated Try-On" : "👔 Style Preview"}: {message.productName}
              {message.usedFallback && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {message.provider || "Enhanced Styling"}
                </span>
              )}
              {!message.usedFallback && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                  AI Generated
                </span>
              )}
            </h4>

            {message.generatedImage ? (
              // Show the AI-generated combined image
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                <Image
                  src={message.generatedImage}
                  alt={`AI generated try-on: ${message.productName}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  AI Generated
                </div>
              </div>
            ) : (
              // Fallback: show product image only
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                <Image
                  src={message.productImage || "/placeholder.jpg"}
                  alt={message.productName || "Product"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-4">
                  <div className="text-center text-white">
                    <div className="text-lg mb-1">✨</div>
                    <div className="text-sm font-medium">Style Preview</div>
                    <div className="text-xs opacity-90">
                      {message.message?.includes("quota") ? 
                        "API quota reached - try again later!" : 
                        "Enhanced styling recommendations"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground mb-3">
              <p className="font-medium mb-1">
                {message.generatedImage ? "AI Fashion Analysis:" : "Fashion Expert Analysis:"}
              </p>
              <p>{message.description}</p>
              {message.message && (
                <p className="mt-2 text-xs italic text-blue-600">{message.message}</p>
              )}
            </div>
            <Button className="w-full" size="sm">
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className={`flex-1 max-w-[80%] ${isUser ? "flex justify-end" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser ? "bg-primary text-white ml-auto" : "bg-neutral-100 dark:bg-neutral-800"
          }`}
        >
          {isUser ? (
            <p className="text-sm">{message.text}</p>
          ) : (
            <div className="text-sm">
              <MarkdownRenderer content={message.text || ""} />
            </div>
          )}
        </div>

        {/* Show suggested products for AI messages */}
        {isAI && message.suggestedProducts && message.suggestedProducts.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Suggested items:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {message.suggestedProducts.map((productId) => {
                const product = products.find((p) => p.id === productId)
                return product ? (
                  <ProductCard key={product.id} product={product} showTryOn onTryOn={onTryOn} />
                ) : null
              })}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
