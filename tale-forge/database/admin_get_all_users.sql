-- =============================================================================
-- ADMIN ACCESS TO ALL USERS - Bypass RLS for admin debugging
-- Run this in Supabase SQL editor to see all auth users
-- =============================================================================

-- Check all auth users with their metadata
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.updated_at,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.raw_user_meta_data->>'name' as name,
    au.raw_user_meta_data->>'display_name' as display_name,
    au.raw_app_meta_data->>'provider' as signup_provider
FROM auth.users au
WHERE au.email IS NOT NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- Check what's in user_profiles vs profiles
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM public.user_profiles
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest  
FROM public.profiles;

-- Check stories count
SELECT 
    'stories' as table_name,
    COUNT(*) as total_stories,
    COUNT(DISTINCT user_id) as unique_authors
FROM public.stories;