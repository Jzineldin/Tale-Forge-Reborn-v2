// Story Seeds Generation V2 - GPT-4o Responses API with Structured Outputs
// Modern implementation that guarantees valid JSON and eliminates parsing errors

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  GPT4O_V2_OPTIMIZED, 
  STORY_SEEDS_SCHEMA,
  optimizedResponsesAPICall,
  legacyOpenAICall,
  createTimerV2,
  promptCacheV2
} from '../_shared/ai-optimization-edge-v2.ts'
import { 
  migrationController, 
  applyMigrationPreset
} from '../_shared/ai-migration-controller.ts'

// Legacy imports for fallback
import { 
  GPT4O_OPTIMIZED, 
  optimizedOpenAICall,
  createTimer,
  promptCache
} from '../_shared/ai-optimization-edge.ts'

interface RequestBody {
  context: 'bedtime' | 'learning' | 'playtime'
  difficulty: 'short' | 'medium' | 'long'
  genre: string
  childName: string
}

interface StorySeed {
  title: string
  teaser: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

function createCorsResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Enhanced fallback seeds with better variety
const getFallbackSeeds = (context: string, difficulty: string, genre: string, childName: string = 'the child'): StorySeed[] => {
  const fallbackSeeds: Record<string, StorySeed[]> = {
    fantasy: [
      { title: "Magic Garden", teaser: `${childName} finds a garden where flowers can talk.` },
      { title: "Dragon Friend", teaser: `${childName} meets a tiny dragon who loves cookies.` },
      { title: "Wishing Star", teaser: `${childName} catches a falling star that grants wishes.` },
      { title: "Rainbow Bridge", teaser: `${childName} discovers a rainbow that leads to a cloud castle.` },
      { title: "Fairy Door", teaser: `${childName} finds a tiny door that fairies use.` },
      { title: "Magic Paintbrush", teaser: `${childName} gets a paintbrush that makes drawings real.` }
    ],
    adventure: [
      { title: "Treasure Hunt", teaser: `${childName} finds a treasure map in the backyard.` },
      { title: "Secret Cave", teaser: `${childName} discovers a hidden cave full of crystals.` },
      { title: "Mountain Climb", teaser: `${childName} decides to climb the tallest hill.` },
      { title: "Ocean Quest", teaser: `${childName} builds a raft to explore the pond.` },
      { title: "Forest Explorer", teaser: `${childName} follows animal tracks into the woods.` },
      { title: "Sky Adventure", teaser: `${childName} finds a way to touch the clouds.` }
    ],
    mystery: [
      { title: "Missing Cookies", teaser: `${childName} solves the case of disappearing cookies.` },
      { title: "Strange Sounds", teaser: `${childName} investigates mysterious noises at night.` },
      { title: "Hidden Message", teaser: `${childName} finds a secret code in an old book.` },
      { title: "Lost Pet Mystery", teaser: `${childName} helps find a neighbor's missing cat.` },
      { title: "Attic Discovery", teaser: `${childName} explores a dusty attic and finds clues.` },
      { title: "Library Secret", teaser: `${childName} notices books moving by themselves.` }
    ],
    educational: [
      { title: "Number Detective", teaser: `${childName} uses math to solve puzzles.` },
      { title: "Science Explorer", teaser: `${childName} discovers how plants grow.` },
      { title: "Word Collector", teaser: `${childName} goes on a hunt for new words.` },
      { title: "Animal Facts", teaser: `${childName} learns amazing things about animals.` },
      { title: "History Hunt", teaser: `${childName} travels back in time to learn.` },
      { title: "Space Journey", teaser: `${childName} explores planets and stars.` }
    ],
    nature: [
      { title: "Garden Helper", teaser: `${childName} helps tiny creatures in the garden.` },
      { title: "Tree Climber", teaser: `${childName} makes friends with forest animals.` },
      { title: "River Adventure", teaser: `${childName} follows a stream to its source.` },
      { title: "Bug Safari", teaser: `${childName} discovers the amazing world of insects.` },
      { title: "Weather Watcher", teaser: `${childName} learns to predict the weather.` },
      { title: "Seed Planter", teaser: `${childName} grows the most beautiful flowers.` }
    ]
  }
  
  const genreLower = genre.toLowerCase()
  const availableSeeds = fallbackSeeds[genreLower] || fallbackSeeds.fantasy
  
  // Enhanced randomization based on context and difficulty
  let filteredSeeds = [...availableSeeds]
  
  if (context === 'bedtime') {
    // Prefer calming stories for bedtime
    filteredSeeds = filteredSeeds.filter(seed => 
      !seed.title.includes('Adventure') && !seed.title.includes('Hunt')
    )
  }
  
  // Shuffle and return 3 random seeds
  const shuffled = filteredSeeds.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

// V2 AI Generation using Responses API
async function generateSeedsV2(params: RequestBody): Promise<StorySeed[]> {
  console.log('🚀 V2: Generating seeds with Responses API + Structured Outputs...')
  
  const prompt = GPT4O_V2_OPTIMIZED.prompts.storySeeds({
    ...params,
    context: params.context,
    difficulty: params.difficulty
  })
  
  // Skip cache for seeds to ensure variety (each request gets fresh seeds)
  const response = await optimizedResponsesAPICall(
    prompt,
    STORY_SEEDS_SCHEMA,
    GPT4O_V2_OPTIMIZED.seedConfig,
    true // skipCache = true for variety
  )
  
  if (!response.seeds || !Array.isArray(response.seeds)) {
    throw new Error('Invalid response structure from V2 API')
  }
  
  // Validate each seed
  const validSeeds = response.seeds.filter(seed => 
    seed && seed.title && seed.teaser && 
    seed.title.trim().length > 0 && 
    seed.teaser.trim().length > 0
  )
  
  if (validSeeds.length < 3) {
    console.warn(`⚠️ V2 generated only ${validSeeds.length} valid seeds, padding with fallbacks`)
    const fallbacks = getFallbackSeeds(params.context, params.difficulty, params.genre, params.childName)
    return [...validSeeds, ...fallbacks.slice(0, 3 - validSeeds.length)]
  }
  
  return validSeeds.slice(0, 3) // Ensure exactly 3 seeds
}

// V1 AI Generation (legacy fallback)
async function generateSeedsV1(params: RequestBody): Promise<StorySeed[]> {
  console.log('🔄 V1: Using legacy Chat Completions API...')
  
  const prompt = GPT4O_OPTIMIZED.prompts.storySeeds({
    genre: params.genre,
    childName: params.childName
  })
  
  const content = await optimizedOpenAICall(prompt, {
    ...GPT4O_OPTIMIZED.storyConfig,
    temperature: 0.95,
    presence_penalty: 0.8,
    frequency_penalty: 0.5,
    max_tokens: 300,
    seed: Math.floor(Math.random() * 1000000)
  })
  
  if (!content) {
    throw new Error('Empty response from V1 API')
  }
  
  // Legacy JSON parsing
  let cleanContent = content.trim()
  cleanContent = cleanContent.replace(/^```[\w]*\s*/gi, '')
  cleanContent = cleanContent.replace(/\s*```$/gi, '')
  cleanContent = cleanContent.replace(/`{3,}/g, '')
  
  const startIdx = cleanContent.indexOf('[')
  const endIdx = cleanContent.lastIndexOf(']')
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleanContent = cleanContent.substring(startIdx, endIdx + 1)
  }
  
  cleanContent = cleanContent.replace(/,\s*([}\]])/g, '$1')
  cleanContent = cleanContent.replace(/\n\s*/g, ' ')
  
  const parsedSeeds = JSON.parse(cleanContent)
  
  if (!Array.isArray(parsedSeeds) || parsedSeeds.length === 0) {
    throw new Error('Invalid V1 response format')
  }
  
  return parsedSeeds.slice(0, 3)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize migration controller with development settings
    applyMigrationPreset('DEVELOPMENT') // Force V2 in development
    
    // Environment validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    console.log('🔍 Environment check V2:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasOpenaiKey: !!openaiApiKey,
      migrationConfig: migrationController.getConfig()
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables')
      return createCorsResponse({ 
        error: 'Server configuration error', 
        success: false 
      }, 500)
    }

    // Parse and validate request
    const requestData: RequestBody = await req.json()
    const { context, difficulty, genre, childName } = requestData
    
    console.log('📥 Request params V2:', { context, difficulty, genre, childName })
    
    if (!context || !difficulty || !genre || !childName) {
      return createCorsResponse({
        error: 'Missing required parameters: context, difficulty, genre, childName',
        success: false
      }, 400)
    }

    // Validate enum values
    const validContexts = ['bedtime', 'learning', 'playtime']
    const validDifficulties = ['short', 'medium', 'long']
    
    if (!validContexts.includes(context)) {
      return createCorsResponse({
        error: `Invalid context. Must be one of: ${validContexts.join(', ')}`,
        success: false
      }, 400)
    }
    
    if (!validDifficulties.includes(difficulty)) {
      return createCorsResponse({
        error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`,
        success: false
      }, 400)
    }

