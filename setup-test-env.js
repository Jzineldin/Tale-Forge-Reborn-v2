// Setup test environment variables for local Supabase edge functions
// This creates a local .env file that will be used by edge functions

import { writeFileSync } from 'fs'

const testEnvVars = {
  // OpenAI API (dummy key for testing - functions should handle gracefully)
  'OPENAI_API_KEY': 'sk-test-dummy-key-for-local-testing-only',
  
  // OVH AI (dummy token)
  'OVH_AI_ENDPOINTS_ACCESS_TOKEN': 'test-dummy-ovh-token',
  
  // Remove NVIDIA since not using it
  // 'NVIDIA_RIVA_API_KEY': 'dummy-riva-key',
  
  // Stripe (dummy keys for webhook testing)
  'STRIPE_SECRET_KEY': 'sk_test_dummy_stripe_key',
  'STRIPE_WEBHOOK_SECRET': 'whsec_dummy_webhook_secret',
  
  // Supabase (these should already be set)
  'SUPABASE_URL': 'http://127.0.0.1:54321',
  'SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
}

// Create .env file content
const envContent = Object.entries(testEnvVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')

// Write to .env file (for general use)
writeFileSync('.env', envContent)

// Also write to supabase functions directory if it has env support
writeFileSync('supabase/functions/.env', envContent)

console.log('✅ Test environment variables configured')
console.log('📝 Created .env files with dummy API keys for local testing')
console.log('\n⚠️  WARNING: These are dummy keys for testing only!')
console.log('For production, replace with real API keys.\n')

console.log('📋 Configured variables:')
Object.keys(testEnvVars).forEach(key => {
  const value = testEnvVars[key]
  const preview = value.length > 20 ? value.substring(0, 20) + '...' : value
  console.log(`   ${key}: ${preview}`)
})

console.log('\n🚀 Now restart supabase functions to pick up new environment:')
console.log('   supabase functions serve --debug')