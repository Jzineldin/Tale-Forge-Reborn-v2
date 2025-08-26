import React from 'react';
import Icon from '@/components/atoms/Icon';

interface Step1StoryConceptProps {
  storyData: any;
  handleInputChange: (field: string, value: string | number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Step1StoryConcept: React.FC<Step1StoryConceptProps> = ({
  storyData,
  handleInputChange,
  onNext
}) => {
  // Difficulty-based system (1-10 scale)
  const getDifficultyDescription = (difficulty: number) => {
    if (difficulty <= 2) return { label: 'Very Easy', description: 'Simple words, short sentences, basic concepts', complexity: 'Beginner' };
    if (difficulty <= 4) return { label: 'Easy', description: 'Clear language, gentle adventures, straightforward plots', complexity: 'Simple' };
    if (difficulty <= 6) return { label: 'Medium', description: 'Balanced vocabulary, engaging adventures, some challenges', complexity: 'Intermediate' };
    if (difficulty <= 8) return { label: 'Hard', description: 'Rich vocabulary, complex plots, deeper themes', complexity: 'Advanced' };
    return { label: 'Very Hard', description: 'Sophisticated language, intricate stories, advanced concepts', complexity: 'Expert' };
  };

  const currentDifficulty = storyData.difficulty || 5;
  const difficultyInfo = getDifficultyDescription(currentDifficulty);
  const currentWordsPerChapter = storyData.wordsPerChapter || 120;

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

  const isValid = storyData.difficulty && storyData.wordsPerChapter && storyData.genre && storyData.ageGroup;

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
            name="childName"
            data-testid="character-name-input"
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
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6" data-testid="age-group-select">
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          👶 Target Age Group
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { id: '3-4', label: '3-4 years', emoji: '👶', description: 'Very simple stories' },
            { id: '4-6', label: '4-6 years', emoji: '🧒', description: 'Early learning tales' },
            { id: '6-8', label: '6-8 years', emoji: '👧', description: 'Elementary adventures' },
            { id: '8-12', label: '8-12 years', emoji: '👦', description: 'Chapter book level' }
          ].map((ageGroup) => (
            <button
              key={ageGroup.id}
              type="button"
              className={`glass-card backdrop-blur-md border-2 rounded-lg p-4 text-center transition-all duration-300 hover:scale-105 ${
                storyData.ageGroup === ageGroup.id
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
              onClick={() => handleInputChange('ageGroup', ageGroup.id)}
            >
              <div className="text-2xl mb-2">{ageGroup.emoji}</div>
              <h4 className={`font-semibold text-sm mb-1 ${
                storyData.ageGroup === ageGroup.id ? 'text-amber-400' : 'text-white'
              }`}>
                {ageGroup.label}
              </h4>
              <p className="text-xs text-white/70">
                {ageGroup.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty and Words Selection */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          🎯 Story Difficulty & Length
        </h3>
        
        <div className="space-y-6">
          {/* Difficulty Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-white font-semibold">Difficulty Level</label>
              <div className="glass-card bg-purple-500/20 border border-purple-400/30 px-4 py-2 rounded-lg">
                <span className="text-purple-300 font-bold text-lg">{currentDifficulty}/10</span>
              </div>
            </div>
            
            <div className="relative px-3 py-2">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={currentDifficulty}
                onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/60 mt-2">
                <span>1</span>
                <span>3</span>
                <span>5</span>
                <span>7</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Difficulty Description */}
          <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30">
            <h4 className="text-xl font-bold text-white mb-2">{difficultyInfo.label}</h4>
            <p className="text-purple-100 mb-3">{difficultyInfo.description}</p>
            <div className="inline-block bg-purple-500/20 border border-purple-400/50 px-3 py-1 rounded-full">
              <span className="text-purple-300 text-sm font-medium">Complexity: {difficultyInfo.complexity}</span>
            </div>
          </div>

          {/* Words Per Chapter Control */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-white font-semibold">Words Per Chapter</label>
              <div className="glass-card bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-lg">
                <span className="text-green-300 font-bold">{currentWordsPerChapter} words</span>
              </div>
            </div>
            
            <div className="relative px-3 py-2">
              <input
                type="range"
                min="30"
                max="400"
                step="10"
                value={currentWordsPerChapter}
                onChange={(e) => handleInputChange('wordsPerChapter', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/60 mt-2">
                <span>30</span>
                <span className="text-green-400 font-medium">Recommended: 150</span>
                <span>400</span>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="inline-flex space-x-4 text-sm">
                <span className={`${currentWordsPerChapter <= 80 ? 'text-blue-400' : 'text-white/60'}`}>
                  📖 Quick Reads
                </span>
                <span className={`${currentWordsPerChapter >= 120 && currentWordsPerChapter <= 180 ? 'text-green-400' : 'text-white/60'}`}>
                  ⭐ Recommended
                </span>
                <span className={`${currentWordsPerChapter >= 300 ? 'text-purple-400' : 'text-white/60'}`}>
                  📚 Detailed Tales
                </span>
              </div>
            </div>
          </div>

          {/* Reading Time Estimate */}
          <div className="text-center p-4 bg-indigo-900/30 rounded-lg border border-indigo-400/30">
            <Icon name="clock" size={20} className="inline-block text-indigo-400 mr-2" />
            <span className="text-indigo-300 text-sm">
              Estimated reading time: {Math.ceil(currentWordsPerChapter / (currentDifficulty <= 3 ? 30 : currentDifficulty <= 6 ? 60 : 100))} minutes per chapter
            </span>
          </div>
        </div>
      </div>

      {/* Genre Selection */}
      <div data-testid="theme-select">
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
          data-testid="next-button"
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
            isValid
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:scale-105'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
          aria-label="Continue to character creation step"
        >
          Next
        </button>
      </div>

      {/* Validation Helper */}
      {(!storyData.difficulty || !storyData.genre || !storyData.wordsPerChapter || !storyData.ageGroup) && (
        <div className="text-center">
          <p className="text-amber-400 text-sm">
            Please set the age group, difficulty level, words per chapter, and select a genre to continue ✨
          </p>
          <p className="text-xs text-white/60 mt-1">
            Debug: Age={storyData.ageGroup ? 'selected' : 'missing'}, Difficulty={storyData.difficulty}, Words={storyData.wordsPerChapter}, Genre={storyData.genre ? 'selected' : 'missing'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Step1StoryConcept;