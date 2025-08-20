-- Check the current sync status between auth.users and profiles
SELECT 
    'User Sync Status Check' as info,
    (SELECT COUNT(*) FROM auth.users WHERE email IS NOT NULL) as auth_users_with_email,
    (SELECT COUNT(*) FROM public.profiles) as profiles_count,
    (SELECT COUNT(*) FROM auth.users au WHERE au.email IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)) as missing_profiles;

-- Show some sample users that are missing from profiles
SELECT 
    'Missing Users Sample:' as info,
    au.email,
    au.created_at
FROM auth.users au 
WHERE au.email IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
LIMIT 10;

-- Show current profiles
SELECT 
    'Current Profiles:' as info,
    email,
    full_name,
    created_at
FROM public.profiles
ORDER BY created_at;