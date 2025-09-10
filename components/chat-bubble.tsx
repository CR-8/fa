import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
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
}

interface ChatBubbleProps {
  message: ChatMessage
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.sender === "user"
  const isAI = message.sender === "ai"

  if (message.type === "tryon-preview") {
    return (
      <div className="flex justify-center mb-4">
        <Card className="max-w-sm">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 text-center">Try-on Preview</h4>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              <Image
                src={message.image || "/outfit-preview-white-tee-and-jeans.jpg"}
                alt="Try-on preview"
                fill
                className="object-cover"
              />
            </div>
            <Button className="w-full mt-3" size="sm">
              Save to Wardrobe
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
          className={`rounded-2xl px-4 py-2 ${
            isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-muted-foreground"
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>

        {/* Show suggested products for AI messages */}
        {isAI && message.suggestedProducts && message.suggestedProducts.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">Suggested items:</p>
            <div className="grid grid-cols-2 gap-2">
              {message.suggestedProducts.map((productId) => {
                const product = products.find((p) => p.id === productId)
                return product ? (
                  <div key={product.id} className="scale-90 origin-left">
                    <ProductCard product={product} showTryOn />
                  </div>
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
