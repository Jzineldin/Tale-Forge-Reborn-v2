-- Add template support columns to stories table
-- Ensures stories table supports template-based story creation

-- Add template-related columns to stories table
DO $$ 
BEGIN
    -- Add template_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'template_id') THEN
        ALTER TABLE stories ADD COLUMN template_id UUID REFERENCES story_templates(id) ON DELETE SET NULL;
    END IF;

    -- Add child_name column for personalization if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'child_name') THEN
        ALTER TABLE stories ADD COLUMN child_name TEXT;
    END IF;

    -- Add status column if missing (for story lifecycle tracking)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'status') THEN
        ALTER TABLE stories ADD COLUMN status TEXT DEFAULT 'created' CHECK (status IN ('created', 'generating', 'ready', 'completed', 'failed'));
    END IF;

    -- Add cost column to track story creation cost
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'cost') THEN
        ALTER TABLE stories ADD COLUMN cost INTEGER DEFAULT 0;
    END IF;

    -- Add completed_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'completed_at') THEN
        ALTER TABLE stories ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add public_shared_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'public_shared_at') THEN
        ALTER TABLE stories ADD COLUMN public_shared_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Ensure target_age is TEXT to support age ranges like '6-8'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'target_age' AND data_type = 'integer') THEN
        ALTER TABLE stories ALTER COLUMN target_age TYPE TEXT USING target_age::TEXT;
    END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_stories_template_id ON stories(template_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_completed_at ON stories(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stories_public_shared ON stories(public_shared_at) WHERE public_shared_at IS NOT NULL;

-- Update RLS policies for stories to support public sharing
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own stories
DROP POLICY IF EXISTS "Users can view their own stories" ON stories;
CREATE POLICY "Users can view their own stories" ON stories
  FOR SELECT USING (user_id = auth.uid());

-- Policy for anyone to view public stories
DROP POLICY IF EXISTS "Anyone can view public stories" ON stories;
CREATE POLICY "Anyone can view public stories" ON stories
  FOR SELECT USING (is_public = TRUE AND status IN ('ready', 'completed'));

-- Policy for users to create stories
DROP POLICY IF EXISTS "Users can create stories" ON stories;
CREATE POLICY "Users can create stories" ON stories
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy for users to update their own stories
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (user_id = auth.uid());

-- Function to purchase full story audio (simplified version for post-completion)
CREATE OR REPLACE FUNCTION purchase_full_story_audio(
  user_uuid UUID,
  story_uuid UUID,
  credit_cost INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  audio_url TEXT,
  message TEXT
) AS $$
DECLARE
  current_balance INTEGER;
  story_exists BOOLEAN;
  mock_audio_url TEXT;
BEGIN
  -- Get current user credits
  SELECT current_balance INTO current_balance
  FROM get_user_credits(user_uuid);
  
  -- Check if user has enough credits
  IF current_balance < credit_cost THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'Insufficient credits';
    RETURN;
  END IF;
  
  -- Check if story exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM stories 
    WHERE id = story_uuid AND user_id = user_uuid
  ) INTO story_exists;
  
  IF NOT story_exists THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'Story not found or access denied';
    RETURN;
  END IF;
  
  -- For now, return a mock audio URL (will be replaced with actual TTS integration)
  mock_audio_url := 'https://example.com/audio/' || story_uuid || '.mp3';
  
  -- Deduct credits
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    description,
    reference_id,
    reference_type,
    metadata
  ) VALUES (
    user_uuid,
    'audio_purchase',
    -credit_cost,
    'Purchased audio narration for story',
    story_uuid::TEXT,
    'story_audio',
    jsonb_build_object('audio_url', mock_audio_url)
  );
  
  RETURN QUERY SELECT TRUE, mock_audio_url, 'Audio purchased successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION purchase_full_story_audio(UUID, UUID, INTEGER) TO authenticated;

COMMENT ON COLUMN stories.template_id IS 'Reference to the template used to create this story';
COMMENT ON COLUMN stories.child_name IS 'Name of child to personalize the story for';
COMMENT ON COLUMN stories.status IS 'Current status of the story in its lifecycle';
COMMENT ON COLUMN stories.cost IS 'Credits spent to create this story';
COMMENT ON FUNCTION purchase_full_story_audio IS 'Purchases full story audio narration with credit deduction';