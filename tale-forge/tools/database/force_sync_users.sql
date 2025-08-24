-- =============================================================================
-- FORCE SYNC ALL USERS - Copy ALL users from auth.users to profiles
-- This script will forcefully populate the profiles table
-- =============================================================================

-- First, let's see what we're working with
SELECT 'BEFORE SYNC - Auth users count:' as info, COUNT(*) as count FROM auth.users WHERE email IS NOT NULL;
SELECT 'BEFORE SYNC - Profiles count:' as info, COUNT(*) as count FROM public.profiles;
SELECT 'BEFORE SYNC - User_profiles count:' as info, COUNT(*) as count FROM public.user_profiles;

-- Clear existing profiles (except admin) to avoid conflicts
DELETE FROM public.profiles WHERE email != 'jzineldin@gmail.com';

-- Insert ALL users from auth.users to profiles
INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    username,
    avatar_url,
    created_at,
    updated_at,
    signup_method,
    role
)
SELECT 
    au.id,
    au.email,
    COALESCE(
        au.raw_user_meta_data->>'full_name', 
        au.raw_user_meta_data->>'name',
        au.raw_user_meta_data->>'display_name',
        split_part(au.email, '@', 1)
    ) as full_name,
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'avatar_url',
    au.created_at,
    COALESCE(au.updated_at, au.created_at),
    COALESCE(au.raw_app_meta_data->>'provider', 'email') as signup_method,
    CASE 
        WHEN au.email = 'jzineldin@gmail.com' THEN 'admin'
        ELSE 'user'
    END as role
FROM auth.users au
WHERE au.email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = EXCLUDED.updated_at,
    signup_method = EXCLUDED.signup_method,
    role = EXCLUDED.role;

-- Show results
SELECT 'AFTER SYNC - Auth users count:' as info, COUNT(*) as count FROM auth.users WHERE email IS NOT NULL;
SELECT 'AFTER SYNC - Profiles count:' as info, COUNT(*) as count FROM public.profiles;
SELECT 'AFTER SYNC - User_profiles count:' as info, COUNT(*) as count FROM public.user_profiles;

-- Show sample of synced users
SELECT 'Sample synced users:' as info, email, full_name, signup_method, role 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;