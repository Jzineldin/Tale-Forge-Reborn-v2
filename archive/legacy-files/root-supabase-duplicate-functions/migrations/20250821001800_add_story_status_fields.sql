-- Add status tracking fields for async story generation
-- Migration: Add status, error_message, and tokens_used to stories table

-- Add status column for tracking story generation progress
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ready'
CHECK (status IN ('generating', 'ready', 'error'));

-- Add error_message column for storing generation errors
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add tokens_used column for tracking AI usage
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;

-- Add index on status for efficient querying
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);

-- Add index on user_id and status for efficient user queries
CREATE INDEX IF NOT EXISTS idx_stories_user_status ON stories(user_id, status);

-- Update existing stories to have 'ready' status if they have content
UPDATE stories 
SET status = 'ready' 
WHERE status IS NULL AND id IN (
  SELECT DISTINCT story_id 
  FROM story_segments 
  WHERE content IS NOT NULL AND content != ''
);

-- Update stories without content to 'generating' status
UPDATE stories 
SET status = 'generating' 
WHERE status IS NULL AND id NOT IN (
  SELECT DISTINCT story_id 
  FROM story_segments 
  WHERE content IS NOT NULL AND content != ''
);

-- Add comment for documentation
COMMENT ON COLUMN stories.status IS 'Story generation status: generating, ready, error';
COMMENT ON COLUMN stories.error_message IS 'Error message if generation failed';
COMMENT ON COLUMN stories.tokens_used IS 'Number of AI tokens used for generation';