-- =====================================================
-- COMPLETE SUPABASE DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create profiles table (for authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'elite')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can only see and update their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Create wardrobe_items table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  size TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_created_at ON public.wardrobe_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category ON public.wardrobe_items(category);

-- Enable RLS for wardrobe_items
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Wardrobe items policies: users can only access their own items
CREATE POLICY "Users can view their own wardrobe items"
  ON public.wardrobe_items
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobe items"
  ON public.wardrobe_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items"
  ON public.wardrobe_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items"
  ON public.wardrobe_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Create function to handle new user signups
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Create function to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.wardrobe_items;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.wardrobe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Create user_credits table (10 daily credits for wardrobe)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 10,
  credits_total INTEGER NOT NULL DEFAULT 10,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'elite')),
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_reset_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
  ON public.user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.user_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Create generation_history table (track credit usage)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('try-on', 'wardrobe-try-on', 'outfit-suggestion', 'style-analysis', 'batch-try-on')),
  credits_used INTEGER NOT NULL DEFAULT 1,
  input_data JSONB,
  result_url TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON public.generation_history(created_at DESC);

-- Enable RLS for generation_history
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generation history"
  ON public.generation_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation history"
  ON public.generation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Create credit_usage_log table (detailed logging)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credit_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL,
  action TEXT NOT NULL,
  remaining_credits INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_usage_log_user_id ON public.credit_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_log_created_at ON public.credit_usage_log(created_at DESC);

-- Enable RLS for credit_usage_log
ALTER TABLE public.credit_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit usage log"
  ON public.credit_usage_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- 8. Function to initialize user credits on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits_remaining, credits_total, plan_tier, last_reset_date, next_reset_date)
  VALUES (
    NEW.id,
    10,
    10,
    'free',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_credits_init ON public.profiles;
CREATE TRIGGER on_user_credits_init
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();

-- 9. Function to get user credits (with auto-reset)
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS TABLE (
  credits_remaining INTEGER,
  credits_total INTEGER,
  plan_tier TEXT,
  last_reset VARCHAR,
  next_reset VARCHAR
) AS $$
DECLARE
  v_credits_remaining INTEGER;
  v_credits_total INTEGER;
  v_plan_tier TEXT;
  v_last_reset DATE;
  v_next_reset DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get or create user credits
  INSERT INTO public.user_credits (user_id, credits_remaining, credits_total, plan_tier, last_reset_date, next_reset_date)
  VALUES (p_user_id, 10, 10, 'free', v_today, v_today + INTERVAL '1 day')
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current credits
  SELECT uc.credits_remaining, uc.credits_total, uc.plan_tier, uc.last_reset_date, uc.next_reset_date
  INTO v_credits_remaining, v_credits_total, v_plan_tier, v_last_reset, v_next_reset
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;

  -- Reset credits if it's a new day
  IF v_last_reset < v_today THEN
    -- Determine new credit amount based on plan tier
    v_credits_total := CASE v_plan_tier
      WHEN 'pro' THEN 100
      WHEN 'elite' THEN 300
      ELSE 10
    END;

    UPDATE public.user_credits
    SET credits_remaining = v_credits_total,
        credits_total = v_credits_total,
        last_reset_date = v_today,
        next_reset_date = v_today + INTERVAL '1 day',
        updated_at = NOW()
    WHERE user_id = p_user_id;

    v_credits_remaining := v_credits_total;
    v_last_reset := v_today;
    v_next_reset := v_today + INTERVAL '1 day';
  END IF;

  RETURN QUERY SELECT v_credits_remaining, v_credits_total, v_plan_tier, v_last_reset::VARCHAR, v_next_reset::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to deduct credits
-- =====================================================
CREATE OR REPLACE FUNCTION public.deduct_credit(
  p_user_id UUID,
  p_generation_type TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  credits_remaining INTEGER,
  plan_tier TEXT,
  error TEXT,
  message TEXT
) AS $$
DECLARE
  v_credits_remaining INTEGER;
  v_plan_tier TEXT;
  v_credits_total INTEGER;
BEGIN
  -- First, ensure credits are up to date (auto-reset if needed)
  PERFORM public.get_user_credits(p_user_id);

  -- Get current credits
  SELECT uc.credits_remaining, uc.plan_tier, uc.credits_total
  INTO v_credits_remaining, v_plan_tier, v_credits_total
  FROM public.user_credits uc
  WHERE uc.user_id = p_user_id;

  -- Check if user has enough credits
  IF v_credits_remaining <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, v_plan_tier, 'insufficient_credits'::TEXT, 'You have no credits remaining. Credits reset daily.'::TEXT;
    RETURN;
  END IF;

  -- Deduct credit
  UPDATE public.user_credits
  SET credits_remaining = credits_remaining - 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  v_credits_remaining := v_credits_remaining - 1;

  -- Log the generation
  INSERT INTO public.generation_history (user_id, generation_type, credits_used)
  VALUES (p_user_id, p_generation_type, 1);

  RETURN QUERY SELECT TRUE, v_credits_remaining, v_plan_tier, NULL::TEXT, 'Credit deducted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- What was created:
-- 1. profiles table - User authentication profiles
-- 2. wardrobe_items table - User's clothing items
-- 3. user_credits table - Daily credits system (10 free daily)
-- 4. generation_history table - Track all AI generations
-- 5. credit_usage_log table - Detailed credit usage logging
-- 6. RLS policies for all tables
-- 7. Functions for credit management with auto-reset
--
-- Credit System:
-- - Free tier: 10 credits daily
-- - Each try-on image generation: 1 credit
-- - Outfit recommendations: FREE (returns 3 outfits)
-- - Credits auto-reset at midnight (daily)
--
-- Next steps:
-- 1. Verify tables were created: Check the Table Editor
-- 2. Test authentication: Sign in with Google OAuth
-- 3. Test wardrobe: Upload a clothing item
-- 4. Test credits: Generate try-on images (1 credit each)
-- =====================================================
