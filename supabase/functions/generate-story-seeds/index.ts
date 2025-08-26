// Tale Forge - Generate Story Seeds Edge Function
// Generates 3 creative story seeds based on context, difficulty, and genre

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Import working shared utilities
import {
  corsHeaders,
  handleCorsPreflightRequest,
  createCorsResponse,
  validateEnvironment,
  validateUserAuth,
  createAuthenticatedSupabaseClient,
  validateRequiredFields
} from './shared/utils.ts';

console.log("Generate Story Seeds function started");

// Story seed interface
interface StorySeed {
  title: string;
  teaser: string;
  hiddenMoral: string;
  conflict: string;
  quest: string;
}

// Context-based story characteristics
const CONTEXT_CHARACTERISTICS = {
  bedtime: {
    themes: ['friendship', 'courage', 'kindness', 'family', 'dreams'],
    settings: ['magical forest', 'cozy village', 'underwater kingdom', 'cloud city', 'garden'],
    morals: ['being brave when scared', 'helping others', 'believing in yourself', 'family love', 'the power of dreams']
  },
  learning: {
    themes: ['discovery', 'problem-solving', 'creativity', 'teamwork', 'perseverance'],
    settings: ['school', 'laboratory', 'library', 'workshop', 'nature'],
    morals: ['learning from mistakes', 'working together', 'trying new things', 'never giving up', 'sharing knowledge']
  },
  playtime: {
    themes: ['adventure', 'fun', 'games', 'sports', 'exploration'],
    settings: ['playground', 'park', 'backyard', 'beach', 'mountain'],
    morals: ['fair play', 'including everyone', 'trying your best', 'making friends', 'having fun safely']
  }
};

