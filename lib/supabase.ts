import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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