-- User-Generated Template System Migration
-- Creates tables for user-created story templates with full gamification support

-- User Story Templates Table
CREATE TABLE IF NOT EXISTS user_story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('3-5', '6-8', '9-12', '13+')),
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Template Content (JSON structures)
  characters JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '[]'::jsonb,
  plot_elements JSONB DEFAULT '[]'::jsonb,
  story_hooks JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  estimated_chapters INTEGER DEFAULT 3,
  estimated_word_count INTEGER DEFAULT 500,
  tags TEXT[] DEFAULT '{}',
  
  -- Visibility & Status
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  
  -- Analytics
  usage_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.0,
  
  -- Creator Info
  creator_tier TEXT DEFAULT 'free' CHECK (creator_tier IN ('free', 'creator', 'master')),
  credits_earned INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  featured_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE user_story_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_story_templates
CREATE POLICY "Users can view public templates" ON user_story_templates
  FOR SELECT USING (is_public = TRUE OR creator_id = auth.uid());

CREATE POLICY "Users can view own templates" ON user_story_templates
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Users can create templates" ON user_story_templates
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update own templates" ON user_story_templates
  FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "Users can delete own templates" ON user_story_templates
  FOR DELETE USING (creator_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_user_templates_creator ON user_story_templates(creator_id);
CREATE INDEX idx_user_templates_public ON user_story_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_user_templates_featured ON user_story_templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_user_templates_genre ON user_story_templates(genre);
CREATE INDEX idx_user_templates_popularity ON user_story_templates(likes_count DESC, usage_count DESC);
CREATE INDEX idx_user_templates_created ON user_story_templates(created_at DESC);
CREATE INDEX idx_user_templates_tags ON user_story_templates USING GIN(tags);

-- Template Usage Logs Table
CREATE TABLE IF NOT EXISTS template_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES user_story_templates(id) ON DELETE CASCADE,
  template_creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  
  -- Reward Tracking
  credits_awarded INTEGER DEFAULT 0,
  award_processed BOOLEAN DEFAULT FALSE,
  
  -- Usage Context
  usage_type TEXT DEFAULT 'story_creation' CHECK (usage_type IN ('story_creation', 'template_copy', 'inspiration')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE template_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_usage_logs
CREATE POLICY "Users can view own usage logs" ON template_usage_logs
  FOR SELECT USING (user_id = auth.uid() OR template_creator_id = auth.uid());

CREATE POLICY "System can create usage logs" ON template_usage_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Indexes for template_usage_logs
CREATE INDEX idx_template_usage_template ON template_usage_logs(template_id);
CREATE INDEX idx_template_usage_creator ON template_usage_logs(template_creator_id);
CREATE INDEX idx_template_usage_user ON template_usage_logs(user_id);
CREATE INDEX idx_template_usage_awards ON template_usage_logs(award_processed) WHERE award_processed = FALSE;
CREATE INDEX idx_template_usage_created ON template_usage_logs(created_at DESC);

-- Template Likes Table (for social engagement)
CREATE TABLE IF NOT EXISTS template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES user_story_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Enable RLS
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_likes
CREATE POLICY "Users can view all likes" ON template_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like templates" ON template_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike templates" ON template_likes
  FOR DELETE USING (user_id = auth.uid());

-- Indexes for template_likes
CREATE INDEX idx_template_likes_template ON template_likes(template_id);
CREATE INDEX idx_template_likes_user ON template_likes(user_id);

-- Template Saves Table (bookmarking)
CREATE TABLE IF NOT EXISTS template_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES user_story_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- Enable RLS
ALTER TABLE template_saves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for template_saves
CREATE POLICY "Users can view own saves" ON template_saves
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can save templates" ON template_saves
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unsave templates" ON template_saves
  FOR DELETE USING (user_id = auth.uid());

-- Indexes for template_saves
CREATE INDEX idx_template_saves_template ON template_saves(template_id);
CREATE INDEX idx_template_saves_user ON template_saves(user_id);

-- Functions for updating counts

-- Update template likes count
CREATE OR REPLACE FUNCTION update_template_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_story_templates 
    SET likes_count = likes_count + 1
    WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_story_templates 
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.template_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update template saves count
CREATE OR REPLACE FUNCTION update_template_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_story_templates 
    SET saves_count = saves_count + 1
    WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_story_templates 
    SET saves_count = GREATEST(saves_count - 1, 0)
    WHERE id = OLD.template_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update template usage count
CREATE OR REPLACE FUNCTION update_template_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_story_templates 
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for count updates
CREATE TRIGGER trigger_update_template_likes_count
  AFTER INSERT OR DELETE ON template_likes
  FOR EACH ROW EXECUTE FUNCTION update_template_likes_count();

CREATE TRIGGER trigger_update_template_saves_count
  AFTER INSERT OR DELETE ON template_saves
  FOR EACH ROW EXECUTE FUNCTION update_template_saves_count();

CREATE TRIGGER trigger_update_template_usage_count
  AFTER INSERT ON template_usage_logs
  FOR EACH ROW EXECUTE FUNCTION update_template_usage_count();

-- Function to award credits for template usage
CREATE OR REPLACE FUNCTION award_template_usage_credits()
RETURNS TRIGGER AS $$
DECLARE
  creator_credits INTEGER := 2; -- Base credits per usage
BEGIN
  -- Only award credits if not already processed and user is not the creator
  IF NOT NEW.award_processed AND NEW.user_id != NEW.template_creator_id THEN
    -- Insert credit transaction for template creator
    INSERT INTO credit_transactions (
      user_id, 
      transaction_type, 
      amount, 
      description, 
      reference_id,
      reference_type,
      metadata
    ) VALUES (
      NEW.template_creator_id,
      'template_usage',
      creator_credits,
      'Credits earned from template usage',
      NEW.template_id::text,
      'template',
      jsonb_build_object(
        'used_by', NEW.user_id,
        'usage_type', NEW.usage_type
      )
    );
    
    -- Mark as processed
    NEW.award_processed := TRUE;
    NEW.credits_awarded := creator_credits;
    
    -- Update template's total credits earned
    UPDATE user_story_templates 
    SET credits_earned = credits_earned + creator_credits
    WHERE id = NEW.template_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for credit awards
CREATE TRIGGER trigger_award_template_usage_credits
  BEFORE INSERT ON template_usage_logs
  FOR EACH ROW EXECUTE FUNCTION award_template_usage_credits();

-- Updated at trigger for templates
CREATE OR REPLACE FUNCTION update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_updated_at
  BEFORE UPDATE ON user_story_templates
  FOR EACH ROW EXECUTE FUNCTION update_template_updated_at();

COMMENT ON TABLE user_story_templates IS 'User-created story templates for community sharing';
COMMENT ON TABLE template_usage_logs IS 'Tracks template usage for analytics and creator rewards';
COMMENT ON TABLE template_likes IS 'Template likes for social engagement';
COMMENT ON TABLE template_saves IS 'Template saves/bookmarks for user collections';