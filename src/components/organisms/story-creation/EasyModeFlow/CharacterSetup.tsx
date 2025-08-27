import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, User } from 'lucide-react';
import { generateStorySeeds, getContextFromGenre, convertSeedToString } from '@/services/storySeedsService';

interface CharacterSetupProps {
  characterName: string;
  characterTraits: string[];
  storySeed: string;
  genre: string;
  difficulty: 'short' | 'medium' | 'long' | null;
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
  difficulty,
  onNameChange,
  onTraitsChange,
  onSeedChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableSeeds, setAvailableSeeds] = useState<string[]>([]);
  const [selectedSeedIndex, setSelectedSeedIndex] = useState(0);

  // Auto-generate initial story seed when genre changes
  useEffect(() => {
    if (genre && !storySeed) {
      generateNewSeed();
    }
  }, [genre]);

  const generateNewSeed = async () => {
    if (!genre || !difficulty) return;
    
    setIsGenerating(true);
    
    try {
      // Determine context from genre (bedtime/learning/playtime)
      const context = getContextFromGenre(genre);
      
      // Generate AI-powered story seeds using the selected difficulty
      const seeds = await generateStorySeeds({
        context,
        difficulty: difficulty, // Use the actual selected difficulty
        genre,
        childName: characterName || 'the child'
      });
      
      // Store all seeds and convert to strings
      const seedTexts = seeds.map(seed => convertSeedToString(seed));
      setAvailableSeeds(seedTexts);
      setSelectedSeedIndex(0);
      
      // Set the first seed as default
      onSeedChange(seedTexts[0]);
      
    } catch (error) {
      console.error('Failed to generate story seeds:', error);
      
      // Fallback to hardcoded seeds if AI fails
      const seeds = storySeeds[genre] || storySeeds.FANTASY;
      const shuffledSeeds = [...seeds].sort(() => Math.random() - 0.5);
      const fallbackSeeds = shuffledSeeds.slice(0, 3); // Take 3 random seeds
      
      setAvailableSeeds(fallbackSeeds);
      setSelectedSeedIndex(0);
      onSeedChange(fallbackSeeds[0]);
      
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

  const selectSeed = (index: number) => {
    setSelectedSeedIndex(index);
    onSeedChange(availableSeeds[index]);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3 animate-fade-in">
          ✨ Let's Create Your Hero! ✨
        </h2>
        <p className="text-gray-300 text-lg">
          Time to make this story uniquely yours with personality and magic
        </p>
      </div>

      {/* AI Story Starter */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
          <h3 className="text-xl font-semibold text-white">
            🎭 AI Story Magic
          </h3>
          <span className="text-sm text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-500/20">
            ✨ Inspiration
          </span>
        </div>

        <div className="space-y-4">
          <div className={`
            p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 
            border border-purple-500/20 text-gray-200 italic leading-relaxed
            ${isGenerating ? 'animate-pulse' : ''}
          `}>
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3 text-amber-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <div className="text-center">
                  <p className="font-medium">🎭 Creating magical adventures...</p>
                  <p className="text-sm text-amber-300 mt-1">Our AI is weaving your perfect story!</p>
                </div>
              </div>
            ) : storySeed ? (
              <div className="space-y-2">
                <p className="text-xs uppercase font-bold text-purple-400 tracking-wide">Your Story Inspiration:</p>
                <p className="text-white italic text-lg leading-relaxed">{storySeed}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">✨ Unique</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">🎯 Age-Appropriate</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 italic">Click below to generate your magical story idea! ✨</p>
              </div>
            )}
          </div>

          <button
            onClick={generateNewSeed}
            className="btn btn-secondary btn-sm group hover:scale-105 transition-all duration-200"
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
            {storySeed ? '🎲 Try Another Adventure' : '✨ Create My Story Idea'}
          </button>
        </div>
      </div>

      {/* Character Name */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className={`w-6 h-6 text-blue-500 ${characterName ? 'animate-bounce' : ''}`} />
          <h3 className="text-xl font-semibold text-white">
            🌟 Our Amazing Hero
          </h3>
          <span className="text-sm text-blue-400 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/20">
            ⭐ Essential
          </span>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={characterName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="What's your hero's name?"
              className={`
                w-full px-4 py-4 rounded-lg border-2 transition-all duration-300
                bg-white/5 text-white placeholder-gray-400
                focus:outline-none text-lg font-medium
                ${characterName 
                  ? 'border-blue-500 bg-blue-900/10 shadow-lg shadow-blue-500/20' 
                  : 'border-white/10 focus:border-blue-500 focus:bg-white/10'
                }
              `}
              autoFocus
            />
            {characterName && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-2xl animate-pulse">🌟</span>
              </div>
            )}
          </div>
          <div className={`transition-all duration-300 ${characterName ? 'opacity-100' : 'opacity-60'}`}>
            <p className="text-sm font-medium text-blue-300">
              {characterName 
                ? `🎭 Perfect! ${characterName} will be our brave protagonist!` 
                : '🎯 This will be the main character of your story!'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Character Traits */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className={`w-6 h-6 text-purple-500 ${characterTraits.length > 0 ? 'animate-pulse' : ''}`} />
          <h3 className="text-xl font-semibold text-white">
            ✨ Personality Powers
          </h3>
          <span className="text-sm text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/20">
            🎨 Customize
          </span>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-purple-300 mb-2">
            What makes {characterName || 'your hero'} special? Pick up to 3 superpowers! ⚡
          </p>
          <div className={`text-xs transition-all duration-300 ${characterTraits.length > 0 ? 'opacity-100' : 'opacity-60'}`}>
            <p className="text-purple-200">
              {characterTraits.length === 0 && '🎯 Select traits that describe your child\'s personality'}
              {characterTraits.length === 1 && '🌟 Great start! Add 1-2 more traits to build the perfect character'}
              {characterTraits.length === 2 && '⚡ Awesome! One more trait to complete your hero\'s powers'}
              {characterTraits.length === 3 && '🎉 Perfect! Your hero has an amazing personality combination'}
            </p>
          </div>
        </div>

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
                  px-4 py-3 rounded-lg border-2 transition-all duration-300 transform
                  font-medium text-sm relative overflow-hidden group
                  ${isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-transparent text-white shadow-xl shadow-amber-500/30 scale-105 animate-pulse'
                    : isDisabled
                    ? 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed opacity-50'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:scale-105 hover:text-white'
                  }
                `}
              >
                <span className="relative z-10">
                  {trait}
                  {isSelected && (
                    <span className="ml-2 animate-bounce">⚡</span>
                  )}
                </span>
                {/* Shimmer effect for hover */}
                {!isSelected && !isDisabled && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= characterTraits.length
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50'
                    : 'bg-gray-600 border border-gray-500'
                }`}
              />
            ))}
          </div>
          <span className={`text-sm font-medium transition-all duration-300 ${
            characterTraits.length > 0 ? 'text-amber-400' : 'text-gray-400'
          }`}>
            {characterTraits.length === 0 && '🎨 Choose your personality powers'}
            {characterTraits.length === 1 && '⚡ 1 power selected! Keep going!'}
            {characterTraits.length === 2 && '🌟 2 powers! Almost complete!'}
            {characterTraits.length === 3 && '🎉 Perfect combo! Maximum power achieved!'}
          </span>
        </div>
      </div>

      {/* Preview */}
      {characterName && (
        <div className="glass-panel p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/20 relative overflow-hidden">
          {/* Animated background sparkles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 animate-ping">✨</div>
            <div className="absolute top-6 right-8 animate-pulse">⭐</div>
            <div className="absolute bottom-4 left-8 animate-bounce">🌟</div>
            <div className="absolute bottom-2 right-4 animate-ping delay-300">✨</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl animate-bounce">🎭</span>
              <h4 className="text-xl font-bold text-white">Character Preview</h4>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-gray-200 leading-relaxed text-lg">
                  Meet <strong className="text-amber-400 animate-pulse">{characterName}</strong>
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
              
              {characterTraits.length === 3 && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30">
                  <span className="text-amber-400 text-lg animate-spin">⚡</span>
                  <span className="text-amber-300 font-medium">Character fully powered up!</span>
                  <span className="text-amber-400 text-lg animate-spin">⚡</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSetup;