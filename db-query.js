import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getTableData(tableName, options = {}) {
  try {
    let query = supabase.from(tableName).select('*')
    
    if (options.count) {
      query = supabase.from(tableName).select('*', { count: 'exact' })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error, count } = await query
    
    if (error) {
      console.error('Error:', error)
      return null
    }
    
    return { data, count }
  } catch (err) {
    console.error('Query error:', err)
    return null
  }
}

// Usage examples
console.log('Getting database info...')

// Count stories
const storiesResult = await getTableData('stories', { count: true, limit: 5 })
if (storiesResult) {
  console.log('Total stories:', storiesResult.count)
  console.log('Sample stories:', storiesResult.data?.slice(0, 3))
}

// Count users  
const usersResult = await getTableData('profiles', { count: true, limit: 3 })
if (usersResult) {
  console.log('Total users:', usersResult.count)
}

// Check credit transactions
const creditsResult = await getTableData('credit_transactions', { count: true, limit: 5 })
if (creditsResult) {
  console.log('Total credit transactions:', creditsResult.count)
  console.log('Recent transactions:', creditsResult.data?.slice(0, 2))
}

process.exit(0)