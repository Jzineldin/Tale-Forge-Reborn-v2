-- Social Engagement System Adapted for Existing Database
-- Works with existing story_templates table structure

-- Add social engagement columns to existing story_templates table
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS bookmarks_count INTEGER DEFAULT 0;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE story_templates ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP NULL;

-- Template likes system
CREATE TABLE IF NOT EXISTS story_template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES story_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(template_id, user_id)
);

-- Template bookmarks/saves
CREATE TABLE IF NOT EXISTS story_template_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES story_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_name TEXT DEFAULT 'default',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(template_id, user_id)
);

-- Template reviews and ratings
CREATE TABLE IF NOT EXISTS story_template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES story_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  helpful_votes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(template_id, user_id)
);

-- Template sharing tracking
CREATE TABLE IF NOT EXISTS story_template_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES story_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Template usage analytics
CREATE TABLE IF NOT EXISTS story_template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES story_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  
  time_spent INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  abandoned_at_step TEXT,
  
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Featured content system
CREATE TABLE IF NOT EXISTS featured_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('template', 'story')),
  content_id UUID NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  featured_image_url TEXT,
  feature_type TEXT NOT NULL,
  
  featured_from TIMESTAMP NOT NULL DEFAULT NOW(),
  featured_until TIMESTAMP NOT NULL,
  display_order INTEGER DEFAULT 0,
  
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Functions to maintain engagement counts
CREATE OR REPLACE FUNCTION update_story_template_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE story_templates SET likes_count = likes_count + 1 WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE story_templates SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.template_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_story_template_reviews_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE story_templates SET 
      reviews_count = reviews_count + 1,
      rating_average = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM story_template_reviews 
        WHERE template_id = NEW.template_id
      )
    WHERE id = NEW.template_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE story_templates SET 
      reviews_count = GREATEST(reviews_count - 1, 0),
      rating_average = COALESCE((
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM story_template_reviews 
        WHERE template_id = OLD.template_id
      ), 0)
    WHERE id = OLD.template_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE story_templates SET 
      rating_average = (
        SELECT AVG(rating)::DECIMAL(3,2) 
        FROM story_template_reviews 
        WHERE template_id = NEW.template_id
      )
    WHERE id = NEW.template_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic count updates
CREATE OR REPLACE TRIGGER story_template_likes_count_trigger
  AFTER INSERT OR DELETE ON story_template_likes
  FOR EACH ROW EXECUTE FUNCTION update_story_template_likes_count();

CREATE OR REPLACE TRIGGER story_template_reviews_count_trigger
  AFTER INSERT OR DELETE OR UPDATE ON story_template_reviews
  FOR EACH ROW EXECUTE FUNCTION update_story_template_reviews_count();

-- Enable RLS on all tables
ALTER TABLE story_template_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_template_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_template_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_template_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_template_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can like templates" ON story_template_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all likes" ON story_template_likes
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can unlike their own likes" ON story_template_likes
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark templates" ON story_template_bookmarks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can review templates" ON story_template_reviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reviews" ON story_template_reviews
  FOR SELECT USING (TRUE);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_templates_social_ranking ON story_templates (
  is_public, quality_score DESC, likes_count DESC, created_at DESC
) WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_story_templates_featured ON story_templates (
  is_featured, featured_until, quality_score DESC
) WHERE is_featured = TRUE;

-- Insert some test data for existing templates
UPDATE story_templates SET 
  is_public = TRUE,
  quality_score = 5.0 + (RANDOM() * 5.0),
  likes_count = FLOOR(RANDOM() * 100)::INTEGER,
  usage_count = FLOOR(RANDOM() * 50)::INTEGER,
  rating_average = 3.5 + (RANDOM() * 1.5)
WHERE id IS NOT NULL;