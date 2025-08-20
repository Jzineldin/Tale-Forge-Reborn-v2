-- =============================================================================
-- TALE FORGE REBORN 2025 - MIGRATION STEP 3: ENHANCE STORIES TABLE
-- Run this third to add new columns to stories
-- =============================================================================

-- Enhance existing stories table with new features
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS genre TEXT,
ADD COLUMN IF NOT EXISTS reading_level TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS estimated_reading_time INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS character_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS choice_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS cover_image_prompt TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS content_rating TEXT DEFAULT 'G',
ADD COLUMN IF NOT EXISTS ai_model_used TEXT,
ADD COLUMN IF NOT EXISTS generation_settings JSONB DEFAULT '{}';

-- Add constraints separately
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'stories_content_rating_check'
    ) THEN
        ALTER TABLE public.stories ADD CONSTRAINT stories_content_rating_check CHECK (content_rating IN ('G', 'PG', 'PG-13'));
    END IF;
END$$;

-- Update existing stories with proper genre mapping
UPDATE public.stories 
SET genre = CASE 
    WHEN story_mode = 'fantasy-magic' THEN 'fantasy'
    WHEN story_mode = 'mystery-and-detective' THEN 'mystery'
    WHEN story_mode = 'adventure' THEN 'adventure'
    WHEN story_mode = 'science-fiction' THEN 'sci-fi'
    ELSE 'fantasy'
END
WHERE genre IS NULL;

-- Set all users to regular tier as requested
UPDATE public.user_profiles 
SET subscription_tier = 'regular', is_premium = false
WHERE subscription_tier != 'regular';

-- Success message
SELECT 'Step 3 Complete: Stories table enhanced and data updated' as result;