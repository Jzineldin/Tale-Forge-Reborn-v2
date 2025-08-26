import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Use service role key if available, otherwise anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false
    }
  }
)

async function executeSQL(sql, description = '') {
  try {
    console.log(`\n🔧 ${description}`)
    
    const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.log(`   ❌ Failed: ${error}`)
      return false
    }
    
    console.log(`   ✅ Success`)
    return true
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function applyMigrations() {
  console.log('🚀 Starting migration application...')
  
  // Step 1: Create user_story_templates table
  const userTemplatesSQL = `
    CREATE TABLE IF NOT EXISTS user_story_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      genre TEXT NOT NULL,
      age_group TEXT NOT NULL CHECK (age_group IN ('3-5', '6-8', '9-12', '13+')),
      difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
      
      characters JSONB DEFAULT '[]'::jsonb,
      settings JSONB DEFAULT '[]'::jsonb,
      plot_elements JSONB DEFAULT '[]'::jsonb,
      story_hooks JSONB DEFAULT '[]'::jsonb,
      
      estimated_chapters INTEGER DEFAULT 3,
      estimated_word_count INTEGER DEFAULT 500,
      tags TEXT[] DEFAULT '{}',
      
      is_public BOOLEAN DEFAULT FALSE,
      is_featured BOOLEAN DEFAULT FALSE,
      is_approved BOOLEAN DEFAULT TRUE,
      approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
      
      usage_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      saves_count INTEGER DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      rating_average DECIMAL(3,2) DEFAULT 0.0,
      
      creator_tier TEXT DEFAULT 'free' CHECK (creator_tier IN ('free', 'creator', 'master')),
      credits_earned INTEGER DEFAULT 0,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_used_at TIMESTAMP WITH TIME ZONE,
      featured_at TIMESTAMP WITH TIME ZONE
    );
  `
  
  await executeSQL(userTemplatesSQL, 'Creating user_story_templates table')
  
  // Step 2: Create achievements table
  const achievementsSQL = `
    CREATE TABLE IF NOT EXISTS achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('story_creation', 'template_creation', 'social_engagement', 'special_events', 'milestones')),
      tier TEXT NOT NULL CHECK (tier IN ('novice', 'intermediate', 'advanced', 'master', 'legendary')),
      
      icon TEXT NOT NULL,
      badge_color TEXT DEFAULT '#fbbf24',
      
      requirement_type TEXT NOT NULL,
      requirement_value INTEGER NOT NULL,
      requirement_timeframe TEXT CHECK (requirement_timeframe IN ('daily', 'weekly', 'monthly', 'all_time')),
      
      credits_reward INTEGER DEFAULT 0,
      
      tier_required TEXT DEFAULT 'free' CHECK (tier_required IN ('free', 'creator', 'master')),
      is_active BOOLEAN DEFAULT TRUE,
      is_repeatable BOOLEAN DEFAULT FALSE,
      is_hidden BOOLEAN DEFAULT FALSE,
      
      display_order INTEGER DEFAULT 0,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  
  await executeSQL(achievementsSQL, 'Creating achievements table')
  
  // Step 3: Create user_achievements table
  const userAchievementsSQL = `
    CREATE TABLE IF NOT EXISTS user_achievements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
      
      earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      credits_earned INTEGER DEFAULT 0,
      progress_when_earned INTEGER DEFAULT 0,
      
      is_claimed BOOLEAN DEFAULT FALSE,
      claimed_at TIMESTAMP WITH TIME ZONE,
      notification_sent BOOLEAN DEFAULT FALSE,
      
      period_identifier TEXT,
      
      UNIQUE(user_id, achievement_id, period_identifier)
    );
  `
  
  await executeSQL(userAchievementsSQL, 'Creating user_achievements table')
  
  // Step 4: Create user_goals table  
  const userGoalsSQL = `
    CREATE TABLE IF NOT EXISTS user_goals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      
      goal_type TEXT NOT NULL CHECK (goal_type IN (
        'daily_story', 'daily_engagement', 'daily_template_interaction',
        'weekly_stories', 'weekly_engagement', 'weekly_template_creation',
        'monthly_challenge', 'monthly_social_activity'
      )),
      target_value INTEGER NOT NULL,
      current_value INTEGER DEFAULT 0,
      
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      period_identifier TEXT NOT NULL,
      
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP WITH TIME ZONE,
      
      credits_reward INTEGER DEFAULT 0,
      bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      UNIQUE(user_id, goal_type, period_identifier)
    );
  `
  
  await executeSQL(userGoalsSQL, 'Creating user_goals table')
  
  // Test the results
  console.log('\n🧪 Testing created tables...')
  
  const requiredTables = [
    'user_story_templates',
    'user_achievements', 
    'user_goals',
    'achievements'
  ]

  let allTablesCreated = true
  for (const tableName of requiredTables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`  ❌ ${tableName} - ${error.message}`)
        allTablesCreated = false
      } else {
        console.log(`  ✅ ${tableName}`)
      }
    } catch (e) {
      console.log(`  ❌ ${tableName} - ${e.message}`)
      allTablesCreated = false
    }
  }
  
  if (allTablesCreated) {
    console.log('\n✨ All tables created successfully!')
  } else {
    console.log('\n⚠️  Some tables may not have been created properly.')
  }
}

applyMigrations()