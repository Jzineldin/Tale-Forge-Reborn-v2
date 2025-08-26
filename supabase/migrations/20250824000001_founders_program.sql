-- Tale Forge Founders Program Database Schema
-- This migration implements the founders program tracking and benefits system

-- Create founders program tracking table
CREATE TABLE founders_program (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    founder_number INTEGER UNIQUE CHECK (founder_number >= 1 AND founder_number <= 200),
    qualified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_verified_at TIMESTAMP WITH TIME ZONE,
    tier_when_qualified TEXT NOT NULL CHECK (tier_when_qualified IN ('premium', 'professional')),
    certificate_url TEXT,
    is_active BOOLEAN DEFAULT true,
    referral_code TEXT UNIQUE, -- Special founder referral codes
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column to user profiles if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add founder status to user profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS founder_number INTEGER,
ADD COLUMN IF NOT EXISTS founder_benefits_active BOOLEAN DEFAULT false;

-- Create founder program settings and counters
CREATE TABLE founders_program_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Singleton table
    is_active BOOLEAN DEFAULT true,
    total_spots INTEGER DEFAULT 200,
    spots_claimed INTEGER DEFAULT 0,
    program_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    program_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '60 days'),
    lifetime_discount_percent INTEGER DEFAULT 40,
    monthly_bonus_credits INTEGER DEFAULT 50,
    credit_purchase_bonus_percent INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO founders_program_settings (id) VALUES (1);

-- Create founder benefits tracking
CREATE TABLE founder_benefits_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    founder_id UUID REFERENCES founders_program(id) NOT NULL,
    benefit_type TEXT NOT NULL, -- 'discount', 'bonus_credits', 'priority_access', etc.
    benefit_amount NUMERIC,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create founder referrals tracking
CREATE TABLE founder_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_founder_id UUID REFERENCES founders_program(id) NOT NULL,
    referred_user_id UUID REFERENCES auth.users(id) NOT NULL,
    referral_code TEXT NOT NULL,
    signup_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_to_paid BOOLEAN DEFAULT false,
    conversion_date TIMESTAMP WITH TIME ZONE,
    bonus_credits_awarded INTEGER DEFAULT 0
);

-- Function to get next available founder number
CREATE OR REPLACE FUNCTION get_next_founder_number()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_number INTEGER;
    program_active BOOLEAN;
    spots_remaining INTEGER;
BEGIN
    -- Check if program is still active
    SELECT 
        is_active,
        (total_spots - spots_claimed)
    INTO 
        program_active,
        spots_remaining
    FROM founders_program_settings 
    WHERE id = 1;
    
    -- Return NULL if program is inactive or full
    IF NOT program_active OR spots_remaining <= 0 THEN
        RETURN NULL;
    END IF;
    
    -- Get the next available number
    SELECT spots_claimed + 1 
    INTO next_number
    FROM founders_program_settings 
    WHERE id = 1;
    
    -- Ensure we don't exceed 200
    IF next_number > 200 THEN
        RETURN NULL;
    END IF;
    
    RETURN next_number;
END;
$$;

