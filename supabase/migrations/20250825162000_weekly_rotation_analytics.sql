-- Weekly Rotation & Analytics System Migration
-- Creates automated template rotation and comprehensive analytics tracking

-- System Events Table (for logging major system activities)
CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for system_events
CREATE INDEX idx_system_events_type ON system_events(event_type);
CREATE INDEX idx_system_events_created ON system_events(created_at DESC);

-- Template Analytics Table (detailed analytics per template)
CREATE TABLE IF NOT EXISTS template_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES user_story_templates(id) ON DELETE CASCADE,
  
  -- Daily metrics
  date DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  uses_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Engagement metrics
  avg_time_to_use INTERVAL,
  completion_rate DECIMAL(5,2) DEFAULT 0.0, -- Percentage of users who complete stories from this template
  
  -- Quality metrics
  rating_average DECIMAL(3,2) DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, date)
);

-- Enable RLS
ALTER TABLE template_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_analytics (read-only for creators, full access for admins)
CREATE POLICY "Template creators can view own analytics" ON template_analytics
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM user_story_templates WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all analytics" ON template_analytics
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Indexes for template_analytics
CREATE INDEX idx_template_analytics_template_date ON template_analytics(template_id, date DESC);
CREATE INDEX idx_template_analytics_date ON template_analytics(date DESC);
CREATE INDEX idx_template_analytics_performance ON template_analytics(uses_count DESC, likes_count DESC);

-- Weekly Template Rotation Log
CREATE TABLE IF NOT EXISTS weekly_rotation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rotation_week DATE NOT NULL, -- Start of the week (Monday)
  template_id UUID REFERENCES user_story_templates(id) ON DELETE CASCADE,
  rotation_position INTEGER NOT NULL, -- 1-6 for featured positions
  popularity_score DECIMAL(10,2) DEFAULT 0,
  credits_awarded INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rotation_week, template_id)
);

-- Indexes for weekly_rotation_log
CREATE INDEX idx_rotation_log_week ON weekly_rotation_log(rotation_week DESC);
CREATE INDEX idx_rotation_log_template ON weekly_rotation_log(template_id);

-- Function to calculate template popularity score (enhanced)
CREATE OR REPLACE FUNCTION calculate_template_popularity_score(template_id UUID, analysis_period INTERVAL DEFAULT INTERVAL '7 days')
RETURNS DECIMAL(10,2) AS $$
DECLARE
  score DECIMAL(10,2) := 0;
  template_record RECORD;
  recent_analytics RECORD;
  
  -- Scoring weights
  likes_weight DECIMAL(3,2) := 2.0;
  usage_weight DECIMAL(3,2) := 3.0;
  saves_weight DECIMAL(3,2) := 1.5;
  recency_weight DECIMAL(3,2) := 1.2;
  rating_weight DECIMAL(3,2) := 2.5;
  engagement_weight DECIMAL(3,2) := 1.8;
  creator_tier_bonus DECIMAL(3,2) := 1.0;
BEGIN
  -- Get template basic info
  SELECT * INTO template_record
  FROM user_story_templates 
  WHERE id = template_id;
  
  IF template_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Get recent analytics data
  SELECT 
    COALESCE(SUM(uses_count), 0) as recent_uses,
    COALESCE(SUM(likes_count), 0) as recent_likes,
    COALESCE(SUM(saves_count), 0) as recent_saves,
    COALESCE(AVG(rating_average), 0) as avg_rating,
    COALESCE(SUM(views_count), 0) as recent_views
  INTO recent_analytics
  FROM template_analytics 
  WHERE template_id = template_id 
    AND date >= CURRENT_DATE - analysis_period;
  
  -- Calculate base score
  score := 
    -- All-time metrics (40% weight)
    (COALESCE(template_record.likes_count, 0) * likes_weight * 0.4) +
    (COALESCE(template_record.usage_count, 0) * usage_weight * 0.4) +
    (COALESCE(template_record.saves_count, 0) * saves_weight * 0.4) +
    (COALESCE(template_record.rating_average, 0) * rating_weight * 0.4) +
    
    -- Recent metrics (60% weight)
    (COALESCE(recent_analytics.recent_likes, 0) * likes_weight * 0.6) +
    (COALESCE(recent_analytics.recent_uses, 0) * usage_weight * 0.6) +
    (COALESCE(recent_analytics.recent_saves, 0) * saves_weight * 0.6) +
    (COALESCE(recent_analytics.avg_rating, 0) * rating_weight * 0.6);
  
  -- Recency bonus (boost for newer templates)
  IF template_record.created_at > NOW() - INTERVAL '30 days' THEN
    score := score + (15 * recency_weight);
  ELSIF template_record.created_at > NOW() - INTERVAL '90 days' THEN
    score := score + (8 * recency_weight);
  ELSIF template_record.created_at > NOW() - INTERVAL '180 days' THEN
    score := score + (3 * recency_weight);
  END IF;
  
  -- Engagement bonus (based on usage rate vs views)
  IF recent_analytics.recent_views > 0 THEN
    score := score + ((recent_analytics.recent_uses::DECIMAL / recent_analytics.recent_views) * engagement_weight * 10);
  END IF;
  
  -- Creator tier bonus
  CASE template_record.creator_tier
    WHEN 'creator' THEN score := score * (1 + creator_tier_bonus * 0.1);
    WHEN 'master' THEN score := score * (1 + creator_tier_bonus * 0.2);
    ELSE NULL;
  END CASE;
  
  -- Penalty for templates that haven't been used recently
  IF template_record.last_used_at IS NULL OR template_record.last_used_at < NOW() - INTERVAL '30 days' THEN
    score := score * 0.8;
  END IF;
  
  -- Ensure minimum score for quality templates
  IF template_record.rating_average >= 4.0 AND template_record.usage_count >= 10 THEN
    score := GREATEST(score, 10.0);
  END IF;
  
  RETURN GREATEST(score, 0);
