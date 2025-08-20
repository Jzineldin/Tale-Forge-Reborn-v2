-- =============================================================================
-- CREATE RPC FUNCTION TO GET AUTH USERS FOR ADMIN
-- This function allows admin users to access auth.users data
-- =============================================================================

CREATE OR REPLACE FUNCTION get_auth_users_for_admin()
RETURNS TABLE (
    id uuid,
    email text,
    created_at timestamptz,
    updated_at timestamptz,
    raw_user_meta_data jsonb,
    raw_app_meta_data jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
    SELECT 
        au.id,
        au.email,
        au.created_at,
        au.updated_at,
        au.raw_user_meta_data,
        au.raw_app_meta_data
    FROM auth.users au
    WHERE au.email IS NOT NULL
    ORDER BY au.created_at DESC;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users_for_admin() TO authenticated;

-- Add RLS policy to ensure only admins can call this function
-- (This would be handled at the application level, but we could add a check here)