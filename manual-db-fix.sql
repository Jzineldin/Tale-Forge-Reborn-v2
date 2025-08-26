-- Manual Database Fix - Create Essential Missing Tables
-- This creates the minimum tables needed to stop the app from crashing

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL,
  icon TEXT NOT NULL,
  badge_color TEXT DEFAULT '#fbbf24',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  credits_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  credits_earned INTEGER DEFAULT 0,
  is_claimed BOOLEAN DEFAULT FALSE
);

-- Create user_goals table
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  credits_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_story_templates table (simplified for now)
CREATE TABLE IF NOT EXISTS user_story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  difficulty INTEGER DEFAULT 5 CHECK (difficulty BETWEEN 1 AND 10),
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic function to prevent crashes
CREATE OR REPLACE FUNCTION get_available_achievements(user_uuid UUID)
RETURNS TABLE(
  achievement_id UUID,
  achievement_name TEXT,
  description TEXT,
  category TEXT,
  tier TEXT,
  icon TEXT,
  badge_color TEXT,
  credits_reward INTEGER,
  requirement_type TEXT,
  requirement_value INTEGER,
  current_progress INTEGER,
  progress_percentage INTEGER,
  is_completed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as achievement_id,
    a.name as achievement_name,
    a.description,
    a.category,
    a.tier,
    a.icon,
    a.badge_color,
    a.credits_reward,
    a.requirement_type,
    a.requirement_value,
    0 as current_progress,  -- Simplified for now
    0 as progress_percentage,
    FALSE as is_completed   -- Simplified for now
  FROM achievements a
  WHERE a.is_active = TRUE
  ORDER BY a.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert a few basic achievements to prevent empty results
INSERT INTO achievements (name, description, category, tier, icon, requirement_type, requirement_value, credits_reward, display_order)
VALUES 
('First Steps', 'Create your first story', 'story_creation', 'novice', 'book-open', 'stories_created', 1, 5, 1),
('Getting Started', 'Create 3 stories', 'story_creation', 'novice', 'edit', 'stories_created', 3, 10, 2),
('Storyteller', 'Create 10 stories', 'story_creation', 'intermediate', 'book', 'stories_created', 10, 25, 3)
ON CONFLICT (name) DO NOTHING;