-- Achievement & Gamification System Migration
-- Creates comprehensive achievement tracking and reward system

-- Achievements Master Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('story_creation', 'template_creation', 'social_engagement', 'special_events', 'milestones')),
  tier TEXT NOT NULL CHECK (tier IN ('novice', 'intermediate', 'advanced', 'master', 'legendary')),
  
  -- Visual Elements
  icon TEXT NOT NULL, -- Lucide icon name
  badge_color TEXT DEFAULT '#fbbf24', -- Hex color for badge
  
  -- Requirements
  requirement_type TEXT NOT NULL, -- stories_created, templates_shared, likes_received, etc.
  requirement_value INTEGER NOT NULL,
  requirement_timeframe TEXT CHECK (requirement_timeframe IN ('daily', 'weekly', 'monthly', 'all_time')),
  
  -- Rewards
  credits_reward INTEGER DEFAULT 0,
  
  -- Restrictions & Settings
  tier_required TEXT DEFAULT 'free' CHECK (tier_required IN ('free', 'creator', 'master')),
  is_active BOOLEAN DEFAULT TRUE,
  is_repeatable BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE, -- Hidden until earned
  
  -- Ordering & Display
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Indexes for achievements
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_tier ON achievements(tier);
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_achievements_display_order ON achievements(display_order);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Achievement Details
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  credits_earned INTEGER DEFAULT 0,
  progress_when_earned INTEGER DEFAULT 0,
  
  -- Tracking
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT FALSE,
  
  -- For repeatable achievements, track which period
  period_identifier TEXT, -- e.g., '2025-W10' for weekly achievements
  
  UNIQUE(user_id, achievement_id, period_identifier) -- Allow repeatable achievements per period
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create user achievements" ON user_achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own achievement claims" ON user_achievements
  FOR UPDATE USING (user_id = auth.uid());

-- Indexes for user_achievements
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned ON user_achievements(earned_at DESC);
CREATE INDEX idx_user_achievements_unclaimed ON user_achievements(user_id) WHERE is_claimed = FALSE;

-- RLS Policies for achievements (moved here after user_achievements table exists)
CREATE POLICY "All users can view active achievements" ON achievements
  FOR SELECT USING (is_active = TRUE AND (is_hidden = FALSE OR id IN (
    SELECT achievement_id FROM user_achievements WHERE user_id = auth.uid()
  )));

-- Goal Tracking System
CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal Definition
  goal_type TEXT NOT NULL CHECK (goal_type IN (
    'daily_story', 'daily_engagement', 'daily_template_interaction',
    'weekly_stories', 'weekly_engagement', 'weekly_template_creation',
    'monthly_challenge', 'monthly_social_activity'
  )),
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  
  -- Time Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_identifier TEXT NOT NULL, -- e.g., '2025-01-15' for daily, '2025-W03' for weekly
  
  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Rewards
  credits_reward INTEGER DEFAULT 0,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, goal_type, period_identifier)
);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_goals
CREATE POLICY "Users can view own goals" ON user_goals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage user goals" ON user_goals
  FOR ALL USING (user_id = auth.uid());

-- Indexes for user_goals
CREATE INDEX idx_user_goals_user_active ON user_goals(user_id, period_end) WHERE completed = FALSE;
CREATE INDEX idx_user_goals_period ON user_goals(period_start, period_end);
CREATE INDEX idx_user_goals_type_period ON user_goals(goal_type, period_identifier);

-- User Progress Statistics Table
CREATE TABLE IF NOT EXISTS user_progress_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Story Creation Stats
  stories_created_total INTEGER DEFAULT 0,
  stories_created_this_month INTEGER DEFAULT 0,
  stories_created_this_week INTEGER DEFAULT 0,
  stories_created_today INTEGER DEFAULT 0,
  
  -- Template Stats
  templates_created_total INTEGER DEFAULT 0,
  templates_public_total INTEGER DEFAULT 0,
  template_usage_received_total INTEGER DEFAULT 0,
  template_likes_received_total INTEGER DEFAULT 0,
  
  -- Social Stats
  likes_given_total INTEGER DEFAULT 0,
  likes_received_total INTEGER DEFAULT 0,
  templates_saved_total INTEGER DEFAULT 0,
  reviews_written_total INTEGER DEFAULT 0,
  helpful_votes_received INTEGER DEFAULT 0,
  
  -- Engagement Stats
  login_streak_current INTEGER DEFAULT 0,
  login_streak_best INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  last_story_date DATE,
  last_template_date DATE,
  
  -- Credit Stats
  credits_earned_from_social INTEGER DEFAULT 0,
  credits_earned_from_templates INTEGER DEFAULT 0,
  credits_earned_from_achievements INTEGER DEFAULT 0,
  credits_earned_from_goals INTEGER DEFAULT 0,
  
  -- Monthly reset fields (reset on 1st of each month)
  monthly_reset_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  weekly_reset_date DATE DEFAULT DATE_TRUNC('week', CURRENT_DATE),
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_progress_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_progress_stats
CREATE POLICY "Users can view own progress stats" ON user_progress_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress stats" ON user_progress_stats
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create progress stats" ON user_progress_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to initialize user progress stats
CREATE OR REPLACE FUNCTION initialize_user_progress_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create progress stats for new users
CREATE TRIGGER trigger_initialize_user_progress_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_progress_stats();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(user_uuid UUID, achievement_type TEXT, current_value INTEGER DEFAULT NULL)
RETURNS void AS $$
DECLARE
  achievement_record RECORD;
  user_tier TEXT;
  period_id TEXT;
