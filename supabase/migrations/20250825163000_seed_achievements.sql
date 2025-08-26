-- Seed Achievement Data
-- Populates the achievements table with the comprehensive gamification system

-- Story Creator Achievements
INSERT INTO achievements (name, description, category, tier, icon, badge_color, requirement_type, requirement_value, credits_reward, display_order) VALUES
-- Novice Tier
('First Steps', 'Create your very first story', 'story_creation', 'novice', 'book-open', '#10b981', 'stories_created', 1, 5, 1),
('Getting Started', 'Create 3 stories and begin your storytelling journey', 'story_creation', 'novice', 'edit', '#10b981', 'stories_created', 3, 10, 2),
('Finding Your Voice', 'Create 5 stories and discover your unique style', 'story_creation', 'novice', 'pen-tool', '#10b981', 'stories_created', 5, 15, 3),

-- Intermediate Tier
('Storyteller', 'Create 10 stories and earn the title of Storyteller', 'story_creation', 'intermediate', 'book', '#3b82f6', 'stories_created', 10, 25, 4),
('Chapter Master', 'Create 25 stories and master the art of chapters', 'story_creation', 'intermediate', 'layers', '#3b82f6', 'stories_created', 25, 40, 5),
('Narrative Builder', 'Create 50 stories and become a narrative architect', 'story_creation', 'intermediate', 'building', '#3b82f6', 'stories_created', 50, 75, 6),

-- Advanced Tier
('Master Narrator', 'Create 100 stories and join the ranks of master storytellers', 'story_creation', 'advanced', 'crown', '#8b5cf6', 'stories_created', 100, 150, 7),
('Story Architect', 'Create 250 stories and design entire story worlds', 'story_creation', 'advanced', 'home', '#8b5cf6', 'stories_created', 250, 300, 8),
('Legend of Tales', 'Create 500 stories and become a legend in storytelling', 'story_creation', 'legendary', 'star', '#f59e0b', 'stories_created', 500, 500, 9);

-- Template Creator Achievements
INSERT INTO achievements (name, description, category, tier, icon, badge_color, requirement_type, requirement_value, credits_reward, display_order) VALUES
-- Creator Tier
('Template Pioneer', 'Create your first story template', 'template_creation', 'novice', 'file-plus', '#10b981', 'templates_created', 1, 10, 10),
('Creative Mind', 'Create 5 templates and show your creativity', 'template_creation', 'novice', 'lightbulb', '#10b981', 'templates_created', 5, 25, 11),
('Template Architect', 'Create 15 templates and master template design', 'template_creation', 'intermediate', 'layout', '#3b82f6', 'templates_created', 15, 50, 12),

-- Community Tier
('Sharing is Caring', 'Share your first template with the community', 'template_creation', 'novice', 'share', '#10b981', 'templates_shared', 1, 15, 13),
('Community Builder', 'Share 5 templates and help build the community', 'template_creation', 'intermediate', 'users', '#3b82f6', 'templates_shared', 5, 40, 14),
('Template Library', 'Share 20 templates and create a personal library', 'template_creation', 'advanced', 'archive', '#8b5cf6', 'templates_shared', 20, 100, 15),

-- Impact Tier
('Popular Creator', 'Have your template used 50+ times by others', 'template_creation', 'intermediate', 'trending-up', '#3b82f6', 'template_uses_received', 50, 75, 16),
('Community Favorite', 'Have your template used 200+ times', 'template_creation', 'advanced', 'heart', '#8b5cf6', 'template_uses_received', 200, 150, 17),
('Template Master', 'Have your template used 1000+ times', 'template_creation', 'legendary', 'award', '#f59e0b', 'template_uses_received', 1000, 400, 18);

-- Social Engagement Achievements
INSERT INTO achievements (name, description, category, tier, icon, badge_color, requirement_type, requirement_value, credits_reward, display_order) VALUES
-- Engagement Tier
('Friendly Face', 'Like 50 templates and support fellow creators', 'social_engagement', 'novice', 'thumbs-up', '#10b981', 'likes_given', 50, 10, 19),
('Community Supporter', 'Like 200 templates and show community spirit', 'social_engagement', 'intermediate', 'hand-heart', '#3b82f6', 'likes_given', 200, 25, 20),
('Engagement Champion', 'Like 500 templates and champion community engagement', 'social_engagement', 'advanced', 'zap', '#8b5cf6', 'likes_given', 500, 60, 21),

