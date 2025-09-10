export const chatHistory = [
  {
    id: "m1",
    sender: "user" as const,
    text: "What should I wear tomorrow?",
    timestamp: "2025-09-08T10:00:00Z",
  },
  {
    id: "m2",
    sender: "ai" as const,
    text: "A casual white tee with denim jeans would look perfect for a sunny day!",
    timestamp: "2025-09-08T10:01:00Z",
    suggestedProducts: ["p1", "p2"],
  },
  {
    id: "m3",
    sender: "ai" as const,
    type: "tryon-preview" as const,
    image: "/outfit-preview-white-tee-and-jeans.jpg",
    timestamp: "2025-09-08T10:02:00Z",
  },
]

export const newProductTemplate = {
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
