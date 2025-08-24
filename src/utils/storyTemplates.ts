// Story Templates for Quick Creation
// Pre-defined story settings to speed up the creation process

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  settings: {
    targetAge: number;
    wordsPerChapter: number;
    genre: string;
    theme: string;
    characters: Array<{
      id: string;
      name: string;
      description: string;
      role: string;
      traits: string[];
    }>;
    location: string;
    timePeriod: string;
    atmosphere: string;
    conflict: string;
    quest: string;
    moralLesson: string;
    additionalDetails: string;
    settingDescription: string;
  };
}

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'magical-adventure',
    name: 'Magical Adventure',
    description: 'A classic fantasy quest with magic, friendship, and wonder',
    icon: '🧙‍♂️',
    category: 'Fantasy',
    settings: {
      targetAge: 8,
      wordsPerChapter: 200,
      genre: 'Fantasy',
      theme: 'Friendship and Magic',
      characters: [
        {
          id: 'hero-1',
          name: 'Luna',
          description: 'A brave young wizard with a kind heart',
          role: 'Hero',
          traits: ['brave', 'curious', 'magical']
        },
        {
          id: 'companion-1',
          name: 'Pip',
          description: 'A talking fox who loves riddles',
          role: 'Companion',
          traits: ['clever', 'loyal', 'funny']
        }
      ],
      location: 'Enchanted Forest',
      timePeriod: 'Fantasy Medieval',
      atmosphere: 'Magical and mysterious',
      conflict: 'The forest\'s magic is fading and needs to be restored',
      quest: 'Find the ancient Crystal of Light to save the magical realm',
      moralLesson: 'True magic comes from helping others and believing in yourself',
      additionalDetails: 'Include talking animals, magical spells, and beautiful nature',
      settingDescription: 'A mystical forest filled with glowing trees, singing streams, and hidden magical creatures'
    }
  },
  {
    id: 'space-explorer',
    name: 'Space Explorer',
    description: 'An exciting journey among the stars with alien friends',
    icon: '🚀',
    category: 'Science Fiction',
    settings: {
      targetAge: 9,
      wordsPerChapter: 250,
      genre: 'Science Fiction',
      theme: 'Exploration and Discovery',
      characters: [
        {
          id: 'astronaut-1',
          name: 'Captain Zara',
          description: 'A fearless space explorer who loves discovering new worlds',
          role: 'Hero',
          traits: ['adventurous', 'smart', 'fearless']
        },
        {
          id: 'alien-1',
          name: 'Glow',
          description: 'A friendly alien who can change colors based on emotions',
          role: 'Friend',
          traits: ['friendly', 'colorful', 'helpful']
        }
      ],
      location: 'Space Station Cosmos',
      timePeriod: 'Future',
      atmosphere: 'Wonder-filled and high-tech',
      conflict: 'Strange signals from a distant planet need investigation',
      quest: 'Explore unknown planets and make first contact with new alien species',
      moralLesson: 'Different doesn\'t mean scary - friendship can cross any distance',
      additionalDetails: 'Include cool gadgets, colorful alien worlds, and space ships',
      settingDescription: 'A gleaming space station orbiting a rainbow nebula, with windows showing distant galaxies'
    }
  },
  {
    id: 'pirate-treasure',
    name: 'Pirate Treasure Hunt',
    description: 'Ahoy! A swashbuckling adventure on the high seas',
    icon: '🏴‍☠️',
    category: 'Adventure',
    settings: {
      targetAge: 7,
      wordsPerChapter: 180,
      genre: 'Adventure',
      theme: 'Courage and Teamwork',
      characters: [
        {
          id: 'pirate-1',
          name: 'Captain Ruby',
          description: 'A kind pirate captain who shares treasure with those in need',
          role: 'Hero',
          traits: ['brave', 'generous', 'clever']
        },
        {
          id: 'parrot-1',
          name: 'Squawk',
          description: 'A colorful parrot who speaks in rhymes',
          role: 'Companion',
          traits: ['wise', 'funny', 'loyal']
        }
      ],
      location: 'Tropical Island',
      timePeriod: 'Age of Pirates',
      atmosphere: 'Adventurous and sunny',
      conflict: 'Evil pirates are threatening peaceful island villages',
      quest: 'Find the legendary Treasure of Kindness to help the islanders',
      moralLesson: 'The greatest treasure is helping others and working as a team',
      additionalDetails: 'Include treasure maps, friendly sea creatures, and tropical paradise',
      settingDescription: 'A beautiful tropical island with palm trees, crystal clear waters, and hidden caves'
    }
  },
  {
    id: 'animal-rescue',
    name: 'Animal Rescue Mission',
    description: 'Help endangered animals in this heartwarming tale',
    icon: '🐾',
    category: 'Nature',
    settings: {
      targetAge: 6,
      wordsPerChapter: 150,
      genre: 'Adventure',
      theme: 'Animal Care and Environment',
      characters: [
        {
          id: 'vet-1',
          name: 'Dr. Maya',
          description: 'A young veterinarian who can talk to animals',
          role: 'Hero',
          traits: ['caring', 'gentle', 'determined']
        },
        {
          id: 'tiger-1',
          name: 'Stripes',
          description: 'A baby tiger who needs help finding his family',
          role: 'Friend',
          traits: ['playful', 'brave', 'loving']
        }
      ],
      location: 'Wildlife Sanctuary',
      timePeriod: 'Modern Day',
      atmosphere: 'Warm and caring',
      conflict: 'Baby animals are separated from their families due to a storm',
      quest: 'Reunite animal families and restore their natural habitat',
      moralLesson: 'Every creature deserves love, care, and a safe home',
      additionalDetails: 'Include various cute animals, nature conservation, and healing',
      settingDescription: 'A peaceful wildlife sanctuary surrounded by forests, with cozy animal homes and healing centers'
    }
  },
  {
    id: 'time-travel',
    name: 'Time Travel Adventure',
    description: 'Journey through different time periods and meet historical figures',
    icon: '⏰',
    category: 'Educational',
    settings: {
      targetAge: 10,
      wordsPerChapter: 300,
      genre: 'Science Fiction',
      theme: 'History and Learning',
      characters: [
        {
          id: 'inventor-1',
          name: 'Alex',
          description: 'A young inventor who discovered time travel',
          role: 'Hero',
          traits: ['curious', 'intelligent', 'brave']
        },
        {
          id: 'guide-1',
          name: 'Chronos',
          description: 'A wise time guardian who helps travelers',
          role: 'Guide',
          traits: ['wise', 'mysterious', 'helpful']
        }
      ],
      location: 'Time Laboratory',
      timePeriod: 'Multiple Time Periods',
      atmosphere: 'Educational and exciting',
      conflict: 'Historical events are being changed by someone misusing time travel',
      quest: 'Restore the timeline by visiting different historical periods',
      moralLesson: 'Learning from history helps us build a better future',
      additionalDetails: 'Include famous historical figures, important inventions, and cultural discoveries',
      settingDescription: 'A high-tech laboratory with swirling time portals leading to ancient Egypt, medieval castles, and more'
    }
  },
  {
    id: 'underwater-kingdom',
    name: 'Underwater Kingdom',
    description: 'Dive into an oceanic adventure with mermaids and sea creatures',
    icon: '🧜‍♀️',
    category: 'Fantasy',
    settings: {
      targetAge: 7,
      wordsPerChapter: 200,
      genre: 'Fantasy',
      theme: 'Ocean Conservation and Friendship',
      characters: [
        {
          id: 'mermaid-1',
          name: 'Coral',
          description: 'A young mermaid princess who loves exploring',
          role: 'Hero',
          traits: ['curious', 'kind', 'brave']
        },
        {
          id: 'dolphin-1',
          name: 'Splash',
          description: 'A playful dolphin who knows all the ocean secrets',
          role: 'Companion',
          traits: ['playful', 'wise', 'loyal']
        }
      ],
      location: 'Coral Kingdom',
      timePeriod: 'Timeless Underwater Realm',
      atmosphere: 'Magical and peaceful',
      conflict: 'Pollution is threatening the beautiful coral reef kingdom',
      quest: 'Clean the ocean and restore the coral reef to its former beauty',
      moralLesson: 'We must protect our oceans and all the creatures that live in them',
      additionalDetails: 'Include colorful fish, underwater castles, and marine conservation',
      settingDescription: 'A magnificent underwater kingdom with rainbow coral reefs, pearl palaces, and schools of tropical fish'
    }
  }
];

export const TEMPLATE_CATEGORIES = [
  'All',
  'Fantasy',
  'Science Fiction', 
  'Adventure',
  'Nature',
  'Educational'
];

export function getTemplatesByCategory(category: string): StoryTemplate[] {
  if (category === 'All') {
    return STORY_TEMPLATES;
  }
  return STORY_TEMPLATES.filter(template => template.category === category);
}

export function getTemplateById(id: string): StoryTemplate | undefined {
  return STORY_TEMPLATES.find(template => template.id === id);
}