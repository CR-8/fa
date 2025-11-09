/**
 * Credit Management System
 * Handles user credits, deductions, and tier-based limits
 */

import { supabase } from './supabase';

export type PlanTier = 'free' | 'pro' | 'elite';

export interface CreditInfo {
  credits_remaining: number;
  credits_total: number;
  plan_tier: PlanTier;
  last_reset: string;
  next_reset: string;
}

export interface CreditDeductionResult {
  success: boolean;
  credits_remaining?: number;
  plan_tier?: PlanTier;
  error?: string;
  message?: string;
}

export const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 10, // 10 daily credits for wardrobe functionality
  pro: 100,
  elite: 300,
};

export const PLAN_FEATURES: Record<PlanTier, {
  name: string;
  dailyCredits: number;
  price: string;
  features: string[];
}> = {
  free: {
    name: 'Free',
    dailyCredits: 10,
    price: '$0',
    features: [
      '10 AI generations per day',
      'Basic virtual try-on',
      'Wardrobe recommendations (3 per request)',
      'Standard processing speed',
      'Community support',
    ],
  },
  pro: {
    name: 'Pro',
    dailyCredits: 100,
    price: '$19/month',
    features: [
      '100 AI generations per day',
      'Advanced virtual try-on',
      'Priority processing',
      'Outfit suggestions',
      'Email support',
      'No watermarks',
    ],
  },
  elite: {
    name: 'Elite',
    dailyCredits: 300,
    price: '$49/month',
    features: [
      '300 AI generations per day',
      'Premium virtual try-on',
      'Instant processing',
      'Unlimited outfit suggestions',
      'Priority 24/7 support',
      'API access',
      'Advanced analytics',
      'Custom branding',
    ],
  },
};

/**
 * Initialize credits for a new user (fallback if trigger fails)
 */
export async function initializeUserCredits(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_remaining: 10,
        credits_total: 10,
        plan_tier: 'free',
        last_reset_date: today,
        next_reset_date: tomorrow,
      });

    if (error) {
      // Ignore conflict errors (user already has credits)
      if (error.code === '23505') {
        return true;
      }
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get user's current credit information
 */
export async function getUserCredits(userId: string): Promise<CreditInfo | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_credits', {
      p_user_id: userId,
    });

    if (error) {
      return await getUserCreditsDirect(userId);
    }

    // RPC returns an array of rows, get the first one
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return await getUserCreditsDirect(userId);
    }

    // If data is an array, get the first element
    const creditInfo = Array.isArray(data) ? data[0] : data;
    
    // Check if all fields are null - this means the user has no credits record
    if (!creditInfo || creditInfo.credits_remaining === null || creditInfo.credits_total === null) {
      // Initialize credits for this user
      await initializeUserCredits(userId);
      
      // Try direct query after initialization
      return await getUserCreditsDirect(userId);
    }
    
    return creditInfo as CreditInfo;
  } catch (error) {
    return await getUserCreditsDirect(userId);
  }
}

/**
 * Get user credits directly from table (fallback method)
 */
