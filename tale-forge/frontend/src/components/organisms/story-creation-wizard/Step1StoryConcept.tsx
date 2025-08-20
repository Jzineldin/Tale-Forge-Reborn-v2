import React from 'react';
import Icon from '@/components/atoms/Icon';

interface Step1StoryConceptProps {
  storyData: any;
  handleInputChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Step1StoryConcept: React.FC<Step1StoryConceptProps> = ({
  storyData,
  handleInputChange,
  onNext,
  onPrevious
}) => {
  // Age group options with fun descriptions
  const ageGroups = [
    { 
      id: '4-6', 
      label: 'Little Dreamers', 
      age: '4-6 years',
      description: 'Gentle, magical tales perfect for bedtime and quiet moments',
      emoji: '🌙',
      color: 'bg-indigo-500'
    },
    { 
      id: '7-9', 
      label: 'Young Adventurers', 
      age: '7-9 years',
      description: 'Exciting journeys with brave heroes and amazing discoveries',
      emoji: '🗺️',
      color: 'bg-green-500'
    },
    { 
      id: '10-12', 
      label: 'Story Masters', 
      age: '10-12 years',
      description: 'Complex narratives with deeper themes and challenging quests',
      emoji: '🎯',
      color: 'bg-purple-500'
    }
  ];

  // Genre options with actual images from your assets
  const genres = [
    { 
      id: 'bedtime', 
      label: 'Bedtime Stories', 
      description: 'Gentle, calming tales for peaceful dreams',
      emoji: '🌙',
      image: '/images/genres/bedtime/peaceful-bedtime.png',
      color: 'hover:border-indigo-400/50'
    },
    { 
      id: 'fantasy', 
      label: 'Fantasy & Magic', 
      description: 'Enchanting worlds with magical creatures and spells',
      emoji: '🧙‍♂️',
      image: '/images/genres/fantasy/enchanted-world.png',
      color: 'hover:border-purple-400/50'
    },
    { 
      id: 'adventure', 
      label: 'Adventure & Exploration', 
      description: 'Exciting journeys to discover new worlds',
      emoji: '🗺️',
      image: '/images/genres/adventure/futuristic-adventure.png',
      color: 'hover:border-green-400/50'
    },
    { 
      id: 'mystery', 
      label: 'Mystery & Detective', 
      description: 'Puzzles and investigations to solve together',
      emoji: '🔍',
      image: '/images/genres/mystery/mystery-placeholder.png',
      color: 'hover:border-yellow-400/50'
    },
    { 
      id: 'sci-fi', 
      label: 'Space & Science Fiction', 
      description: 'Futuristic tales and cosmic adventures',
      emoji: '🚀',
      image: '/images/genres/sci-fi/futuristic-space-adventure.png',
      color: 'hover:border-blue-400/50'
    },
    { 
      id: 'educational', 
      label: 'Educational Stories', 
      description: 'Learning through fun and engaging storytelling',
      emoji: '📚',
      image: '/images/genres/educational/educational-content.png',
      color: 'hover:border-emerald-400/50'
    },
    { 
      id: 'values', 
      label: 'Values & Life Lessons', 
      description: 'Stories that teach kindness and good values',
      emoji: '💎',
      image: '/images/genres/values/friendly-character.png',
      color: 'hover:border-pink-400/50'
    },
    { 
      id: 'humorous', 
      label: 'Silly & Funny Stories', 
      description: 'Laughter-filled adventures with silly characters',
      emoji: '😄',
      image: '/images/genres/humorous/comical-space-adventure.png',
      color: 'hover:border-orange-400/50'
    }
  ];

  const isValid = storyData.ageGroup && storyData.genre;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
          💡 Story Concept
        </h2>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Let's start by choosing what kind of magical tale you'd like to create
        </p>
      </div>

      {/* Child's Name Input */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <label className="block text-white font-semibold mb-3">
          ✨ Child's Name (Optional)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter the hero's name for personalization..."
            value={storyData.childName}
            onChange={(e) => handleInputChange('childName', e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3 text-lg rounded-xl"
          />
          <Icon name="user" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
        </div>
        <p className="text-sm text-white/60 mt-2">
          We'll use this name to make the story extra special and personal
        </p>
      </div>

      {/* Age Group Selection */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          🎯 Choose Age Group
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ageGroups.map((ageGroup) => (
            <button
              key={ageGroup.id}
              type="button"
              className={`glass-card backdrop-blur-md border-2 rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 ${
                storyData.ageGroup === ageGroup.id
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
              onClick={() => handleInputChange('ageGroup', ageGroup.id)}
            >
              <div className={`${ageGroup.color} w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4`}>
                {ageGroup.emoji}
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                {ageGroup.label}
              </h4>
              <div className="text-sm text-amber-400 font-semibold mb-2">
                {ageGroup.age}
              </div>
              <p className="text-sm text-white/80">
                {ageGroup.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Genre Selection */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          🎨 Pick Your Story Genre
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              className={`glass-card backdrop-blur-md border-2 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 group ${
                storyData.genre === genre.id
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              } ${genre.color}`}
              onClick={() => handleInputChange('genre', genre.id)}
            >
              {/* Genre Image */}
              <div className="relative h-32 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                <img 
                  src={genre.image} 
                  alt={genre.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                  <span className="text-4xl">{genre.emoji}</span>
                </div>
                
                {/* Selected indicator */}
                {storyData.genre === genre.id && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>

              {/* Genre Info */}
              <div className="p-4">
                <h4 className={`font-bold mb-2 ${
                  storyData.genre === genre.id ? 'text-amber-400' : 'text-white'
                }`}>
                  {genre.emoji} {genre.label}
                </h4>
                <p className="text-xs text-white/70">
                  {genre.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Theme Input */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <label className="block text-white font-semibold mb-3">
          💭 Story Theme or Idea (Optional)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="What should the story be about? (e.g., friendship, courage, kindness)"
            value={storyData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3 text-lg rounded-xl"
          />
          <Icon name="star" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
        </div>
        <p className="text-sm text-white/60 mt-2">
          Give us a theme or lesson you'd like the story to explore
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button 
          disabled
          className="px-6 py-3 rounded-lg bg-white/10 text-white/40 cursor-not-allowed"
          aria-label="Back to previous step (disabled on first step)"
        >
          ← Back
        </button>
        <button 
          onClick={onNext}
          disabled={!isValid}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
            isValid
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:scale-105'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
          aria-label="Continue to character creation step"
        >
          Next: Create Characters → 
        </button>
      </div>

      {/* Validation Helper */}
      {(!storyData.ageGroup || !storyData.genre) && (
        <div className="text-center">
          <p className="text-amber-400 text-sm">
            Please select both an age group and genre to continue ✨
          </p>
        </div>
      )}
    </div>
  );
};

export default Step1StoryConcept;