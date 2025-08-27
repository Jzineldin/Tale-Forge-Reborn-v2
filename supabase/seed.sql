-- Create test user for local development
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at) 
VALUES 
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'test@example.com', crypt('testpass123', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}', '{}', false, NOW(), NOW());