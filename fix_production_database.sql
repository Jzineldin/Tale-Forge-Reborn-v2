-- =====================================================
-- PRODUCTION DATABASE FIX
-- Run this in Supabase SQL Editor to fix template/achievement errors
-- =====================================================

-- 1. Fix RLS policy for user_profiles to allow viewing profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view profiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    id IN (
      SELECT creator_id FROM user_story_templates WHERE is_public = TRUE
    )
  );

-- 2. Create function to get unclaimed achievements
CREATE OR REPLACE FUNCTION get_unclaimed_achievements(user_uuid UUID)
RETURNS TABLE (
  achievement_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  tier TEXT,
  icon TEXT,
  badge_color TEXT,
  credits_reward INTEGER,
  earned_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.achievement_id,
    a.name,
    a.description,
    a.category,
    a.tier,
    a.icon,
    a.badge_color,
    a.credits_reward,
    ua.earned_at
  FROM user_achievements ua
  JOIN achievements a ON ua.achievement_id = a.id
  WHERE ua.user_id = user_uuid
    AND ua.is_claimed = FALSE
  ORDER BY ua.earned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_unclaimed_achievements(UUID) TO authenticated;

-- 3. Create simplified view for templates with creator info
CREATE OR REPLACE VIEW templates_with_creator AS
SELECT 
  t.*,
  p.full_name as creator_full_name,
  p.avatar_url as creator_avatar_url
FROM user_story_templates t
LEFT JOIN user_profiles p ON t.creator_id = p.id;

-- Grant access
GRANT SELECT ON templates_with_creator TO authenticated;
GRANT SELECT ON templates_with_creator TO anon;

-- 4. Create simplified view for saved templates
CREATE OR REPLACE VIEW saved_templates_view AS
SELECT 
  ts.id as save_id,
  ts.user_id,
  ts.template_id,
  ts.created_at as saved_at,
  t.title,
  t.description,
  t.genre,
  t.age_group,
  t.creator_id,
  p.full_name as creator_full_name,
  p.avatar_url as creator_avatar_url
FROM template_saves ts
LEFT JOIN user_story_templates t ON ts.template_id = t.id
LEFT JOIN user_profiles p ON t.creator_id = p.id;

-- Grant access
GRANT SELECT ON saved_templates_view TO authenticated;

-- 5. Ensure foreign keys exist (won't error if they already exist)
DO $$ 
BEGIN
  -- Check and add foreign key for user_story_templates if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_story_templates_creator_id_fkey'
  ) THEN
    ALTER TABLE user_story_templates
    ADD CONSTRAINT user_story_templates_creator_id_fkey 
    FOREIGN KEY (creator_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
  END IF;

  -- Check and add foreign key for template_saves if not exists  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'template_saves_template_id_fkey'
  ) THEN
    ALTER TABLE template_saves
    ADD CONSTRAINT template_saves_template_id_fkey 
    FOREIGN KEY (template_id) 
    REFERENCES user_story_templates(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Test the fixes
-- You should see results without errors after running this
SELECT 'Testing template query:' as test;
SELECT COUNT(*) as public_templates FROM user_story_templates WHERE is_public = TRUE;

SELECT 'Testing achievements query:' as test;
SELECT COUNT(*) as total_achievements FROM achievements WHERE is_active = TRUE;

SELECT 'Fix complete! The template marketplace and achievements should work now.' as status;