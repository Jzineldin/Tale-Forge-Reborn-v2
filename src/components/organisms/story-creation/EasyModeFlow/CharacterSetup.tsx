import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, User } from 'lucide-react';
import { generateStorySeeds, getContextFromGenre, convertSeedToString } from '@/services/storySeedsService';

interface CharacterSetupProps {
  characterName: string;
  characterTraits: string[];
  storySeed: string;
  genre: string;
  onNameChange: (name: string) => void;
  onTraitsChange: (traits: string[]) => void;
  onSeedChange: (seed: string) => void;
}

const availableTraits = [
  'Brave', 'Curious', 'Kind', 'Smart', 'Funny', 'Creative',
  'Adventurous', 'Gentle', 'Clever', 'Caring', 'Bold', 'Imaginative'
];

const storySeeds: Record<string, string[]> = {
  FANTASY: [
    "A young adventurer discovers a magical map that leads to a hidden kingdom where animals can talk and help solve an ancient mystery.",
    "When the stars stop shining, a brave child must journey through enchanted forests to find the lost Star Crystal and save the night.",
    "A small village needs a hero when a friendly dragon's magic goes wrong, turning all the flowers into candy that won't stop growing."
  ],
  'SCI-FI': [
    "A curious young explorer discovers a friendly robot buried in their backyard who needs help getting back to its home planet.",
    "When all the computers in town start acting silly, a tech-savvy kid must figure out why the AI has developed a sense of humor.",
    "A child finds a time machine in their grandparent's attic and accidentally travels to a future where kids and robots are best friends."
  ],
  ADVENTURE: [
    "A treasure map found in an old library book leads to the greatest adventure of a lifetime, full of puzzles and friendly challenges.",
    "When a storm washes a mysterious bottle onto the beach, the message inside starts an incredible island adventure.",
    "A brave young explorer must help a lost baby whale find its family by navigating through coral reefs and underwater caves."
  ],
  MYSTERY: [
    "The case of the missing playground toys leads a young detective through a series of fun clues around the neighborhood.",
    "When books start disappearing from the library, a clever child must solve the mystery of the Midnight Book Borrower.",
    "A magical music box that only plays at midnight holds the key to solving the puzzle of the singing garden."
  ],
  FAIRYTALE: [
    "A kind child helps a lost fairy find her way home to the Flower Kingdom, discovering the magic of friendship along the way.",
    "When the kingdom's laughter disappears, a brave young hero must find the Giggling Goblin to bring joy back to the land.",
    "A magical mirror shows not reflections, but glimpses of fairy tale friends who need help solving their own happy endings."
  ],
  ANIMALS: [
    "A lonely puppy in the animal shelter has a secret - it can understand what all the other animals are thinking and feeling.",
    "When the neighborhood cats start acting strange, a young animal lover discovers they're planning the most adorable surprise.",
    "A child who can talk to animals must help organize the forest creatures for the biggest woodland celebration ever."
  ],
  EDUCATION: [
    "A magical school where numbers come alive teaches a young student that math can be the most exciting adventure of all.",
    "When letters start jumping off book pages, a curious child must help them find their way back to their stories.",
    "A time-traveling library card takes a student on educational adventures through history, meeting famous inventors and explorers."
  ],
  FUNNY: [
    "A child's imaginary friend turns out to be real, but has a terrible habit of turning everything into silly songs and rhymes.",
    "When a magic spell makes all the vegetables in town start telling jokes, dinnertime becomes the funniest part of the day.",
    "A young comedian must help a grumpy giant remember how to laugh by showing them all the funny things in the world."
  ],
  NATURE: [
    "A secret garden hidden behind an old oak tree needs a young gardener to help its flowers bloom again after a long winter.",
    "When the forest animals ask for help, a nature-loving child must solve the mystery of why the stream has stopped singing.",
    "A magical seed grows into an adventure when it sprouts into a beanstalk that leads to a cloud city full of weather friends."
  ]
};

