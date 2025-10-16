-- Temporary fix for development: Allow unauthenticated inserts into wardrobe_items
-- This should be removed in production and proper authentication implemented

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON wardrobe_items;

-- Create a new policy that allows inserts for authenticated users OR during development (when auth.uid() is null)
CREATE POLICY "Users can insert wardrobe items" ON wardrobe_items
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id OR
    auth.uid() IS NULL  -- Allow during development when not authenticated
  );

-- Also update the select policy to allow reading when not authenticated
DROP POLICY IF EXISTS "Users can view their own wardrobe items" ON wardrobe_items;

CREATE POLICY "Users can view wardrobe items" ON wardrobe_items
  FOR SELECT USING (
    auth.uid()::text = user_id OR
    auth.uid() IS NULL  -- Allow during development when not authenticated
  );