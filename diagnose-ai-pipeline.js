import { createClient } from '@supabase/supabase-js'

// PRODUCTION DATABASE
const supabaseUrl = 'https://fyihypkigbcmsxyvseca.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 ANALYZING AI PIPELINE & DATABASE STRUCTURE...\n')

async function diagnoseAIPipeline() {
  // 1. Check story generation patterns
  console.log('📊 STORY GENERATION ANALYSIS:')
  console.log('================================')
  
  const { data: stories, error: storiesError } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (stories) {
    // Check for AI-related fields
    console.log(`\n✓ Recent ${stories.length} stories found`)
    
    // Analyze story structure
    const sampleStory = stories[0]
    if (sampleStory) {
      console.log('\n📝 Story Structure:')
      console.log('  Fields:', Object.keys(sampleStory).join(', '))
      
      // Check for AI generation flags
      const aiFields = Object.keys(sampleStory).filter(key => 
        key.includes('ai') || key.includes('generated') || key.includes('prompt') || 
        key.includes('model') || key.includes('completion')
      )
      console.log('  AI-related fields:', aiFields.length > 0 ? aiFields.join(', ') : 'NONE FOUND ⚠️')
      
      // Check story status
      const statusCounts = {}
      stories.forEach(s => {
        statusCounts[s.status || 'null'] = (statusCounts[s.status || 'null'] || 0) + 1
      })
      console.log('\n  Status distribution:', statusCounts)
    }
  }

  // 2. Check story segments (chapters)
  console.log('\n📚 STORY SEGMENTS/CHAPTERS:')
  console.log('================================')
  
  const { data: segments, error: segmentsError } = await supabase
    .from('story_segments')
    .select('*')
    .limit(5)
  
  if (segmentsError) {
    console.log('  ❌ No story_segments table found:', segmentsError.message)
    
    // Try alternative table names
    const alternativeTables = ['chapters', 'story_chapters', 'segments', 'story_content']
    for (const table of alternativeTables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (!error) {
        console.log(`  ✓ Found alternative table: ${table}`)
        if (data && data[0]) {
          console.log(`    Fields: ${Object.keys(data[0]).join(', ')}`)
        }
      }
    }
  } else if (segments) {
    console.log(`  ✓ Found ${segments.length} segments`)
    if (segments[0]) {
      console.log('    Fields:', Object.keys(segments[0]).join(', '))
    }
  }

  // 3. Check AI configuration tables
  console.log('\n🤖 AI CONFIGURATION:')
  console.log('================================')
  
  const aiTables = [
    'ai_models',
    'ai_config',
    'ai_settings',
    'generation_config',
    'prompt_templates',
    'story_templates'
  ]
  
  for (const table of aiTables) {
    const { data, error } = await supabase.from(table).select('*').limit(3)
    if (!error) {
      console.log(`  ✓ ${table}: ${data?.length || 0} records`)
      if (data && data[0]) {
        console.log(`    Sample:`, Object.keys(data[0]).slice(0, 5).join(', '))
      }
    }
  }

  // 4. Check Edge Functions / API endpoints
  console.log('\n⚡ EDGE FUNCTIONS & API:')
  console.log('================================')
  
  // Check if there are any generation logs
  const { data: logs, error: logsError } = await supabase
    .from('generation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (!logsError && logs) {
    console.log(`  ✓ Found ${logs.length} generation logs`)
    logs.forEach(log => {
      console.log(`    - ${log.status}: ${log.error_message || 'Success'}`)
    })
  } else {
    console.log('  ℹ️ No generation_logs table found')
  }

  // 5. Check user credits and limits
  console.log('\n💰 CREDITS & LIMITS:')
  console.log('================================')
  
  const { data: credits } = await supabase
    .from('user_credits')
    .select('*')
    .limit(5)
  
  if (credits) {
    console.log(`  ✓ Credit system active: ${credits.length} users with credits`)
  }

  // 6. Check for error patterns
  console.log('\n❌ ERROR PATTERNS:')
  console.log('================================')
  
  // Check stories with null/empty content
  const { count: emptyStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .or('content.is.null,content.eq.')
  
  console.log(`  Empty content stories: ${emptyStories || 0}`)
  
  // Check failed status
  const { count: failedStories } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed')
  
  console.log(`  Failed stories: ${failedStories || 0}`)

  // 7. Recent activity
  console.log('\n📈 RECENT ACTIVITY:')
  console.log('================================')
  
  const { data: recentStories } = await supabase
    .from('stories')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (recentStories) {
    const now = new Date()
    const last24h = recentStories.filter(s => {
      const created = new Date(s.created_at)
      return (now - created) < (24 * 60 * 60 * 1000)
    }).length
    
    const last7d = recentStories.filter(s => {
      const created = new Date(s.created_at)
      return (now - created) < (7 * 24 * 60 * 60 * 1000)
    }).length
    
    console.log(`  Last 24 hours: ${last24h} stories`)
    console.log(`  Last 7 days: ${last7d} stories`)
  }
}

await diagnoseAIPipeline()
process.exit(0)