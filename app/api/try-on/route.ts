import { products } from "@/data/products";
import { generateTryOnImage } from "@/lib/image-generation";

// Retry utility function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Only retry on rate limit or service unavailable errors
      if (error.status === 429 || error.status === 503) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

export async function POST(req: Request) {
  const { personImage, clothingImage, category } = await req.json();

  // Validate required fields
  if (!personImage || !clothingImage) {
    return new Response(JSON.stringify({ error: "Person image and clothing image are required" }), { status: 400 });
  }

  try {
    console.log(`Generating try-on for wardrobe item with category: ${category}`);

    // Use the centralized image generation utility with wardrobe item data
    const result = await retryWithBackoff(async () => {
      return await generateTryOnImage({
        userImageUrl: personImage,
        productImageUrl: clothingImage,
        productName: `Wardrobe ${category}`,
        productDescription: `A ${category} item from your wardrobe`,
        category: category || 'clothing'
      });
    });

    // Prepare response based on result
    const response = {
      description: result.description,
      productName: `Wardrobe ${category}`,
      productImage: clothingImage,
      userImage: personImage,
      generatedImage: result.imageUrl || null,
      success: result.success,
      usedFallback: result.usedFallback,
      provider: result.provider,
      message: result.usedFallback ?
        "Using enhanced styling recommendations. For AI-generated images, try again later when quota resets!" :
        "AI-generated try-on image created successfully!"
    };

    return new Response(JSON.stringify(response), { status: 200 });

  } catch (error: any) {
    console.error("Try-on generation error:", error);

    // Ultimate fallback
    return new Response(JSON.stringify({
      description: `This wardrobe ${category} would be a fantastic addition to your outfit! Our fashion experts believe it would suit your style perfectly.`,
      productName: `Wardrobe ${category}`,
      productImage: clothingImage,
      userImage: personImage,
      generatedImage: null,
      success: true,
      usedFallback: true,
      provider: "Emergency Fallback",
      error: error.message,
      message: "Using basic styling recommendations due to technical issues."
    }), { status: 200 });
  }
}