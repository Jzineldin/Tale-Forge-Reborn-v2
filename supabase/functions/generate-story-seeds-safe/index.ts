import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Child-safe system prompt with comprehensive safety guidelines
const CHILD_SAFE_SYSTEM_PROMPT = `You are a children's story seed generator for Tale-Forge, creating age-appropriate content for children aged 5-12. 

ABSOLUTE SAFETY REQUIREMENTS:
- ALL content must be G-rated and appropriate for young children
- NO violence, scary themes, death, weapons, or frightening creatures
- NO romantic content beyond innocent friendship
- NO references to real-world conflicts, politics, or controversial topics
- Use positive, uplifting themes of friendship, adventure, learning, and kindness
- Ensure all characters and scenarios promote good values

STORY SEED REQUIREMENTS:
- Keep language simple and engaging for young readers
- Focus on magical, whimsical, or everyday adventure themes
- Include diverse characters in inclusive, welcoming environments
- Emphasize problem-solving through cooperation and creativity
- End with positive outcomes that teach valuable life lessons

CONTENT VALIDATION:
- Double-check every word for appropriateness
- If uncertain about any content, err on the side of caution
- Provide wholesome alternatives to any potentially concerning elements`;

// Fallback story seeds for different genres when AI fails
const FALLBACK_SEEDS = {
  fantasy: [
    "A young wizard discovers that their magic works best when helping others, leading to adventures in a colorful kingdom filled with friendly dragons and talking animals.",
    "In a land where flowers sing lullabies, a curious child learns the secret language of nature and helps a lost unicorn find its way home.",
    "A magical library appears in the town square, where books come alive to tell their stories and teach important lessons about friendship and courage."
  ],
  adventure: [
    "Three friends build a treehouse that becomes a portal to different peaceful worlds, where they help solve gentle puzzles and make new friends.",
    "A young explorer discovers a hidden garden behind their school where vegetables can talk and need help organizing the perfect harvest festival.",
    "On a family camping trip, siblings discover a map leading to a treasure of kindness left by previous campers for others to find."
  ],
  mystery: [
    "The case of the missing library books leads young detectives through their neighborhood, uncovering acts of kindness and forming new friendships along the way.",
    "When all the cookies disappear from the school bake sale, a group of student detectives learns about sharing and community spirit while solving the sweet mystery.",
    "A mysterious gift appears each morning at the local park, inspiring children to investigate and discover the joy of anonymous kindness."
  ],
  science: [
    "A young inventor creates helpful gadgets for their community garden, learning about plants, weather, and the importance of taking care of nature.",
    "Space-loving friends build a backyard observatory and discover that the stars spell out messages of hope and wonder from friendly alien children.",
    "A curious student starts a recycling club at school and discovers amazing ways to turn trash into treasure while helping the environment."
  ]
};

// Enhanced content safety validation
function validateContent(content: any): { isValid: boolean; violations: string[]; cleanContent?: any } {
  const violations: string[] = [];
  
  if (!content || typeof content !== 'object') {
    violations.push('Invalid content structure');
    return { isValid: false, violations };
  }
  
  // Check for inappropriate keywords
  const inappropriateKeywords = [
    'kill', 'death', 'murder', 'weapon', 'gun', 'sword', 'war', 'fight', 'battle',
    'scary', 'frightening', 'terrifying', 'horror', 'nightmare', 'monster',
    'hate', 'evil', 'villain', 'revenge', 'anger', 'violence',
    'romantic', 'love', 'dating', 'kiss', 'relationship'
  ];
  
  const contentStr = JSON.stringify(content).toLowerCase();
  
  for (const keyword of inappropriateKeywords) {
    if (contentStr.includes(keyword)) {
      violations.push(`Inappropriate content detected: ${keyword}`);
    }
  }
  
  // Validate story structure
  if (content.story && typeof content.story === 'string') {
    if (content.story.length < 50) {
      violations.push('Story content too short');
    }
    if (content.story.length > 1000) {
      violations.push('Story content too long');
    }
  }
  
  return { isValid: violations.length === 0, violations };
}

