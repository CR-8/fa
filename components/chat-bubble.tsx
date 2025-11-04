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
      <div className="flex justify-center mb-6">
        <Card className="max-w-md border-2 border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-white dark:bg-neutral-900">
          <CardContent className="p-6">
            <h4 className="font-bold mb-3 text-center flex items-center justify-center gap-2 uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
              {message.generatedImage ? "🖼️ AI Generated Try-On" : "👔 Style Preview"}: {message.productName}
              {message.usedFallback && (
                <span className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-2 py-1 rounded-sm border-2 border-neutral-300 dark:border-neutral-600 font-bold uppercase">
                  {message.provider || "Enhanced Styling"}
                </span>
              )}
              {!message.usedFallback && (
                <span className="text-xs bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 px-2 py-1 rounded-sm border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase">
                  AI Generated
                </span>
              )}
            </h4>

            {message.generatedImage ? (
              // Show the AI-generated combined image
              <div className="relative aspect-square rounded-sm overflow-hidden mb-4 border-2 border-neutral-200 dark:border-neutral-800">
                <Image
                  src={message.generatedImage}
                  alt={`AI generated try-on: ${message.productName}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 text-xs px-3 py-1 rounded-sm border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase">
                  AI Generated
                </div>
              </div>
            ) : (
              // Fallback: show product image only
              <div className="relative aspect-square rounded-sm overflow-hidden mb-4 border-2 border-neutral-200 dark:border-neutral-800">
                <Image
                  src={message.productImage || "/placeholder.jpg"}
                  alt={message.productName || "Product"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-neutral-900/60 dark:bg-neutral-950/60 flex items-end justify-center p-4">
                  <div className="text-center text-neutral-50 dark:text-neutral-100">
                    <div className="text-lg mb-1">✨</div>
                    <div className="text-sm font-bold uppercase tracking-wide">Style Preview</div>
                    <div className="text-xs font-semibold uppercase">
                      {message.message?.includes("quota") ? 
                        "API quota reached - try again later!" : 
                        "Enhanced styling recommendations"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              <p className="font-bold mb-2 uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                {message.generatedImage ? "AI Fashion Analysis:" : "Fashion Expert Analysis:"}
              </p>
              <p className="font-medium">{message.description}</p>
              {message.message && (
                <p className="mt-2 text-xs font-semibold uppercase text-neutral-900 dark:text-neutral-100">{message.message}</p>
              )}
            </div>
            <Button className="w-full h-10 bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-neutral-900 dark:border-neutral-100 font-bold uppercase tracking-wide" size="sm">
              Add to Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`flex gap-3 mb-6 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0 rounded-sm border-2 border-neutral-300 dark:border-neutral-600">
        {isUser ? (
          <>
            <AvatarImage src="/diverse-user-avatars.png" />
            <AvatarFallback className="rounded-sm bg-neutral-200 dark:bg-neutral-800">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 rounded-sm">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className={`flex-1 max-w-[80%] ${isUser ? "flex justify-end" : ""}`}>
        <div
          className={`rounded-sm px-4 py-3 border-2 ${
            isUser ? "bg-neutral-900 dark:bg-neutral-100 text-neutral-50 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 ml-auto" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700"
          }`}
        >
          {isUser ? (
            <p className="text-sm font-semibold">{message.text}</p>
          ) : (
            <div className="text-sm font-medium">
              <MarkdownRenderer content={message.text || ""} />
            </div>
          )}
        </div>

        {/* Show suggested products for AI messages */}
        {isAI && message.suggestedProducts && message.suggestedProducts.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 font-bold uppercase tracking-wide">Suggested items:</p>
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

        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-semibold uppercase tracking-wide">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
