// Story Seeds Service - Connects to generate-story-seeds edge function
import { edgeFunctionsClient } from '@/lib/supabase';

export interface StorySeed {
  title: string;
  teaser: string;
}

export interface StorySeedsResponse {
  success: boolean;
  seeds: StorySeed[];
  metadata: {
    context: string;
    difficulty: string;
    genre: string;
    childName: string;
    generatedAt: string;
    userId: string;
  };
  message: string;
}

export interface GenerateSeedsRequest {
  context: 'bedtime' | 'learning' | 'playtime';
  difficulty: 'short' | 'medium' | 'long';
  genre: string;
  childName?: string;
}

/**
 * Generates story seeds using the AI-powered edge function
 */
export const generateStorySeeds = async ({
  context,
  difficulty,
  genre,
  childName = "the child"
}: GenerateSeedsRequest): Promise<StorySeed[]> => {
  try {
    console.log('🌱 Requesting story seeds:', { context, difficulty, genre, childName });

    // Add cache-busting parameters to ensure fresh generation
    const { data, error } = await edgeFunctionsClient.functions.invoke('generate-story-seeds', {
      body: {
        context,
        difficulty, 
        genre: genre.toUpperCase(), // Backend expects uppercase genres
        childName,
        timestamp: Date.now(), // Cache buster
        requestId: Math.random().toString(36).substring(7) // Unique request ID
      }
    });

    if (error) {
      console.error('❌ Error generating story seeds:', error);
      // Don't throw, use fallback instead
      const fallback = getFallbackSeeds(genre);
      console.log(`📚 Using fallback seeds for ${genre}: ${fallback.length} seeds available`);
      // Shuffle fallback for variety
      const shuffled = [...fallback].sort(() => Math.random() - 0.5).slice(0, 3);
      console.log(`🔀 Returning ${shuffled.length} shuffled fallback seeds`);
      return shuffled;
    }

    if (!data || !data.success) {
      console.error('❌ Invalid response from story seeds API:', data);
      const fallback = getFallbackSeeds(genre);
      console.log(`📚 Using fallback seeds for ${genre}: ${fallback.length} seeds available`);
      const shuffled = [...fallback].sort(() => Math.random() - 0.5).slice(0, 3);
      console.log(`🔀 Returning ${shuffled.length} shuffled fallback seeds`);
      return shuffled;
    }

    console.log('✅ Story seeds generated:', data.seeds.length, 'seeds', 'Using AI:', !data.metadata?.usingFallback);
    
    // Ensure we always return 3 seeds
    if (data.seeds.length > 3) {
      return data.seeds.slice(0, 3);
    }
    
    return data.seeds;

  } catch (error) {
    console.error('❌ Story seeds service error:', error);
    
    // Return shuffled fallback seeds if API fails  
    const fallback = getFallbackSeeds(genre);
    // Shuffle for variety
    for (let i = fallback.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fallback[i], fallback[j]] = [fallback[j], fallback[i]];
    }
    return fallback.slice(0, 3);
  }
};

/**
 * Fallback story seeds if API fails (same as backend fallbacks)
 */
const getFallbackSeeds = (genre: string): StorySeed[] => {
  const fallbackSeeds: Record<string, StorySeed[]> = {
    FANTASY: [
      {
        title: "Moonbeam Magic",
        teaser: "A girl rides moonbeams to visit sleepy cloud animals."
      },
      {
        title: "Dragon's Lullaby",
        teaser: "A dragon learns to sleep with help from an owl."
      },
      {
        title: "Star Train",
        teaser: "Twins ride a magical train through the stars."
      }
    ],
    'SCI-FI': [
      {
        title: "Robot Friend",
        teaser: "A child builds a robot that becomes their best friend."
      },
      {
        title: "Puzzle School",
        teaser: "Students solve fun puzzles in a magical school."
      },
      {
        title: "Living Books",
        teaser: "Books come alive in a special library."
      }
    ],
    MYSTERY: [
      {
        title: "Cookie Mystery",
        teaser: "A detective solves the case of missing cookies."
      },
      {
        title: "Singing Garden",
        teaser: "A garden sings mysterious melodies at midnight."
      },
      {
        title: "Hidden Door",
        teaser: "A secret door appears behind the library bookshelf."
      }
    ],
    DEFAULT: [
      {
        title: "Playground Games",
        teaser: "Kids organize the best playground Olympics ever."
      },
      {
        title: "Treasure Map",
        teaser: "Friends find a treasure map in the park."
      },
      {
        title: "Super Squad",
        teaser: "Kids discover they have superpowers when playing together."
      }
    ]
  };

  const genreKey = genre.toUpperCase();
  const seeds = fallbackSeeds[genreKey] || fallbackSeeds.DEFAULT;
  
  // Always return an array of 3 seeds, shuffle if needed
  if (seeds.length < 3) {
    console.warn(`Only ${seeds.length} fallback seeds for genre ${genreKey}, using defaults to fill`);
    const combined = [...seeds, ...fallbackSeeds.DEFAULT];
    return combined.slice(0, 3);
  }
  
  return seeds;
};

/**
 * Get context based on typical story usage patterns
 * This helps determine whether to use bedtime, learning, or playtime context
 */
export const getContextFromGenre = (genre: string): 'bedtime' | 'learning' | 'playtime' => {
  const genreUpper = genre.toUpperCase();
  
  if (['FANTASY', 'FAIRYTALE', 'ANIMALS'].includes(genreUpper)) {
    return 'bedtime';
  }
  
  if (['EDUCATION', 'SCI-FI', 'MYSTERY'].includes(genreUpper)) {
    return 'learning';
  }
  
  return 'playtime'; // ADVENTURE, FUNNY, NATURE, etc.
};

/**
 * Convert StorySeed to the simple string format expected by current UI
 */
export const convertSeedToString = (seed: StorySeed): string => {
  return seed.teaser;
};