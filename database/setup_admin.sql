-- Check and create admin user for local development
-- This script creates the admin user if it doesn't exist

-- First check if user exists
DO $$
DECLARE
    user_exists BOOLEAN DEFAULT FALSE;
    admin_user_id UUID;
BEGIN
    -- Check if the user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'jzineldin@gmail.com') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Create the user in auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        ) VALUES (
            gen_random_uuid(),
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'jzineldin@gmail.com',
            crypt('temppassword123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Admin User"}',
            false
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Created user jzineldin@gmail.com with ID: %', admin_user_id;
    ELSE
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'jzineldin@gmail.com';
        RAISE NOTICE 'User jzineldin@gmail.com already exists with ID: %', admin_user_id;
    END IF;
    
    -- Ensure user profile exists
    INSERT INTO user_profiles (id, role, full_name)
    VALUES (admin_user_id, 'admin', 'Admin User')
    ON CONFLICT (id) 
    DO UPDATE SET 
        role = 'admin',
        updated_at = NOW();
    
    -- Give unlimited credits
    INSERT INTO user_credits (user_id, current_balance, total_earned, updated_at)
    VALUES (admin_user_id, 999999, 999999, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        current_balance = 999999,
        total_earned = GREATEST(user_credits.total_earned, 999999),
        updated_at = NOW();
    
    -- Log admin setup
    INSERT INTO credit_transactions (
        user_id,
        transaction_type,
        amount,
        balance_after,
        description,
        reference_type
    ) VALUES (
        admin_user_id,
        'admin_setup',
        999999,
        999999,
        'Admin user setup - unlimited credits granted',
        'admin'
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Admin setup completed for jzineldin@gmail.com';
END $$;