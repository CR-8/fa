import { GoogleGenerativeAI } from "@google/generative-ai";

interface ImageGenerationOptions {
  userImageUrls: string[]; // Changed to array for multiple user images
  productImageUrls: string[]; // Changed to array for multiple product images
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
  imagesUsed?: {
    userImages: number;
    productImages: number;
  };
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

// Helper function to fetch multiple images concurrently
async function fetchMultipleImages(urls: string[]): Promise<Array<{ data: string; mimeType: string }>> {
  console.log(`📦 Fetching ${urls.length} images...`);
  const results = await Promise.all(urls.map(url => fetchImageAsBase64(url)));
  console.log(`✅ Successfully fetched all ${results.length} images`);
  return results;
}

// Generate try-on image using Gemini 2.0 Flash Exp with multiple images
async function generateWithGemini(options: ImageGenerationOptions): Promise<string> {
  if (!genAI) {
    throw new Error("Google AI not initialized - check your API key");
  }

  const { userImageUrls, productImageUrls, productName, productDescription, category } = options;

  console.log(`🎨 Starting Gemini generation for product: ${productName}`);
  console.log(`📋 Options:`, {
    userImageCount: userImageUrls.length,
    productImageCount: productImageUrls.length,
    productName,
    productDescription,
    category,
    hasAPIKey: !!process.env.GOOGLE_API_KEY
  });

  // Fetch all user images and product images
  const userImageResults = await fetchMultipleImages(userImageUrls);
  const productImageResults = await fetchMultipleImages(productImageUrls);

  // Use the correct model for image generation
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-preview-image-generation",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.4,
      topP: 0.95,
      topK: 20,
      candidateCount: 1,
      responseModalities: ["text", "image"]
    }
  });

  // Enhanced prompt that references multiple images
  const prompt = `
You are given ${userImageUrls.length} reference image(s) of a person and ${productImageUrls.length} image(s) of a ${category} product (${productName}).

Task: Create a realistic virtual try-on image showing the person wearing the product.

Instructions for User Images (${userImageUrls.length} image${userImageUrls.length > 1 ? 's' : ''}):
- Analyze ALL provided user images to understand: body type, proportions, skin tone, posture, and style preferences
- Use the best-quality or most suitable user image as the base for the try-on
- Maintain consistency with the person's appearance across all reference images

Instructions for Product Images (${productImageUrls.length} image${productImageUrls.length > 1 ? 's' : ''}):
- Analyze ALL product images to understand: design details, fabric texture, color accuracy, and fit characteristics
- Capture details from multiple angles if multiple product images are provided
- Ensure accurate representation of patterns, logos, stitching, and material properties

Positive Prompt:
- Keep the person's face, hair, skin tone, body shape, pose, and background completely unchanged
- Replace only their current clothing with the ${category} from the product images
- Perfect alignment: clothing must fit their body naturally with correct proportions based on body analysis
- Realistic fabric texture, stitching, folds, and draping matching the product images
- Natural lighting, shadows, and reflections consistent with the original photo
- Seamless blending, no visible edits
- Professional fashion photography quality
- Full body image, high resolution
- Photorealistic detail, ultra-sharp, studio-grade output
- If multiple product views are available, synthesize them for the most accurate representation

Negative Prompt:
- Blurry, low-resolution, distorted, deformed
- Extra limbs, extra fingers, broken body parts
- Warped clothing, unnatural fit, misaligned proportions
- Cartoonish, painted, CGI, or fake-looking
- Overexposed, underexposed, inconsistent shadows
- Cropped body or missing parts
- Visible artifacts, watermarks, or overlays
- Mixing features from different product images incorrectly
`;

  // Build the request parts array with all images
  const requestParts: any[] = [{ text: prompt }];
  
  // Add all user images
  console.log(`📸 Adding ${userImageResults.length} user images to request`);
  userImageResults.forEach((img, idx) => {
    requestParts.push({
      inlineData: { 
        mimeType: img.mimeType, 
        data: img.data 
      }
    });
  });
  
  // Add all product images
  console.log(`👕 Adding ${productImageResults.length} product images to request`);
  productImageResults.forEach((img, idx) => {
    requestParts.push({
      inlineData: { 
        mimeType: img.mimeType, 
        data: img.data 
      }
    });
  });

  console.log(`📤 Sending request to Gemini API:`, {
    model: "gemini-2.0-flash-preview-image-generation",
    promptLength: prompt.length,
    totalImages: userImageResults.length + productImageResults.length,
    userImages: userImageResults.length,
    productImages: productImageResults.length,
    partsCount: requestParts.length,
    responseModalities: ["text", "image"]
  });

  try {
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

    throw new Error("No image generated in Gemini response");

  } catch (error: any) {
    console.error("❌ Gemini API Error Details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details
    });

    throw error;
  }
}

// Fallback descriptions
const fallbackDescriptions = {
  "p1": "This classic white tee would create a perfect casual look on you! The clean lines and soft cotton fabric would drape beautifully, highlighting your natural style while providing ultimate comfort for any occasion.",
  "p2": "These blue denim jeans would complement your body type exceptionally well! The medium wash and slim-fit design would create a modern, versatile look that pairs perfectly with your existing wardrobe.",
  "p3": "This red hoodie would add a vibrant pop of color to your style! The relaxed fit and cozy fleece material would create a comfortable streetwear look that showcases your confident personality.",
  "p4": "This black jacket would elevate your outfit with sophisticated elegance! The tailored design would create clean lines that enhance your silhouette while adding a professional, polished touch.",
  "p5": "These white sneakers would complete your look with fresh, modern appeal! The clean design and versatile color would complement any outfit while providing comfort and style for daily wear.",
  "p6": "This formal white shirt would create a crisp, professional appearance! The structured fit and quality fabric would enhance your presence in any business or formal setting."
};

