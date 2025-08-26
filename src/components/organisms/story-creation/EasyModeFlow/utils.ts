import { EasyModeData } from './index';

// Mapping from Easy Mode difficulty to backend format
const DIFFICULTY_TO_BACKEND = {
  'short': {
    story_type: 'short',
    words_per_chapter: 60,    // 40-80 words
    target_age: 5,            // Ages 4-6
    age_group: '4-6',
    chapters: 1
  },
  'medium': {
    story_type: 'medium',
    words_per_chapter: 125,   // 100-150 words
    target_age: 7,            // Ages 6-9
    age_group: '7-9',
    chapters: 2
  },
  'long': {
    story_type: 'long',
    words_per_chapter: 180,   // 160-200 words
    target_age: 10,           // Ages 9-12
    age_group: '10-12',
    chapters: 3
  }
} as const;

// Genre mapping from UI to backend
const GENRE_MAP = {
  'FANTASY': 'fantasy',
  'SCI-FI': 'scifi',
  'ADVENTURE': 'adventure',
  'MYSTERY': 'mystery',
  'FAIRYTALE': 'fairytale',
  'ANIMALS': 'animals',
  'EDUCATION': 'educational',
  'FUNNY': 'humor',
  'NATURE': 'nature'
} as const;

// Theme extraction from genre
const GENRE_THEMES = {
  'fantasy': 'Magic and wonder',
  'scifi': 'Future and technology',
  'adventure': 'Exploration and discovery',
  'mystery': 'Problem solving and curiosity',
  'fairytale': 'Good vs evil with happy endings',
  'animals': 'Friendship and companionship',
  'educational': 'Learning through experience',
  'humor': 'Laughter and fun',
  'nature': 'Environmental awareness and beauty'
} as const;

// Setting extraction from genre
const GENRE_SETTINGS = {
  'fantasy': 'A magical realm with enchanted forests',
  'scifi': 'A futuristic world with advanced technology',
  'adventure': 'Various exciting locations around the world',
  'mystery': 'A puzzling place that needs investigation',
  'fairytale': 'A classic storybook kingdom',
  'animals': 'A place where animals and humans interact',
  'educational': 'An environment that encourages learning',
  'humor': 'A silly, laugh-filled setting',
  'nature': 'Beautiful natural environments'
} as const;

// Atmosphere mapping
const GENRE_ATMOSPHERE = {
  'fantasy': 'whimsical and magical',
  'scifi': 'futuristic and exciting',
  'adventure': 'thrilling and bold',
  'mystery': 'curious and intriguing',
  'fairytale': 'classic and heartwarming',
  'animals': 'friendly and caring',
  'educational': 'encouraging and supportive',
  'humor': 'lighthearted and fun',
  'nature': 'peaceful and inspiring'
} as const;

// Default moral lessons by age
const DEFAULT_MORALS = {
  5: 'Being kind to others makes everyone happy',
  7: 'Working together helps us solve any problem',
  10: 'Being brave means doing the right thing even when it\'s hard'
} as const;

/**
 * Generate a story title based on the story seed and character name
 */
