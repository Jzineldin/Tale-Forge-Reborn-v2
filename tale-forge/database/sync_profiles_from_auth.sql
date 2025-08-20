-- =============================================================================
-- SYNC PROFILES TABLE - Copy all missing users from auth.users to profiles
-- This will ensure all 115 users appear in the profiles table
-- =============================================================================

-- Check current status
SELECT 
    'Before Sync:' as status,
    (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL) as auth_users,
    (SELECT COUNT(*) FROM public.user_profiles) as user_profiles_count,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count;

-- Insert missing users from auth.users to profiles table
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
        split_part(au.email, '@', 1)  -- Fallback to username from email
    ) as full_name,
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'avatar_url',
    au.created_at,
    COALESCE(au.updated_at, au.created_at),
    CASE 
        WHEN au.raw_app_meta_data->>'provider' = 'google' THEN 'google'
        WHEN au.raw_app_meta_data->>'provider' = 'github' THEN 'github'
        WHEN au.raw_app_meta_data->>'provider' = 'facebook' THEN 'facebook'
        ELSE 'email'
    END as signup_method,
    CASE 
        WHEN au.email = 'jzineldin@gmail.com' THEN 'admin'
        ELSE 'user'
    END as role
FROM auth.users au
WHERE au.email IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Verify the sync worked
SELECT 
    'After Sync:' as status,
    (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL) as auth_users,
    (SELECT COUNT(*) FROM public.user_profiles) as user_profiles_count,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count,
    'Success! All users should now be in profiles table.' as result;

-- Show a sample of newly synced users
SELECT 
    'Sample Synced Users:' as info,
    email,
    full_name,
    signup_method,
    role,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;