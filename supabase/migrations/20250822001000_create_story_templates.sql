-- Create story_templates table for template system
-- This must come before social system migrations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create story_templates table
CREATE TABLE IF NOT EXISTS story_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    genre TEXT,
    target_age_min INTEGER DEFAULT 4,
    target_age_max INTEGER DEFAULT 12,
    template_structure JSONB NOT NULL DEFAULT '{}',
    character_templates JSONB DEFAULT '[]',
    setting_options JSONB DEFAULT '[]',
    plot_points JSONB DEFAULT '[]',
    moral_themes JSONB DEFAULT '[]',
    language TEXT DEFAULT 'en',
    content_rating TEXT DEFAULT 'G',
    difficulty_level TEXT DEFAULT 'beginner',
    estimated_duration INTEGER DEFAULT 10, -- in minutes
    
    -- Template metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_templates_category ON story_templates(category);
CREATE INDEX IF NOT EXISTS idx_story_templates_genre ON story_templates(genre);
CREATE INDEX IF NOT EXISTS idx_story_templates_age_range ON story_templates(target_age_min, target_age_max);
CREATE INDEX IF NOT EXISTS idx_story_templates_active ON story_templates(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_story_templates_created_at ON story_templates(created_at DESC);

-- Enable RLS
ALTER TABLE story_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view active templates
CREATE POLICY "Anyone can view active templates" ON story_templates
  FOR SELECT USING (is_active = TRUE);

-- Users can create templates
CREATE POLICY "Users can create templates" ON story_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update own templates" ON story_templates
  FOR UPDATE USING (auth.uid() = created_by);

-- Insert some default templates
INSERT INTO story_templates (
    title, 
    description, 
    category, 
    genre,
    target_age_min,
    target_age_max,
    template_structure,
    character_templates,
    setting_options,
    plot_points,
    moral_themes,
    difficulty_level,
    estimated_duration
) VALUES 
(
    'Magical Forest Adventure',
    'Explore an enchanted forest filled with magical creatures and hidden treasures',
    'Fantasy',
    'Adventure',
    4,
    8,
    '{"segments": 5, "choices_per_segment": 3, "has_illustrations": true}',
    '[{"name": "Young Explorer", "traits": ["brave", "curious", "kind"]}, {"name": "Forest Guardian", "traits": ["wise", "protective", "magical"]}]',
    '["Enchanted Forest", "Crystal Cave", "Fairy Meadow", "Ancient Tree House"]',
    '["Meeting magical creature", "Finding hidden treasure", "Solving forest puzzle", "Helping someone in need"]',
    '["Kindness to nature", "Helping others", "Being brave", "Curiosity leads to discovery"]',
    'beginner',
    12
),
(
    'Space Explorer Mission',
    'Journey through space to discover new planets and meet alien friends',
    'Science Fiction',
    'Adventure',
    5,
    10,
    '{"segments": 6, "choices_per_segment": 3, "has_illustrations": true}',
    '[{"name": "Space Cadet", "traits": ["smart", "brave", "friendly"]}, {"name": "Robot Companion", "traits": ["loyal", "helpful", "funny"]}]',
    '["Space Station", "Alien Planet", "Asteroid Field", "Cosmic Garden"]',
    '["Meeting alien civilization", "Solving space puzzle", "Rescuing stranded traveler", "Discovering new planet"]',
    '["Friendship across differences", "Problem-solving", "Helping others", "Scientific curiosity"]',
    'intermediate',
    15
),
(
    'Underwater Kingdom Quest',
    'Dive deep into the ocean to explore an underwater kingdom and meet sea creatures',
    'Fantasy',
    'Adventure',
    4,
    9,
    '{"segments": 5, "choices_per_segment": 3, "has_illustrations": true}',
    '[{"name": "Young Diver", "traits": ["adventurous", "kind", "brave"]}, {"name": "Dolphin Friend", "traits": ["playful", "wise", "loyal"]}]',
    '["Coral Reef City", "Underwater Palace", "Deep Sea Cave", "Kelp Forest"]',
    '["Meeting mermaid princess", "Solving ocean mystery", "Protecting sea creatures", "Finding lost treasure"]',
    '["Ocean conservation", "Friendship", "Protecting nature", "Being helpful"]',
    'beginner',
    10
);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_story_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER story_templates_updated_at_trigger
    BEFORE UPDATE ON story_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_story_templates_updated_at();

COMMENT ON TABLE story_templates IS 'Templates for generating interactive stories with predefined structures and themes';