-- Setup admin user for local development
-- This creates the admin user jzineldin@gmail.com with unlimited credits

-- First, check if auth.users exists and create test user if needed
DO $$
DECLARE
    user_id uuid;
    existing_user_id uuid;
BEGIN
    -- Check if user already exists in auth.users
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'jzineldin@gmail.com' 
    LIMIT 1;
    
    IF existing_user_id IS NULL THEN
        -- Create user in auth.users (for local development)
        user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            aud,
            role
        ) VALUES (
            user_id,
            '00000000-0000-0000-0000-000000000000',
            'jzineldin@gmail.com',
            crypt('admin123', gen_salt('bf')), -- password: admin123
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Admin User"}',
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE 'Created new user with ID: %', user_id;
    ELSE
        user_id := existing_user_id;
        RAISE NOTICE 'Using existing user with ID: %', user_id;
    END IF;
    
    -- Create/update user profile
    INSERT INTO user_profiles (
        id,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'jzineldin@gmail.com',
        'admin',
        now(),
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        updated_at = now();
    
    RAISE NOTICE 'Created/updated user profile';
    
    -- Create/update user credits (unlimited for admin)
    INSERT INTO user_credits (
        user_id,
        current_balance,
        total_earned,
        total_spent,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        999999,
        999999,
        0,
        now(),
        now()
    ) ON CONFLICT (user_id) DO UPDATE SET
        current_balance = 999999,
        total_earned = 999999,
        updated_at = now();
    
    RAISE NOTICE 'Created/updated user credits';
    
    -- Add admin setup transaction record
    INSERT INTO credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description,
        reference_type,
        created_at
    ) VALUES (
        user_id,
        'admin_setup',
        999999,
        0,
        999999,
        'Admin user setup - unlimited credits granted',
        'admin',
        now()
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added admin setup transaction';
    
    RAISE NOTICE 'Admin user setup complete!';
    RAISE NOTICE 'Email: jzineldin@gmail.com';
    RAISE NOTICE 'Password: admin123 (for local development only)';
    RAISE NOTICE 'Role: admin';
    RAISE NOTICE 'Credits: 999999 (unlimited)';
    
END $$;