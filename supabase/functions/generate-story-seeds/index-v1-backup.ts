import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { 
  GPT4O_OPTIMIZED, 
  optimizedOpenAICall,
  createTimer,
  promptCache,
  SDXL_OPTIMIZED
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

// Fallback story seeds - simple one-sentence ideas
const getFallbackSeeds = (context: string, difficulty: string, genre: string, childName: string = 'the child'): StorySeed[] => {
  const fallbackSeeds: Record<string, StorySeed[]> = {
    fantasy: [
      {
        title: "Magic Garden",
        teaser: `${childName} finds a garden where flowers can talk.`
      },
      {
        title: "Dragon Friend",
        teaser: `${childName} meets a tiny dragon who loves cookies.`
      },
      {
        title: "Wishing Star",
        teaser: `${childName} catches a falling star that grants wishes.`
      },
      {
        title: "Rainbow Bridge",
        teaser: `${childName} discovers a rainbow that leads to a cloud castle.`
      }
    ],
    adventure: [
      {
        title: "Treasure Hunt",
        teaser: `${childName} finds a treasure map in the backyard.`
      },
      {
        title: "Rainbow Falls",
        teaser: `${childName} searches for a magical waterfall.`
      },
      {
        title: "Playground Games",
        teaser: `${childName} organizes the best playground olympics ever.`
      },
      {
        title: "Secret Cave",
        teaser: `${childName} discovers a hidden cave full of crystals.`
      }
    ],
    mystery: [
      {
        title: "Missing Cookies",
        teaser: `${childName} solves the case of disappearing cookies.`
      },
      {
        title: "Library Mystery",
        teaser: `${childName} investigates missing library books.`
      },
      {
        title: "Clock Tower Secret",
        teaser: `${childName} discovers what makes the clock tower chime at midnight.`
      },
      {
        title: "Hidden Room",
        teaser: `${childName} finds a secret room in the old house.`
      }
    ]
  }
  
  const genreLower = genre.toLowerCase()
  const availableSeeds = fallbackSeeds[genreLower] || fallbackSeeds.fantasy
  
  // Add randomization - shuffle the seeds and return 3 random seeds
  const shuffled = [...availableSeeds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3) // Return 3 seeds
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Environment validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasOpenaiKey: !!openaiApiKey
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables')
      return createCorsResponse({ 
        error: 'Server configuration error', 
        success: false 
      }, 500)
    }

    // Parse and validate request
    const { context, difficulty, genre, childName }: RequestBody = await req.json()
    
    console.log('📥 Request params:', { context, difficulty, genre, childName })
    
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
      console.log('🔒 Auth failed:', userError?.message)
      // Don't block development - continue with service role
    }
    
    const userId = user.user?.id || 'anonymous'
    console.log('👤 User ID:', userId)

    let seeds: StorySeed[] = []
    let usingFallback = false
    
    // Try AI generation first if OpenAI key is available
    if (openaiApiKey) {
      try {
        const aiTimer = createTimer('story_seed');
        console.log('🤖 Attempting OPTIMIZED AI generation with OpenAI...')
        
        const contextPrompts = {
          bedtime: 'Create gentle, calming stories perfect for bedtime with soothing adventures',
          learning: 'Create educational stories that teach valuable lessons while being engaging', 
          playtime: 'Create fun, energetic stories perfect for active imagination and play'
        }
        
        const difficultyPrompts = {
          short: 'simple stories for ages 3-5 with basic concepts',
          medium: 'engaging stories for ages 6-8 with moderate complexity',
          long: 'rich stories for ages 9-12 with deeper themes'
        }
        
        // Skip caching for seed generation to ensure variety
        // Each request should generate fresh seeds for better user experience
        console.log('🎲 Generating fresh seeds (caching disabled for variety)');
        
        {
          // Use optimized prompt structure
          const optimizedPrompt = GPT4O_OPTIMIZED.prompts.storySeeds({
            genre,
            childName
          });
          
          console.log('🎯 Using optimized prompt structure...');
        
          // Use optimized OpenAI call with speed-focused configuration
          const content = await optimizedOpenAICall(optimizedPrompt, {
            ...GPT4O_OPTIMIZED.storyConfig,
            temperature: 0.95, // Higher for variety
            presence_penalty: 0.8,
            frequency_penalty: 0.5,
            max_tokens: 300,    // Reduce tokens for faster response
            seed: Math.floor(Math.random() * 1000000)
          });
        
          if (content) {
            try {
              // Enhanced JSON extraction with better markdown handling
              let cleanContent = content.trim()
              
              // Remove all possible markdown code block variations
              cleanContent = cleanContent.replace(/^```[\w]*\s*/gi, '')  // Opening ```json or ```
              cleanContent = cleanContent.replace(/\s*```$/gi, '')       // Closing ```
              cleanContent = cleanContent.replace(/`{3,}/g, '')          // Any triple backticks
              cleanContent = cleanContent.replace(/^\s*json\s*/gi, '')   // Standalone 'json' lines
              
              // Find JSON array boundaries more precisely
              const startIdx = cleanContent.indexOf('[')
              const endIdx = cleanContent.lastIndexOf(']')
              
              if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                cleanContent = cleanContent.substring(startIdx, endIdx + 1)
              }
              
              // Clean up formatting issues
              cleanContent = cleanContent.replace(/,\s*([}\]])/g, '$1')  // Trailing commas
              cleanContent = cleanContent.replace(/\n\s*/g, ' ')          // Normalize whitespace
              
              // Parse the cleaned JSON
              const parsedSeeds = JSON.parse(cleanContent)
              
              if (Array.isArray(parsedSeeds) && parsedSeeds.length >= 3) {
                seeds = parsedSeeds.slice(0, 3) // Take only first 3 if more
                console.log('✅ OPTIMIZED AI generation successful - 3 unique fresh seeds created')
              } else if (Array.isArray(parsedSeeds) && parsedSeeds.length > 0) {
                // If we got fewer than 3, use what we got
                seeds = parsedSeeds
                console.log(`⚠️ AI generated only ${parsedSeeds.length} fresh seeds`)
              } else {
                throw new Error(`Invalid AI response format - expected array of seeds`)
              }
            } catch (parseError) {
              console.log('❌ Failed to parse OPTIMIZED AI response:', parseError)
              console.log('🔍 Raw AI response (first 500 chars):', content.substring(0, 500))
              console.log('🔍 Raw AI response (last 500 chars):', content.substring(content.length - 500))
              throw parseError
            }
          } else {
            throw new Error('Empty optimized AI response')
          }
          
          // End timer for successful generation
          aiTimer.end();
        }
        
      } catch (aiError) {
        console.log('❌ AI generation failed, using fallback:', aiError.message)
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
      console.log('🔄 No seeds generated, using fallback')
      seeds = getFallbackSeeds(context, difficulty, genre, childName)
      usingFallback = true
    }
    
    console.log('📋 Final seeds count:', seeds.length, 'Using fallback:', usingFallback)

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
        usingFallback
      },
      message: usingFallback 
        ? 'Story seeds generated using fallback (AI unavailable)'
        : 'Story seeds generated successfully'
    })
    
  } catch (error) {
    console.error('❌ Function error:', error)
    
    return createCorsResponse({
      error: 'Internal server error',
      success: false,
      message: error.message
    }, 500)
  }
})