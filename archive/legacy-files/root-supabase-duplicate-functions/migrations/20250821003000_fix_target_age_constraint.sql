-- Fix target_age constraint to allow proper age ranges
-- Migration: Remove overly restrictive target_age constraint and create proper one

-- Drop the existing constraint if it exists
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_target_age_check;

-- Add a proper constraint that allows reasonable age ranges (3-18 years)
ALTER TABLE public.stories 
ADD CONSTRAINT stories_target_age_check 
CHECK (target_age >= 3 AND target_age <= 18);

-- Update any existing invalid ages to be within range
UPDATE public.stories 
SET target_age = CASE 
    WHEN target_age < 3 THEN 3
    WHEN target_age > 18 THEN 18
    ELSE target_age
END
WHERE target_age < 3 OR target_age > 18;