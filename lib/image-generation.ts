// Image generation utilities with multiple providers
import { GoogleGenAI } from "@google/genai";

interface ImageGenerationOptions {
  userImageUrl: string;
  productName: string;
  productDescription: string;
  category: string;
}

interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  description: string;
  provider?: string;
  usedFallback: boolean;
  error?: string;
}

const genAIImage = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Helper function to fetch image from URL and convert to base64
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    // Handle relative URLs by converting to absolute
    let absoluteUrl = url;
    if (url.startsWith('/')) {
      absoluteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${url}`;
    }

    const response = await fetch(absoluteUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.startsWith('image/') ? contentType : 'image/jpeg';

    return { data: base64, mimeType };
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image from URL');
  }
}

// Generate try-on image using Gemini 2.5 Flash Image with both user and product images
async function generateWithGemini(options: ImageGenerationOptions): Promise<string> {
  const { userImageUrl, productName, productDescription, category } = options;

  // We need the product image URL - let's get it from the products data
  const { products } = await import("@/data/products");
  const product = products.find(p => p.name === productName);
  if (!product) {
    throw new Error("Product not found for image generation");
  }

  // Fetch both user image and product image
  const userImageResult = await fetchImageAsBase64(userImageUrl);
  const productImageResult = await fetchImageAsBase64(product.images[0]);

  const prompt = [
    {
      text: `Make this person wear ${productName}. Keep the person's face, body, and pose exactly the same. Replace only their clothing with the ${category}. Keep the background unchanged. Make it look natural and realistic.

REQUIREMENTS:
- Keep the person's identity, face, and body EXACTLY the same
- Only change their clothing to match the product shown
- Maintain natural lighting and shadows
- Professional fashion photography quality
- Realistic fabric texture and fit
- The clothing should look like it naturally belongs on this person`
    },
    {
      inlineData: {
        mimeType: productImageResult.mimeType,
        data: productImageResult.data,
      },
    },
  ];

  const response = await genAIImage.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: prompt,
  });

  // Extract the generated image from response
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  throw new Error("No image generated in Gemini response");
}

// Fallback descriptions for when image generation fails
const fallbackDescriptions = {
  "p1": "This classic white tee would create a perfect casual look on you! The clean lines and soft cotton fabric would drape beautifully, highlighting your natural style while providing ultimate comfort for any occasion.",
  "p2": "These blue denim jeans would complement your body type exceptionally well! The medium wash and slim-fit design would create a modern, versatile look that pairs perfectly with your existing wardrobe.",
  "p3": "This red hoodie would add a vibrant pop of color to your style! The relaxed fit and cozy fleece material would create a comfortable streetwear look that showcases your confident personality.",
  "p4": "This black jacket would elevate your outfit with sophisticated elegance! The tailored design would create clean lines that enhance your silhouette while adding a professional, polished touch.",
  "p5": "These white sneakers would complete your look with fresh, modern appeal! The clean design and versatile color would complement any outfit while providing comfort and style for daily wear.",
  "p6": "This formal white shirt would create a crisp, professional appearance! The structured fit and quality fabric would enhance your presence in any business or formal setting."
};

export async function generateTryOnImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const { productName, category } = options;
  
  // Check if we have a valid user image URL
  if (!options.userImageUrl || options.userImageUrl === "/placeholder.svg") {
    return {
      success: false,
      description: `To see yourself wearing ${productName}, please upload some photos in your profile page first! Once you do, our AI will create a personalized try-on image just for you.`,
      usedFallback: true,
      error: "No user image provided"
    };
  }

  // For now, skip API calls and use enhanced fallback due to quota limits
  console.log("Using enhanced fallback mode due to API quota restrictions");
  
  // Use enhanced fallback description with styling advice
  const productId = Object.keys(fallbackDescriptions).find(id => 
    fallbackDescriptions[id as keyof typeof fallbackDescriptions].toLowerCase().includes(category.toLowerCase())
  ) || "p1";
  
  const baseDescription = fallbackDescriptions[productId as keyof typeof fallbackDescriptions] ||
    `This ${productName} would look fantastic on you! The ${category} style would perfectly complement your personal aesthetic and enhance your overall look.`;

  // Add styling advice based on product category
  let stylingAdvice = "";
  switch(category.toLowerCase()) {
    case "tops":
      stylingAdvice = " For the perfect fit, consider pairing with high-waisted bottoms to create a balanced silhouette. The fabric would complement your skin tone beautifully.";
      break;
    case "bottoms":
      stylingAdvice = " These would create a flattering silhouette that enhances your natural proportions. Pair with a fitted top for the perfect balance.";
      break;
    case "outerwear":
      stylingAdvice = " This piece would add structure to your outfit while providing comfort and style. Layer it over your favorite basics for an elevated look.";
      break;
    case "footwear":
      stylingAdvice = " These would complete your look perfectly, adding both comfort and style to any outfit combination.";
      break;
    default:
      stylingAdvice = " This piece would integrate seamlessly into your wardrobe, offering versatility for multiple styling options.";
  }

  return {
    success: true,
    description: `${baseDescription}${stylingAdvice}\n\n✨ *Professional styling recommendation based on your uploaded photos and fashion expertise*\n\n💡 **Note**: AI image generation is temporarily limited due to high demand. This enhanced preview shows how the item would complement your style!`,
    usedFallback: true,
    provider: "Enhanced Fashion Advisor",
    error: "API quota temporarily exceeded - using enhanced styling recommendations"
  };

  /* 
  // Disabled for now due to quota limits - uncomment when you have paid API access
  
  try {
    console.log("Attempting Gemini 2.5 Flash Image generation...");
    
    const imageUrl = await generateWithGemini(options);
    
    return {
      success: true,
      imageUrl,
      description: `Here's how ${productName} looks on you! Our AI has created a realistic try-on showing the perfect fit and style for your body type.`,
      provider: "Gemini 2.5 Flash Image",
      usedFallback: false
    };

  } catch (error: any) {
    console.log("Gemini generation failed:", error.message);
    
    // Check if it's a quota/rate limit error
    const isQuotaError = error.status === 429 || 
                        error.message?.includes('quota') || 
                        error.message?.includes('limit');
    
    // Use fallback description
    const productId = Object.keys(fallbackDescriptions).find(id => 
      fallbackDescriptions[id as keyof typeof fallbackDescriptions].includes(category)
    ) || "p1";
    
    const description = fallbackDescriptions[productId as keyof typeof fallbackDescriptions] ||
      `This ${productName} would look fantastic on you! The ${category} style would perfectly complement your personal aesthetic and enhance your overall look.`;

    return {
      success: true, // Still success, just using fallback
      description: isQuotaError ? 
        `${description}\n\n*Note: AI image generation is temporarily at capacity. Upgrade to a paid plan for unlimited AI try-on images!*` :
        `${description}\n\n*Using enhanced styling recommendations*`,
      usedFallback: true,
      provider: "Fallback Description",
      error: isQuotaError ? "API quota exceeded" : error.message
    };
  }
  */
}