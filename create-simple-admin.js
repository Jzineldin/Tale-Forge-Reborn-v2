import jwt from 'jsonwebtoken'

const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long'

// For testing, let's just generate a token with a known UUID and see if we can fix the user creation later
const ADMIN_USER = {
  // Use a fixed UUID that we'll create manually
  sub: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  email: 'jzineldin@gmail.com',
  role: 'admin'
}

function createTestToken() {
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days  
    iat: Math.floor(Date.now() / 1000),
    iss: 'supabase-demo',
    sub: ADMIN_USER.sub,
    email: ADMIN_USER.email,
    phone: '',
    app_metadata: {
      provider: 'email',
      providers: ['email']
    },
    user_metadata: {
      name: 'Admin User',
      role: 'admin'
    },
    role: 'authenticated',
    aal: 'aal1',
    amr: [{ method: 'password', timestamp: Math.floor(Date.now() / 1000) }],
    session_id: '00000000-0000-0000-0000-000000000000'
  }

  const token = jwt.sign(payload, JWT_SECRET)
  return { userId: ADMIN_USER.sub, token }
}

// Generate the token
const { userId, token } = createTestToken()

console.log('\n' + '='.repeat(80))
console.log('🔑 Test JWT Token Generated')
console.log('='.repeat(80))
console.log(`🆔 User ID: ${userId}`)
console.log(`📧 Email: ${ADMIN_USER.email}`)
console.log(`🔑 Token: ${token}`)
console.log('\n📝 Now manually insert this user into the database...')
console.log('='.repeat(80))

// SQL to insert manually
const insertSQL = `
-- Insert into auth.users manually
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
    raw_user_meta_data
) VALUES (
    '${userId}',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    '${ADMIN_USER.email}',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin User", "role": "admin"}'
);

-- Insert into user_profiles
INSERT INTO user_profiles (
    id,
    role,
    full_name
) VALUES (
    '${userId}',
    'admin',
    'Admin User'
);

-- Insert into user_credits  
INSERT INTO user_credits (
    user_id,
    current_balance,
    total_earned,
    total_spent
) VALUES (
    '${userId}',
    999999,
    999999,
    0
);
`

console.log('\n📋 SQL to execute:')
console.log(insertSQL)

export { token, userId }