-- =============================================================================
-- ADMIN STORIES ACCESS - Create RPC function for admin to access all stories
-- This bypasses RLS policies for admin users
-- =============================================================================

-- First, let's check what columns exist in stories table
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'stories'
ORDER BY ordinal_position;

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

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_all_stories_for_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_profiles_for_admin() TO authenticated;

-- Test the functions
SELECT 'Stories function test:' as info, COUNT(*) as count FROM get_all_stories_for_admin();
SELECT 'Profiles function test:' as info, COUNT(*) as count FROM get_all_profiles_for_admin();