async function getUserCreditsDirect(userId: string): Promise<CreditInfo | null> {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return {
        credits_remaining: 10,
        credits_total: 10,
        plan_tier: 'free' as PlanTier,
        last_reset: new Date().toISOString(),
        next_reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
    }

    return {
      credits_remaining: data.credits_remaining || 10,
      credits_total: data.credits_total || 10,
      plan_tier: data.plan_tier || 'free',
      last_reset: data.last_reset_date || new Date().toISOString(),
      next_reset: data.next_reset_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } catch (error) {
    return {
      credits_remaining: 10,
      credits_total: 10,
      plan_tier: 'free' as PlanTier,
      last_reset: new Date().toISOString(),
      next_reset: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }
}

/**
 * Deduct a credit from user's account
 * Automatically resets credits if it's a new day
 */
export async function deductCredit(
  userId: string,
  generationType: 'try-on' | 'outfit-suggestion' | 'style-analysis' = 'try-on'
): Promise<CreditDeductionResult> {
  try {
    const { data, error } = await supabase.rpc('deduct_credit', {
      p_user_id: userId,
      p_generation_type: generationType,
    });

    if (error) {
      return {
        success: false,
        error: 'database_error',
        message: 'Failed to deduct credit. Please try again.',
      };
    }

    return data as CreditDeductionResult;
  } catch (error) {
    return {
      success: false,
      error: 'exception',
      message: 'An unexpected error occurred.',
    };
  }
}

/**
 * Check if user has enough credits
 */
export async function hasCredits(userId: string): Promise<boolean> {
  const creditInfo = await getUserCredits(userId);
  return creditInfo ? creditInfo.credits_remaining > 0 : false;
}

/**
 * Get credit requirements for different operations
 */
export function getCreditCost(operationType: string): number {
  const costs: Record<string, number> = {
    'try-on': 1, // Each image generation costs 1 credit
    'wardrobe-try-on': 1, // Each wardrobe try-on image costs 1 credit
    'outfit-suggestion': 0, // Recommendations are free (just shows 3 outfits)
    'style-analysis': 1,
    'batch-try-on': 3,
  };

  return costs[operationType] || 1;
}

/**
 * Record a generation in history
 */
export async function recordGeneration(
  userId: string,
  generationType: 'try-on' | 'outfit-suggestion' | 'style-analysis',
  inputData: any,
  resultUrl?: string,
  processingTimeMs?: number
): Promise<boolean> {
  try {
    const { error } = await supabase.from('generation_history').insert({
      user_id: userId,
      generation_type: generationType,
      input_data: inputData,
      result_url: resultUrl,
      credits_used: getCreditCost(generationType),
      processing_time_ms: processingTimeMs,
    });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get user's generation history
 */
export async function getGenerationHistory(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
}

/**
 * Get user's plan tier
 */
export async function getUserPlanTier(userId: string): Promise<PlanTier> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('plan_tier')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return 'free';
    }

    return data.plan_tier as PlanTier;
  } catch (error) {
    return 'free';
  }
}

/**
 * Update user's plan tier
 */
export async function updateUserPlanTier(
  userId: string,
  newTier: PlanTier
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ plan_tier: newTier })
      .eq('id', userId);

    if (error) {
      return false;
    }

    // Update credits to match new tier
    const newCreditLimit = PLAN_LIMITS[newTier];
    await supabase
      .from('user_credits')
      .update({
        credits_remaining: newCreditLimit,
        credits_total: newCreditLimit,
      })
      .eq('user_id', userId);

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get credit usage statistics for a user
 */
export async function getCreditStats(userId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('generation_history')
      .select('generation_type, credits_used, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      return null;
    }

    // Calculate statistics
    const totalCreditsUsed = data.reduce((sum, item) => sum + item.credits_used, 0);
    const generationsByType = data.reduce((acc, item) => {
      acc[item.generation_type] = (acc[item.generation_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCreditsUsed,
      totalGenerations: data.length,
      generationsByType,
      dailyAverage: totalCreditsUsed / days,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Format credit info for display
 */
export function formatCreditDisplay(creditInfo: CreditInfo | null): string {
  if (!creditInfo) return 'N/A';
  
  return `${creditInfo.credits_remaining}/${creditInfo.credits_total}`;
}

/**
 * Get time until next credit reset
 */
export function getTimeUntilReset(creditInfo: CreditInfo | null): string {
  if (!creditInfo) return 'Unknown';

  const now = new Date();
  const nextReset = new Date(creditInfo.next_reset);
  const diff = nextReset.getTime() - now.getTime();

  if (diff <= 0) return 'Resetting now...';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

/**
 * Check if user is eligible for upgrade
 */
export function canUpgrade(currentTier: PlanTier): boolean {
  return currentTier !== 'elite';
}

/**
 * Get recommended tier based on usage
 */
export async function getRecommendedTier(userId: string): Promise<PlanTier> {
  const stats = await getCreditStats(userId, 7); // Last 7 days
  if (!stats) return 'free';

  const avgDailyUsage = stats.dailyAverage;

  if (avgDailyUsage >= 100) return 'elite';
  if (avgDailyUsage >= 20) return 'pro';
  return 'free';
}
