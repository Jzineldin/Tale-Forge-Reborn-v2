-- Credit System Implementation - Safe Application
-- Manages user credit balances, transactions, and usage tracking

-- Create credits table for tracking user credit balances (safe CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_balance INTEGER DEFAULT 0 NOT NULL,
  total_earned INTEGER DEFAULT 0 NOT NULL,
  total_spent INTEGER DEFAULT 0 NOT NULL,
  last_monthly_refresh TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Create credit transactions table for detailed tracking (safe CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'spend', 'refund', 'monthly_refresh'
  amount INTEGER NOT NULL, -- positive for earning, negative for spending
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID, -- story_id, subscription_id, etc.
  reference_type VARCHAR(50), -- 'story', 'subscription', 'purchase', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create credit costs configuration table (safe CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS credit_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL UNIQUE, -- 'story_text', 'story_image', 'story_audio'
  cost_per_unit INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default credit costs (safe ON CONFLICT)
INSERT INTO credit_costs (action_type, cost_per_unit, description) VALUES
('story_text', 1, 'Cost per story text segment (chapter)'),
('story_image', 3, 'Cost per story illustration'),
('story_audio', 3, 'Cost per audio narration segment')
ON CONFLICT (action_type) DO UPDATE SET
  cost_per_unit = EXCLUDED.cost_per_unit,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Function to initialize user credits (called when user signs up)
CREATE OR REPLACE FUNCTION initialize_user_credits(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  initial_credits INTEGER := 15; -- Free tier monthly credits
BEGIN
  INSERT INTO user_credits (user_id, current_balance, total_earned, last_monthly_refresh)
  VALUES (user_uuid, initial_credits, initial_credits, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Record the initial credit grant transaction
  INSERT INTO credit_transactions (
    user_id, 
    transaction_type, 
    amount, 
    balance_after, 
    description,
    reference_type
  ) VALUES (
    user_uuid,
    'monthly_refresh',
    initial_credits,
    initial_credits,
    'Initial free tier credits',
    'signup'
  ) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credit balance
CREATE OR REPLACE FUNCTION get_user_credits(user_uuid UUID)
RETURNS TABLE(
  current_balance INTEGER,
  total_earned INTEGER,
  total_spent INTEGER,
  last_refresh TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uc.current_balance,
    uc.total_earned,
    uc.total_spent,
    uc.last_monthly_refresh
  FROM user_credits uc
  WHERE uc.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend credits
CREATE OR REPLACE FUNCTION spend_credits(
  user_uuid UUID,
  credits_to_spend INTEGER,
  description_text TEXT,
  ref_id UUID DEFAULT NULL,
  ref_type VARCHAR(50) DEFAULT NULL,
  transaction_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance with row lock
  SELECT current_balance INTO current_balance
  FROM user_credits
  WHERE user_id = user_uuid
  FOR UPDATE;
  
  -- Check if user exists and has sufficient credits
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'User credits not found';
  END IF;
  
  IF current_balance < credits_to_spend THEN
    RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - credits_to_spend;
  
  -- Update user credits
  UPDATE user_credits
  SET 
    current_balance = new_balance,
    total_spent = total_spent + credits_to_spend,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    reference_id,
    reference_type,
    metadata
  ) VALUES (
    user_uuid,
    'spend',
    -credits_to_spend,
    new_balance,
    description_text,
    ref_id,
    ref_type,
    transaction_metadata
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  user_uuid UUID,
  credits_to_add INTEGER,
  description_text TEXT,
  ref_id UUID DEFAULT NULL,
  ref_type VARCHAR(50) DEFAULT NULL,
  transaction_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Get current balance with row lock
  SELECT current_balance INTO current_balance
  FROM user_credits
  WHERE user_id = user_uuid
  FOR UPDATE;
  
  -- Initialize if user doesn't exist
  IF current_balance IS NULL THEN
    PERFORM initialize_user_credits(user_uuid);
    current_balance := 15; -- Default initial credits
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + credits_to_add;
  
  -- Update user credits
  UPDATE user_credits
  SET 
    current_balance = new_balance,
    total_earned = total_earned + credits_to_add,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    reference_id,
    reference_type,
    metadata
  ) VALUES (
    user_uuid,
    'earn',
    credits_to_add,
    new_balance,
    description_text,
    ref_id,
    ref_type,
    transaction_metadata
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate story costs based on structure
CREATE OR REPLACE FUNCTION calculate_story_cost(
  story_type VARCHAR(50), -- 'short', 'medium', 'long'
  include_images BOOLEAN DEFAULT TRUE,
  include_audio BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
  chapters INTEGER,
  text_cost INTEGER,
  image_cost INTEGER,
  audio_cost INTEGER,
  total_cost INTEGER
) AS $$
DECLARE
  chapter_count INTEGER;
  text_unit_cost INTEGER;
  image_unit_cost INTEGER;
  audio_unit_cost INTEGER;
BEGIN
  -- Get unit costs
  SELECT cost_per_unit INTO text_unit_cost FROM credit_costs WHERE action_type = 'story_text';
  SELECT cost_per_unit INTO image_unit_cost FROM credit_costs WHERE action_type = 'story_image';
  SELECT cost_per_unit INTO audio_unit_cost FROM credit_costs WHERE action_type = 'story_audio';
  
  -- Determine chapter count based on story type
  CASE story_type
    WHEN 'short' THEN chapter_count := 3;
    WHEN 'medium' THEN chapter_count := 5;
    WHEN 'long' THEN chapter_count := 8;
    ELSE chapter_count := 3; -- default to short
  END CASE;
  
  RETURN QUERY SELECT
    chapter_count,
    chapter_count * text_unit_cost,
    CASE WHEN include_images THEN chapter_count * image_unit_cost ELSE 0 END,
    CASE WHEN include_audio THEN chapter_count * audio_unit_cost ELSE 0 END,
    chapter_count * text_unit_cost + 
    CASE WHEN include_images THEN chapter_count * image_unit_cost ELSE 0 END +
    CASE WHEN include_audio THEN chapter_count * audio_unit_cost ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);

-- Enable RLS (Row Level Security)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credits
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage all credits" ON user_credits;
CREATE POLICY "Service can manage all credits" ON user_credits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for credit_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can manage all transactions" ON credit_transactions;
CREATE POLICY "Service can manage all transactions" ON credit_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Initialize credits for existing users who don't have credit records
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id 
    FROM auth.users au
    LEFT JOIN user_credits uc ON au.id = uc.user_id
    WHERE uc.user_id IS NULL
    LIMIT 100 -- Process in batches to avoid timeouts
  LOOP
    PERFORM initialize_user_credits(user_record.id);
  END LOOP;
END $$;