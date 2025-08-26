import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function runManualFix() {
  console.log('🔧 Running manual database fix...')
  
  const sql = fs.readFileSync('./manual-db-fix.sql', 'utf8')
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  console.log(`Found ${statements.length} SQL statements to execute`)
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (!statement.trim()) continue
    
    try {
      console.log(`\n📝 Executing statement ${i + 1}...`)
      
      // For CREATE TABLE statements, try using the SQL query builder
      if (statement.toLowerCase().includes('create table')) {
        const { error } = await supabase.rpc('execute_sql', { query: statement })
        if (error) {
          console.log(`   ⚠️  Statement ${i + 1}: ${error.message}`)
          // Continue with other statements even if one fails
        } else {
          console.log(`   ✅ Statement ${i + 1}: Success`)
        }
      } else if (statement.toLowerCase().includes('create or replace function')) {
        const { error } = await supabase.rpc('execute_sql', { query: statement })
        if (error) {
          console.log(`   ⚠️  Statement ${i + 1}: ${error.message}`)
        } else {
          console.log(`   ✅ Statement ${i + 1}: Function created`)
        }
      } else if (statement.toLowerCase().includes('insert into')) {
        const { error } = await supabase.rpc('execute_sql', { query: statement })
        if (error) {
          console.log(`   ⚠️  Statement ${i + 1}: ${error.message}`)
        } else {
          console.log(`   ✅ Statement ${i + 1}: Data inserted`)
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Statement ${i + 1} failed: ${error.message}`)
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n🧪 Testing database after manual fix...')
  
  // Test the tables
  const tables = ['achievements', 'user_achievements', 'user_goals', 'user_story_templates']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`)
      } else {
        console.log(`  ✅ ${table}: Working`)
      }
    } catch (e) {
      console.log(`  ❌ ${table}: ${e.message}`)
    }
  }
  
  // Test the function
  try {
    const { error } = await supabase.rpc('get_available_achievements', {
      user_uuid: '00000000-0000-0000-0000-000000000000'
    })
    if (error) {
      console.log(`  ❌ get_available_achievements: ${error.message}`)
    } else {
      console.log(`  ✅ get_available_achievements: Working`)
    }
  } catch (e) {
    console.log(`  ❌ get_available_achievements: ${e.message}`)
  }
  
  console.log('\n✨ Manual database fix completed!')
}

// Alternative approach if execute_sql doesn't work
async function tryDirectTableCreation() {
  console.log('\n🔄 Trying alternative approach - direct table operations...')
  
  // For now, just test if we can access the tables that should exist
  const requiredTables = ['achievements', 'user_achievements', 'user_goals', 'user_story_templates']
  
  console.log('\n🔍 Testing table access:')
  for (const tableName of requiredTables) {
    try {
      const { error } = await supabase.from(tableName).select('*').limit(1)
      if (error) {
        console.log(`  ❌ ${tableName} - ${error.message}`)
      } else {
        console.log(`  ✅ ${tableName} - Accessible`)
      }
    } catch (e) {
      console.log(`  ❌ ${tableName} - ${e.message}`)
    }
  }
  
  return true
}

runManualFix().catch(console.error)