-- =============================================================================
-- SYNC MISSING USERS FROM AUTH.USERS TO PROFILES
-- This will create profiles for users who are in auth.users but missing from profiles
-- =============================================================================

-- First, let's see what we have
SELECT 
    'Current Status:' as info,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count;

-- Create profiles for users who exist in auth.users but not in profiles
INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    username,
    avatar_url,
    signup_method,
    created_at,
    role
)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', 'User'),
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'avatar_url',
    CASE 
        WHEN au.raw_app_meta_data->>'provider' = 'google' THEN 'google'
        WHEN au.raw_app_meta_data->>'provider' = 'github' THEN 'github' 
        ELSE 'email'
    END,
    au.created_at,
    CASE WHEN au.email = 'jzineldin@gmail.com' THEN 'admin' ELSE 'user' END
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL  -- Only users not already in profiles
AND au.email IS NOT NULL; -- Only users with valid emails

-- Create user_profiles for any missing users
INSERT INTO public.user_profiles (
    id,
    subscription_tier,
    is_premium,
    created_at
)
SELECT 
    au.id,
    'regular',
    false,
    au.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL  -- Only users not already in user_profiles
AND au.email IS NOT NULL; -- Only users with valid emails

-- Final count check
SELECT 
    'After Sync:' as info,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count,
    (SELECT COUNT(*) FROM public.user_profiles) as user_profiles_count,
    'All 115 users should now be synced!' as result;