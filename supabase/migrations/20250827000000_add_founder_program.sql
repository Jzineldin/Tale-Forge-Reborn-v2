-- Add founder program support with subscription-based tiers
-- This migration adds founder status tracking tied to subscription levels

-- Add founder fields to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS founder_tier TEXT,  -- 'elite' or 'pioneer'
ADD COLUMN IF NOT EXISTS founder_number INTEGER,
ADD COLUMN IF NOT EXISTS founder_discount_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_lifetime_discount BOOLEAN DEFAULT FALSE;

-- Create founder program tracking table with tier limits
CREATE TABLE IF NOT EXISTS public.founder_program (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Elite Founders (Starter $9.99 subscribers) - 150 slots
  elite_founders_count INTEGER DEFAULT 0,
  elite_founders_limit INTEGER DEFAULT 150,
  elite_program_active BOOLEAN DEFAULT TRUE,
  
  -- Pioneer Founders (Premium $19.99 subscribers) - 50 slots  
  pioneer_founders_count INTEGER DEFAULT 0,
  pioneer_founders_limit INTEGER DEFAULT 50,
  pioneer_program_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize founder program with single row
INSERT INTO public.founder_program (
  elite_founders_count, elite_founders_limit, elite_program_active,
  pioneer_founders_count, pioneer_founders_limit, pioneer_program_active
) VALUES (0, 150, TRUE, 0, 50, TRUE)
ON CONFLICT DO NOTHING;

-- Function to assign founder status when user subscribes
CREATE OR REPLACE FUNCTION public.assign_founder_status_on_subscription()
RETURNS TRIGGER AS $$
DECLARE
  elite_count INTEGER;
  elite_limit INTEGER;
  elite_active BOOLEAN;
  pioneer_count INTEGER;
  pioneer_limit INTEGER;
  pioneer_active BOOLEAN;
  founder_tier TEXT;
  discount_percentage INTEGER;
BEGIN
  -- Only process active subscriptions for starter/premium plans
  IF NEW.status = 'active' AND NEW.plan_id IN ('starter', 'premium') THEN
    
    -- Get current founder program status
    SELECT 
      elite_founders_count, elite_founders_limit, elite_program_active,
      pioneer_founders_count, pioneer_founders_limit, pioneer_program_active
    INTO 
      elite_count, elite_limit, elite_active,
      pioneer_count, pioneer_limit, pioneer_active
    FROM public.founder_program
    LIMIT 1;

    -- Determine tier and benefits based on plan
    IF NEW.plan_id = 'premium' AND pioneer_active AND pioneer_count < pioneer_limit THEN
      -- Pioneer Founder (Premium subscribers)
      founder_tier := 'pioneer';
      discount_percentage := 60; -- Higher discount for premium
      
      -- Update founder program counters
      UPDATE public.founder_program 
      SET pioneer_founders_count = pioneer_count + 1,
          updated_at = NOW()
      WHERE id = (SELECT id FROM public.founder_program LIMIT 1);

      -- Check if pioneer program is full
      IF pioneer_count + 1 >= pioneer_limit THEN
        UPDATE public.founder_program 
        SET pioneer_program_active = FALSE,
            updated_at = NOW();
      END IF;

      -- Update user profile with Pioneer founder status
      UPDATE public.user_profiles
      SET 
        is_founder = TRUE,
        founder_tier = founder_tier,
        founder_number = pioneer_count + 1,
        founder_discount_percentage = discount_percentage,
        has_lifetime_discount = TRUE,
        updated_at = NOW()
      WHERE id = NEW.user_id;

    ELSIF NEW.plan_id = 'starter' AND elite_active AND elite_count < elite_limit THEN
      -- Elite Founder (Starter subscribers)
      founder_tier := 'elite';
      discount_percentage := 50; -- Standard discount for starter
      
      -- Update founder program counters
      UPDATE public.founder_program 
      SET elite_founders_count = elite_count + 1,
          updated_at = NOW()
      WHERE id = (SELECT id FROM public.founder_program LIMIT 1);

      -- Check if elite program is full
      IF elite_count + 1 >= elite_limit THEN
        UPDATE public.founder_program 
        SET elite_program_active = FALSE,
            updated_at = NOW();
      END IF;

      -- Update user profile with Elite founder status
      UPDATE public.user_profiles
      SET 
        is_founder = TRUE,
        founder_tier = founder_tier,
        founder_number = elite_count + 1,
        founder_discount_percentage = discount_percentage,
        has_lifetime_discount = TRUE,
        updated_at = NOW()
      WHERE id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-assign founder status on subscription creation
DROP TRIGGER IF EXISTS trigger_assign_founder_status_subscription ON public.user_subscriptions;
CREATE TRIGGER trigger_assign_founder_status_subscription
  AFTER INSERT ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_founder_status_on_subscription();

-- Function to get founder program status for UI display
CREATE OR REPLACE FUNCTION public.get_founder_program_status()
RETURNS TABLE (
  -- Elite Founders (Starter tier)
  elite_founders_count INTEGER,
  elite_founders_limit INTEGER,
  elite_program_active BOOLEAN,
  elite_spots_remaining INTEGER,
  
  -- Pioneer Founders (Premium tier)  
  pioneer_founders_count INTEGER,
  pioneer_founders_limit INTEGER,
  pioneer_program_active BOOLEAN,
  pioneer_spots_remaining INTEGER,
  
  -- Overall program status
  any_program_active BOOLEAN,
  total_founders_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.elite_founders_count,
    fp.elite_founders_limit,
    fp.elite_program_active,
    GREATEST(0, fp.elite_founders_limit - fp.elite_founders_count) as elite_spots_remaining,
    
    fp.pioneer_founders_count,
    fp.pioneer_founders_limit,
    fp.pioneer_program_active,
    GREATEST(0, fp.pioneer_founders_limit - fp.pioneer_founders_count) as pioneer_spots_remaining,
    
    (fp.elite_program_active OR fp.pioneer_program_active) as any_program_active,
    (fp.elite_founders_count + fp.pioneer_founders_count) as total_founders_count
  FROM public.founder_program fp
  LIMIT 1;
END;
$$;

-- Function to check if user is founder and get their status
CREATE OR REPLACE FUNCTION public.get_user_founder_status(user_uuid UUID)
RETURNS TABLE (
  is_founder BOOLEAN,
  founder_tier TEXT,
  founder_number INTEGER,
  discount_percentage INTEGER,
  has_lifetime_discount BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.is_founder,
    p.founder_tier,
    p.founder_number,
    p.founder_discount_percentage,
    p.has_lifetime_discount
  FROM public.user_profiles p
  WHERE p.id = user_uuid;
END;
$$;

-- Add RLS policies
ALTER TABLE public.founder_program ENABLE ROW LEVEL SECURITY;

-- Anyone can view founder program status (for signup/pricing pages)
CREATE POLICY "Anyone can view founder program status" ON public.founder_program
  FOR SELECT USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_founder ON public.user_profiles(is_founder);
CREATE INDEX IF NOT EXISTS idx_user_profiles_founder_tier ON public.user_profiles(founder_tier);
CREATE INDEX IF NOT EXISTS idx_user_profiles_founder_number ON public.user_profiles(founder_number);

-- Create view for founder leaderboards by tier
CREATE OR REPLACE VIEW public.founder_leaderboard AS
SELECT 
  up.id,
  au.email,
  up.full_name,
  up.founder_tier,
  up.founder_number,
  up.founder_discount_percentage,
  up.created_at,
  -- Rank within tier
  ROW_NUMBER() OVER (PARTITION BY up.founder_tier ORDER BY up.founder_number) as tier_rank
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.is_founder = TRUE
ORDER BY 
  CASE up.founder_tier 
    WHEN 'pioneer' THEN 1 
    WHEN 'elite' THEN 2 
    ELSE 3 
  END,
  up.founder_number ASC;

-- Note: Views inherit RLS from underlying tables
-- The founder_leaderboard view will use the RLS policies from user_profiles and auth.users