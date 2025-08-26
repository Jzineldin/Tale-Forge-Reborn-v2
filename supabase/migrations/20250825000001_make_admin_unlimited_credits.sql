-- Make admin users have unlimited credits by modifying the existing spend_credits function
-- This migration modifies the existing spend_credits function to bypass credit checks for admin users

-- First, update the user to be admin
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email
  SELECT au.id INTO target_user_id
  FROM auth.users au 
  WHERE au.email = 'jzineldin@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Update user profile to admin
    INSERT INTO user_profiles (id, role, updated_at)
    VALUES (target_user_id, 'admin', NOW())
    ON CONFLICT (id) 
    DO UPDATE SET 
      role = 'admin', 
      updated_at = NOW();
    
    -- Give them unlimited credits (999999)
    INSERT INTO user_credits (user_id, current_balance, total_earned, updated_at)
    VALUES (target_user_id, 999999, 999999, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      current_balance = 999999,
      total_earned = GREATEST(user_credits.total_earned, 999999),
      updated_at = NOW();
    
    -- Log admin setup
    INSERT INTO credit_transactions (
      user_id,
      transaction_type,
      amount,
      balance_after,
      description,
      reference_type
    ) VALUES (
      target_user_id,
      'admin_setup',
      999999,
      999999,
      'Admin user setup - unlimited credits granted',
      'admin'
    );
    
    RAISE NOTICE 'Admin user setup completed for jzineldin@gmail.com (ID: %)', target_user_id;
  ELSE
    RAISE NOTICE 'User jzineldin@gmail.com not found';
  END IF;
END $$;

-- Override the spend_credits function to allow unlimited spending for admins
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
  user_role TEXT;
BEGIN
  -- Check if user is admin first
  SELECT up.role INTO user_role
  FROM user_profiles up
  WHERE up.id = user_uuid;
  
  -- If admin, allow unlimited spending
  IF user_role = 'admin' THEN
    -- Get current balance (or set to a high value if NULL)
    SELECT COALESCE(current_balance, 999999) INTO current_balance
    FROM user_credits
    WHERE user_id = user_uuid;
    
    -- For admins, maintain high balance
    new_balance := GREATEST(current_balance, 999999);
    
    -- Update or insert credits record
    INSERT INTO user_credits (user_id, current_balance, total_spent, updated_at)
    VALUES (user_uuid, new_balance, credits_to_spend, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      current_balance = GREATEST(user_credits.current_balance, 999999),
      total_spent = user_credits.total_spent + credits_to_spend,
      updated_at = NOW();
    
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
      'admin_spend',
      -credits_to_spend,
      new_balance,
      description_text || ' (Admin - Unlimited)',
      ref_id,
      ref_type,
      transaction_metadata
    );
    
    RETURN TRUE;
  END IF;
  
  -- For non-admin users, use the original logic
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