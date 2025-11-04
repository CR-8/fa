-- =============================================
-- AUTHENTICATION & CREDITS MIGRATION
-- =============================================

-- 1. CREATE PROFILES TABLE (Extended with Auth & Subscription)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'elite')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE USER_CREDITS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER DEFAULT 5 NOT NULL CHECK (credits_remaining >= 0),
  credits_total INTEGER DEFAULT 5 NOT NULL,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. CREATE GENERATION_HISTORY TABLE (Track AI generations)
-- =============================================
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('try-on', 'outfit-suggestion', 'style-analysis')),
  input_data JSONB,
  result_url TEXT,
  credits_used INTEGER DEFAULT 1,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE API_KEYS TABLE (For rotation system)
-- =============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  daily_usage_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 100,
  last_used TIMESTAMP WITH TIME ZONE,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_last_reset ON user_credits(last_reset);
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_keys_service_active ON api_keys(service_name, is_active);

-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User credits policies
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- Generation history policies
CREATE POLICY "Users can view their own generation history" ON generation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation history" ON generation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- API keys policies (Admin only - no public access)
CREATE POLICY "Only service role can access api_keys" ON api_keys
  USING (false);

-- 8. CREATE FUNCTION: Handle new user registration
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Insert into user_credits with default credits based on plan
  INSERT INTO user_credits (user_id, credits_remaining, credits_total, last_reset)
  VALUES (NEW.id, 5, 5, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CREATE TRIGGER: Auto-create profile and credits on signup
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 10. CREATE FUNCTION: Check and deduct credits
-- =============================================
CREATE OR REPLACE FUNCTION deduct_credit(p_user_id UUID, p_generation_type TEXT)
RETURNS JSONB AS $$
DECLARE
  v_credits INTEGER;
  v_plan_tier TEXT;
  v_last_reset TIMESTAMP WITH TIME ZONE;
  v_result JSONB;
BEGIN
  -- Get user's plan and credits
  SELECT 
    uc.credits_remaining, 
    p.plan_tier,
    uc.last_reset
  INTO v_credits, v_plan_tier, v_last_reset
  FROM user_credits uc
  JOIN profiles p ON p.id = uc.user_id
  WHERE uc.user_id = p_user_id
  FOR UPDATE;
  
  -- Check if credits need to be reset (daily reset)
  IF v_last_reset::date < CURRENT_DATE THEN
    -- Reset credits based on plan tier
    CASE v_plan_tier
      WHEN 'free' THEN v_credits := 5;
      WHEN 'pro' THEN v_credits := 100;
      WHEN 'elite' THEN v_credits := 300;
      ELSE v_credits := 5;
    END CASE;
    
    UPDATE user_credits
    SET 
      credits_remaining = v_credits,
      credits_total = v_credits,
      last_reset = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Check if user has enough credits
  IF v_credits <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_credits',
      'credits_remaining', 0,
      'message', 'You have run out of credits. Please upgrade your plan or wait for daily reset.'
    );
  END IF;
  
  -- Deduct credit
  UPDATE user_credits
  SET credits_remaining = credits_remaining - 1
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'credits_remaining', v_credits - 1,
    'plan_tier', v_plan_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CREATE FUNCTION: Get user credits with auto-reset
-- =============================================
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_credits INTEGER;
  v_plan_tier TEXT;
  v_last_reset TIMESTAMP WITH TIME ZONE;
  v_credits_total INTEGER;
BEGIN
  -- Get current credits
  SELECT 
    uc.credits_remaining, 
    p.plan_tier,
    uc.last_reset,
    uc.credits_total
  INTO v_credits, v_plan_tier, v_last_reset, v_credits_total
  FROM user_credits uc
  JOIN profiles p ON p.id = uc.user_id
  WHERE uc.user_id = p_user_id;
  
  -- Check if credits need to be reset
  IF v_last_reset::date < CURRENT_DATE THEN
    -- Reset credits based on plan tier
    CASE v_plan_tier
      WHEN 'free' THEN 
        v_credits := 5;
        v_credits_total := 5;
      WHEN 'pro' THEN 
        v_credits := 100;
        v_credits_total := 100;
      WHEN 'elite' THEN 
        v_credits := 300;
        v_credits_total := 300;
      ELSE 
        v_credits := 5;
        v_credits_total := 5;
    END CASE;
    
    UPDATE user_credits
    SET 
      credits_remaining = v_credits,
      credits_total = v_credits_total,
      last_reset = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'credits_remaining', v_credits,
    'credits_total', v_credits_total,
    'plan_tier', v_plan_tier,
    'last_reset', v_last_reset,
    'next_reset', (v_last_reset::date + INTERVAL '1 day')::timestamp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. CREATE FUNCTION: Daily credit reset (for scheduled job)
-- =============================================
CREATE OR REPLACE FUNCTION reset_daily_credits()
RETURNS void AS $$
BEGIN
  UPDATE user_credits uc
  SET 
    credits_remaining = CASE 
      WHEN p.plan_tier = 'free' THEN 5
      WHEN p.plan_tier = 'pro' THEN 100
      WHEN p.plan_tier = 'elite' THEN 300
      ELSE 5
    END,
    credits_total = CASE 
      WHEN p.plan_tier = 'free' THEN 5
      WHEN p.plan_tier = 'pro' THEN 100
      WHEN p.plan_tier = 'elite' THEN 300
      ELSE 5
    END,
    last_reset = NOW()
  FROM profiles p
  WHERE uc.user_id = p.id
    AND uc.last_reset::date < CURRENT_DATE;
    
  -- Also reset API key daily usage counts
  UPDATE api_keys
  SET 
    daily_usage_count = 0,
    last_reset = NOW()
  WHERE last_reset::date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. CREATE FUNCTION: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. CREATE TRIGGERS: Auto-update timestamps
-- =============================================
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. GRANT PERMISSIONS
-- =============================================
-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, UPDATE ON user_credits TO authenticated;
GRANT SELECT, INSERT ON generation_history TO authenticated;

-- Service role gets full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 16. INSERT SAMPLE DATA (Optional - for testing)
-- =============================================
-- Uncomment to add sample API keys
-- INSERT INTO api_keys (service_name, api_key_encrypted, daily_limit) VALUES
-- ('replicate', 'your_encrypted_key_1', 100),
-- ('replicate', 'your_encrypted_key_2', 100),
-- ('replicate', 'your_encrypted_key_3', 100);

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Next steps:
-- 1. Set up Google OAuth in Supabase Dashboard
-- 2. Add environment variables for API keys
-- 3. Configure scheduled job for reset_daily_credits()
-- 4. Test authentication flow
