-- Simple Admin User Creation for Local Development
-- Creates admin user with your email for testing

DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Create auth user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'jzineldin@gmail.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated'
    )
    RETURNING id INTO user_id;

    RAISE NOTICE 'Admin user created with ID: %', user_id;

    -- Create user profile if table exists
    INSERT INTO user_profiles (id, role, created_at, updated_at)
    VALUES (user_id, 'admin', now(), now())
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        updated_at = now();

    -- Initialize credits if table exists
    INSERT INTO user_credits (user_id, current_balance, total_earned, created_at, updated_at)
    VALUES (user_id, 999999, 999999, now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
        current_balance = 999999,
        total_earned = 999999,
        updated_at = now();

    RAISE NOTICE 'Admin user created/updated successfully!';
    RAISE NOTICE 'Email: jzineldin@gmail.com';
    RAISE NOTICE 'Password: admin123';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating admin user (tables may not exist yet): %', SQLERRM;
END $$;