function generateTitle(easyMode: EasyModeData): string {
  if (!easyMode.characterName) return 'An Amazing Adventure';

  const genreTitles: Record<string, string[]> = {
    'FANTASY': [
      `${easyMode.characterName} and the Magic Quest`,
      `The Adventures of ${easyMode.characterName} in Magical Land`,
      `${easyMode.characterName}'s Enchanted Journey`
    ],
    'SCI-FI': [
      `${easyMode.characterName} Explores the Future`,
      `${easyMode.characterName} and the Space Adventure`,
      `The Time Traveling Tales of ${easyMode.characterName}`
    ],
    'ADVENTURE': [
      `${easyMode.characterName}'s Great Adventure`,
      `The Explorer ${easyMode.characterName}`,
      `${easyMode.characterName} and the Hidden Treasure`
    ],
    'MYSTERY': [
      `Detective ${easyMode.characterName} Solves the Case`,
      `${easyMode.characterName} and the Mysterious Clues`,
      `The Case of ${easyMode.characterName}'s Big Discovery`
    ],
    'FAIRYTALE': [
      `Princess/Prince ${easyMode.characterName}'s Tale`,
      `${easyMode.characterName} and the Happy Ending`,
      `The Fairy Tale of ${easyMode.characterName}`
    ],
    'ANIMALS': [
      `${easyMode.characterName} and the Animal Friends`,
      `${easyMode.characterName}'s Pet Adventure`,
      `The Story of ${easyMode.characterName} and the Talking Animals`
    ],
    'EDUCATION': [
      `${easyMode.characterName} Learns Something New`,
      `The Learning Adventure of ${easyMode.characterName}`,
      `${easyMode.characterName} Discovers Amazing Things`
    ],
    'FUNNY': [
      `The Silly Adventures of ${easyMode.characterName}`,
      `${easyMode.characterName} and the Giggling Adventure`,
      `${easyMode.characterName}'s Funny Day`
    ],
    'NATURE': [
      `${easyMode.characterName} and the Secret Garden`,
      `${easyMode.characterName}'s Nature Adventure`,
      `The Story of ${easyMode.characterName} and the Magic Forest`
    ]
  };

  const titles = genreTitles[easyMode.genre || 'ADVENTURE'] || genreTitles['ADVENTURE'];
  return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Extract theme from story seed or use default
 */
function extractTheme(storySeed: string, genre: string): string {
  const backendGenre = GENRE_MAP[genre as keyof typeof GENRE_MAP] || 'adventure';

  // Try to extract theme from seed, otherwise use default
  if (storySeed.includes('friend')) return 'friendship and cooperation';
  if (storySeed.includes('magic')) return 'magic and wonder';
  if (storySeed.includes('brave') || storySeed.includes('courage')) return 'bravery and courage';
  if (storySeed.includes('kind') || storySeed.includes('help')) return 'kindness and helping others';
  if (storySeed.includes('learn') || storySeed.includes('discover')) return 'learning and discovery';

  return GENRE_THEMES[backendGenre] || 'adventure and growth';
}

/**
 * Extract setting from story seed or use default
 */
function extractSetting(storySeed: string, genre: string): string {
  const backendGenre = GENRE_MAP[genre as keyof typeof GENRE_MAP] || 'adventure';

  // Try to extract setting from seed
  if (storySeed.includes('forest')) return 'An enchanted forest full of wonder';
  if (storySeed.includes('space') || storySeed.includes('planet')) return 'A fascinating space adventure';
  if (storySeed.includes('ocean') || storySeed.includes('sea')) return 'The vast and mysterious ocean';
  if (storySeed.includes('school')) return 'A magical learning environment';
  if (storySeed.includes('home') || storySeed.includes('house')) return 'A cozy home with hidden secrets';
  if (storySeed.includes('garden')) return 'A beautiful secret garden';
  if (storySeed.includes('kingdom')) return 'A magnificent fairy tale kingdom';

  return GENRE_SETTINGS[backendGenre] || 'An exciting place full of possibilities';
}

/**
 * Extract conflict from story seed
 */
function extractConflict(storySeed: string): string {
  // Extract the main challenge/problem from the seed
  if (storySeed.includes('lost')) return 'Something important has been lost and needs to be found';
  if (storySeed.includes('missing')) return 'Someone or something is missing and needs help';
  if (storySeed.includes('broken') || storySeed.includes('wrong')) return 'Something needs to be fixed or made right';
  if (storySeed.includes('mystery')) return 'A puzzling mystery that needs to be solved';
  if (storySeed.includes('help') || storySeed.includes('save')) return 'Someone or something needs rescue or assistance';
  if (storySeed.includes('find')) return 'An important discovery or quest needs to be completed';

  return 'An exciting challenge that needs our hero\'s special talents to overcome';
}

/**
 * Convert Easy Mode data to backend format
 */
export function convertToBackendFormat(easyMode: EasyModeData) {
  if (!easyMode.difficulty || !easyMode.genre) {
    throw new Error('Difficulty and genre are required');
  }

  const difficulty = DIFFICULTY_TO_BACKEND[easyMode.difficulty];
  const backendGenre = GENRE_MAP[easyMode.genre as keyof typeof GENRE_MAP];

  if (!difficulty || !backendGenre) {
    throw new Error('Invalid difficulty or genre');
  }

  // Create main character
  const mainCharacter = {
    id: 'main',
    name: easyMode.characterName || 'Hero',
    role: 'protagonist',
    traits: easyMode.characterTraits,
    description: easyMode.characterTraits.length > 0
      ? `A ${easyMode.characterTraits.join(', ').toLowerCase()} child`
      : 'A brave and curious child'
  };

  // Extract story elements
  const theme = extractTheme(easyMode.storySeed, easyMode.genre);
  const setting = extractSetting(easyMode.storySeed, easyMode.genre);
  const conflict = extractConflict(easyMode.storySeed);

  return {
    // Required fields matching StoryCreationRequest interface
    title: generateTitle(easyMode),
    description: easyMode.storySeed || `An amazing ${backendGenre} adventure for ${easyMode.characterName || 'a special child'}`,
    genre: backendGenre,
    age_group: difficulty.age_group,

    // Required Story fields  
    status: 'draft' as const,
    user_id: '', // Will be set by the useCreateStory hook

    // Story configuration
    story_type: difficulty.story_type,
    target_age: difficulty.target_age,
    words_per_chapter: difficulty.words_per_chapter,

    // Character data
    child_name: easyMode.characterName || '',
    characters: [mainCharacter],

    // Story elements (from AI seed and defaults)
    theme: theme,
    setting: setting,
    conflict: conflict,
    quest: easyMode.storySeed || `Help ${easyMode.characterName || 'our hero'} on an amazing adventure`,

    // Additional optional fields (matching backend interface)
    additional_details: easyMode.storySeed,
    atmosphere: GENRE_ATMOSPHERE[backendGenre] || 'exciting and engaging',
    moral_lesson: DEFAULT_MORALS[difficulty.target_age as keyof typeof DEFAULT_MORALS] || 'Every adventure teaches us something new',
    time_period: 'present day',
    setting_description: setting,

    // Easy Mode specific fields for backend processing
    include_images: true,
    include_audio: true
  };
}

export { DIFFICULTY_TO_BACKEND, GENRE_MAP, GENRE_THEMES };