-- Recognition Tier
('First Fan', 'Receive your first 10 likes from the community', 'social_engagement', 'novice', 'user-heart', '#10b981', 'likes_received', 10, 15, 22),
('Liked Creator', 'Receive 100 likes and gain popularity', 'social_engagement', 'intermediate', 'flame', '#3b82f6', 'likes_received', 100, 40, 23),
('Community Star', 'Receive 500 likes and become a community star', 'social_engagement', 'advanced', 'star', '#8b5cf6', 'likes_received', 500, 100, 24),

-- Influence Tier
('Helpful Reviewer', 'Write 25 helpful reviews for templates', 'social_engagement', 'intermediate', 'message-square', '#3b82f6', 'reviews_written', 25, 20, 25),
('Trusted Voice', 'Receive 50+ helpful votes on your reviews', 'social_engagement', 'advanced', 'check-circle', '#8b5cf6', 'helpful_votes_received', 50, 50, 26),
('Community Guide', 'Receive 200+ helpful votes and guide the community', 'social_engagement', 'legendary', 'compass', '#f59e0b', 'helpful_votes_received', 200, 120, 27);

-- Special & Milestone Achievements
INSERT INTO achievements (name, description, category, tier, icon, badge_color, requirement_type, requirement_value, credits_reward, is_repeatable, display_order) VALUES
-- Platform Milestones
('Welcome Aboard', 'Join the Tale-Forge community', 'milestones', 'novice', 'ship', '#10b981', 'account_created', 1, 10, FALSE, 28),
('Platform Veteran', 'Be a member for one full year', 'milestones', 'advanced', 'calendar', '#8b5cf6', 'days_member', 365, 75, FALSE, 29),
('Early Adopter', 'Join during the beta period', 'milestones', 'advanced', 'rocket', '#8b5cf6', 'beta_member', 1, 50, FALSE, 30),

-- Collaboration Achievements
('Template Explorer', 'Use 10 different templates from other creators', 'milestones', 'novice', 'compass', '#10b981', 'templates_used', 10, 20, FALSE, 31),
('Template Collaboration', 'Use 20 templates from other creators', 'milestones', 'intermediate', 'handshake', '#3b82f6', 'templates_used', 20, 30, FALSE, 32),
('Cross-Genre Explorer', 'Create stories in 5 different genres', 'milestones', 'intermediate', 'shuffle', '#3b82f6', 'genres_explored', 5, 40, FALSE, 33),
('Age Range Master', 'Create stories for all age groups', 'milestones', 'advanced', 'users', '#8b5cf6', 'age_groups_covered', 4, 60, FALSE, 34);

-- Seasonal Achievements (these will be activated seasonally)
INSERT INTO achievements (name, description, category, tier, icon, badge_color, requirement_type, requirement_value, credits_reward, is_active, requirement_timeframe, display_order) VALUES
('Halloween Master', 'Create a spooky story during October', 'special_events', 'intermediate', 'moon', '#f97316', 'seasonal_story_october', 1, 25, FALSE, 'monthly', 35),
('Holiday Spirit', 'Create a festive story during December', 'special_events', 'intermediate', 'gift', '#dc2626', 'seasonal_story_december', 1, 25, FALSE, 'monthly', 36),
('New Year, New Stories', 'Create 10 stories in January', 'special_events', 'intermediate', 'calendar-days', '#3b82f6', 'january_stories', 10, 50, FALSE, 'monthly', 37),
('Summer Adventure', 'Create an adventure story during summer', 'special_events', 'intermediate', 'sun', '#f59e0b', 'seasonal_story_summer', 1, 25, FALSE, 'monthly', 38),
('Spring Renewal', 'Create a nature story during spring', 'special_events', 'intermediate', 'flower', '#10b981', 'seasonal_story_spring', 1, 25, FALSE, 'monthly', 39);

-- Streak & Consistency Achievements
INSERT INTO achievements (name, description, category, tier, icon, badge_color, requirement_type, requirement_value, credits_reward, is_repeatable, requirement_timeframe, display_order) VALUES
('Daily Creator', 'Create a story every day for 7 days', 'milestones', 'intermediate', 'calendar-check', '#3b82f6', 'daily_story_streak', 7, 35, TRUE, 'weekly', 40),
('Consistent Creator', 'Create a story every day for 30 days', 'milestones', 'advanced', 'target', '#8b5cf6', 'daily_story_streak', 30, 100, TRUE, 'monthly', 41),
('Story Marathon', 'Create a story every day for 100 days', 'milestones', 'legendary', 'trophy', '#f59e0b', 'daily_story_streak', 100, 300, FALSE, 'all_time', 42);

