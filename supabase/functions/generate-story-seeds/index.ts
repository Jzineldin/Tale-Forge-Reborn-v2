import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RequestBody {
  context: 'bedtime' | 'learning' | 'playtime'
  difficulty: 'short' | 'medium' | 'long'
  genre: string
  childName: string
}

interface StorySeed {
  title: string
  teaser: string
  hiddenMoral: string
  conflict: string
  quest: string
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

// Fallback story seeds for when AI generation fails
const getFallbackSeeds = (context: string, difficulty: string, genre: string): StorySeed[] => {
  const fallbackSeeds: Record<string, StorySeed[]> = {
    fantasy: [
      {
        title: "The Magical Garden Discovery",
        teaser: "A young adventurer finds a secret garden where flowers sing and trees dance, but the magic is slowly fading away.",
        hiddenMoral: "Taking care of nature helps it flourish and brings joy to everyone.",
        conflict: "The magical garden is losing its power because people have forgotten to care for it.",
        quest: "Find the three magical seeds hidden throughout the garden to restore its power."
      },
      {
        title: "The Dragon Who Lost His Roar",
        teaser: "A friendly dragon can't roar anymore and feels too embarrassed to play with friends.",
        hiddenMoral: "Everyone has unique talents, and true friends accept you as you are.",
        conflict: "The dragon thinks he's not a real dragon without his roar.",
        quest: "Help the dragon discover his new special ability - the power to create beautiful melodies."
      },
      {
        title: "The Wishing Well's Last Wish",
        teaser: "An ancient wishing well grants one final wish before its magic runs out forever.",
        hiddenMoral: "The best wishes are those made for others, not ourselves.",
        conflict: "Many people want to use the last wish for themselves.",
        quest: "Decide who deserves the final wish and why selflessness matters most."
      }
    ],
    adventure: [
      {
        title: "The Lost Treasure Map",
        teaser: "An old treasure map leads to an island where X marks the spot, but the real treasure isn't gold.",
        hiddenMoral: "The greatest treasures are the friendships we make along the way.",
        conflict: "Pirates and explorers are racing to find the treasure first.",
        quest: "Navigate through challenges and discover what the real treasure truly is."
      },
      {
        title: "The Secret of Rainbow Falls",
        teaser: "A hidden waterfall creates rainbows even on cloudy days, but only those pure of heart can find it.",
        hiddenMoral: "Kindness and honesty open doors that cannot be unlocked any other way.",
        conflict: "Many have searched for Rainbow Falls but returned empty-handed.",
        quest: "Prove your pure heart through acts of kindness to reveal the secret path."
      }
    ],
    mystery: [
      {
        title: "The Case of the Missing Cookies",
        teaser: "Every night, freshly baked cookies disappear from the kitchen without a trace.",
        hiddenMoral: "Sometimes the most obvious answer is right in front of us.",
        conflict: "Everyone in the house is suspected, causing family tension.",
        quest: "Follow the clues and solve the mystery without hurting anyone's feelings."
      }
    ]
  }
  
  const genreLower = genre.toLowerCase()
  const seeds = fallbackSeeds[genreLower] || fallbackSeeds.fantasy
  return seeds.slice(0, 3)
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
        console.log('🤖 Attempting AI generation with OpenAI...')
        
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
        
        const prompt = `You are a children's story seed generator. Create exactly 3 unique story seeds for ${context} time.
        
Context: ${contextPrompts[context]}
Difficulty: ${difficultyPrompts[difficulty]}
Genre: ${genre}
Child's name: ${childName}
        
For each story seed, provide:
- title: An engaging title
- teaser: A 2-3 sentence description that hooks the reader
- hiddenMoral: The life lesson or value taught (not obvious to the child)
- conflict: The main challenge or problem in the story
- quest: What the protagonist needs to do to resolve the story
        
Make stories age-appropriate, inclusive, and positive. Incorporate the child's name naturally.
        
Respond with valid JSON array of exactly 3 story seed objects.`
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 1500
          })
        })
        
        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json()
          const content = openaiData.choices[0]?.message?.content
          
          if (content) {
            try {
              const parsedSeeds = JSON.parse(content)
              if (Array.isArray(parsedSeeds) && parsedSeeds.length === 3) {
                seeds = parsedSeeds
                console.log('✅ AI generation successful')
              } else {
                throw new Error('Invalid AI response format')
              }
            } catch (parseError) {
              console.log('❌ Failed to parse AI response:', parseError)
              throw parseError
            }
          } else {
            throw new Error('Empty AI response')
          }
        } else {
          const errorText = await openaiResponse.text()
          console.log('❌ OpenAI API error:', openaiResponse.status, errorText)
          throw new Error(`OpenAI API error: ${openaiResponse.status}`)
        }
        
      } catch (aiError) {
        console.log('❌ AI generation failed, using fallback:', aiError.message)
        seeds = getFallbackSeeds(context, difficulty, genre)
        usingFallback = true
      }
    } else {
      console.log('⚠️ No OpenAI API key - using fallback seeds')
      seeds = getFallbackSeeds(context, difficulty, genre)
      usingFallback = true
    }

    // Ensure we always have seeds
    if (!seeds || seeds.length === 0) {
      console.log('🔄 No seeds generated, using fallback')
      seeds = getFallbackSeeds(context, difficulty, genre)
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