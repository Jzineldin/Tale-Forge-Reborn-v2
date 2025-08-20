-- =============================================================================
-- TALE FORGE REBORN 2025 - MIGRATION STEP 4 (SKIP SEGMENTS): CREATE OTHER STORY FEATURES
-- Skip story_segments (it already exists) and just create characters and choices
-- =============================================================================

-- Story characters (this is new and safe)
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

-- Story choices for interactive decisions (this needs to reference existing story_segments)
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
SELECT 
    'Step 4 Complete: Characters and choices created (segments table already existed)' as result,
    (SELECT COUNT(*) FROM public.story_segments) as existing_segments,
    'Story system ready!' as status;