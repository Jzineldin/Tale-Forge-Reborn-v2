-- Setup admin user for local development
-- This creates the admin user jzineldin@gmail.com with unlimited credits

DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    -- Create user in auth.users (for local development)
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
    
    -- Create user profile
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
    );
    
    -- Create user credits (unlimited for admin)
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
    );
    
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
    );
    
    RAISE NOTICE 'Admin user setup complete!';
    RAISE NOTICE 'Email: jzineldin@gmail.com';
    RAISE NOTICE 'Password: admin123 (for local development only)';
    RAISE NOTICE 'Role: admin';
    RAISE NOTICE 'Credits: 999999 (unlimited)';
    
END $$;