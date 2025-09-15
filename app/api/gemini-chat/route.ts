import { GoogleGenerativeAI } from "@google/generative-ai";
import { products } from "@/data/products";
import { formatAIResponse, extractProductRecommendations } from "@/lib/ai-response-formatter";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

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

// Helper function to fetch image from URL and convert to base64
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Determine MIME type from URL or response headers
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.startsWith('image/') ? contentType : 'image/jpeg';

    return { data: base64, mimeType };
  } catch (error) {
    console.error('Error fetching image:', error);
    throw new Error('Failed to fetch image from URL');
  }
}

export async function POST(req: Request) {
  const { message, userImages } = await req.json();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a prompt that includes product information
    const productInfo = products.map((p, index) =>
      `Product ${index + 1}: ${p.name} - ${p.description} - Category: ${p.category} - Price: ₹${p.price} - Tags: ${p.tags.join(', ')}`
    ).join('\n');

    const prompt = `
You are a professional fashion expert and stylist. Based on the user's query: "${message}", provide personalized fashion recommendations.

Available products (with Product IDs):
${productInfo}

Guidelines:
- Respond in a conversational, helpful tone
- Use markdown formatting for better readability (headers, lists, bold text)
- Suggest specific products by mentioning "Product ID: X" where X is the product number
- Give styling tips and outfit combinations
- Keep responses engaging and professional
- Focus on practical advice

IMPORTANT FORMATTING RULES:
- Use **bold** for product names and key points
- Use *italics* for emphasis
- Use proper headers with ## for sections
- Use bullet points (-) for lists
- Keep formatting clean and consistent
- End with suggested Product IDs in format: "Suggested Product IDs: 1, 2, 3"

Example format:
## My Recommendations

Here are some great pieces for you:

- **Classic White Tee** - This versatile piece can be styled in many ways (Product ID: 1)
- **Blue Denim Jeans** - Perfect for casual outings (Product ID: 2)

**Styling Tip:** Layering adds dimension to your outfit!

Suggested Product IDs: 1, 2
`;

    let contentParts: any[] = [{ text: prompt }];

    // Include user images if provided
    if (userImages && userImages.length > 0) {
      for (const imageUrl of userImages) {
        try {
          let imageData: string;
          let mimeType: string;

          if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
            // External URL (Cloudinary or other)
            const imageResult = await fetchImageAsBase64(imageUrl);
            imageData = imageResult.data;
            mimeType = imageResult.mimeType;
          } else if (imageUrl.startsWith('/')) {
            // Local image path
            const localImageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${imageUrl}`;
            const imageResult = await fetchImageAsBase64(localImageUrl);
            imageData = imageResult.data;
            mimeType = imageResult.mimeType;
          } else {
            console.warn(`Skipping invalid image URL format: ${imageUrl}`);
            continue;
          }

          contentParts.push({
            inlineData: {
              mimeType: mimeType,
              data: imageData
            }
          });
        } catch (error) {
          console.warn(`Failed to load user image: ${imageUrl}`, error);
        }
      }
    }

    const result = await retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      return await model.generateContent({
        contents: [{
          role: "user",
          parts: contentParts
        }]
      });
    });

    const response = await result.response;
    let text = response.text();

    // Pre-process the AI response for better formatting
    text = text
      // Fix common markdown issues
      .replace(/\*\*\s+/g, '**') // Remove spaces after bold markers
      .replace(/\s+\*\*/g, '**') // Remove spaces before bold markers
      .replace(/\*\s+\*/g, '**') // Fix broken bold formatting
      // Ensure proper list formatting
      .replace(/^\*\s+/gm, '- ') // Convert asterisks to dashes for consistency
      .replace(/^-\s+/gm, '- ') // Ensure single space after dash markers
      // Clean up headers
      .replace(/^#+\s*/gm, (match) => match.trim() + ' ') // Ensure space after header markers
      // Fix line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace excessive newlines
      .trim()

    // Format and clean the AI response
    const formattedResponse = formatAIResponse(text);

    // Also extract products mentioned by name as fallback
    const mentionedProducts = products.filter(p =>
      text.toLowerCase().includes(p.name.toLowerCase())
    ).map(p => String(products.indexOf(p) + 1));

    // Combine extracted IDs with mentioned products
    const allSuggestedProducts = [...new Set([
      ...formattedResponse.suggestedProducts,
      ...mentionedProducts
    ])];

    return new Response(JSON.stringify({
      reply: formattedResponse.message,
      products: allSuggestedProducts
    }), { status: 200 });
  } catch (error: any) {
    console.error("Gemini API error:", error);

    // Handle specific Gemini API errors
    if (error.status === 429) {
      return new Response(JSON.stringify({
        reply: "I'm currently receiving too many requests. Please wait a moment and try again! 💫",
        products: [],
        retryAfter: 60
      }), { status: 429 });
    }

    if (error.status === 503) {
      return new Response(JSON.stringify({
        reply: "My AI brain is taking a quick break! Please try again in a few moments. 🤖",
        products: [],
        retryAfter: 30
      }), { status: 503 });
    }

    // Handle network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return new Response(JSON.stringify({
        reply: "Oops! Having trouble connecting right now. Please check your internet and try again! 🌐",
        products: []
      }), { status: 500 });
    }

    return new Response(JSON.stringify({
      reply: "I apologize, but I'm experiencing some technical difficulties right now. Please try asking your fashion question again in a moment! 🔧",
      products: []
    }), { status: 500 });
  }
}