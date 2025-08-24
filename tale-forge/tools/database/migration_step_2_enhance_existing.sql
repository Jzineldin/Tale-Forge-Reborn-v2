-- =============================================================================
-- TALE FORGE REBORN 2025 - MIGRATION STEP 2: ENHANCE EXISTING TABLES
-- Run this second to add new columns to existing tables
-- =============================================================================

-- Enhance existing profiles table with new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS stories_created INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reading_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_genres TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reading_level TEXT DEFAULT 'beginner';

-- Add constraints separately (safer)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_role_check'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_reading_level_check'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_reading_level_check CHECK (reading_level IN ('beginner', 'intermediate', 'advanced'));
    END IF;
END$$;

-- Success message
SELECT 'Step 2 Complete: Profiles table enhanced' as result;