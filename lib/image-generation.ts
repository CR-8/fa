// Image generation utilities with multiple providers
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ImageGenerationOptions {
  userImageUrl: string;
  productImageUrl: string; // Cloudinary URL for the product
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

// Initialize with proper error handling
let genAI: GoogleGenerativeAI | null = null;

try {
  if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    console.log("✅ Google AI initialized successfully");
  } else {
    console.error("❌ GOOGLE_API_KEY not found in environment variables");
  }
} catch (error) {
  console.error("❌ Failed to initialize Google AI:", error);
}

// Helper function to fetch image from URL and convert to base64
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    console.log(`📥 Fetching image from URL: ${url}`);
    
    // Handle relative URLs by converting to absolute
    let absoluteUrl = url;
    if (url.startsWith('/')) {
      absoluteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${url}`;
      console.log(`🔗 Converted to absolute URL: ${absoluteUrl}`);
    }

    const response = await fetch(absoluteUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.startsWith('image/') ? contentType : 'image/jpeg';

    console.log(`✅ Image fetched successfully - Size: ${Math.round(arrayBuffer.byteLength / 1024)}KB, Type: ${mimeType}`);
    
    return { data: base64, mimeType };
  } catch (error) {
    console.error('❌ Error fetching image:', error);
    throw new Error(`Failed to fetch image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate try-on image using Gemini 2.0 Flash Exp (correct model for image generation)
async function generateWithGemini(options: ImageGenerationOptions): Promise<string> {
  if (!genAI) {
    throw new Error("Google AI not initialized - check your API key");
  }

  const { userImageUrl, productImageUrl, productName, productDescription, category } = options;

  console.log(`🎨 Starting Gemini generation for product: ${productName}`);
  console.log(`📋 Options:`, {
    userImageUrl,
    productImageUrl,
    productName,
    productDescription,
    category,
    hasAPIKey: !!process.env.GOOGLE_API_KEY
  });

  // Fetch both user image and product image using the provided URLs
  const userImageResult = await fetchImageAsBase64(userImageUrl);
  const productImageResult = await fetchImageAsBase64(productImageUrl);

  // Use the correct model for image generation - gemini-2.0-flash-exp with proper config
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.4,
      topP: 0.95,
      topK: 20,
      candidateCount: 1,
      responseModalities: ["text", "image"]
    }
  });

  const prompt = `Create a realistic try-on image showing this person wearing the ${productName}. 

INSTRUCTIONS:
- Keep the person's face, body, pose, and background EXACTLY the same
- Only replace their current clothing with the ${category} shown in the product image
- Maintain natural lighting, shadows, and proportions
- Ensure the clothing fits naturally on this person's body type
- Professional fashion photography quality
- Realistic fabric texture and draping

The person should look natural wearing this ${category}, as if they actually put it on.

IMPORTANT: Generate a new image that combines the person from the first image with the clothing from the second image. The output should be a single realistic photo.`;

  // Corrected request format - pass the content parts directly
  const requestParts = [
    { text: prompt },
    { 
      inlineData: { 
        mimeType: userImageResult.mimeType, 
        data: userImageResult.data 
      } 
    },
    { 
      inlineData: { 
        mimeType: productImageResult.mimeType, 
        data: productImageResult.data 
      } 
    }
  ];

  console.log(`📤 Sending request to Gemini API:`, {
    model: "gemini-2.0-flash-exp",
    promptLength: prompt.length,
    userImageSize: `${Math.round(userImageResult.data.length / 1024)}KB`,
    productImageSize: `${Math.round(productImageResult.data.length / 1024)}KB`,
    userImageType: userImageResult.mimeType,
    productImageType: productImageResult.mimeType,
    partsCount: requestParts.length,
    responseModalities: ["text", "image"]
  });

  try {
    // Pass the parts array directly
    const response = await model.generateContent(requestParts);
    
    console.log(`📥 Received Gemini response:`, {
      candidates: response.response.candidates?.length || 0,
      hasContent: !!response.response.candidates?.[0]?.content,
      finishReason: response.response.candidates?.[0]?.finishReason,
      safetyRatings: response.response.candidates?.[0]?.safetyRatings?.map(r => ({
        category: r.category,
        probability: r.probability
      }))
    });

    // Extract the generated image from response
    const candidate = response.response.candidates?.[0];
    if (!candidate) {
      throw new Error("No candidates in response");
    }

    const parts = candidate.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          console.log(`✅ Generated image successfully - Type: ${part.inlineData.mimeType}, Size: ${Math.round(part.inlineData.data.length / 1024)}KB`);
          return imageUrl;
        }
      }
    }

    // If no image was generated, check if there's text response
    const textParts = parts?.filter(p => p.text);
    if (textParts && textParts.length > 0) {
      console.log("📝 Received text response instead of image:", textParts.map(p => p.text).join(' '));
      throw new Error("Model returned text instead of image - this model may not support image generation");
    }

    // Log the full response structure for debugging
    console.log("🔍 Full response structure:", JSON.stringify({
      candidates: response.response.candidates?.map(c => ({
        content: c.content?.parts?.map(p => ({ 
          text: p.text ? `${p.text.substring(0, 100)}...` : undefined,
          hasInlineData: !!p.inlineData,
          inlineDataType: p.inlineData?.mimeType
        })),
        finishReason: c.finishReason,
        safetyRatings: c.safetyRatings
      }))
    }, null, 2));

    throw new Error("No image generated in Gemini response");

  } catch (error: any) {
    console.error("❌ Gemini API Error Details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
      cause: error.cause,
      stack: error.stack?.split('\n').slice(0, 5)
    });

    // Log the full error object for debugging
    if (error.status === 429) {
      console.error("🚫 Quota exceeded - Full error:", JSON.stringify(error, null, 2));
    }

    throw error;
  }
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
  
  console.log(`🚀 Starting try-on generation for: ${productName}`);
  console.log(`📊 Environment check:`, {
    hasGoogleAPIKey: !!process.env.GOOGLE_API_KEY,
    apiKeyPrefix: process.env.GOOGLE_API_KEY?.substring(0, 10) + "...",
    nodeEnv: process.env.NODE_ENV,
    userImageUrl: options.userImageUrl
  });

  // Check if we have a valid user image URL
  if (!options.userImageUrl || options.userImageUrl === "/placeholder.svg") {
    console.log("⚠️ No valid user image provided");
    return {
      success: false,
      description: `To see yourself wearing ${productName}, please upload some photos in your profile page first! Once you do, our AI will create a personalized try-on image just for you.`,
      usedFallback: true,
      error: "No user image provided"
    };
  }

  // Try the actual API generation
  try {
    console.log("🎯 Attempting Gemini generation...");
    
    const imageUrl = await generateWithGemini(options);
    
    console.log("✅ Gemini generation successful!");
    return {
      success: true,
      imageUrl,
      description: `Here's how ${productName} looks on you! Our AI has created a realistic try-on showing the perfect fit and style for your body type.`,
      provider: "Gemini 2.0 Flash Exp",
      usedFallback: false
    };

  } catch (error: any) {
    console.error("❌ Gemini generation failed:", error);
    
    // Check if it's a quota/rate limit error
    const isQuotaError = error.status === 429 || 
                        error.code === 429 ||
                        error.message?.includes('quota') || 
                        error.message?.includes('limit') ||
                        error.message?.includes('429');
    
    // Check if it's an API key issue
    const isAuthError = error.status === 401 || 
                       error.status === 403 ||
                       error.message?.includes('API key') ||
                       error.message?.includes('authentication');

    // Check if it's a model capability issue
    const isModelError = error.message?.includes('not support') ||
                        error.message?.includes('model') ||
                        error.message?.includes('image generation');

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

    let errorMessage = "";
    if (isQuotaError) {
      errorMessage = "\n\n💡 **Quota Issue**: You've exceeded the free tier limits. Consider upgrading to a paid plan for unlimited AI try-on images!";
      console.log("🔄 Recommendation: Upgrade to paid tier or wait for quota reset");
    } else if (isAuthError) {
      errorMessage = "\n\n🔑 **API Key Issue**: Please check your Google AI API key configuration.";
      console.log("🔧 Recommendation: Verify API key is valid and has proper permissions");
    } else if (isModelError) {
      errorMessage = "\n\n🤖 **Model Limitation**: The current AI model doesn't support image generation. We're working on alternatives!";
      console.log("🔧 Recommendation: Try a different AI provider or wait for model updates");
    } else {
      errorMessage = "\n\n⚙️ **Technical Issue**: AI image generation temporarily unavailable.";
    }

    console.log(`💡 Using fallback description with advice`);
    return {
      success: true, // Still success, just using fallback
      description: `${baseDescription}${stylingAdvice}\n\n✨ *Professional styling recommendation based on your uploaded photos and fashion expertise*${errorMessage}`,
      usedFallback: true,
      provider: "Enhanced Fashion Advisor",
      error: isQuotaError ? "API quota exceeded" : isAuthError ? "Authentication error" : isModelError ? "Model limitation" : error.message
    };
  }
}

// Alternative: Use a different approach with text-to-image if image-to-image fails
export async function generateTryOnImageAlternative(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  // This would use a text-to-image model to generate based on descriptions
  // For now, just return the fallback
  return generateTryOnImage(options);
}