-- Unified Template System Migration
-- Consolidates template systems and adds support for new template-based story creation

-- First, create a unified story_templates table that supports both preset and user-created templates
-- This will replace the old story_templates and integrate with user_story_templates

-- Rename old table as backup
ALTER TABLE IF EXISTS story_templates RENAME TO story_templates_backup;

-- Create new unified story_templates table
CREATE TABLE IF NOT EXISTS story_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic template info
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('3-5', '6-8', '9-12', '13+')),
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  
  -- Template content (structured as expected by templateCreditsService)
  characters JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '[]'::jsonb,
  plot_elements TEXT[] DEFAULT '{}',
  
  -- Template type and ownership
  is_preset BOOLEAN DEFAULT FALSE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view preset templates" ON story_templates
  FOR SELECT USING (is_preset = TRUE);

CREATE POLICY "Users can view own templates" ON story_templates
  FOR SELECT USING (creator_id = auth.uid());

CREATE POLICY "Users can create templates" ON story_templates
  FOR INSERT WITH CHECK (creator_id = auth.uid() AND is_preset = FALSE);

CREATE POLICY "Users can update own templates" ON story_templates
  FOR UPDATE USING (creator_id = auth.uid() AND is_preset = FALSE);

CREATE POLICY "Users can delete own templates" ON story_templates
  FOR DELETE USING (creator_id = auth.uid() AND is_preset = FALSE);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_templates_preset ON story_templates(is_preset) WHERE is_preset = TRUE;
CREATE INDEX IF NOT EXISTS idx_story_templates_creator ON story_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_story_templates_genre ON story_templates(genre);
CREATE INDEX IF NOT EXISTS idx_story_templates_age_group ON story_templates(age_group);
CREATE INDEX IF NOT EXISTS idx_story_templates_created ON story_templates(created_at DESC);

-- Migrate data from old story_templates_backup to new structure
INSERT INTO story_templates (
  name, 
  description, 
  genre,
  age_group,
  difficulty,
  characters,
  settings,
  plot_elements,
  is_preset,
  created_at,
  updated_at
) 
SELECT 
  title as name,
  description,
  COALESCE(genre, category) as genre,
  CASE 
    WHEN target_age_min <= 5 AND target_age_max <= 5 THEN '3-5'
    WHEN target_age_min <= 8 AND target_age_max <= 8 THEN '6-8'
    WHEN target_age_min <= 12 AND target_age_max <= 12 THEN '9-12'
    ELSE '13+'
  END as age_group,
  CASE 
    WHEN difficulty_level = 'beginner' THEN 1
    WHEN difficulty_level = 'intermediate' THEN 2
    WHEN difficulty_level = 'advanced' THEN 3
    ELSE 2
  END as difficulty,
  character_templates as characters,
  setting_options as settings,
  ARRAY(SELECT jsonb_array_elements_text(plot_points)) as plot_elements,
  TRUE as is_preset,
  created_at,
  updated_at
FROM story_templates_backup
WHERE is_active = TRUE;

-- Insert additional preset templates with the new structure for template service
INSERT INTO story_templates (name, description, genre, age_group, difficulty, characters, settings, plot_elements, is_preset) VALUES
('Enchanted Garden Adventure', 'Discover magical flowers and friendly garden creatures in a secret garden', 'Fantasy', '3-5', 1, 
 '[{"name": "Little Explorer", "description": "A curious child", "personality": "brave and kind", "appearance": "bright eyes and warm smile", "role": "protagonist"}]'::jsonb,
 '[{"name": "Secret Garden", "description": "A magical hidden garden", "atmosphere": "peaceful and enchanting", "location_type": "outdoor"}]'::jsonb,
 ARRAY['Finding a hidden door', 'Meeting talking flowers', 'Helping garden friends', 'Discovering garden magic'], TRUE),

('Dinosaur Discovery', 'Travel back in time to meet friendly dinosaurs and learn about the prehistoric world', 'Adventure', '6-8', 2,
 '[{"name": "Time Explorer", "description": "A young adventurer", "personality": "curious and brave", "appearance": "explorer gear", "role": "protagonist"}, {"name": "Friendly T-Rex", "description": "A gentle giant dinosaur", "personality": "protective and wise", "appearance": "large but friendly", "role": "mentor"}]'::jsonb,
 '[{"name": "Prehistoric Forest", "description": "Lush ancient forest", "atmosphere": "mysterious and wild", "location_type": "outdoor"}, {"name": "Dinosaur Valley", "description": "Open plains with dinosaurs", "atmosphere": "exciting and vast", "location_type": "outdoor"}]'::jsonb,
 ARRAY['Meeting first dinosaur', 'Learning dinosaur facts', 'Solving prehistoric puzzle', 'Helping lost baby dinosaur'], TRUE),

('Castle Mystery', 'Solve puzzles and riddles in an ancient castle to uncover its hidden treasures', 'Mystery', '9-12', 3,
 '[{"name": "Young Detective", "description": "A clever problem-solver", "personality": "observant and determined", "appearance": "detective notebook and magnifying glass", "role": "protagonist"}, {"name": "Castle Ghost", "description": "A friendly castle spirit", "personality": "helpful but mysterious", "appearance": "translucent and glowing", "role": "supporting"}]'::jsonb,
 '[{"name": "Ancient Castle", "description": "Old stone castle with many rooms", "atmosphere": "mysterious and grand", "location_type": "indoor"}, {"name": "Secret Library", "description": "Hidden room full of ancient books", "atmosphere": "scholarly and mysterious", "location_type": "indoor"}]'::jsonb,
 ARRAY['Finding mysterious clues', 'Solving ancient riddles', 'Discovering secret passages', 'Uncovering castle history'], TRUE),