BEGIN
  -- Get user's current tier
  SELECT COALESCE(
    (SELECT tier FROM user_subscriptions WHERE user_id = user_uuid AND status = 'active' ORDER BY created_at DESC LIMIT 1),
    'free'
  ) INTO user_tier;
  
  -- Generate period identifier for repeatable achievements
  period_id := CASE 
    WHEN achievement_type LIKE '%daily%' THEN CURRENT_DATE::text
    WHEN achievement_type LIKE '%weekly%' THEN TO_CHAR(CURRENT_DATE, 'IYYY-IW')
    WHEN achievement_type LIKE '%monthly%' THEN TO_CHAR(CURRENT_DATE, 'YYYY-MM')
    ELSE NULL
  END;
  
  -- Check all relevant achievements
  FOR achievement_record IN
    SELECT a.*, ups.* 
    FROM achievements a, user_progress_stats ups
    WHERE a.is_active = TRUE
      AND a.requirement_type = achievement_type
      AND ups.user_id = user_uuid
      AND (a.tier_required = 'free' OR a.tier_required = user_tier OR 
           (user_tier = 'creator' AND a.tier_required IN ('free')) OR
           (user_tier = 'master' AND a.tier_required IN ('free', 'creator')))
      -- Check if user hasn't already earned this achievement
      AND NOT EXISTS (
        SELECT 1 FROM user_achievements ua 
        WHERE ua.user_id = user_uuid 
          AND ua.achievement_id = a.id 
          AND (NOT a.is_repeatable OR ua.period_identifier = period_id)
      )
  LOOP
    -- Check if requirement is met
    DECLARE
      meets_requirement BOOLEAN := FALSE;
      progress_value INTEGER := 0;
    BEGIN
      -- Get the current progress value based on achievement type
      CASE achievement_record.requirement_type
        WHEN 'stories_created' THEN progress_value := achievement_record.stories_created_total;
        WHEN 'templates_created' THEN progress_value := achievement_record.templates_created_total;
        WHEN 'templates_shared' THEN progress_value := achievement_record.templates_public_total;
        WHEN 'likes_received' THEN progress_value := achievement_record.likes_received_total;
        WHEN 'template_uses_received' THEN progress_value := achievement_record.template_usage_received_total;
        WHEN 'social_engagement' THEN progress_value := achievement_record.likes_given_total;
        WHEN 'login_streak' THEN progress_value := achievement_record.login_streak_current;
        ELSE progress_value := COALESCE(current_value, 0);
      END CASE;
      
      meets_requirement := progress_value >= achievement_record.requirement_value;
      
      IF meets_requirement THEN
        -- Award the achievement
        INSERT INTO user_achievements (
          user_id,
          achievement_id,
          credits_earned,
          progress_when_earned,
          period_identifier
        ) VALUES (
          user_uuid,
          achievement_record.id,
          achievement_record.credits_reward,
          progress_value,
          period_id
        );
        
        -- Award credits if any
        IF achievement_record.credits_reward > 0 THEN
          INSERT INTO credit_transactions (
            user_id,
            transaction_type,
            amount,
            description,
            reference_id,
            reference_type
          ) VALUES (
            user_uuid,
            'achievement',
            achievement_record.credits_reward,
            'Achievement earned: ' || achievement_record.name,
            achievement_record.id::text,
            'achievement'
          );
          
          -- Update progress stats
          UPDATE user_progress_stats 
          SET credits_earned_from_achievements = credits_earned_from_achievements + achievement_record.credits_reward
          WHERE user_id = user_uuid;
        END IF;
      END IF;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user progress stats
CREATE OR REPLACE FUNCTION update_user_progress_stats(
  user_uuid UUID,
  stat_type TEXT,
  increment_value INTEGER DEFAULT 1
) RETURNS void AS $$
DECLARE
  current_date_val DATE := CURRENT_DATE;
  current_month DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  current_week DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
