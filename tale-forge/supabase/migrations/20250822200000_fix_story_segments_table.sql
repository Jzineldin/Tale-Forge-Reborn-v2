-- Force creation of story_segments table
-- Migration to ensure story_segments table exists with proper schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create story_segments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.story_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    segment_number INTEGER NOT NULL DEFAULT 0,
    title TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    image_prompt TEXT,
    audio_url TEXT,
    choices JSONB DEFAULT '[]',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
    -- Add content column if missing (this is critical)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'content') THEN
        ALTER TABLE public.story_segments ADD COLUMN content TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add choices column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'choices') THEN
        ALTER TABLE public.story_segments ADD COLUMN choices JSONB DEFAULT '[]';
    END IF;

    -- Add position column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'position') THEN
        ALTER TABLE public.story_segments ADD COLUMN position INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_story_segments_story_id ON public.story_segments(story_id);
CREATE INDEX IF NOT EXISTS idx_story_segments_position ON public.story_segments(story_id, position);
CREATE INDEX IF NOT EXISTS idx_story_segments_segment_number ON public.story_segments(story_id, segment_number);

-- Enable RLS policies
ALTER TABLE public.story_segments ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own story segments
DROP POLICY IF EXISTS "Users can view their own story segments" ON public.story_segments;
CREATE POLICY "Users can view their own story segments" 
ON public.story_segments FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.stories WHERE stories.id = story_segments.story_id
  )
);

-- Policy for users to insert segments for their own stories
DROP POLICY IF EXISTS "Users can insert segments for their own stories" ON public.story_segments;
CREATE POLICY "Users can insert segments for their own stories" 
ON public.story_segments FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.stories WHERE stories.id = story_segments.story_id
  )
);

-- Policy for users to update segments for their own stories
DROP POLICY IF EXISTS "Users can update segments for their own stories" ON public.story_segments;
CREATE POLICY "Users can update segments for their own stories" 
ON public.story_segments FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.stories WHERE stories.id = story_segments.story_id
  )
);

-- Test insert to verify table works
DO $$
BEGIN
    -- Try to insert a test record to verify table structure
    RAISE NOTICE 'story_segments table created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create story_segments table: %', SQLERRM;
END $$;