export async function generateTryOnImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const { productName, category, userImageUrls, productImageUrls } = options;
  
  console.log(`🚀 Starting try-on generation for: ${productName}`);
  console.log(`📊 Environment check:`, {
    hasGoogleAPIKey: !!process.env.GOOGLE_API_KEY,
    apiKeyPrefix: process.env.GOOGLE_API_KEY?.substring(0, 10) + "...",
    nodeEnv: process.env.NODE_ENV,
    userImageCount: userImageUrls?.length || 0,
    productImageCount: productImageUrls?.length || 0
  });

  // Validate user images (handle undefined/null)
  const validUserImages = (userImageUrls || []).filter(url => url && url !== "/placeholder.svg");
  if (validUserImages.length === 0) {
    console.log("⚠️ No valid user images provided");
    return {
      success: false,
      description: `To see yourself wearing ${productName}, please upload some photos in your profile page first! Once you do, our AI will create a personalized try-on image just for you.`,
      usedFallback: true,
      error: "No user images provided",
      imagesUsed: { userImages: 0, productImages: productImageUrls?.length || 0 }
    };
  }

  // Validate product images (handle undefined/null)
  const validProductImages = (productImageUrls || []).filter(url => url && url !== "/placeholder.svg");
  if (validProductImages.length === 0) {
    console.log("⚠️ No valid product images provided");
    return {
      success: false,
      description: `No product images available for ${productName}. Please ensure product images are properly configured.`,
      usedFallback: true,
      error: "No product images provided",
      imagesUsed: { userImages: validUserImages.length, productImages: 0 }
    };
  }

  // Try the actual API generation with validated images
  try {
    console.log(`🎯 Attempting Gemini generation with ${validUserImages.length} user image(s) and ${validProductImages.length} product image(s)...`);
    
    const imageUrl = await generateWithGemini({
      ...options,
      userImageUrls: validUserImages,
      productImageUrls: validProductImages
    });
    
    console.log("✅ Gemini generation successful!");
    const imageCountMsg = validUserImages.length > 1 || validProductImages.length > 1
      ? ` Our AI analyzed ${validUserImages.length} photo${validUserImages.length > 1 ? 's' : ''} of you and ${validProductImages.length} product image${validProductImages.length > 1 ? 's' : ''} for maximum accuracy.`
      : '';
    
    return {
      success: true,
      imageUrl,
      description: `Here's how ${productName} looks on you!${imageCountMsg} The result shows a realistic try-on with perfect fit and style for your body type.`,
      provider: "Gemini 2.0 Flash Exp",
      usedFallback: false,
      imagesUsed: {
        userImages: validUserImages.length,
        productImages: validProductImages.length
      }
    };

  } catch (error: any) {
    console.error("❌ Gemini generation failed:", error);
    
    // Error handling (same as before)
    const isQuotaError = error.status === 429 || 
                        error.code === 429 ||
                        error.message?.includes('quota') || 
                        error.message?.includes('limit') ||
                        error.message?.includes('429');
    
    const isAuthError = error.status === 401 || 
                       error.status === 403 ||
                       error.message?.includes('API key') ||
                       error.message?.includes('authentication');

    const isModelError = error.message?.includes('not support') ||
                        error.message?.includes('model') ||
                        error.message?.includes('image generation');

    const productId = Object.keys(fallbackDescriptions).find(id => 
      fallbackDescriptions[id as keyof typeof fallbackDescriptions].toLowerCase().includes(category.toLowerCase())
    ) || "p1";
    
    const baseDescription = fallbackDescriptions[productId as keyof typeof fallbackDescriptions] ||
      `This ${productName} would look fantastic on you! The ${category} style would perfectly complement your personal aesthetic and enhance your overall look.`;

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
    } else if (isAuthError) {
      errorMessage = "\n\n🔑 **API Key Issue**: Please check your Google AI API key configuration.";
    } else if (isModelError) {
      errorMessage = "\n\n🤖 **Model Limitation**: The current AI model doesn't support image generation. We're working on alternatives!";
    } else {
      errorMessage = "\n\n⚙️ **Technical Issue**: AI image generation temporarily unavailable.";
    }

    return {
      success: true,
      description: `${baseDescription}${stylingAdvice}\n\n✨ *Professional styling recommendation based on your ${validUserImages.length} uploaded photo${validUserImages.length > 1 ? 's' : ''} and fashion expertise*${errorMessage}`,
      usedFallback: true,
      provider: "Enhanced Fashion Advisor",
      error: isQuotaError ? "API quota exceeded" : isAuthError ? "Authentication error" : isModelError ? "Model limitation" : error.message,
      imagesUsed: {
        userImages: validUserImages.length,
        productImages: validProductImages.length
      }
    };
  }
}

// Alternative generation method
export async function generateTryOnImageAlternative(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  return generateTryOnImage(options);
}