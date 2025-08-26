-- Quick Admin Setup for jzineldin@gmail.com
-- Find user and set admin privileges with unlimited credits

-- Step 1: Find user ID
\set user_email 'jzineldin@gmail.com'

-- Step 2: Update or insert user profile as admin
WITH user_info AS (
  SELECT id FROM auth.users WHERE email = :'user_email'
)
INSERT INTO user_profiles (id, role, updated_at)
SELECT id, 'admin', NOW() FROM user_info
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin', 
  updated_at = NOW();

-- Step 3: Set unlimited credits
WITH user_info AS (
  SELECT id FROM auth.users WHERE email = :'user_email'
)
INSERT INTO user_credits (user_id, current_balance, total_earned, updated_at)
SELECT id, 999999, 999999, NOW() FROM user_info
ON CONFLICT (user_id) 
DO UPDATE SET 
  current_balance = 999999,
  total_earned = GREATEST(user_credits.total_earned, 999999),
  updated_at = NOW();

-- Step 4: Log transaction
WITH user_info AS (
  SELECT id FROM auth.users WHERE email = :'user_email'
)
INSERT INTO credit_transactions (
  user_id,
  transaction_type,
  amount,
  balance_after,
  description,
  reference_type
)
SELECT 
  id,
  'admin_setup',
  999999,
  999999,
  'REMOTE: Admin user setup - unlimited credits granted',
  'admin'
FROM user_info;

-- Verification
SELECT 
  'ADMIN SETUP COMPLETE' as status,
  au.email, 
  up.role, 
  uc.current_balance, 
  uc.total_earned
FROM auth.users au 
JOIN user_profiles up ON au.id = up.id 
LEFT JOIN user_credits uc ON up.id = uc.user_id 
WHERE au.email = :'user_email';