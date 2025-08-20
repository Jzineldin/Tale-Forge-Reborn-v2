-- =============================================================================
-- TALE FORGE REBORN 2025 - MIGRATION STEP 4 (FIXED): CREATE INTERACTIVE STORY SYSTEM
-- Run this instead of step 4 to handle existing data properly
-- =============================================================================

-- First, let's check if story_segments table exists and fix any data issues
DO $$
BEGIN
    -- If table exists, update any invalid status values first
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'story_segments') THEN
        -- Fix any invalid image generation status values
        UPDATE public.story_segments 
        SET image_generation_status = 'pending' 
        WHERE image_generation_status NOT IN ('pending', 'generating', 'completed', 'failed');
        
        -- Fix any invalid audio generation status values  
        UPDATE public.story_segments 
        SET audio_generation_status = 'pending'
        WHERE audio_generation_status NOT IN ('pending', 'generating', 'completed', 'failed');
        
        RAISE NOTICE 'Fixed existing story_segments data';
    END IF;
END$$;

-- Story segments for interactive storytelling
CREATE TABLE IF NOT EXISTS public.story_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    segment_number INTEGER NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    image_prompt TEXT,
    image_generation_status TEXT DEFAULT 'pending',
    audio_url TEXT,
    audio_generation_status TEXT DEFAULT 'pending',
    scene_description TEXT,
    mood TEXT,
    choices JSONB DEFAULT '[]',
    parent_choice_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, segment_number)
);

-- Add constraints separately (only if they don't exist)
DO $$
BEGIN
    -- Drop existing constraints if they exist (in case they were partially applied)
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'story_segments_image_status_check') THEN
        ALTER TABLE public.story_segments DROP CONSTRAINT story_segments_image_status_check;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'story_segments_audio_status_check') THEN
        ALTER TABLE public.story_segments DROP CONSTRAINT story_segments_audio_status_check;
    END IF;
    
    -- Now add the constraints (data should be clean now)
    ALTER TABLE public.story_segments ADD CONSTRAINT story_segments_image_status_check 
    CHECK (image_generation_status IN ('pending', 'generating', 'completed', 'failed'));
    
    ALTER TABLE public.story_segments ADD CONSTRAINT story_segments_audio_status_check 
    CHECK (audio_generation_status IN ('pending', 'generating', 'completed', 'failed'));
    
    RAISE NOTICE 'Added constraints to story_segments';
END$$;

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
    choice_type TEXT DEFAULT 'narrative',
    impact_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add choice type constraint
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'story_choices_type_check') THEN
        ALTER TABLE public.story_choices DROP CONSTRAINT story_choices_type_check;
    END IF;
    
    -- Add the constraint
    ALTER TABLE public.story_choices ADD CONSTRAINT story_choices_type_check 
    CHECK (choice_type IN ('narrative', 'moral', 'action', 'dialogue'));
END$$;

-- Success message
SELECT 'Step 4 FIXED Complete: Interactive story system created (existing data handled)' as result;