('Superhero Training Academy', 'Learn to become a superhero and use special powers to help others', 'Adventure', '6-8', 2,
 '[{"name": "New Superhero", "description": "A child with emerging powers", "personality": "eager and heroic", "appearance": "colorful superhero costume", "role": "protagonist"}, {"name": "Mentor Hero", "description": "Experienced superhero teacher", "personality": "wise and encouraging", "appearance": "classic superhero outfit", "role": "mentor"}]'::jsonb,
 '[{"name": "Training Academy", "description": "Special school for superheroes", "atmosphere": "exciting and high-tech", "location_type": "indoor"}, {"name": "Practice City", "description": "Safe training environment", "atmosphere": "dynamic and colorful", "location_type": "outdoor"}]'::jsonb,
 ARRAY['Discovering special power', 'First training challenge', 'Helping someone in need', 'Graduating as hero'], TRUE),

('Pirate Treasure Hunt', 'Sail the seven seas and search for buried treasure with a crew of friendly pirates', 'Adventure', '9-12', 3,
 '[{"name": "Young Pirate", "description": "A brave new crew member", "personality": "adventurous and loyal", "appearance": "pirate hat and compass", "role": "protagonist"}, {"name": "Captain Goodheart", "description": "Kind pirate captain", "personality": "fair and wise", "appearance": "traditional pirate captain", "role": "mentor"}]'::jsonb,
 '[{"name": "Pirate Ship", "description": "Sturdy sailing vessel", "atmosphere": "adventurous and exciting", "location_type": "outdoor"}, {"name": "Treasure Island", "description": "Mysterious tropical island", "atmosphere": "wild and mysterious", "location_type": "outdoor"}]'::jsonb,
 ARRAY['Joining the crew', 'Following treasure map', 'Overcoming obstacles', 'Finding the treasure'], TRUE);

-- Function to support template-based story creation with proper cost structure
CREATE OR REPLACE FUNCTION create_story_from_template(
  user_uuid UUID,
  template_uuid UUID,
  tier_id TEXT,
  story_title TEXT,
  child_name TEXT DEFAULT NULL,
  includes_audio BOOLEAN DEFAULT FALSE,
  credit_cost INTEGER DEFAULT 10
)
RETURNS TABLE (
  story_id UUID,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  new_story_id UUID;
  current_balance INTEGER;
  template_data RECORD;
BEGIN
  -- Get current user credits
  SELECT current_balance INTO current_balance
  FROM get_user_credits(user_uuid);
  
  -- Check if user has enough credits
  IF current_balance < credit_cost THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Insufficient credits';
    RETURN;
  END IF;
  
  -- Get template data
  SELECT * INTO template_data 
  FROM story_templates 
  WHERE id = template_uuid;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Template not found';
    RETURN;
  END IF;
  
  -- Create the story
  INSERT INTO stories (
    user_id,
    title,
    genre,
    target_age,
    status,
    template_id,
    child_name,
    created_at,
    updated_at
  ) VALUES (
    user_uuid,
    story_title,
    template_data.genre,
    template_data.age_group,
    'created',
    template_uuid,
    child_name,
    NOW(),
    NOW()
  ) RETURNING id INTO new_story_id;
  
  -- Deduct credits
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    reference_id,
    reference_type,
    metadata
  ) VALUES (
    user_uuid,
    'story_creation',
    -credit_cost,
    'Created story from template: ' || template_data.name,
    new_story_id::TEXT,
    'story',
    jsonb_build_object(
      'template_id', template_uuid,
      'tier_id', tier_id,
      'includes_audio', includes_audio
    )
  );
  
  RETURN QUERY SELECT new_story_id, TRUE, 'Story created successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_story_from_template(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER) TO authenticated;

-- Function to get user template creation limits (subscription-based)
CREATE OR REPLACE FUNCTION get_user_template_limits(user_uuid UUID)
RETURNS TABLE (
  template_creation_limit INTEGER,
  custom_templates_created INTEGER,
  can_create_templates BOOLEAN,
  subscription_tier TEXT
) AS $$
DECLARE
  user_subscription TEXT;
  templates_created INTEGER;
  creation_limit INTEGER;
BEGIN
  -- Get user's subscription tier (default to free)
  SELECT COALESCE(subscription_status, 'free') INTO user_subscription
  FROM user_profiles 
  WHERE id = user_uuid;
  
  -- Count user's custom templates
  SELECT COUNT(*) INTO templates_created
  FROM story_templates
  WHERE creator_id = user_uuid AND is_preset = FALSE;
  
  -- Set limits based on subscription
  CASE user_subscription
    WHEN 'pro' THEN creation_limit := 50;
    WHEN 'basic' THEN creation_limit := 10;
    ELSE creation_limit := 0; -- Free users can't create templates
  END CASE;
  
  RETURN QUERY SELECT 
    creation_limit,
    templates_created,
    (templates_created < creation_limit),
    user_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_template_limits(UUID) TO authenticated;

-- Add updated_at trigger for new story_templates table
CREATE OR REPLACE FUNCTION update_story_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER story_templates_updated_at_trigger
  BEFORE UPDATE ON story_templates
  FOR EACH ROW EXECUTE FUNCTION update_story_templates_updated_at();

-- Grant table permissions
GRANT SELECT ON story_templates TO authenticated;
GRANT SELECT ON story_templates TO anon;

COMMENT ON TABLE story_templates IS 'Unified template system supporting both preset and user-created story templates';
COMMENT ON FUNCTION create_story_from_template IS 'Creates a new story from a template with credit deduction';
COMMENT ON FUNCTION get_user_template_limits IS 'Returns user template creation limits based on subscription tier';