import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabaseUrl = 'http://127.0.0.1:54321'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey)

const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long'

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Create user via Supabase Auth Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'jzineldin@gmail.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return
    }

    const userId = authData.user.id
    console.log(`✅ Created auth user with ID: ${userId}`)

    // Update user profile to admin role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        role: 'admin',
        full_name: 'Admin User'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return
    }

    console.log('✅ Created user profile')

    // Create unlimited credits
    const { error: creditsError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: userId,
        current_balance: 999999,
        total_earned: 999999,
        total_spent: 0
      })

    if (creditsError) {
      console.error('Credits creation error:', creditsError)
      return
    }

    console.log('✅ Created user credits')

    // Generate JWT token for this user
    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
      iat: Math.floor(Date.now() / 1000),
      iss: 'supabase-demo',
      sub: userId,
      email: 'jzineldin@gmail.com',
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

    console.log('\n' + '='.repeat(80))
    console.log('🎉 Admin User Setup Complete!')
    console.log('='.repeat(80))
    console.log(`📧 Email: jzineldin@gmail.com`)
    console.log(`🔒 Password: admin123`)
    console.log(`🆔 User ID: ${userId}`)
    console.log(`💰 Credits: 999,999 (unlimited)`)
    console.log(`\n🔑 JWT Token for testing:`)
    console.log(token)
    console.log('\n📝 Update your test-edge-functions.js with this token!')
    console.log('='.repeat(80))

    return {
      userId,
      email: 'jzineldin@gmail.com',
      token
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  }
}

// Run the function
createAdminUser()