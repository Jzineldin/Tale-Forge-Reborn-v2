-- Make target_age constraint more flexible to allow any reasonable age range
-- This allows templates and users to use any age range format while maintaining data integrity

-- Drop the restrictive constraint
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_target_age_check;

-- Add a flexible constraint that allows any reasonable age format
ALTER TABLE public.stories 
ADD CONSTRAINT stories_target_age_check 
CHECK (
  target_age ~ '^([0-9]{1,2}(-[0-9]{1,2})?|[0-9]{1,2}\+?)$' OR -- Matches: "3", "3-4", "7-9", "12+", etc.
  target_age IN ('toddler', 'preschool', 'early-elementary', 'elementary', 'middle-school', 'teen') -- Named categories
);

-- Update the comment to reflect flexibility
COMMENT ON COLUMN public.stories.target_age IS 'Flexible age targeting: numeric ranges (e.g., "3-4", "7-9", "12+"), single ages (e.g., "5"), or named categories (e.g., "preschool")';

-- Test the new flexible constraint
DO $$
BEGIN
    -- Test various age formats that should now work
    INSERT INTO public.stories (
        id, title, description, genre, target_age, story_mode, 
        is_completed, is_public, language, content_rating
    ) VALUES 
        (gen_random_uuid(), 'Test 1', 'Test', 'adventure', '3-4', 'interactive', false, false, 'en', 'G'),
        (gen_random_uuid(), 'Test 2', 'Test', 'adventure', '7-12', 'interactive', false, false, 'en', 'G'),
        (gen_random_uuid(), 'Test 3', 'Test', 'adventure', '5', 'interactive', false, false, 'en', 'G'),
        (gen_random_uuid(), 'Test 4', 'Test', 'adventure', '12+', 'interactive', false, false, 'en', 'G');
    
    -- Clean up test records
    DELETE FROM public.stories WHERE title LIKE 'Test %';
    
    RAISE NOTICE 'Flexible age constraint update successful! Now supports any reasonable age format.';
EXCEPTION
    WHEN check_violation THEN
        RAISE EXCEPTION 'Failed to update constraint: %', SQLERRM;
END
$$;