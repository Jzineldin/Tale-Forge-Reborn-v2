-- =============================================================================
-- TALE FORGE REBORN 2025 - MIGRATION STEP 7 (FIXED): CREATE INDEXES AND FINISH
-- Run this last to add performance indexes (only for existing columns)
-- =============================================================================

-- Performance indexes (only create for columns that exist)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_stories_genre ON public.stories(genre);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON public.stories(featured);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_is_public ON public.stories(is_public);

-- Only create GIN indexes if the columns exist
DO $$
BEGIN
    -- Check if tags column exists before creating index
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'tags'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_stories_tags ON public.stories USING GIN(tags);
    END IF;
    
    -- Check if title column exists (it should)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'title'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_stories_title_search ON public.stories USING GIN(to_tsvector('english', title));
    END IF;
    
    -- Check if description column exists (it should)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'description'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_stories_description_search ON public.stories USING GIN(to_tsvector('english', description));
    END IF;
END$$;

-- Story segments indexes (only for existing columns)
CREATE INDEX IF NOT EXISTS idx_story_segments_story_id ON public.story_segments(story_id);

-- Only create segment_number index if the column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'story_segments' AND column_name = 'segment_number'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_story_segments_number ON public.story_segments(story_id, segment_number);
    END IF;
END$$;

-- Engagement table indexes (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'story_likes') THEN
        CREATE INDEX IF NOT EXISTS idx_story_likes_user_story ON public.story_likes(user_id, story_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reading_progress') THEN
        CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON public.reading_progress(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collection_items') THEN
        CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.collection_items(collection_id);
    END IF;
END$$;

-- Create default collections for existing users (only if user_collections table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_collections') THEN
        INSERT INTO public.user_collections (user_id, name, description, color)
        SELECT DISTINCT p.id, 'My Favorites', 'My favorite stories', '#8B5CF6'
        FROM public.profiles p
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_collections uc WHERE uc.user_id = p.id AND uc.name = 'My Favorites'
        );
        
        RAISE NOTICE 'Default collections created';
    END IF;
END$$;

-- Final success message with what we actually have
SELECT 
    'Tale Forge Reborn 2025 - Migration Complete!' as status,
    (SELECT COUNT(*) FROM public.stories) as stories_preserved,
    (SELECT COUNT(*) FROM public.profiles) as users_preserved,
    (SELECT COUNT(*) FROM public.story_segments) as story_segments_found,
    'Migration adapted to your existing structure!' as result;