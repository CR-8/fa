import { createClient, type User, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Main client for both client and server-side
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Create a client instance (for use in client components)
export function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
}

// Auth helper types
export type PlanTier = 'free' | 'pro' | 'elite'

export interface Profile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  plan_tier: PlanTier
  created_at: string
  updated_at: string
}

export interface UserCredits {
  id: string
  user_id: string
  credits_remaining: number
  credits_total: number
  last_reset: string
  created_at: string
  updated_at: string
}

// Auth functions
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
  
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  
  return data as Profile
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  
  if (error) {
    console.error('Error updating user profile:', error)
    return false
  }
  
  return true
}

// Database types
export interface WardrobeItem {
  id?: string
  user_id: string
  name: string
  category: 'shirt' | 'pants' | 'suit' | 't-shirt' | 'other'
  color: string
  size: string
  description: string
  image_url: string
  metadata?: {
    style?: string
    occasion?: string
    material?: string
    pattern?: string
    fit?: string
    brand?: string
    condition?: string
  }
  created_at?: string
  updated_at?: string
}

export interface UserProfile {
  id?: string
  user_id: string
  height?: string
  shoe_size?: string
  measurements?: {
    chest?: string
    waist?: string
    hips?: string
  }
  created_at?: string
  updated_at?: string
}