END;
$$ LANGUAGE plpgsql;

-- Enhanced weekly rotation function
CREATE OR REPLACE FUNCTION rotate_featured_templates(rotation_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  template_id UUID,
  template_title TEXT,
  creator_name TEXT,
  popularity_score DECIMAL(10,2),
  rotation_position INTEGER
) AS $$
DECLARE
  template_record RECORD;
  rotation_week DATE;
  position_counter INTEGER := 1;
BEGIN
  -- Calculate the start of the week (Monday)
  rotation_week := DATE_TRUNC('week', rotation_date)::DATE;
  
  -- Reset all featured flags
  UPDATE user_story_templates SET is_featured = FALSE, featured_at = NULL;
  
  -- Select top templates by popularity score
  FOR template_record IN
    SELECT 
      ust.id,
      ust.title,
      ust.creator_id,
      up.full_name as creator_name,
      calculate_template_popularity_score(ust.id) as score
    FROM user_story_templates ust
    LEFT JOIN user_profiles up ON up.id = ust.creator_id
    WHERE ust.is_public = TRUE 
      AND ust.is_approved = TRUE
      -- Exclude templates that were featured in the last 4 weeks
      AND ust.id NOT IN (
        SELECT template_id FROM weekly_rotation_log 
        WHERE rotation_week >= rotation_date - INTERVAL '4 weeks'
      )
    ORDER BY score DESC 
    LIMIT 6
  LOOP
    -- Set as featured
    UPDATE user_story_templates 
    SET is_featured = TRUE, featured_at = NOW()
    WHERE id = template_record.id;
    
    -- Log the rotation
    INSERT INTO weekly_rotation_log (
      rotation_week,
      template_id,
      rotation_position,
      popularity_score,
      credits_awarded
    ) VALUES (
      rotation_week,
      template_record.id,
      position_counter,
      template_record.score,
      40 -- Base credits for being featured
    );
    
    -- Award credits to template creator
    INSERT INTO credit_transactions (
      user_id, 
      transaction_type, 
      amount, 
      description, 
      reference_id,
      reference_type,
      metadata
    ) VALUES (
      template_record.creator_id,
      'template_featured',
      40,
      'Template featured in weekly rotation: ' || template_record.title,
      template_record.id::text,
      'template',
      jsonb_build_object(
        'rotation_week', rotation_week,
        'position', position_counter,
        'popularity_score', template_record.score
      )
    );
    
    -- Update user progress stats
    UPDATE user_progress_stats 
    SET credits_earned_from_templates = credits_earned_from_templates + 40
    WHERE user_id = template_record.creator_id;
    
    -- Return data for logging
    template_id := template_record.id;
    template_title := template_record.title;
    creator_name := template_record.creator_name;
    popularity_score := template_record.score;
    rotation_position := position_counter;
    
    RETURN NEXT;
    
    position_counter := position_counter + 1;
  END LOOP;
  
  -- Log the rotation event
  INSERT INTO system_events (event_type, event_data)
  VALUES ('weekly_template_rotation', jsonb_build_object(
    'rotation_week', rotation_week,
    'rotation_date', rotation_date,
    'featured_count', position_counter - 1,
    'total_credits_awarded', (position_counter - 1) * 40
  ));
  
  -- Update template analytics for featured templates
  INSERT INTO template_analytics (template_id, date, views_count)
  SELECT id, CURRENT_DATE, 0
  FROM user_story_templates 
  WHERE is_featured = TRUE
  ON CONFLICT (template_id, date) DO NOTHING;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update template analytics
