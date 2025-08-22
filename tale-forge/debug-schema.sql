-- Check current schema of story_segments table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'story_segments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we have any stories
SELECT COUNT(*) as story_count FROM stories;

-- Check if we have any segments  
SELECT COUNT(*) as segment_count FROM story_segments;