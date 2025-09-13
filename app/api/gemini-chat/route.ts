import { GoogleGenerativeAI } from "@google/generative-ai";
import { products } from "@/data/products";
import { formatAIResponse, extractProductRecommendations } from "@/lib/ai-response-formatter";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  const { message } = await req.json();

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

Format your response with proper markdown including:
- Use **bold** for product names and key points
- Use bullet points for lists
- Use headers (##) for sections if needed
- End with a clear list of suggested Product IDs

Example format:
## My Recommendations

Here are some great pieces for you:

* **Product Name** - Brief description and styling tip (Product ID: X)
* **Another Product** - How to style it (Product ID: Y)

Suggested Product IDs: X, Y, Z
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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
  } catch (error) {
    console.error("Gemini API error:", error);
    return new Response(JSON.stringify({
      reply: "I apologize, but I'm experiencing some technical difficulties right now. Please try asking your fashion question again in a moment!",
      products: []
    }), { status: 500 });
  }
}