// Fallback seeds in case AI generation fails
const FALLBACK_SEEDS = {
  bedtime: [
    {
      title: "Luna's Moonbeam Adventure",
      teaser: "A little girl discovers that moonbeams can carry her to magical places where she helps sleepy animals find their dreams.",
      hiddenMoral: "Even small acts of kindness can make a big difference",
      conflict: "The dream animals have lost their way home",
      quest: "Help each animal find their perfect dream"
    },
    {
      title: "The Sleepy Dragon's Lullaby",
      teaser: "A gentle dragon who's forgotten how to sleep learns the most beautiful lullaby from a wise old owl.",
      hiddenMoral: "Sometimes we need help from friends to solve our problems",
      conflict: "The dragon's insomnia is keeping the whole forest awake",
      quest: "Learn the ancient lullaby that brings peaceful sleep"
    },
    {
      title: "Starlight Express",
      teaser: "Twin siblings board a magical train made of starlight that takes them on a journey through constellation kingdoms.",
      hiddenMoral: "Family bonds give us strength to overcome any challenge",
      conflict: "The constellations are fading and losing their magic",
      quest: "Restore the light to each constellation kingdom"
    }
  ],
  learning: [
    {
      title: "The Curious Inventor",
      teaser: "A young inventor creates a machine that can solve any problem, but learns that some challenges are best solved with friends.",
      hiddenMoral: "Teamwork and cooperation are more powerful than any invention",
      conflict: "The invention causes more problems than it solves",
      quest: "Fix the mistakes and learn to work with others"
    },
    {
      title: "Professor Puzzle's Mystery School",
      teaser: "Students at a special school solve magical puzzles that teach them about the world around them.",
      hiddenMoral: "Learning is an adventure when you're curious and persistent",
      conflict: "The school's magic is fading because students have stopped being curious",
      quest: "Rediscover the joy of learning and asking questions"
    },
    {
      title: "The Library of Living Books",
      teaser: "Books come alive in a magical library, but they need help organizing their stories and sharing their wisdom.",
      hiddenMoral: "Knowledge becomes powerful when we share it with others",
      conflict: "The books are scattered and their stories are getting mixed up",
      quest: "Help the books find their place and organize the library"
    }
  ],
  playtime: [
    {
      title: "The Playground Olympics",
      teaser: "Kids from different schools compete in the most epic playground games ever, learning that winning isn't everything.",
      hiddenMoral: "Good sportsmanship and having fun matter more than winning",
      conflict: "Some kids are more focused on winning than having fun",
      quest: "Bring back the spirit of fun and fair play to the games"
    },
    {
      title: "Adventure Island Treasure Hunt",
      teaser: "A group of friends discovers a mysterious map leading to treasure on a secret island in their local park.",
      hiddenMoral: "The best treasures are the friendships we make along the way",
      conflict: "The friends disagree about how to find the treasure",
      quest: "Work together to solve the treasure map's clues"
    },
    {
      title: "The Super Playground Squad",
      teaser: "Ordinary kids discover they have special powers, but only when they're playing together and including everyone.",
      hiddenMoral: "Everyone has unique talents that make the group stronger",
      conflict: "A new kid feels left out and the group's powers start to fade",
      quest: "Include everyone and discover each person's special ability"
    }
  ]
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }
  
  try {
    console.log('🌱 Processing generate-story-seeds request...');
    
    // 1. Validate environment
    const env = validateEnvironment();
    if (!env.isValid) {
      console.error('❌ Environment validation failed:', env.error);
      return createCorsResponse({
        error: env.error
      }, { status: 500 });
    }
    
    // 2. Validate authentication
    const authResult = await validateUserAuth(req, env.supabaseUrl!, env.supabaseAnonKey!);
    if (!authResult.isValid) {
      console.error('❌ Authentication failed:', authResult.error);
      return createCorsResponse({
        error: authResult.error
      }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', authResult.user!.id);
    
    // 3. Parse and validate request
    const requestBody = await req.json();
    const validationErrors = validateRequiredFields(requestBody, ['context', 'difficulty', 'genre']);
    if (validationErrors.length > 0) {
      console.error('❌ Validation failed:', validationErrors);
      return createCorsResponse({
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 });
    }
    
    const { context, difficulty, genre, childName = "the child" } = requestBody;
    console.log('🌱 Generating seeds for:', { context, difficulty, genre, childName });
    
    // 4. Generate story seeds with AI
    let seeds: StorySeed[] = [];
    
    try {
      // Get characteristics for the context
      const characteristics = CONTEXT_CHARACTERISTICS[context as keyof typeof CONTEXT_CHARACTERISTICS] || CONTEXT_CHARACTERISTICS.bedtime;
      
      // Create OpenAI prompt
      const prompt = `Create 3 unique, engaging story seeds for a ${context} story with these requirements:

CONTEXT: ${context}
DIFFICULTY: ${difficulty} (affects complexity and vocabulary)
GENRE: ${genre}
CHILD NAME: ${childName}

Each story should have:
- An engaging title
- A compelling teaser (2-3 sentences that hook the reader)
- A hidden moral lesson (age-appropriate life lesson)
- A central conflict that drives the story
- A quest or goal for the protagonist

Themes to consider: ${characteristics.themes.join(', ')}
Possible settings: ${characteristics.settings.join(', ')}
Moral lessons: ${characteristics.morals.join(', ')}

Make each story unique and appropriate for ${context} time. If child name is provided, consider incorporating it naturally.

Return as JSON array with objects containing: title, teaser, hiddenMoral, conflict, quest`;

      // Make OpenAI request
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a creative children\'s story writer. Create engaging, age-appropriate story seeds with clear moral lessons. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1500
        })
      });
      
      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }
      
      const openaiData = await openaiResponse.json();
      const generatedContent = openaiData.choices[0]?.message?.content;
      
      if (generatedContent) {
        try {
          seeds = JSON.parse(generatedContent);
          console.log('✅ Generated seeds with AI:', seeds.length);
        } catch (parseError) {
          console.warn('⚠️ Failed to parse AI response, using fallbacks');
          throw parseError;
        }
      } else {
        throw new Error('No content received from OpenAI');
      }
      
    } catch (aiError) {
      console.warn('⚠️ AI generation failed, using fallback seeds:', aiError);
      
      // Use fallback seeds
      const fallbackSeedsForContext = FALLBACK_SEEDS[context as keyof typeof FALLBACK_SEEDS] || FALLBACK_SEEDS.bedtime;
      seeds = fallbackSeedsForContext;
    }
    
    // 5. Ensure we have exactly 3 seeds
    if (seeds.length < 3) {
      const fallbackSeedsForContext = FALLBACK_SEEDS[context as keyof typeof FALLBACK_SEEDS] || FALLBACK_SEEDS.bedtime;
      seeds = [...seeds, ...fallbackSeedsForContext].slice(0, 3);
    } else {
      seeds = seeds.slice(0, 3);
    }
    
    console.log('✅ Story seeds generated successfully:', {
      context,
      difficulty,
      genre,
      seedCount: seeds.length,
      userId: authResult.user!.id
    });
    
    // 6. Return success response
    return createCorsResponse({
      success: true,
      seeds,
      metadata: {
        context,
        difficulty,
        genre,
        childName,
        generatedAt: new Date().toISOString(),
        userId: authResult.user!.id
      },
      message: 'Story seeds generated successfully'
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', {
      message: error.message,
      stack: error.stack
    });
    
    return createCorsResponse({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
});

/* 
✅ GENERATE STORY SEEDS FUNCTION FEATURES:

🎯 AI-POWERED GENERATION: Uses OpenAI GPT-4o to create unique story seeds
🛡️ FALLBACK SYSTEM: Comprehensive fallback seeds if AI fails
🌟 CONTEXT-AWARE: Adapts to bedtime, learning, or playtime contexts
📚 GENRE-FLEXIBLE: Works with any story genre
👶 AGE-APPROPRIATE: Considers difficulty level for content
🔒 SECURE: Proper authentication and validation
⚡ FAST: Optimized for quick seed generation

This function creates the foundation for Easy Mode story creation!
*/