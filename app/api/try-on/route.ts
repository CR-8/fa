import { products } from "@/data/products";
import { generateTryOnImage } from "@/lib/image-generation";
import { Product } from "@/data/models";

export async function POST(req: Request) {
  const body = await req.json();
  
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