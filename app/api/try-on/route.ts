import { GoogleGenerativeAI } from "@google/generative-ai";
import { products } from "@/data/products";
import { user } from "@/data/user";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  const { productId, poseIndex } = await req.json();

  const product = products.find(p => p.id === productId);
  if (!product) {
    return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
  }

  const userImagePath = path.join(process.cwd(), "public", user.poses[poseIndex] || user.poses[0]);
  const productImagePath = path.join(process.cwd(), "public", product.images[0]);

  try {
    // Read and encode images to base64
    const userImageData = fs.readFileSync(userImagePath).toString("base64");
    const productImageData = fs.readFileSync(productImagePath).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Generate a detailed description of how this person would look wearing ${product.name}. Based on the reference images provided, describe the outfit combination in detail, including colors, fit, and overall appearance. Make it sound like a professional fashion stylist giving advice.`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: userImageData } },
            { inlineData: { mimeType: "image/png", data: productImageData } }
          ]
        }
      ]
    });

    const response = await result.response;
    const text = response.text();

    // For now, return a text description instead of generated image
    // In a production app, you might want to use a different image generation service
    return new Response(JSON.stringify({ 
      description: text,
      productName: product.name,
      productImage: product.images[0]
    }), { status: 200 });
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate try-on image" }), { status: 500 });
  }
}