// Log safety violation to Supabase
async function logSafetyViolation(
  supabase: any,
  violationType: string,
  content: any,
  userId?: string,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  try {
    await supabase.from('safety_violations').insert({
      user_id: userId,
      violation_type: violationType,
      content_snippet: JSON.stringify(content).substring(0, 500),
      severity,
      context: 'story-seed-generation',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log safety violation:', error);
  }
}

// Log AI performance metrics
async function logAIPerformance(
  supabase: any,
  operation: string,
  success: boolean,
  responseTime: number,
  userId?: string
) {
  try {
    await supabase.from('ai_performance_logs').insert({
      user_id: userId,
      operation_type: operation,
      success,
      response_time_ms: responseTime,
      model_used: 'claude-3-haiku',
      context: 'story-seed-generation',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log AI performance:', error);
  }
}

// Generate personalized fallback content
function generatePersonalizedFallback(genre: string, characterName?: string, difficulty?: string): any {
  const seeds = FALLBACK_SEEDS[genre as keyof typeof FALLBACK_SEEDS] || FALLBACK_SEEDS.fantasy;
  let selectedSeed = seeds[Math.floor(Math.random() * seeds.length)];
  
  // Personalize with character name if provided
  if (characterName && characterName.length > 0) {
    const cleanName = characterName.replace(/[^a-zA-Z\s]/g, '').trim();
    if (cleanName.length > 0) {
      selectedSeed = selectedSeed.replace(/young \w+|child|friends?|siblings?/i, cleanName);
    }
  }
  
  // Adjust complexity based on difficulty
  const complexity = difficulty === 'long' ? 'complex' : difficulty === 'short' ? 'simple' : 'moderate';
  
  return {
    story: selectedSeed,
    theme: `A ${complexity} ${genre} adventure focusing on kindness and friendship`,
    characters: characterName ? [characterName] : ['Alex', 'Sam'],
    setting: `A safe, magical world perfect for children's adventures`,
    conflict: 'A gentle challenge that can be solved through cooperation and creativity',
    generated_at: new Date().toISOString(),
    safety_validated: true,
    is_fallback: true
  };
}

// Rate limiting check
async function checkRateLimit(supabase: any, userId: string): Promise<{ allowed: boolean; remainingRequests?: number }> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('ai_performance_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('operation_type', 'story-seed-generation')
      .gte('created_at', oneHourAgo);
    
    if (error) throw error;
    
    const requestCount = data?.length || 0;
    const maxRequests = 50; // 50 requests per hour
    
    return {
      allowed: requestCount < maxRequests,
      remainingRequests: Math.max(0, maxRequests - requestCount)
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true }; // Fail open for better user experience
  }
}

// Main Deno serve function
Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request
    const { genre, difficulty, characterName } = await req.json();
    
    // Extract user ID from auth header if available
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id;
      } catch (error) {
        console.log('Auth parsing failed, continuing without user ID');
      }
    }
    
    // Validate input parameters
    if (!genre || typeof genre !== 'string') {
      await logSafetyViolation(supabase, 'invalid_input', { genre }, userId, 'low');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid genre parameter',
          fallback: [generatePersonalizedFallback('fantasy', characterName, difficulty)]
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Rate limiting check
    if (userId) {
      const rateLimit = await checkRateLimit(supabase, userId);
      if (!rateLimit.allowed) {
        await logSafetyViolation(supabase, 'rate_limit_exceeded', { userId }, userId, 'high');
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            fallback: [generatePersonalizedFallback(genre, characterName, difficulty)]
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    // Input sanitization
    const sanitizedGenre = genre.replace(/[^a-zA-Z\s]/g, '').trim().toLowerCase();
    const sanitizedCharacterName = characterName ? 
      characterName.replace(/[^a-zA-Z\s]/g, '').trim() : '';
    const sanitizedDifficulty = difficulty && ['short', 'medium', 'long'].includes(difficulty) ? 
      difficulty : 'medium';
    
    // Validate character name for safety
    if (sanitizedCharacterName && sanitizedCharacterName.length > 0) {
      const inappropriateNames = ['admin', 'root', 'system', 'null', 'undefined'];
      if (inappropriateNames.includes(sanitizedCharacterName.toLowerCase()) || 
          sanitizedCharacterName.length > 50) {
        await logSafetyViolation(supabase, 'inappropriate_name', { characterName }, userId);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid character name',
            fallback: [generatePersonalizedFallback(sanitizedGenre, '', sanitizedDifficulty)]
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    // Create AI prompt
    const prompt = `Generate 3 unique, child-safe story seeds for the "${sanitizedGenre}" genre${
      sanitizedCharacterName ? ` featuring a character named "${sanitizedCharacterName}"` : ''
    }. Difficulty level: ${sanitizedDifficulty}.
    
    Each seed should be a complete story concept including:
    - A brief, engaging premise (2-3 sentences)
    - Main characters with positive traits
    - A safe, age-appropriate setting
    - A gentle conflict that teaches valuable lessons
    - Themes of friendship, kindness, and personal growth
    
    Format as JSON array with objects containing: story, theme, characters, setting, conflict.`;
    
    try {
      // Call Claude API (mock implementation - replace with actual API call)
      const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: CHILD_SAFE_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      
      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`);
      }
      
      const aiData = await aiResponse.json();
      let generatedContent: any;
      
      try {
        generatedContent = JSON.parse(aiData.content[0].text);
      } catch {
        throw new Error('Invalid AI response format');
      }
      
      // Validate AI-generated content
      const validation = validateContent(generatedContent);
      
      if (!validation.isValid) {
        await logSafetyViolation(supabase, 'ai_content_violation', {
          violations: validation.violations,
          content: generatedContent
        }, userId, 'high');
        
        throw new Error('AI generated inappropriate content');
      }
      
      // Add safety metadata
      const safeContent = Array.isArray(generatedContent) ? generatedContent : [generatedContent];
      const enrichedContent = safeContent.map(item => ({
        ...item,
        generated_at: new Date().toISOString(),
        safety_validated: true,
        is_fallback: false
      }));
      
      // Log successful AI performance
      await logAIPerformance(supabase, 'story-seed-generation', true, Date.now() - startTime, userId);
      
      // Log content safety audit
      try {
        await supabase.from('content_safety_audits').insert({
          user_id: userId,
          content_type: 'story_seed',
          safety_score: 100,
          flagged_content: null,
          context: `Genre: ${sanitizedGenre}, Character: ${sanitizedCharacterName}`,
          created_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to log safety audit:', error);
      }
      
      return new Response(
        JSON.stringify(enrichedContent),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
      
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      
      // Log AI failure
      await logAIPerformance(supabase, 'story-seed-generation', false, Date.now() - startTime, userId);
      
      // Return personalized fallback
      const fallbackContent = generatePersonalizedFallback(sanitizedGenre, sanitizedCharacterName, sanitizedDifficulty);
      
      return new Response(
        JSON.stringify([fallbackContent]),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
  } catch (error) {
    console.error('Function error:', error);
    
    // Log system error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('system_health_metrics').insert({
        metric_type: 'function_error',
        metric_value: 1,
        context: `Error: ${error.message}`,
        created_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log system error:', logError);
    }
    
    // Return safe fallback even on system errors
    const fallbackContent = generatePersonalizedFallback('fantasy', '', 'medium');
    
    return new Response(
      JSON.stringify([fallbackContent]),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  }
});