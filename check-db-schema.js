import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkDatabaseSchema() {
  console.log('Checking database schema...')
  
  try {
    // Use raw SQL query to check tables
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_list')
    
    if (tablesError) {
      console.error('Error with RPC, trying direct query...')
      // Fallback to a simpler approach - try to query each table directly
      
      const requiredTables = [
        'user_story_templates',
        'user_achievements', 
        'user_goals',
        'achievements',
        'stories',
        'user_profiles'
      ]

      console.log('\n🔍 Checking required tables by attempting queries:')
      for (const tableName of requiredTables) {
        try {
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (error) {
            console.log(`  ❌ ${tableName} - ${error.message}`)
          } else {
            console.log(`  ✅ ${tableName}`)
          }
        } catch (e) {
          console.log(`  ❌ ${tableName} - ${e.message}`)
        }
      }
    } else {
      console.log('\n📋 Available tables:', tables)
    }

    // Check the get_available_achievements function by trying to call it
    console.log('\n🔧 Checking for get_available_achievements function...')
    try {
      const { error: funcError } = await supabase.rpc('get_available_achievements', {
        user_uuid: '00000000-0000-0000-0000-000000000000' // dummy UUID
      })
      
      if (funcError) {
        console.log(`  ❌ get_available_achievements function - ${funcError.message}`)
      } else {
        console.log(`  ✅ get_available_achievements function`)
      }
    } catch (e) {
      console.log(`  ❌ get_available_achievements function - ${e.message}`)
    }

  } catch (error) {
    console.error('Database connection error:', error)
  }
}

checkDatabaseSchema()