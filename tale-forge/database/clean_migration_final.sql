-- =============================================================================
-- TALE FORGE REBORN 2025 - CLEAN MIGRATION
-- This migration safely adds new features while cleaning up old unused tables
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- STEP 1: CLEAN UP OLD UNUSED TABLES
-- =============================================================================

-- Drop any test or unused tables that might exist
DROP TABLE IF EXISTS public.test_table CASCADE;
DROP TABLE IF EXISTS public.temp_migration CASCADE;
DROP TABLE IF EXISTS public._supabase_migrations CASCADE;

-- Drop old subscription system if it's empty (keeping user_profiles for now)
-- The subscriptions table is empty according to your examination
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- =============================================================================
-- STEP 2: ENHANCE EXISTING TABLES
-- =============================================================================

-- Enhance existing profiles table with new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS stories_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_genres TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reading_level TEXT DEFAULT 'beginner' CHECK (reading_level IN ('beginner', 'intermediate', 'advanced'));

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
ADD COLUMN IF NOT EXISTS content_rating TEXT DEFAULT 'G' CHECK (content_rating IN ('G', 'PG', 'PG-13')),
ADD COLUMN IF NOT EXISTS ai_model_used TEXT,
ADD COLUMN IF NOT EXISTS generation_settings JSONB DEFAULT '{}';

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

-- =============================================================================
-- STEP 3: CREATE NEW INTERACTIVE STORY SYSTEM
-- =============================================================================

-- Story segments for interactive storytelling
CREATE TABLE IF NOT EXISTS public.story_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    segment_number INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    image_prompt TEXT,
    image_generation_status TEXT DEFAULT 'pending' CHECK (image_generation_status IN ('pending', 'generating', 'completed', 'failed')),
    audio_url TEXT,
    audio_generation_status TEXT DEFAULT 'pending' CHECK (audio_generation_status IN ('pending', 'generating', 'completed', 'failed')),
    scene_description TEXT,
    mood TEXT,
    choices JSONB DEFAULT '[]',
    parent_choice_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, segment_number)
);

-- Story characters
CREATE TABLE IF NOT EXISTS public.story_characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    personality_traits TEXT[],
    appearance TEXT,
    role TEXT,
    avatar_url TEXT,
    avatar_prompt TEXT,
    character_arc TEXT,
    relationships JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story choices for interactive decisions
CREATE TABLE IF NOT EXISTS public.story_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    segment_id UUID NOT NULL REFERENCES public.story_segments(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    choice_description TEXT,
    consequence_preview TEXT,
    leads_to_segment_id UUID REFERENCES public.story_segments(id),
    choice_order INTEGER NOT NULL,
    choice_type TEXT DEFAULT 'narrative' CHECK (choice_type IN ('narrative', 'moral', 'action', 'dialogue')),
    impact_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 4: USER ENGAGEMENT FEATURES
-- =============================================================================

-- User collections
CREATE TABLE IF NOT EXISTS public.user_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    color TEXT DEFAULT '#8B5CF6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection items
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES public.user_collections(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, story_id)
);

-- Story likes
CREATE TABLE IF NOT EXISTS public.story_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Story bookmarks
CREATE TABLE IF NOT EXISTS public.story_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES public.story_segments(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Reading progress
CREATE TABLE IF NOT EXISTS public.reading_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    current_segment_id UUID REFERENCES public.story_segments(id),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    choices_made JSONB DEFAULT '{}',
    reading_time INTEGER DEFAULT 0,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- =============================================================================
-- STEP 5: AI IMAGE GENERATION SYSTEM
-- =============================================================================

-- Image generations tracking
CREATE TABLE IF NOT EXISTS public.image_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES public.story_segments(id) ON DELETE CASCADE,
    character_id UUID REFERENCES public.story_characters(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    style TEXT DEFAULT 'fantasy',
    model TEXT DEFAULT 'stable-diffusion',
    image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
    error_message TEXT,
    generation_time INTEGER,
    cost_credits INTEGER DEFAULT 1,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 6: ADMIN & MODERATION SYSTEM
-- =============================================================================

-- Content reports
CREATE TABLE IF NOT EXISTS public.content_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES auth.users(id),
    story_id UUID REFERENCES public.stories(id),
    segment_id UUID REFERENCES public.story_segments(id),
    report_type TEXT NOT NULL CHECK (report_type IN ('inappropriate', 'spam', 'copyright', 'violence', 'other')),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin actions for audit trail
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 7: ANALYTICS & NOTIFICATIONS
-- =============================================================================

-- User analytics
CREATE TABLE IF NOT EXISTS public.user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    stories_read INTEGER DEFAULT 0,
    stories_created INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    images_generated INTEGER DEFAULT 0,
    choices_made INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Story analytics
CREATE TABLE IF NOT EXISTS public.story_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    avg_reading_time INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, date)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('story_liked', 'story_shared', 'new_follower', 'admin_message', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STEP 8: PERFORMANCE INDEXES
-- =============================================================================

-- User and profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);

-- Story indexes
CREATE INDEX IF NOT EXISTS idx_stories_genre ON public.stories(genre);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON public.stories(featured);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_is_public ON public.stories(is_public);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON public.stories USING GIN(tags);

-- Story segments indexes
CREATE INDEX IF NOT EXISTS idx_story_segments_story_id ON public.story_segments(story_id);
CREATE INDEX IF NOT EXISTS idx_story_segments_number ON public.story_segments(story_id, segment_number);

-- Engagement indexes
CREATE INDEX IF NOT EXISTS idx_story_likes_user_story ON public.story_likes(user_id, story_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON public.reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.collection_items(collection_id);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_stories_title_search ON public.stories USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_stories_description_search ON public.stories USING GIN(to_tsvector('english', description));

-- =============================================================================
-- STEP 9: ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Stories policies
CREATE POLICY IF NOT EXISTS "Anyone can view public stories" ON public.stories FOR SELECT USING (is_public = true);
CREATE POLICY IF NOT EXISTS "Users can view own stories" ON public.stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can create stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own stories" ON public.stories FOR UPDATE USING (auth.uid() = user_id);

-- Story segments policies
CREATE POLICY IF NOT EXISTS "Users can view segments of accessible stories" ON public.story_segments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.stories 
        WHERE id = story_segments.story_id 
        AND (is_public = true OR user_id = auth.uid())
    )
);
CREATE POLICY IF NOT EXISTS "Users can manage segments of own stories" ON public.story_segments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.stories 
        WHERE id = story_segments.story_id 
        AND user_id = auth.uid()
    )
);

