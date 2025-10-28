import { products } from "@/data/products";
import { generateTryOnImage } from "@/lib/image-generation";
import { Product } from "@/data/models";

// Simple in-memory rate limiter for try-on API
class APIRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) { // 5 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      this.requests.set(identifier, validRequests);
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getTimeUntilNextRequest(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;
    
    const now = Date.now();
    const oldestRequest = Math.min(...userRequests);
    const timePassed = now - oldestRequest;
    return Math.max(0, this.windowMs - timePassed);
  }
}

// Global rate limiter instance - stricter limits for production
const rateLimiter = new APIRateLimiter(
  process.env.NODE_ENV === 'production' ? 3 : 10, // 3 per minute in prod, 10 in dev
  60000 // 1 minute window
);

// Request deduplication - prevent concurrent identical requests
const ongoingRequests = new Map<string, Promise<Response>>();

function generateRequestKey(body: any): string {
  // Create a key based on the request parameters
  const keyData = {
    productId: body.productId,
    personImages: body.personImages?.sort() || [],
    clothingImages: body.clothingImages?.sort() || [],
    category: body.category
  };
  return btoa(JSON.stringify(keyData));
}

export async function POST(req: Request) {
  const body = await req.json();
  
  // Get client IP for rate limiting (fallback to a default if not available)
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  
  // Check rate limit
  if (!rateLimiter.canMakeRequest(clientIP)) {
    const waitTime = Math.ceil(rateLimiter.getTimeUntilNextRequest(clientIP) / 1000);
    return new Response(JSON.stringify({ 
      error: "Too many requests. Please wait before trying again.",
      retryAfter: waitTime
    }), { 
      status: 429,
      headers: {
        'Retry-After': waitTime.toString()
      }
    });
  }

  // Request deduplication
  const requestKey = generateRequestKey(body);
  if (ongoingRequests.has(requestKey)) {
    console.log('🔄 Duplicate request detected, waiting for existing request to complete');
    try {
      return await ongoingRequests.get(requestKey)!;
    } catch (error) {
      // If the ongoing request failed, we'll proceed with a new one
      ongoingRequests.delete(requestKey);
    }
  }

  // Create the request promise and store it
  const requestPromise = processTryOnRequest(body);
  ongoingRequests.set(requestKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    ongoingRequests.delete(requestKey);
  }
}

async function processTryOnRequest(body: any): Promise<Response> {
  // Support both old (singular) and new (plural/array) formats
  const personImage = body.personImage;
  const clothingImage = body.clothingImage;
  const personImages = body.personImages || (personImage ? [personImage] : []);
  const clothingImages = body.clothingImages || (clothingImage ? [clothingImage] : []);
  const category = body.category;
  const productId = body.productId;

  let product: Product | undefined;
  if (productId) {
    product = products.find(p => p.id === productId);
    if (!product) {
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
    }
  }

  // Validate required fields (check both formats)
  if (personImages.length === 0 || (clothingImages.length === 0 && !product)) {
    return new Response(JSON.stringify({ error: "Person image(s) and clothing image(s) or productId are required" }), { status: 400 });
  }

  try {
    console.log(`Generating try-on for ${product ? 'product' : 'wardrobe item'} with category: ${category || product?.category}`);
    console.log(`📊 Images count: ${personImages.length} user photo(s), ${clothingImages.length || product?.images.length} product image(s)`);
    
    // Determine which clothing images to use
    const finalClothingImages = product ? product.images : clothingImages;
    
    console.log('🔍 API Debug - Received clothing images:', clothingImages);
    console.log('🔍 API Debug - Final clothing images being sent:', finalClothingImages);
    console.log('🔍 API Debug - Person images being sent:', personImages);

    // Use the centralized image generation utility with ALL available images
    const result = await generateTryOnImage({
      userImageUrls: personImages, // Pass all user photos
      productImageUrls: finalClothingImages, // Pass all product/clothing images
      productName: product ? product.name : `Wardrobe ${category}`,
      productDescription: product ? product.description : `A ${category} item from your wardrobe`,
      category: category || product!.category
    });

    // Prepare response based on result
    const response = {
      description: result.description,
      productName: product ? product.name : `Wardrobe ${category}`,
      productImage: clothingImages[0] || product?.images[0], // First image for backward compatibility
      userImage: personImages[0], // First image for backward compatibility
      generatedImage: result.imageUrl || null,
      success: result.success,
      usedFallback: result.usedFallback,
      provider: result.provider,
      imagesUsed: result.imagesUsed, // Include image count info
      message: result.usedFallback ?
        "Using enhanced styling recommendations. For AI-generated images, try again later when quota resets!" :
        "AI-generated try-on image created successfully!"
    };

    return new Response(JSON.stringify(response), { status: 200 });

  } catch (error: any) {
    console.error("Try-on generation error:", error);

    // Ultimate fallback
    const fallbackProductName = product ? product.name : `Wardrobe ${category}`;
    const fallbackImage = clothingImages[0] || product?.images[0];
    return new Response(JSON.stringify({
      description: `This ${fallbackProductName} would be a fantastic addition to your outfit! Our fashion experts believe it would suit your style perfectly.`,
      productName: fallbackProductName,
      productImage: fallbackImage,
      userImage: personImages[0],
      generatedImage: null,
      success: true,
      usedFallback: true,
      provider: "Emergency Fallback",
      error: error.message,
      message: "Using basic styling recommendations due to technical issues."
    }), { status: 200 });
  }
}