BEGIN
  -- Ensure user has progress stats record
  INSERT INTO user_progress_stats (user_id) 
  VALUES (user_uuid) 
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update the specific stat
  CASE stat_type
    WHEN 'story_created' THEN
      UPDATE user_progress_stats SET
        stories_created_total = stories_created_total + increment_value,
        stories_created_this_month = CASE 
          WHEN monthly_reset_date < current_month THEN increment_value
          ELSE stories_created_this_month + increment_value
        END,
        stories_created_this_week = CASE 
          WHEN weekly_reset_date < current_week THEN increment_value
          ELSE stories_created_this_week + increment_value
        END,
        stories_created_today = CASE 
          WHEN last_activity_date < current_date_val THEN increment_value
          ELSE stories_created_today + increment_value
        END,
        last_story_date = current_date_val,
        last_activity_date = current_date_val,
        monthly_reset_date = current_month,
        weekly_reset_date = current_week,
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'template_created' THEN
      UPDATE user_progress_stats SET
        templates_created_total = templates_created_total + increment_value,
        last_template_date = current_date_val,
        last_activity_date = current_date_val,
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'template_made_public' THEN
      UPDATE user_progress_stats SET
        templates_public_total = templates_public_total + increment_value,
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'like_given' THEN
      UPDATE user_progress_stats SET
        likes_given_total = likes_given_total + increment_value,
        last_activity_date = current_date_val,
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'like_received' THEN
      UPDATE user_progress_stats SET
        likes_received_total = likes_received_total + increment_value,
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'template_usage_received' THEN
      UPDATE user_progress_stats SET
        template_usage_received_total = template_usage_received_total + increment_value,
        updated_at = NOW()
      WHERE user_id = user_uuid;
      
    WHEN 'template_saved' THEN
      UPDATE user_progress_stats SET
        templates_saved_total = templates_saved_total + increment_value,
        last_activity_date = current_date_val,
        updated_at = NOW()
      WHERE user_id = user_uuid;
  END CASE;
  
  -- Check for achievements after updating stats
  PERFORM check_and_award_achievements(user_uuid, stat_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create daily goals for users
CREATE OR REPLACE FUNCTION create_daily_goals(user_uuid UUID, goal_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
  period_id TEXT := goal_date::text;
BEGIN
  -- Daily story creation goal
  INSERT INTO user_goals (
    user_id, goal_type, target_value, period_start, period_end, period_identifier, credits_reward
  ) VALUES (
    user_uuid, 'daily_story', 1, goal_date, goal_date, period_id, 2
  ) ON CONFLICT (user_id, goal_type, period_identifier) DO NOTHING;
  
  -- Daily engagement goal
  INSERT INTO user_goals (
    user_id, goal_type, target_value, period_start, period_end, period_identifier, credits_reward
  ) VALUES (
    user_uuid, 'daily_engagement', 3, goal_date, goal_date, period_id, 1
  ) ON CONFLICT (user_id, goal_type, period_identifier) DO NOTHING;
  
  -- Daily template interaction goal
  INSERT INTO user_goals (
    user_id, goal_type, target_value, period_start, period_end, period_identifier, credits_reward
  ) VALUES (
    user_uuid, 'daily_template_interaction', 2, goal_date, goal_date, period_id, 1
  ) ON CONFLICT (user_id, goal_type, period_identifier) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create weekly goals for users
CREATE OR REPLACE FUNCTION create_weekly_goals(user_uuid UUID, week_start DATE DEFAULT DATE_TRUNC('week', CURRENT_DATE)::DATE)
RETURNS void AS $$
DECLARE
  week_end DATE := week_start + INTERVAL '6 days';
  period_id TEXT := TO_CHAR(week_start, 'IYYY-IW');
BEGIN
  -- Weekly story creation goal
  INSERT INTO user_goals (
    user_id, goal_type, target_value, period_start, period_end, period_identifier, credits_reward
  ) VALUES (
    user_uuid, 'weekly_stories', 5, week_start, week_end, period_id, 15
  ) ON CONFLICT (user_id, goal_type, period_identifier) DO NOTHING;
  
  -- Weekly template creation goal
  INSERT INTO user_goals (
    user_id, goal_type, target_value, period_start, period_end, period_identifier, credits_reward
  ) VALUES (
    user_uuid, 'weekly_template_creation', 2, week_start, week_end, period_id, 10
  ) ON CONFLICT (user_id, goal_type, period_identifier) DO NOTHING;
  
  -- Weekly engagement goal
  INSERT INTO user_goals (
    user_id, goal_type, target_value, period_start, period_end, period_identifier, credits_reward
  ) VALUES (
    user_uuid, 'weekly_engagement', 20, week_start, week_end, period_id, 20
  ) ON CONFLICT (user_id, goal_type, period_identifier) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE achievements IS 'Master list of available achievements in the gamification system';
COMMENT ON TABLE user_achievements IS 'Tracks achievements earned by users with timestamps and rewards';
COMMENT ON TABLE user_goals IS 'Daily, weekly, and monthly goals for users with progress tracking';
COMMENT ON TABLE user_progress_stats IS 'Comprehensive statistics tracking for each user across all activities';