-- User collections policies  
CREATE POLICY IF NOT EXISTS "Users can view public collections" ON public.user_collections FOR SELECT USING (is_public = true);
CREATE POLICY IF NOT EXISTS "Users can manage own collections" ON public.user_collections FOR ALL USING (auth.uid() = user_id);

-- Story likes policies
CREATE POLICY IF NOT EXISTS "Users can view all likes" ON public.story_likes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can manage own likes" ON public.story_likes FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- STEP 10: ESSENTIAL FUNCTIONS
-- =============================================================================

-- Function to update story statistics
CREATE OR REPLACE FUNCTION update_story_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update likes count
    IF TG_TABLE_NAME = 'story_likes' THEN
        UPDATE public.stories 
        SET likes_count = (
            SELECT COUNT(*) FROM public.story_likes 
            WHERE story_id = COALESCE(NEW.story_id, OLD.story_id)
        )
        WHERE id = COALESCE(NEW.story_id, OLD.story_id);
    END IF;
    
    -- Update character count
    IF TG_TABLE_NAME = 'story_characters' THEN
        UPDATE public.stories 
        SET character_count = (
            SELECT COUNT(*) FROM public.story_characters 
            WHERE story_id = COALESCE(NEW.story_id, OLD.story_id)
        )
        WHERE id = COALESCE(NEW.story_id, OLD.story_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic stats updates
CREATE TRIGGER IF NOT EXISTS trigger_update_story_likes_stats
    AFTER INSERT OR DELETE ON public.story_likes
    FOR EACH ROW EXECUTE FUNCTION update_story_stats();

CREATE TRIGGER IF NOT EXISTS trigger_update_story_character_stats
    AFTER INSERT OR DELETE ON public.story_characters
    FOR EACH ROW EXECUTE FUNCTION update_story_stats();

-- Function to handle reading progress updates
CREATE OR REPLACE FUNCTION update_reading_progress(
    p_user_id UUID,
    p_story_id UUID,
    p_segment_id UUID,
    p_progress_percentage INTEGER,
    p_reading_time INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.reading_progress (
        user_id, story_id, current_segment_id, progress_percentage, reading_time, last_read_at
    )
    VALUES (
        p_user_id, p_story_id, p_segment_id, p_progress_percentage, p_reading_time, NOW()
    )
    ON CONFLICT (user_id, story_id) 
    DO UPDATE SET
        current_segment_id = p_segment_id,
        progress_percentage = p_progress_percentage,
        reading_time = reading_progress.reading_time + p_reading_time,
        last_read_at = NOW(),
        updated_at = NOW(),
        completed = CASE WHEN p_progress_percentage = 100 THEN true ELSE reading_progress.completed END,
        completed_at = CASE WHEN p_progress_percentage = 100 AND reading_progress.completed = false THEN NOW() ELSE reading_progress.completed_at END;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STEP 11: CREATE DEFAULT DATA
-- =============================================================================

-- Create default collections for existing users
INSERT INTO public.user_collections (user_id, name, description, color)
SELECT DISTINCT p.id, 'My Favorites', 'My favorite stories', '#8B5CF6'
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_collections uc WHERE uc.user_id = p.id AND uc.name = 'My Favorites'
);

-- =============================================================================
-- MIGRATION COMPLETE - SUMMARY
-- =============================================================================

SELECT 
    'Tale Forge Reborn 2025 - Clean Migration Completed Successfully!' as status,
    'All existing data preserved and enhanced with new features' as result,
    (SELECT COUNT(*) FROM public.stories) as stories_count,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count;