-- Add support for age group 3-4
-- This extends the target_age constraint to include very young children

-- First, let's check the current constraint
-- The constraint likely allows only '4-6', '7-9', '10-12'

-- Drop the existing constraint
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_target_age_check;

-- Add the updated constraint with 3-4 support
ALTER TABLE public.stories 
ADD CONSTRAINT stories_target_age_check 
CHECK (target_age IN ('3-4', '4-6', '7-9', '10-12'));

-- Update the shared utilities and frontend to recognize 3-4 age group
-- (Note: This requires frontend code changes as well)

-- Add a comment explaining the age ranges
COMMENT ON COLUMN public.stories.target_age IS 'Age group for the story: 3-4 (20-40 words), 4-6 (50-90 words), 7-9 (80-120 words), 10-12 (150-180 words)';

-- Verify the constraint works
DO $$
BEGIN
    -- Test that 3-4 is now allowed
    INSERT INTO public.stories (
        id, title, description, genre, target_age, story_mode, 
        is_completed, is_public, language, content_rating
    ) VALUES (
        gen_random_uuid(), 
        'Test Story 3-4', 
        'Test story for very young children',
        'adventure',
        '3-4',
        'interactive',
        false,
        false,
        'en',
        'G'
    );
    
    -- Clean up the test record
    DELETE FROM public.stories WHERE title = 'Test Story 3-4';
    
    RAISE NOTICE 'Age group 3-4 constraint update successful!';
EXCEPTION
    WHEN check_violation THEN
        RAISE EXCEPTION 'Failed to update constraint: %', SQLERRM;
END
$$;