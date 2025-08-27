import { createClient } from '@supabase/supabase-js'

// PRODUCTION DATABASE ACCESS
const supabaseUrl = 'https://fyihypkigbcmsxyvseca.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aWh5cGtpZ2JjbXN4eXZzZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzM3NjAsImV4cCI6MjA2NjgwOTc2MH0.4LgZRIaUTuVG2_ddX8jbg-XGceWiTvmjoJ0T3GCmrkg'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getProductionData() {
  console.log('🔥 CONNECTING TO PRODUCTION DATABASE...')
  
  try {
    // Count stories
    const { count: storyCount, error: storyError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
    
    if (storyError) {
      console.error('Stories error:', storyError)
    } else {
      console.log('📚 TOTAL STORIES:', storyCount)
    }

    // Get sample stories
    const { data: sampleStories, error: sampleError } = await supabase
      .from('stories')
      .select('id, title, genre, created_at')
      .limit(5)
    
    if (!sampleError && sampleStories) {
      console.log('📖 SAMPLE STORIES:')
      sampleStories.forEach((story, i) => {
        console.log(`  ${i+1}. "${story.title}" (${story.genre}) - ${new Date(story.created_at).toLocaleDateString()}`)
      })
    }

    // Count users
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    if (!userError) {
      console.log('👥 TOTAL USERS:', userCount)
    }

    // Count credit transactions
    const { count: creditCount, error: creditError } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
    
    if (!creditError) {
      console.log('💳 CREDIT TRANSACTIONS:', creditCount)
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error)
  }
}

await getProductionData()
process.exit(0)