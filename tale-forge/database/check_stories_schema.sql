-- =============================================================================
-- CHECK STORIES TABLE SCHEMA - Find out what columns actually exist
-- =============================================================================

-- Check the stories table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'stories'
ORDER BY ordinal_position;

-- Also check a sample of the actual data
SELECT * FROM public.stories LIMIT 3;