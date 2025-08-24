-- Ensure story_segments table and all required columns exist
-- This migration ensures compatibility and fixes missing columns

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stories table if it doesn't exist (needed for foreign key)
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    genre TEXT,
    target_age INTEGER,
    story_mode TEXT DEFAULT 'interactive',
    is_completed BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'en',
    content_rating TEXT DEFAULT 'G',
    ai_model_used TEXT,
    generation_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create story_segments table with all required columns if it doesn't exist
CREATE TABLE IF NOT EXISTS story_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
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

-- Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    -- Add id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'id') THEN
        ALTER TABLE story_segments ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
    END IF;

    -- Add story_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'story_id') THEN
        ALTER TABLE story_segments ADD COLUMN story_id UUID REFERENCES stories(id) ON DELETE CASCADE;
    END IF;

    -- Add content column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'content') THEN
        ALTER TABLE story_segments ADD COLUMN content TEXT;
    END IF;

    -- Add choices column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'choices') THEN
        ALTER TABLE story_segments ADD COLUMN choices JSONB DEFAULT '[]';
    END IF;

    -- Add image_url column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'image_url') THEN
        ALTER TABLE story_segments ADD COLUMN image_url TEXT;
    END IF;

    -- Add image_prompt column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'image_prompt') THEN
        ALTER TABLE story_segments ADD COLUMN image_prompt TEXT;
    END IF;

    -- Add audio_url column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'audio_url') THEN
        ALTER TABLE story_segments ADD COLUMN audio_url TEXT;
    END IF;

    -- Add created_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'created_at') THEN
        ALTER TABLE story_segments ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'updated_at') THEN
        ALTER TABLE story_segments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Add segment_number column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'segment_number') THEN
        ALTER TABLE story_segments ADD COLUMN segment_number INTEGER DEFAULT 0;
    END IF;

    -- Add title column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'title') THEN
        ALTER TABLE story_segments ADD COLUMN title TEXT;
    END IF;

    -- Add position column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'story_segments' AND column_name = 'position') THEN
        ALTER TABLE story_segments ADD COLUMN position INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_story_segments_story_id ON story_segments(story_id);
CREATE INDEX IF NOT EXISTS idx_story_segments_position ON story_segments(story_id, position);
CREATE INDEX IF NOT EXISTS idx_story_segments_segment_number ON story_segments(story_id, segment_number);

-- Ensure RLS policies exist
ALTER TABLE story_segments ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own story segments
DROP POLICY IF EXISTS "Users can view their own story segments" ON story_segments;
CREATE POLICY "Users can view their own story segments" 
ON story_segments FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM stories WHERE stories.id = story_segments.story_id
  )
);

-- Policy for users to insert segments for their own stories
DROP POLICY IF EXISTS "Users can insert segments for their own stories" ON story_segments;
CREATE POLICY "Users can insert segments for their own stories" 
ON story_segments FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM stories WHERE stories.id = story_segments.story_id
  )
);

-- Policy for users to update segments for their own stories
DROP POLICY IF EXISTS "Users can update segments for their own stories" ON story_segments;
CREATE POLICY "Users can update segments for their own stories" 
ON story_segments FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id FROM stories WHERE stories.id = story_segments.story_id
  )
);

-- Add comments for documentation
COMMENT ON TABLE story_segments IS 'Individual segments/chapters of stories with content, choices, and media';
COMMENT ON COLUMN story_segments.content IS 'The main text content of this story segment';
COMMENT ON COLUMN story_segments.choices IS 'JSON array of available choices for the reader';
COMMENT ON COLUMN story_segments.image_url IS 'URL to the generated illustration for this segment';
COMMENT ON COLUMN story_segments.position IS 'Order position of segment within the story (0-based)';
COMMENT ON COLUMN story_segments.segment_number IS 'Sequential number of the segment in the story';