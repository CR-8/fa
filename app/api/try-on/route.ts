import { GoogleGenerativeAI } from "@google/generative-ai";
import { products } from "@/data/products";
import { generateTryOnImage as generateTryOnImageUtil } from "@/lib/image-generation";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  const { productId, userImageUrl } = await req.json();

  const product = products.find(p => p.id === productId);
  if (!product) {
    return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
  }

  try {
    console.log(`Generating try-on for product: ${product.name}`);
    
    // Use the centralized image generation utility
    const result = await generateTryOnImageUtil({
      userImageUrl,
      productName: product.name,
      productDescription: product.description,
      category: product.category
    });

    // Prepare response based on result
    const response = {
      description: result.description,
      productName: product.name,
      productImage: product.images[0],
      userImage: userImageUrl,
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
      description: `This ${product.name} would be a fantastic addition to your wardrobe! Our fashion experts believe it would suit your style perfectly.`,
      productName: product.name,
      productImage: product.images[0],
      userImage: userImageUrl,
      generatedImage: null,
      success: true,
      usedFallback: true,
      provider: "Emergency Fallback",
      error: error.message,
      message: "Using basic styling recommendations due to technical issues."
    }), { status: 200 });
  }
}