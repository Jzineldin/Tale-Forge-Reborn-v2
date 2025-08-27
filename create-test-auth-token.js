import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

/**
 * Create a test JWT token for the admin user
 * This generates a proper authentication token for testing edge functions
 */

// JWT secret from local supabase (from supabase status)
const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';

// Admin user details (created by migration)
const ADMIN_USER = {
  email: 'jzineldin@gmail.com',
  role: 'admin',
  // We'll use a fixed UUID for consistency
  sub: '11111111-1111-1111-1111-111111111111' // This will be the user ID
};

function createAuthToken() {
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours from now
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
  };

  const token = jwt.sign(payload, JWT_SECRET);
  return token;
}

function createServiceRoleToken() {
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours from now
    iat: Math.floor(Date.now() / 1000),
    iss: 'supabase-demo',
    role: 'service_role'
  };

  const token = jwt.sign(payload, JWT_SECRET);
  return token;
}

const authToken = createAuthToken();
const serviceRoleToken = createServiceRoleToken();

console.log('='.repeat(80));
console.log('🔑 Test Authentication Tokens Generated');
console.log('='.repeat(80));
console.log('');
console.log('🔐 Admin User Token:');
console.log('   User ID:', ADMIN_USER.sub);
console.log('   Email:', ADMIN_USER.email);
console.log('   Role:', ADMIN_USER.role);
console.log('   Token:', authToken);
console.log('');
console.log('⚡ Service Role Token:');
console.log('   Token:', serviceRoleToken);
console.log('');
console.log('📋 Usage in test script:');
console.log('   Replace ANON_KEY with one of these tokens');
console.log('   Use Admin Token for user-authenticated functions');
console.log('   Use Service Role Token for admin functions');
console.log('');

// Export the tokens for use by other scripts
export { authToken, serviceRoleToken, ADMIN_USER };