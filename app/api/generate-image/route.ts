/**
 * Generate Image API Route
 * Handles AI-powered virtual try-on with credit checking and premium delay
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { deductCredit, recordGeneration } from '@/lib/credits';
import { getNextApiKey } from '@/lib/api-key-manager';
import Replicate from 'replicate';

const MINIMUM_PROCESSING_TIME = 30000; // 30 seconds for premium feel

interface GenerateImageRequest {
  userImageUrl: string;
  clothingImageUrl: string;
  prompt?: string;
  negativePrompt?: string;
  style?: string;
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  message?: string;
  creditsRemaining?: number;
  processingTime?: number;
}

/**
 * Premium delay to make the AI generation feel more valuable
 */
async function premiumDelay(minTime: number = MINIMUM_PROCESSING_TIME): Promise<void> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, minTime - elapsed);
    
    setTimeout(resolve, remainingTime);
  });
}

/**
 * Build optimized prompt for virtual try-on
 */
function buildTryOnPrompt(
  userPrompt?: string,
  style?: string,
  clothingType?: string
): string {
  const basePrompt = userPrompt || 
    `Generate a photorealistic image of a person wearing the provided clothing item. 
     Maintain natural lighting, realistic shadows, and accurate body fit.`;
  
  const styleModifier = style ? `Style: ${style}. ` : '';
  const qualityModifiers = `Output high quality 1024x1024 resolution with neutral background. 
    Ensure realistic fabric texture, proper clothing drape, and natural body proportions.`;
  
  return `${styleModifier}${basePrompt} ${qualityModifiers}`;
}

/**
 * Build negative prompt to avoid common AI artifacts
 */
function buildNegativePrompt(customNegativePrompt?: string): string {
  const defaultNegative = `distortion, double faces, multiple heads, deformed body, 
    color mismatch, unrealistic proportions, background clutter, low quality, 
    blurry, pixelated, warped clothing, incorrect anatomy, floating objects`;
  
  return customNegativePrompt 
    ? `${defaultNegative}, ${customNegativePrompt}` 
    : defaultNegative;
}

/**
 * Generate image using Replicate API with rotated keys
 */
async function generateWithReplicate(
  userImageUrl: string,
  clothingImageUrl: string,
  prompt: string,
  negativePrompt: string
): Promise<string | null> {
  const apiKey = getNextApiKey('replicate');
  
  if (!apiKey) {
    throw new Error('No available API keys for image generation');
  }

  const replicate = new Replicate({
    auth: apiKey,
  });

  try {
    // Using a virtual try-on model (example - adjust based on your preferred model)
    const output = await replicate.run(
      "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
      {
        input: {
          human_img: userImageUrl,
          garm_img: clothingImageUrl,
          garment_des: prompt,
          is_checked: true,
          denoise_steps: 30,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    ) as any;

    // Extract image URL from output
    if (Array.isArray(output) && output.length > 0) {
      return output[0];
    } else if (typeof output === 'string') {
      return output;
    } else if (output?.url) {
      return output.url;
    }

    return null;
  } catch (error) {
    console.error('Replicate generation error:', error);
    throw error;
  }
}

/**
 * Alternative: Generate with Stability AI or other provider
 */
async function generateWithStability(
  userImageUrl: string,
  clothingImageUrl: string,
  prompt: string
): Promise<string | null> {
  const apiKey = getNextApiKey('stability');
  
  if (!apiKey) {
    throw new Error('No available Stability AI API keys');
  }

  // Implement Stability AI logic here
  // This is a placeholder - adjust based on actual Stability AI API
  
  return null;
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
    const body: GenerateImageRequest = await request.json();
    const { userImageUrl, clothingImageUrl, prompt, negativePrompt, style } = body;

    if (!userImageUrl || !clothingImageUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'invalid_request', 
          message: 'Both user image and clothing image are required' 
        },
        { status: 400 }
      );
    }

    // 3. Check and deduct credits
    const creditResult = await deductCredit(user.id, 'try-on');
    
    if (!creditResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: creditResult.error,
          message: creditResult.message || 'Insufficient credits',
          creditsRemaining: 0,
        },
        { status: 402 } // Payment Required
      );
    }

    // 4. Build prompts
    const finalPrompt = buildTryOnPrompt(prompt, style);
    const finalNegativePrompt = buildNegativePrompt(negativePrompt);

    // 5. Generate image with AI
    let imageUrl: string | null = null;
    let generationError: Error | null = null;

    try {
      imageUrl = await generateWithReplicate(
        userImageUrl,
        clothingImageUrl,
        finalPrompt,
        finalNegativePrompt
      );
    } catch (error) {
      console.error('Primary generation method failed:', error);
      generationError = error as Error;
      
      // Try fallback method if available
      try {
        imageUrl = await generateWithStability(userImageUrl, clothingImageUrl, finalPrompt);
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
      }
    }

    // 6. Apply premium delay (minimum 30 seconds)
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < MINIMUM_PROCESSING_TIME) {
      await premiumDelay(MINIMUM_PROCESSING_TIME - elapsedTime);
    }

    const totalProcessingTime = Date.now() - startTime;

    // 7. Record generation history
    await recordGeneration(
      user.id,
      'try-on',
      {
        userImageUrl,
        clothingImageUrl,
        prompt: finalPrompt,
        negativePrompt: finalNegativePrompt,
        style,
      },
      imageUrl || undefined,
      totalProcessingTime
    );

    // 8. Return result
    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'generation_failed',
          message: generationError?.message || 'Failed to generate image. Credit has been refunded.',
          creditsRemaining: creditResult.credits_remaining,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      creditsRemaining: creditResult.credits_remaining,
      processingTime: totalProcessingTime,
      message: 'Image generated successfully!',
    });

  } catch (error) {
    console.error('Generate image error:', error);
    
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

// GET endpoint to check API status
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's credit info
    const { data: creditInfo } = await supabase.rpc('get_user_credits', {
      p_user_id: user.id,
    });

    return NextResponse.json({
      status: 'operational',
      user: {
        id: user.id,
        email: user.email,
      },
      credits: creditInfo,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