CREATE OR REPLACE FUNCTION update_template_analytics(
  template_uuid UUID,
  event_type TEXT,
  user_uuid UUID DEFAULT NULL
) RETURNS void AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Ensure analytics record exists for today
  INSERT INTO template_analytics (template_id, date)
  VALUES (template_uuid, today_date)
  ON CONFLICT (template_id, date) DO NOTHING;
  
  -- Update the specific metric
  CASE event_type
    WHEN 'view' THEN
      UPDATE template_analytics SET
        views_count = views_count + 1,
        unique_viewers = CASE 
          WHEN user_uuid IS NOT NULL THEN unique_viewers + 1
          ELSE unique_viewers
        END
      WHERE template_id = template_uuid AND date = today_date;
      
    WHEN 'use' THEN
      UPDATE template_analytics SET
        uses_count = uses_count + 1,
        unique_users = CASE 
          WHEN user_uuid IS NOT NULL THEN unique_users + 1
          ELSE unique_users
        END
      WHERE template_id = template_uuid AND date = today_date;
      
    WHEN 'like' THEN
      UPDATE template_analytics SET
        likes_count = likes_count + 1
      WHERE template_id = template_uuid AND date = today_date;
      
    WHEN 'save' THEN
      UPDATE template_analytics SET
        saves_count = saves_count + 1
      WHERE template_id = template_uuid AND date = today_date;
      
    WHEN 'share' THEN
      UPDATE template_analytics SET
        shares_count = shares_count + 1
      WHERE template_id = template_uuid AND date = today_date;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get template performance metrics
CREATE OR REPLACE FUNCTION get_template_performance_summary(
  template_uuid UUID,
  days_back INTEGER DEFAULT 30
) RETURNS TABLE(
  total_views INTEGER,
  total_uses INTEGER,
  total_likes INTEGER,
  total_saves INTEGER,
  avg_daily_views DECIMAL(8,2),
  avg_daily_uses DECIMAL(8,2),
  conversion_rate DECIMAL(5,2),
  engagement_score DECIMAL(8,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(ta.views_count), 0)::INTEGER as total_views,
    COALESCE(SUM(ta.uses_count), 0)::INTEGER as total_uses,
    COALESCE(SUM(ta.likes_count), 0)::INTEGER as total_likes,
    COALESCE(SUM(ta.saves_count), 0)::INTEGER as total_saves,
    ROUND(COALESCE(AVG(ta.views_count), 0), 2) as avg_daily_views,
    ROUND(COALESCE(AVG(ta.uses_count), 0), 2) as avg_daily_uses,
    ROUND(
      CASE 
        WHEN SUM(ta.views_count) > 0 
        THEN (SUM(ta.uses_count)::DECIMAL / SUM(ta.views_count)) * 100
        ELSE 0
      END, 2
    ) as conversion_rate,
    ROUND(
      (COALESCE(SUM(ta.uses_count), 0) * 3 + 
       COALESCE(SUM(ta.likes_count), 0) * 2 + 
       COALESCE(SUM(ta.saves_count), 0) * 1.5)::DECIMAL, 2
    ) as engagement_score
  FROM template_analytics ta
  WHERE ta.template_id = template_uuid
    AND ta.date >= CURRENT_DATE - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy template popularity ranking
CREATE OR REPLACE VIEW template_popularity_rankings AS
SELECT 
  ust.id,
  ust.title,
  ust.creator_id,
  up.full_name as creator_name,
  ust.genre,
  ust.age_group,
  ust.usage_count,
  ust.likes_count,
  ust.saves_count,
  ust.rating_average,
  ust.created_at,
  calculate_template_popularity_score(ust.id) as popularity_score,
  RANK() OVER (ORDER BY calculate_template_popularity_score(ust.id) DESC) as popularity_rank
FROM user_story_templates ust
LEFT JOIN user_profiles up ON up.id = ust.creator_id
WHERE ust.is_public = TRUE AND ust.is_approved = TRUE;

COMMENT ON TABLE template_analytics IS 'Daily analytics tracking for user-generated templates';
COMMENT ON TABLE weekly_rotation_log IS 'Historical log of weekly template rotations and featured content';
COMMENT ON VIEW template_popularity_rankings IS 'Real-time ranking of templates by popularity score';