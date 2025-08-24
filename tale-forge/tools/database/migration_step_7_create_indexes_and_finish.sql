-- =============================================================================
-- TALE FORGE REBORN 2025 - MIGRATION STEP 7: CREATE INDEXES AND FINISH
-- Run this last to add performance indexes and complete the migration
-- =============================================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_stories_genre ON public.stories(genre);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON public.stories(featured);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_is_public ON public.stories(is_public);
CREATE INDEX IF NOT EXISTS idx_stories_tags ON public.stories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_story_segments_story_id ON public.story_segments(story_id);
CREATE INDEX IF NOT EXISTS idx_story_segments_number ON public.story_segments(story_id, segment_number);
CREATE INDEX IF NOT EXISTS idx_story_likes_user_story ON public.story_likes(user_id, story_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON public.reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_stories_title_search ON public.stories USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_stories_description_search ON public.stories USING GIN(to_tsvector('english', description));

-- Create default collections for existing users
INSERT INTO public.user_collections (user_id, name, description, color)
SELECT DISTINCT p.id, 'My Favorites', 'My favorite stories', '#8B5CF6'
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_collections uc WHERE uc.user_id = p.id AND uc.name = 'My Favorites'
);

-- Final success message with counts
SELECT 
    'Tale Forge Reborn 2025 - Migration Complete!' as status,
    (SELECT COUNT(*) FROM public.stories) as stories_preserved,
    (SELECT COUNT(*) FROM public.profiles) as users_preserved,
    'All new features ready!' as result;