const CharacterSetup: React.FC<CharacterSetupProps> = ({
  characterName,
  characterTraits,
  storySeed,
  genre,
  onNameChange,
  onTraitsChange,
  onSeedChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-generate initial story seed when genre changes
  useEffect(() => {
    if (genre && !storySeed) {
      generateNewSeed();
    }
  }, [genre]);

  const generateNewSeed = async () => {
    if (!genre) return;
    
    setIsGenerating(true);
    
    try {
      // Determine context from genre (bedtime/learning/playtime)
      const context = getContextFromGenre(genre);
      
      // Generate AI-powered story seeds
      const seeds = await generateStorySeeds({
        context,
        difficulty: 'medium', // Default difficulty for seed generation
        genre,
        childName: characterName || 'the child'
      });
      
      // Pick a random seed from the 3 generated
      const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
      const seedText = convertSeedToString(randomSeed);
      
      onSeedChange(seedText);
      
    } catch (error) {
      console.error('Failed to generate story seeds:', error);
      
      // Fallback to hardcoded seeds if API fails
      const seeds = storySeeds[genre] || storySeeds.FANTASY;
      const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
      onSeedChange(randomSeed);
      
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTrait = (trait: string) => {
    if (characterTraits.includes(trait)) {
      onTraitsChange(characterTraits.filter(t => t !== trait));
    } else {
      onTraitsChange([...characterTraits, trait]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          Personalize Your Story
        </h2>
        <p className="text-gray-400">
          Add your child's name and personality to make it special
        </p>
      </div>

      {/* AI Story Starter */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-semibold text-white">
            AI Story Starter
          </h3>
          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            Optional
          </span>
        </div>

        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 
            border border-purple-500/20 text-gray-200 italic leading-relaxed
            ${isGenerating ? 'animate-pulse' : ''}
          `}>
            {isGenerating ? (
              <div className="flex items-center gap-2 text-amber-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Crafting a magical story idea...
              </div>
            ) : (
              `"${storySeed}"`
            )}
          </div>

          <button
            onClick={generateNewSeed}
            className="btn btn-secondary btn-sm"
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate New Idea
          </button>
        </div>
      </div>

      {/* Character Name */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-white">
            Main Character Name
          </h3>
          <span className="text-sm text-red-400 bg-red-900/30 px-2 py-1 rounded-full">
            Required
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={characterName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter your child's name"
            className="
              w-full px-4 py-3 rounded-lg border-2 border-white/10
              bg-white/5 text-white placeholder-gray-400
              focus:border-blue-500 focus:bg-white/10 focus:outline-none
              transition-all duration-200
            "
            autoFocus
          />
          <p className="text-sm text-gray-400">
            This will be the hero of the story!
          </p>
        </div>
      </div>

      {/* Character Traits */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-semibold text-white">
            Character Traits
          </h3>
          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            Optional
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Choose personality traits that describe your child (select up to 3)
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableTraits.map((trait) => {
            const isSelected = characterTraits.includes(trait);
            const isDisabled = !isSelected && characterTraits.length >= 3;
            
            return (
              <button
                key={trait}
                onClick={() => toggleTrait(trait)}
                disabled={isDisabled}
                className={`
                  px-4 py-3 rounded-lg border-2 transition-all duration-200
                  font-medium text-sm
                  ${isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-transparent text-white shadow-lg shadow-amber-500/25'
                    : isDisabled
                    ? 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                  }
                `}
              >
                {trait}
                {isSelected && (
                  <span className="ml-2">✓</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <span className="text-sm text-gray-400">
            Selected: {characterTraits.length}/3
          </span>
        </div>
      </div>

      {/* Preview */}
      {characterName && (
        <div className="glass-panel p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/20">
          <h4 className="font-semibold text-white mb-2">Story Preview:</h4>
          <p className="text-gray-300 leading-relaxed">
            Meet <strong className="text-amber-400">{characterName}</strong>
            {characterTraits.length > 0 && (
              <>
                , a{' '}
                <strong className="text-blue-400">
                  {characterTraits.join(', ').toLowerCase()}
                </strong>{' '}
              </>
            )}
            {characterTraits.length > 0 ? 'child' : ''} who is about to embark on an amazing{' '}
            <strong className="text-purple-400">{genre.toLowerCase()}</strong> adventure!
          </p>
        </div>
      )}
    </div>
  );
};

export default CharacterSetup;