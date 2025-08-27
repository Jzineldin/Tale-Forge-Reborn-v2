// Story Seeds Service - Connects to generate-story-seeds edge function
import { supabase } from '@/lib/supabase';

export interface StorySeed {
  title: string;
  teaser: string;
  hiddenMoral: string;
  conflict: string;
  quest: string;
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
    const { data, error } = await supabase.functions.invoke('generate-story-seeds', {
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
      // Shuffle fallback for variety
      return fallback.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    if (!data || !data.success) {
      console.error('❌ Invalid response from story seeds API:', data);
      const fallback = getFallbackSeeds(genre);
      return fallback.sort(() => Math.random() - 0.5).slice(0, 3);
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
    'SCI-FI': [
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
    DEFAULT: [
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

  const genreKey = genre.toUpperCase();
  return fallbackSeeds[genreKey] || fallbackSeeds.DEFAULT;
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