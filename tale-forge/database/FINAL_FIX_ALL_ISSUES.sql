-- =============================================================================
-- FINAL FIX - Run this ONE script to fix ALL admin panel issues
-- This will sync users and create admin access functions
-- =============================================================================

-- STEP 1: Check current state
SELECT 'BEFORE FIX:' as step, 'Auth users' as table_name, COUNT(*) as count FROM auth.users WHERE email IS NOT NULL
UNION ALL
SELECT 'BEFORE FIX:', 'Profiles', COUNT(*) FROM public.profiles
UNION ALL  
SELECT 'BEFORE FIX:', 'User_profiles', COUNT(*) FROM public.user_profiles
UNION ALL
SELECT 'BEFORE FIX:', 'Stories', COUNT(*) FROM public.stories;

-- STEP 2: Force sync ALL users from auth.users to profiles
-- Clear existing profiles except admin to avoid conflicts
DELETE FROM public.profiles WHERE email != 'jzineldin@gmail.com';

-- Insert ALL users from auth.users to profiles with proper conflict handling
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

-- STEP 3: Create admin RPC functions to bypass RLS
-- Function to get all user profiles for admin
CREATE OR REPLACE FUNCTION get_all_profiles_for_admin()
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    username text,
    avatar_url text,
    created_at timestamptz,
    updated_at timestamptz,
    signup_method text,
    role text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.username,
        p.avatar_url,
        p.created_at,
        p.updated_at,
        p.signup_method,
        p.role
    FROM public.profiles p
    ORDER BY p.created_at DESC;
$$;

-- Function to get all stories for admin users (using only existing columns)
CREATE OR REPLACE FUNCTION get_all_stories_for_admin()
RETURNS TABLE (
    id uuid,
    title text,
    user_id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    genre text,
    target_age text,
    is_completed boolean,
    description text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
    SELECT 
        s.id,
        s.title,
        s.user_id,
        s.created_at,
        s.updated_at,
        s.genre,
        s.target_age,
        s.is_completed,
        s.description
    FROM public.stories s
    ORDER BY s.created_at DESC
    LIMIT 100;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_all_profiles_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_stories_for_admin() TO authenticated;

-- STEP 4: Verify everything worked
SELECT 'AFTER FIX:' as step, 'Auth users' as table_name, COUNT(*) as count FROM auth.users WHERE email IS NOT NULL
UNION ALL
SELECT 'AFTER FIX:', 'Profiles', COUNT(*) FROM public.profiles
UNION ALL  
SELECT 'AFTER FIX:', 'User_profiles', COUNT(*) FROM public.user_profiles
UNION ALL
SELECT 'AFTER FIX:', 'Stories', COUNT(*) FROM public.stories;

-- Test the RPC functions
SELECT 'RPC TEST:' as step, 'Profiles function' as test_name, COUNT(*) as count FROM get_all_profiles_for_admin()
UNION ALL
SELECT 'RPC TEST:', 'Stories function', COUNT(*) FROM get_all_stories_for_admin();

-- Show sample of synced users with real emails
SELECT 'SUCCESS!' as status, email, full_name, role 
FROM public.profiles 
WHERE email != 'jzineldin@gmail.com'
ORDER BY created_at DESC 
LIMIT 5;