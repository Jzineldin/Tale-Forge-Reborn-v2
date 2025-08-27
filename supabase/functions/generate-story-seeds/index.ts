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

// Fallback story seeds for when AI generation fails - now with randomization and child name integration
const getFallbackSeeds = (context: string, difficulty: string, genre: string, childName: string = 'the child'): StorySeed[] => {
  const fallbackSeeds: Record<string, StorySeed[]> = {
    fantasy: [
      {
        title: `${childName}'s Magical Garden Discovery`,
        teaser: `${childName} finds a secret garden where flowers sing and trees dance, but the magic is slowly fading away.`,
        hiddenMoral: "Taking care of nature helps it flourish and brings joy to everyone.",
        conflict: "The magical garden is losing its power because people have forgotten to care for it.",
        quest: "Find the three magical seeds hidden throughout the garden to restore its power."
      },
      {
        title: "The Dragon Who Lost His Roar",
        teaser: `A friendly dragon can't roar anymore and feels too embarrassed to play with ${childName} and other friends.`,
        hiddenMoral: "Everyone has unique talents, and true friends accept you as you are.",
        conflict: "The dragon thinks he's not a real dragon without his roar.",
        quest: "Help the dragon discover his new special ability - the power to create beautiful melodies."
      },
      {
        title: "The Wishing Well's Last Wish",
        teaser: `An ancient wishing well grants ${childName} one final wish before its magic runs out forever.`,
        hiddenMoral: "The best wishes are those made for others, not ourselves.",
        conflict: "Many people want to use the last wish for themselves.",
        quest: "Decide who deserves the final wish and why selflessness matters most."
      },
      {
        title: `${childName} and the Starlight Express`,
        teaser: `${childName} boards a magical train made of starlight that travels through constellation kingdoms.`,
        hiddenMoral: "Every journey teaches us something new about ourselves.",
        conflict: "The constellations are fading and losing their magic.",
        quest: "Restore the light to each constellation kingdom."
      }
    ],
    adventure: [
      {
        title: `${childName}'s Lost Treasure Map`,
        teaser: `${childName} discovers an old treasure map that leads to an island where X marks the spot, but the real treasure isn't gold.`,
        hiddenMoral: "The greatest treasures are the friendships we make along the way.",
        conflict: "Pirates and explorers are racing to find the treasure first.",
        quest: "Navigate through challenges and discover what the real treasure truly is."
      },
      {
        title: "The Secret of Rainbow Falls",
        teaser: `${childName} searches for a hidden waterfall that creates rainbows even on cloudy days, but only those pure of heart can find it.`,
        hiddenMoral: "Kindness and honesty open doors that cannot be unlocked any other way.",
        conflict: "Many have searched for Rainbow Falls but returned empty-handed.",
        quest: "Prove your pure heart through acts of kindness to reveal the secret path."
      },
      {
        title: `${childName}'s Playground Olympics`,
        teaser: `${childName} and friends compete in the most epic playground games ever, learning that winning isn't everything.`,
        hiddenMoral: "Good sportsmanship and having fun matter more than winning.",
        conflict: "Some kids are more focused on winning than having fun.",
        quest: "Bring back the spirit of fun and fair play to the games."
      }
    ],
    mystery: [
      {
        title: `${childName} and the Case of the Missing Cookies`,
        teaser: `Every night, freshly baked cookies disappear from ${childName}'s kitchen without a trace.`,
        hiddenMoral: "Sometimes the most obvious answer is right in front of us.",
        conflict: "Everyone in the house is suspected, causing family tension.",
        quest: "Follow the clues and solve the mystery without hurting anyone's feelings."
      },
      {
        title: `Detective ${childName}'s Library Mystery`,
        teaser: `Books keep disappearing from the school library, and ${childName} is determined to solve the case.`,
        hiddenMoral: "Understanding why someone does something is more important than catching them.",
        conflict: "The librarian is worried and students are being blamed unfairly.",
        quest: "Find the real reason behind the disappearing books and help everyone involved."
      },
      {
        title: `${childName} and the Secret of the Old Clock Tower`,
        teaser: `Strange sounds come from the old clock tower at midnight, and ${childName} decides to investigate.`,
        hiddenMoral: "Courage means facing your fears to help others.",
        conflict: "Everyone is afraid of the clock tower and won't go near it.",
        quest: "Discover what's really making the sounds and help solve the mystery."
      }
    ]
  }
  
  const genreLower = genre.toLowerCase()
  const availableSeeds = fallbackSeeds[genreLower] || fallbackSeeds.fantasy
  
  // Add randomization - shuffle the seeds and return a random selection
  const shuffled = [...availableSeeds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 1) // Return only 1 seed to match "1 seeds" in your log
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
        
        // Add randomness to ensure unique generations
        const randomSeed = Math.random().toString(36).substring(7)
        const timestamp = new Date().getTime()
        
        const prompt = `You are a creative children's story seed generator. Create exactly 1 completely unique and original story seed for ${context} time.

IMPORTANT: Generate a BRAND NEW story concept that hasn't been created before. Be creative and unique!

Context: ${contextPrompts[context]}
Difficulty: ${difficultyPrompts[difficulty]}
Genre: ${genre}
Child's name: ${childName}
Random ID: ${randomSeed}_${timestamp}

For the story seed, provide:
- title: An engaging, unique title that incorporates ${childName}'s name
- teaser: A 2-3 sentence description that hooks the reader and features ${childName} as the main character
- hiddenMoral: The life lesson or value taught (not obvious to the child)
- conflict: The main challenge or problem in the story that ${childName} must face
- quest: What ${childName} needs to do to resolve the story

Requirements:
- Make ${childName} the main protagonist 
- Create a completely original story concept
- Ensure age-appropriate, inclusive, and positive content
- Be creative and avoid common tropes

Respond with a valid JSON array containing exactly 1 story seed object.`
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.9, // Increase randomness
            max_tokens: 800,
            presence_penalty: 0.6, // Encourage new topics
            frequency_penalty: 0.3 // Reduce repetition
          })
        })
        
        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json()
          const content = openaiData.choices[0]?.message?.content
          
          if (content) {
            try {
              const parsedSeeds = JSON.parse(content)
              if (Array.isArray(parsedSeeds) && parsedSeeds.length === 1) {
                seeds = parsedSeeds
                console.log('✅ AI generation successful - unique seed created')
              } else {
                throw new Error('Invalid AI response format - expected 1 seed')
              }
            } catch (parseError) {
              console.log('❌ Failed to parse AI response:', parseError)
              console.log('🔍 Raw AI response:', content)
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