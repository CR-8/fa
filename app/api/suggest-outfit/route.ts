/**
 * Outfit Suggestion API Route
 * AI-powered wardrobe outfit combinations based on occasion
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase';
import { deductCredit, recordGeneration } from '@/lib/credits';
import { getNextApiKey } from '@/lib/api-key-manager';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MINIMUM_PROCESSING_TIME = 15000; // 15 seconds for outfit suggestions

interface OutfitSuggestionRequest {
  wardrobeImageUrls: string[];
  occasion: string;
  style?: string;
  season?: string;
  colorPreference?: string;
  numberOfOutfits?: number;
}

interface OutfitCombination {
  outfit_name: string;
  description: string;
  matched_items_urls: string[];
  occasion_fit: string;
  style_notes: string;
  confidence_score: number;
}

interface OutfitSuggestionResponse {
  success: boolean;
  outfits?: OutfitCombination[];
  error?: string;
  message?: string;
  creditsRemaining?: number;
  processingTime?: number;
}

/**
 * Premium delay for outfit suggestions
 */
async function premiumDelay(minTime: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, minTime));
}

/**
 * Build prompt for outfit suggestions
 */
function buildOutfitPrompt(
  wardrobeCount: number,
  occasion: string,
  style?: string,
  season?: string,
  colorPreference?: string,
  numberOfOutfits: number = 3
): string {
  const styleContext = style ? ` with ${style} style` : '';
  const seasonContext = season ? ` suitable for ${season}` : '';
  const colorContext = colorPreference ? ` preferring ${colorPreference} colors` : '';

  return `You are an expert fashion stylist. Based on the ${wardrobeCount} wardrobe items provided, create ${numberOfOutfits} complete outfit combinations for "${occasion}"${styleContext}${seasonContext}${colorContext}.

For each outfit, provide:
1. A creative outfit name
2. Detailed description of the combination
3. Why it works for the occasion
4. Style tips and notes
5. A confidence score (0-100) for how well it matches the occasion

Analyze the items carefully considering:
- Color coordination and harmony
- Seasonal appropriateness
- Occasion formality level
- Style coherence
- Current fashion trends

Return ONLY a valid JSON array with this exact structure:
[
  {
    "outfit_name": "string",
    "description": "detailed description of the outfit combination",
    "matched_items_urls": ["url1", "url2", "url3"],
    "occasion_fit": "explanation of why this works for the occasion",
    "style_notes": "styling tips and suggestions",
    "confidence_score": 85
  }
]

Be creative, practical, and ensure outfits are actually wearable together.`;
}

/**
 * Generate outfit suggestions using Gemini AI
 */
async function generateOutfitsWithGemini(
  wardrobeImageUrls: string[],
  prompt: string
): Promise<OutfitCombination[]> {
  const apiKey = process.env.GEMINI_API_KEY || getNextApiKey('gemini');
  
  if (!apiKey) {
    throw new Error('No Gemini API key available');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    // Prepare the content with images and text
    const imageParts = await Promise.all(
      wardrobeImageUrls.map(async (url) => {
        try {
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          
          return {
            inlineData: {
              data: base64,
              mimeType,
            },
          };
        } catch (error) {
          console.error(`Failed to fetch image: ${url}`, error);
          return null;
        }
      })
    );

    const validImageParts = imageParts.filter(part => part !== null);

    if (validImageParts.length === 0) {
      throw new Error('No valid wardrobe images provided');
    }

    // Generate content
    const result = await model.generateContent([
      prompt,
      ...validImageParts,
    ]);

    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const outfits: OutfitCombination[] = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure URLs are from the provided wardrobe
    return outfits.map(outfit => ({
      ...outfit,
      matched_items_urls: outfit.matched_items_urls.filter(url =>
        wardrobeImageUrls.includes(url)
      ),
    }));

  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}

/**
 * Fallback: Generate simple rule-based outfit suggestions
 */
function generateRuleBasedOutfits(
  wardrobeImageUrls: string[],
  occasion: string,
  numberOfOutfits: number = 3
): OutfitCombination[] {
  // Simple fallback logic
  const outfits: OutfitCombination[] = [];
  
  for (let i = 0; i < Math.min(numberOfOutfits, Math.floor(wardrobeImageUrls.length / 3)); i++) {
    const startIdx = i * 3;
    const selectedItems = wardrobeImageUrls.slice(startIdx, startIdx + 3);
    
    if (selectedItems.length >= 2) {
      outfits.push({
        outfit_name: `${occasion} Outfit ${i + 1}`,
        description: `A stylish combination of ${selectedItems.length} pieces from your wardrobe.`,
        matched_items_urls: selectedItems,
        occasion_fit: `Suitable for ${occasion} events`,
        style_notes: 'Mix and match based on personal preference',
        confidence_score: 70,
      });
    }
  }
  
  return outfits;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'unauthorized', message: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: OutfitSuggestionRequest = await request.json();
    const {
      wardrobeImageUrls,
      occasion,
      style,
      season,
      colorPreference,
      numberOfOutfits = 3,
    } = body;

    if (!wardrobeImageUrls || wardrobeImageUrls.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'invalid_request',
          message: 'At least 3 wardrobe items are required for outfit suggestions',
        },
        { status: 400 }
      );
    }

    if (!occasion) {
      return NextResponse.json(
        {
          success: false,
          error: 'invalid_request',
          message: 'Occasion is required',
        },
        { status: 400 }
      );
    }

    // 3. Check and deduct credits (outfit suggestions cost 2 credits)
    const creditResult = await deductCredit(user.id, 'outfit-suggestion');
    
    if (!creditResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditResult.error,
          message: creditResult.message || 'Insufficient credits',
          creditsRemaining: 0,
        },
        { status: 402 }
      );
    }

    // 4. Build prompt
    const prompt = buildOutfitPrompt(
      wardrobeImageUrls.length,
      occasion,
      style,
      season,
      colorPreference,
      numberOfOutfits
    );

    // 5. Generate outfit suggestions
    let outfits: OutfitCombination[] = [];
    let generationError: Error | null = null;

    try {
      outfits = await generateOutfitsWithGemini(wardrobeImageUrls, prompt);
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      generationError = error as Error;
      
      // Use rule-based fallback
      outfits = generateRuleBasedOutfits(wardrobeImageUrls, occasion, numberOfOutfits);
    }

    // 6. Apply premium delay
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MINIMUM_PROCESSING_TIME) {
      await premiumDelay(MINIMUM_PROCESSING_TIME - elapsedTime);
    }

    const totalProcessingTime = Date.now() - startTime;

    // 7. Record generation history
    await recordGeneration(
      user.id,
      'outfit-suggestion',
      {
        wardrobeImageUrls,
        occasion,
        style,
        season,
        colorPreference,
        numberOfOutfits,
      },
      JSON.stringify(outfits),
      totalProcessingTime
    );

    // 8. Return result
    if (outfits.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'generation_failed',
          message: 'Could not generate outfit suggestions. Please try again.',
          creditsRemaining: creditResult.credits_remaining,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      outfits,
      creditsRemaining: creditResult.credits_remaining,
      processingTime: totalProcessingTime,
      message: `Generated ${outfits.length} outfit suggestions!`,
    });

  } catch (error) {
    console.error('Outfit suggestion error:', error);
    
    const processingTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        success: false,
        error: 'server_error',
        message: 'An unexpected error occurred. Please try again.',
        processingTime,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve recent suggestions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // This could fetch recent outfit suggestions from generation_history
    return NextResponse.json({
      status: 'operational',
      message: 'Outfit suggestion service is ready',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
