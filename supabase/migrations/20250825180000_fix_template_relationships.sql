-- Fix Missing Foreign Key Relationships
-- Adds proper foreign key relationships for template and achievement systems

-- Add foreign key constraint from user_story_templates to user_profiles
-- First, ensure creator_id references auth.users (it should already)
ALTER TABLE user_story_templates 
  DROP CONSTRAINT IF EXISTS user_story_templates_creator_id_fkey;

ALTER TABLE user_story_templates
  ADD CONSTRAINT user_story_templates_creator_id_fkey 
  FOREIGN KEY (creator_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create a view to simplify queries with user profile joins
CREATE OR REPLACE VIEW user_story_templates_with_profiles AS
SELECT 
  t.*,
  p.full_name as creator_full_name,
  p.avatar_url as creator_avatar_url,
  p.role as creator_role
FROM user_story_templates t
LEFT JOIN user_profiles p ON t.creator_id = p.id;

-- Grant access to the view
GRANT SELECT ON user_story_templates_with_profiles TO authenticated;
GRANT SELECT ON user_story_templates_with_profiles TO anon;

-- For achievements, ensure user_achievements can properly join with achievements
-- This should already exist but let's ensure it's correct
ALTER TABLE user_achievements 
  DROP CONSTRAINT IF EXISTS user_achievements_achievement_id_fkey;

ALTER TABLE user_achievements
  ADD CONSTRAINT user_achievements_achievement_id_fkey 
  FOREIGN KEY (achievement_id) 
  REFERENCES achievements(id) 
  ON DELETE CASCADE;

-- Create a view for user achievements with full achievement details
CREATE OR REPLACE VIEW user_achievements_with_details AS
SELECT 
  ua.*,
  a.name as achievement_name,
  a.description as achievement_description,
  a.category as achievement_category,
  a.tier as achievement_tier,
  a.icon as achievement_icon,
  a.badge_color as achievement_badge_color,
  a.credits_reward as achievement_credits_reward
FROM user_achievements ua
LEFT JOIN achievements a ON ua.achievement_id = a.id;

-- Grant access to the view
GRANT SELECT ON user_achievements_with_details TO authenticated;

-- For template_saves, ensure it references the correct table
ALTER TABLE template_saves 
  DROP CONSTRAINT IF EXISTS template_saves_template_id_fkey;

ALTER TABLE template_saves
  ADD CONSTRAINT template_saves_template_id_fkey 
  FOREIGN KEY (template_id) 
  REFERENCES user_story_templates(id) 
  ON DELETE CASCADE;

-- Create a view for saved templates with full details
CREATE OR REPLACE VIEW template_saves_with_details AS
SELECT 
  ts.id as save_id,
  ts.user_id,
  ts.template_id,
  ts.created_at as saved_at,
  t.title,
  t.description,
  t.genre,
  t.age_group,
  t.difficulty_level,
  t.characters,
  t.settings,
  t.plot_elements,
  t.story_hooks,
  t.estimated_chapters,
  t.estimated_word_count,
  t.tags,
  t.is_public,
  t.is_featured,
  t.usage_count,
  t.likes_count,
  t.saves_count,
  t.reviews_count,
  t.rating_average,
  t.creator_id,
  p.full_name as creator_full_name,
  p.avatar_url as creator_avatar_url
FROM template_saves ts
LEFT JOIN user_story_templates t ON ts.template_id = t.id
LEFT JOIN user_profiles p ON t.creator_id = p.id;

-- Grant access to the view
GRANT SELECT ON template_saves_with_details TO authenticated;

-- Update RLS policy for user_profiles to allow viewing public profiles for template creators
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view profiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    id IN (
      SELECT creator_id FROM user_story_templates WHERE is_public = TRUE
    )
  );

-- Add function to get unclaimed achievements for a user
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

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_unclaimed_achievements(UUID) TO authenticated;