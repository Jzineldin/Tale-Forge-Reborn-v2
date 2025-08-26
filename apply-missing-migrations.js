import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function applyMigrationFile(filePath) {
  console.log(`\n📄 Applying migration: ${path.basename(filePath)}`)
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8')
    
    // Split SQL by statements (rough approach for now)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))
    
    console.log(`   Found ${statements.length} SQL statements`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.log(`   ⚠️  Statement ${i + 1} warning: ${error.message}`)
            // Continue with other statements
          } else {
            console.log(`   ✅ Statement ${i + 1} applied`)
          }
        } catch (e) {
          console.log(`   ❌ Statement ${i + 1} failed: ${e.message}`)
        }
      }
    }
    
  } catch (error) {
    console.error(`❌ Failed to read or apply migration: ${error.message}`)
  }
}

async function applyMissingMigrations() {
  console.log('🔧 Applying missing migrations...')
  
  const migrationFiles = [
    'supabase/migrations/20250825160000_user_generated_templates.sql',
    'supabase/migrations/20250825161000_achievement_system.sql', 
    'supabase/migrations/20250825163000_seed_achievements.sql'
  ]
  
  for (const file of migrationFiles) {
    const fullPath = path.resolve(file)
    if (fs.existsSync(fullPath)) {
      await applyMigrationFile(fullPath)
    } else {
      console.log(`❌ Migration file not found: ${file}`)
    }
  }
  
  console.log('\n✨ Migration application completed!')
  
  // Test the results
  console.log('\n🧪 Testing applied migrations...')
  
  const requiredTables = [
    'user_story_templates',
    'user_achievements', 
    'user_goals',
    'achievements'
  ]

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
  
  // Test function
  try {
    const { error: funcError } = await supabase.rpc('get_available_achievements', {
      user_uuid: '00000000-0000-0000-0000-000000000000'
    })
    
    if (funcError) {
      console.log(`  ❌ get_available_achievements function - ${funcError.message}`)
    } else {
      console.log(`  ✅ get_available_achievements function`)
    }
  } catch (e) {
    console.log(`  ❌ get_available_achievements function - ${e.message}`)
  }
}

applyMissingMigrations()