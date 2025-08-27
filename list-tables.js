import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

// Get all tables
const { data: tables, error } = await supabase.rpc('get_schema_tables')
if (error) {
  console.log('RPC not available, trying direct query approach...')
  // Alternative method - check a few common tables
  const commonTables = ['auth.users', 'stories', 'user_credits', 'credit_transactions', 'achievements', 'user_story_templates']
  
  for (const table of commonTables) {
    try {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (!error) {
        console.log(`✅ Table "${table}": ${count} records`)
      }
    } catch (err) {
      console.log(`❌ Table "${table}": not accessible or doesn't exist`)
    }
  }
} else {
  console.log('Available tables:', tables)
}

process.exit(0)