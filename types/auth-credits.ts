/**
 * Type Definitions for Authentication & Credit System
 */

// ==================== AUTH TYPES ====================

export type PlanTier = 'free' | 'pro' | 'elite';

export interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  plan_tier: PlanTier;
  created_at: string;
  updated_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  credits_total: number;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

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

// ==================== GENERATION TYPES ====================

export type GenerationType = 'try-on' | 'outfit-suggestion' | 'style-analysis';

export interface GenerationHistory {
  id: string;
  user_id: string;
  generation_type: GenerationType;
  input_data: any;
  result_url?: string;
  credits_used: number;
  processing_time_ms?: number;
  created_at: string;
}

// ==================== API REQUEST/RESPONSE TYPES ====================

export interface GenerateImageRequest {
  userImageUrl: string;
  clothingImageUrl: string;
  prompt?: string;
  negativePrompt?: string;
  style?: string;
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  message?: string;
  creditsRemaining?: number;
  processingTime?: number;
}

export interface OutfitSuggestionRequest {
  wardrobeImageUrls: string[];
  occasion: string;
  style?: string;
  season?: string;
  colorPreference?: string;
  numberOfOutfits?: number;
}

export interface OutfitCombination {
  outfit_name: string;
  description: string;
  matched_items_urls: string[];
  occasion_fit: string;
  style_notes: string;
  confidence_score: number;
}

export interface OutfitSuggestionResponse {
  success: boolean;
  outfits?: OutfitCombination[];
  error?: string;
  message?: string;
  creditsRemaining?: number;
  processingTime?: number;
}

// ==================== SUBSCRIPTION TYPES ====================

export interface PlanFeatures {
  name: string;
  dailyCredits: number;
  price: string;
  features: string[];
}

export interface SubscriptionPlan {
  tier: PlanTier;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId?: string;
}

// ==================== API KEY TYPES ====================

export interface ApiKey {
  key: string;
  dailyUsage: number;
  dailyLimit: number;
  isActive: boolean;
  lastReset: Date;
  lastUsed?: Date;
}

export interface ApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  totalUsage: number;
  totalLimit: number;
  utilizationRate: number;
}

// ==================== UI COMPONENT TYPES ====================

export interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  credits: CreditInfo | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

export interface PremiumLoadingProps {
  message?: string;
  estimatedTime?: number;
  showProgress?: boolean;
}

// ==================== ERROR TYPES ====================

export interface ApiError {
  error: string;
  message: string;
  code?: string;
  details?: any;
}

export type ErrorCode = 
  | 'unauthorized'
  | 'insufficient_credits'
  | 'invalid_request'
  | 'generation_failed'
  | 'server_error'
  | 'rate_limited'
  | 'database_error';

// ==================== UTILITY TYPES ====================

export interface CreditStats {
  totalCreditsUsed: number;
  totalGenerations: number;
  generationsByType: Record<GenerationType, number>;
  dailyAverage: number;
}

export interface UsageAnalytics {
  user_id: string;
  period: 'daily' | 'weekly' | 'monthly';
  total_generations: number;
  total_credits_used: number;
  average_processing_time: number;
  most_used_feature: GenerationType;
}