-- Function to register a new founder
CREATE OR REPLACE FUNCTION register_founder(
    p_user_id UUID,
    p_tier TEXT
)
RETURNS TABLE(
    founder_number INTEGER,
    referral_code TEXT,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_founder_number INTEGER;
    v_referral_code TEXT;
    v_program_active BOOLEAN;
    v_spots_remaining INTEGER;
BEGIN
    -- Check if user is already a founder
    IF EXISTS (SELECT 1 FROM founders_program WHERE user_id = p_user_id) THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, false, 'User is already a founder';
        RETURN;
    END IF;
    
    -- Check program status
    SELECT 
        is_active,
        (total_spots - spots_claimed)
    INTO 
        v_program_active,
        v_spots_remaining
    FROM founders_program_settings 
    WHERE id = 1;
    
    IF NOT v_program_active THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, false, 'Founders program is not active';
        RETURN;
    END IF;
    
    IF v_spots_remaining <= 0 THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, false, 'All founder spots have been claimed';
        RETURN;
    END IF;
    
    -- Get next founder number
    SELECT get_next_founder_number() INTO v_founder_number;
    
    IF v_founder_number IS NULL THEN
        RETURN QUERY SELECT NULL::INTEGER, NULL::TEXT, false, 'No founder spots available';
        RETURN;
    END IF;
    
    -- Generate unique referral code
    v_referral_code := 'FOUNDER' || LPAD(v_founder_number::TEXT, 3, '0');
    
    -- Insert new founder record
    INSERT INTO founders_program (
        user_id,
        founder_number,
        tier_when_qualified,
        referral_code,
        payment_verified_at
    ) VALUES (
        p_user_id,
        v_founder_number,
        p_tier,
        v_referral_code,
        NOW()
    );
    
    -- Update user profile
    UPDATE user_profiles 
    SET 
        is_founder = true,
        founder_number = v_founder_number,
        founder_benefits_active = true
    WHERE id = p_user_id;
    
    -- Update program counter
    UPDATE founders_program_settings 
    SET 
        spots_claimed = spots_claimed + 1,
        updated_at = NOW()
    WHERE id = 1;
    
    -- Log the founder registration
    INSERT INTO founder_benefits_log (
        founder_id,
        benefit_type,
        description
    ) SELECT 
        fp.id,
        'founder_registration',
        'Founder #' || v_founder_number || ' registered with ' || p_tier || ' tier'
    FROM founders_program fp 
    WHERE fp.user_id = p_user_id;
    
    RETURN QUERY SELECT v_founder_number, v_referral_code, true, 'Successfully registered as founder #' || v_founder_number;
END;
$$;

-- Function to get founder program status (for real-time counter)
CREATE OR REPLACE FUNCTION get_founders_program_status()
RETURNS TABLE(
    is_active BOOLEAN,
    total_spots INTEGER,
    spots_claimed INTEGER,
    spots_remaining INTEGER,
    program_end_date TIMESTAMP WITH TIME ZONE,
    last_founder_number INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fps.is_active,
        fps.total_spots,
        fps.spots_claimed,
        (fps.total_spots - fps.spots_claimed) as spots_remaining,
        fps.program_end_date,
        COALESCE(MAX(fp.founder_number), 0) as last_founder_number
    FROM founders_program_settings fps
    LEFT JOIN founders_program fp ON fp.is_active = true
    WHERE fps.id = 1
    GROUP BY fps.is_active, fps.total_spots, fps.spots_claimed, fps.program_end_date;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_founders_program_user_id ON founders_program(user_id);
CREATE INDEX idx_founders_program_number ON founders_program(founder_number);
CREATE INDEX idx_founder_referrals_referrer ON founder_referrals(referrer_founder_id);
CREATE INDEX idx_founder_benefits_founder ON founder_benefits_log(founder_id);

-- Enable Row Level Security
ALTER TABLE founders_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_benefits_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own founder record
CREATE POLICY "Users can read own founder record" ON founders_program
FOR SELECT USING (auth.uid() = user_id);

-- Users can read their own benefits log
CREATE POLICY "Users can read own benefits log" ON founder_benefits_log
FOR SELECT USING (
    founder_id IN (SELECT id FROM founders_program WHERE user_id = auth.uid())
);

-- Users can read their own referrals
CREATE POLICY "Users can read own referrals" ON founder_referrals
FOR SELECT USING (
    referrer_founder_id IN (SELECT id FROM founders_program WHERE user_id = auth.uid())
);

-- Public read access to program status (for counter)
CREATE POLICY "Anyone can read program status" ON founders_program_settings
FOR SELECT USING (true);

-- Admin policies (for admin users only)
-- Note: In production, you'd check for admin role
CREATE POLICY "Admins can manage founders program" ON founders_program
FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create a view for public founder leaderboard  
CREATE VIEW public_founders_leaderboard AS
SELECT 
    fp.founder_number,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as display_name,
    au.raw_user_meta_data->>'avatar_url' as avatar_url,
    fp.qualified_at,
    fp.total_referrals,
    fp.tier_when_qualified
FROM founders_program fp
JOIN auth.users au ON au.id = fp.user_id
WHERE fp.is_active = true
ORDER BY fp.founder_number ASC;

-- Grant access to the view
GRANT SELECT ON public_founders_leaderboard TO anon, authenticated;

COMMENT ON TABLE founders_program IS 'Tracks the first 200 paid subscribers who qualify for lifetime founder benefits';
COMMENT ON TABLE founders_program_settings IS 'Configuration and counters for the founders program';
COMMENT ON TABLE founder_benefits_log IS 'Audit log of all founder benefits applied';
COMMENT ON TABLE founder_referrals IS 'Tracks successful referrals made by founders';
COMMENT ON FUNCTION register_founder IS 'Atomically registers a new founder and assigns founder number';
COMMENT ON FUNCTION get_founders_program_status IS 'Returns current program status for real-time counters';