    // Auth check
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return createCorsResponse({
        error: 'Missing authorization header',
        success: false
      }, 401)
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: user, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user.user) {
      console.log('🔒 Auth failed V2:', userError?.message)
      // Don't block development - continue with service role
    }
    
    const userId = user.user?.id || 'anonymous'
    console.log('👤 User ID V2:', userId)

    let seeds: StorySeed[] = []
    let usingFallback = false
    let migrationInfo: any = null
    
    // Try AI generation with migration controller
    if (openaiApiKey) {
      try {
        const migrationResult = await migrationController.executeWithMigration(
          // V1 operation
          async () => await generateSeedsV1(requestData),
          // V2 operation  
          async () => await generateSeedsV2(requestData),
          'story_seeds',
          userId
        )
        
        seeds = migrationResult.result
        migrationInfo = {
          version: migrationResult.version,
          duration: migrationResult.duration,
          provider: migrationResult.provider,
          hadError: migrationResult.wasError
        }
        
        console.log(`✅ SUCCESS V2: Generated ${seeds.length} seeds using ${migrationResult.version}`)
        
      } catch (aiError) {
        console.log('❌ AI generation failed completely, using fallback:', aiError.message)
        seeds = getFallbackSeeds(context, difficulty, genre, childName)
        usingFallback = true
      }
    } else {
      console.log('⚠️ No OpenAI API key - using fallback seeds')
      seeds = getFallbackSeeds(context, difficulty, genre, childName)
      usingFallback = true
    }

    // Ensure we always have seeds
    if (!seeds || seeds.length === 0) {
      console.log('🔄 No seeds generated, using enhanced fallback')
      seeds = getFallbackSeeds(context, difficulty, genre, childName)
      usingFallback = true
    }
    
    // Validate seed quality
    seeds = seeds.map(seed => ({
      title: seed.title?.trim() || 'Untitled Story',
      teaser: seed.teaser?.trim() || `${childName} goes on an adventure.`
    }))
    
    console.log('📋 Final seeds count V2:', seeds.length, 'Using fallback:', usingFallback)

    return createCorsResponse({
      success: true,
      seeds,
      metadata: {
        context,
        difficulty, 
        genre,
        childName,
        generatedAt: new Date().toISOString(),
        userId,
        usingFallback,
        migration: migrationInfo,
        version: 'v2'
      },
      message: usingFallback 
        ? 'Story seeds generated using enhanced fallback (AI unavailable)'
        : `Story seeds generated successfully using ${migrationInfo?.version || 'AI'}`
    })
    
  } catch (error) {
    console.error('❌ Function error V2:', error)
    
    return createCorsResponse({
      error: 'Internal server error',
      success: false,
      message: error.message,
      version: 'v2'
    }, 500)
  }
})