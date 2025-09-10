// TypeScript interfaces for type safety
export interface User {
  id: string
  name: string
  email: string
  avatar: string
  poses: string[]
  preferences: {
    styles: string[]
    sizes: { top: string; bottom: string; shoes: string }
    favoriteColors: string[]
  }
}

export interface Product {
  id: string
  name: string
  price: number
  category: string
  brand: string
  sizes: string[]
  colors: string[]
  description: string
  images: string[]
  tryOnPreview: string
  tags: string[]
  arrivalDate: string
}

export interface Suggestion {
  userId: string
  recommendedProducts: string[]
  reasoning: string
}

export interface ChatMessage {
  id: string
  sender: "user" | "ai"
  text?: string
  timestamp?: string
  suggestedProducts?: string[]
  type?: string
  image?: string
}

export interface NewProductTemplate {
  name: string
  price: number
  category: string
  brand: string
  sizes: string[]
  colors: string[]
  description: string
  images: string[]
  arrivalDate: string
}

// Static data exports
export const user: User = {
  id: "u1",
  name: "Ayush Awasthi",
  email: "ayush@example.com",
  avatar: "/avatars/user1.png",
  poses: ["/poses/pose1.png", "/poses/pose2.png", "/poses/pose3.png"],
  preferences: {
    styles: ["casual", "streetwear"],
    sizes: { top: "M", bottom: "32", shoes: "9" },
    favoriteColors: ["black", "blue"],
  },
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Classic White Tee",
    price: 20,
    category: "tops",
    brand: "Uniqlo",
    sizes: ["S", "M", "L", "XL"],
    colors: ["white", "black"],
    description: "Soft cotton T-shirt, perfect for everyday wear.",
    images: ["/products/tee1.png"],
    tryOnPreview: "/tryons/u1_p1.png",
    tags: ["casual", "basic", "unisex"],
    arrivalDate: "2025-09-01",
  },
  {
    id: "p2",
    name: "Blue Denim Jeans",
    price: 45,
    category: "bottoms",
    brand: "Levi's",
    sizes: ["28", "30", "32", "34"],
    colors: ["blue", "black"],
    description: "Slim-fit stretch denim jeans with comfort.",
    images: ["/products/jeans1.png"],
    tryOnPreview: "/tryons/u1_p2.png",
    tags: ["denim", "casual"],
    arrivalDate: "2025-08-28",
  },
  {
    id: "p3",
    name: "Red Hoodie",
    price: 35,
    category: "outerwear",
    brand: "Nike",
    sizes: ["S", "M", "L"],
    colors: ["red", "grey"],
    description: "Warm fleece hoodie with adjustable drawstring.",
    images: ["/products/hoodie1.png"],
    tryOnPreview: "/tryons/u1_p3.png",
    tags: ["hoodie", "streetwear"],
    arrivalDate: "2025-09-05",
  },
]

export const suggestions: Suggestion[] = [
  {
    userId: "u1",
    recommendedProducts: ["p1", "p2"],
    reasoning: "Based on your casual preference and pose fit, these look stylish.",
  },
]

export const chatHistory: ChatMessage[] = [
  {
    id: "m1",
    sender: "user",
    text: "What should I wear tomorrow?",
    timestamp: "2025-09-08T10:00:00Z",
  },
  {
    id: "m2",
    sender: "ai",
    text: "A casual white tee with denim jeans would look perfect for a sunny day!",
    timestamp: "2025-09-08T10:01:00Z",
    suggestedProducts: ["p1", "p2"],
  },
  {
    id: "m3",
    sender: "ai",
    type: "tryon-preview",
    image: "/tryons/u1_outfit1.png",
  },
]

export const newProductTemplate: NewProductTemplate = {
  name: "",
  price: 0,
  category: "",
  brand: "",
  sizes: [],
  colors: [],
  description: "",
  images: [],
  arrivalDate: new Date().toISOString(),
}