-- Community Impact Achievements
INSERT INTO achievements (name, description, category, tier, icon, badge_color, requirement_type, requirement_value, credits_reward, display_order) VALUES
('Inspiration Spark', 'Your template inspires 10 different stories', 'template_creation', 'intermediate', 'spark', '#3b82f6', 'template_inspirations', 10, 50, 43),
('Creative Catalyst', 'Your templates inspire 100 different stories', 'template_creation', 'advanced', 'zap', '#8b5cf6', 'template_inspirations', 100, 150, 44),
('Community Cornerstone', 'Your templates inspire 500 different stories', 'template_creation', 'legendary', 'gem', '#f59e0b', 'template_inspirations', 500, 400, 45),

-- Quality & Excellence Achievements
('Quality Storyteller', 'Maintain 4+ star average rating across 10 stories', 'story_creation', 'intermediate', 'star-half', '#3b82f6', 'story_quality_rating', 4, 30, 46),
('Excellence Master', 'Maintain 4.5+ star average rating across 25 stories', 'story_creation', 'advanced', 'badge-check', '#8b5cf6', 'story_quality_rating', 45, 75, 47),
('Perfectionist', 'Maintain 5 star average rating across 50 stories', 'story_creation', 'legendary', 'crown', '#f59e0b', 'story_quality_rating', 50, 200, 48);

COMMENT ON TABLE achievements IS 'Master achievements for the Tale-Forge gamification system with comprehensive reward structure';

-- Create index for efficient achievement queries
CREATE INDEX IF NOT EXISTS idx_achievements_requirement_type ON achievements(requirement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_tier_category ON achievements(tier, category);
CREATE INDEX IF NOT EXISTS idx_achievements_credits_reward ON achievements(credits_reward DESC);

-- Function to get user's available achievements (achievements they can work towards)
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
DECLARE
  user_tier TEXT;
  user_stats RECORD;
BEGIN
  -- Get user's subscription tier
  SELECT COALESCE(
    (SELECT tier FROM user_subscriptions WHERE user_id = user_uuid AND status = 'active' ORDER BY created_at DESC LIMIT 1),
    'free'
  ) INTO user_tier;
  
  -- Get user's progress stats
  SELECT * INTO user_stats
  FROM user_progress_stats 
  WHERE user_id = user_uuid;
  
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
    CASE a.requirement_type
      WHEN 'stories_created' THEN COALESCE(user_stats.stories_created_total, 0)
      WHEN 'templates_created' THEN COALESCE(user_stats.templates_created_total, 0)
      WHEN 'templates_shared' THEN COALESCE(user_stats.templates_public_total, 0)
      WHEN 'likes_received' THEN COALESCE(user_stats.likes_received_total, 0)
      WHEN 'likes_given' THEN COALESCE(user_stats.likes_given_total, 0)
      WHEN 'template_uses_received' THEN COALESCE(user_stats.template_usage_received_total, 0)
      ELSE 0
    END as current_progress,
    LEAST(100, 
      CASE 
        WHEN a.requirement_value = 0 THEN 100
        ELSE (
          CASE a.requirement_type
            WHEN 'stories_created' THEN COALESCE(user_stats.stories_created_total, 0)
            WHEN 'templates_created' THEN COALESCE(user_stats.templates_created_total, 0)
            WHEN 'templates_shared' THEN COALESCE(user_stats.templates_public_total, 0)
            WHEN 'likes_received' THEN COALESCE(user_stats.likes_received_total, 0)
            WHEN 'likes_given' THEN COALESCE(user_stats.likes_given_total, 0)
            WHEN 'template_uses_received' THEN COALESCE(user_stats.template_usage_received_total, 0)
            ELSE 0
          END * 100 / a.requirement_value
        )
      END
    ) as progress_percentage,
    EXISTS(
      SELECT 1 FROM user_achievements ua 
      WHERE ua.user_id = user_uuid AND ua.achievement_id = a.id
    ) as is_completed
  FROM achievements a
  WHERE a.is_active = TRUE
    AND (a.tier_required = 'free' OR a.tier_required = user_tier OR 
         (user_tier = 'creator' AND a.tier_required IN ('free')) OR
         (user_tier = 'master' AND a.tier_required IN ('free', 'creator')))
  ORDER BY a.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;