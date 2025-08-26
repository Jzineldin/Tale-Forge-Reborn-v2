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
        <h2 className="title-section mb-3">
          💡 Story Concept
        </h2>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Let's start by choosing what kind of magical tale you'd like to create
        </p>
      </div>

      {/* Child's Name Input */}
      <div className="glass-card">
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
            className="input-primary w-full pl-12"
          />
          <Icon name="user" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
        </div>
        <p className="text-sm text-muted mt-2">
          We'll use this name to make the story extra special and personal
        </p>
      </div>

      {/* Age Group Selection */}
      <div className="glass-card" data-testid="age-group-select">
        <h3 className="title-card text-center mb-6">
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
              className={`genre-card ${
                storyData.ageGroup === ageGroup.id
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleInputChange('ageGroup', ageGroup.id)}
            >
              <div className="text-2xl mb-2">{ageGroup.emoji}</div>
              <h4 className={`font-semibold text-sm mb-1 ${
                storyData.ageGroup === ageGroup.id ? 'text-primary' : 'text-white'
              }`}>
                {ageGroup.label}
              </h4>
              <p className="text-xs text-muted">
                {ageGroup.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty and Words Selection */}
      <div className="glass-card">
        <h3 className="title-card text-center mb-6">
          🎯 Story Difficulty & Length
        </h3>
        
        <div className="space-y-6">
          {/* Difficulty Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-white font-semibold">Difficulty Level</label>
              <div className="badge badge-lg bg-purple-500/20 border-purple-400/30">
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
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>1</span>
                <span>3</span>
                <span>5</span>
                <span>7</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Difficulty Description */}
          <div className="glass-card text-center">
            <h4 className="title-card mb-2">{difficultyInfo.label}</h4>
            <p className="text-body mb-3">{difficultyInfo.description}</p>
            <div className="badge bg-purple-500/20 border-purple-400/50">
              <span className="text-purple-300 text-sm font-medium">Complexity: {difficultyInfo.complexity}</span>
            </div>
          </div>

          {/* Words Per Chapter Control */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-white font-semibold">Words Per Chapter</label>
              <div className="badge badge-lg bg-green-500/20 border-green-400/30">
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
              <div className="flex justify-between text-xs text-muted mt-2">
                <span>30</span>
                <span className="text-green-400 font-medium">Recommended: 150</span>
                <span>400</span>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="inline-flex space-x-4 text-sm">
                <span className={`${currentWordsPerChapter <= 80 ? 'text-primary' : 'text-muted'}`}>
                  📖 Quick Reads
                </span>
                <span className={`${currentWordsPerChapter >= 120 && currentWordsPerChapter <= 180 ? 'text-success' : 'text-muted'}`}>
                  ⭐ Recommended
                </span>
                <span className={`${currentWordsPerChapter >= 300 ? 'text-accent' : 'text-muted'}`}>
                  📚 Detailed Tales
                </span>
              </div>
            </div>
          </div>

          {/* Reading Time Estimate */}
          <div className="alert alert-info">
            <Icon name="clock" size={20} className="inline-block mr-2" />
            <span className="text-sm">
              Estimated reading time: {Math.ceil(currentWordsPerChapter / (currentDifficulty <= 3 ? 30 : currentDifficulty <= 6 ? 60 : 100))} minutes per chapter
            </span>
          </div>
        </div>
      </div>

      {/* Genre Selection */}
      <div data-testid="theme-select">
        <h3 className="title-card text-center mb-6">
          🎨 Pick Your Story Genre
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              className={`genre-card group ${
                storyData.genre === genre.id
                  ? 'selected'
                  : ''
              }`}
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
                  storyData.genre === genre.id ? 'text-primary' : 'text-white'
                }`}>
                  {genre.emoji} {genre.label}
                </h4>
                <p className="text-xs text-muted">
                  {genre.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Theme Input */}
      <div className="glass-card">
        <label className="block text-white font-semibold mb-3">
          💭 Story Theme or Idea (Optional)
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="What should the story be about? (e.g., friendship, courage, kindness)"
            value={storyData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            className="input-primary w-full pl-12"
          />
          <Icon name="star" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
        </div>
        <p className="text-sm text-muted mt-2">
          Give us a theme or lesson you'd like the story to explore
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button 
          disabled
          className="btn btn-ghost opacity-50 cursor-not-allowed"
          aria-label="Back to previous step (disabled on first step)"
        >
          ← Back
        </button>
        <button 
          onClick={onNext}
          disabled={!isValid}
          data-testid="next-button"
          className={`btn ${
            isValid
              ? 'btn-primary'
              : 'btn-ghost opacity-50 cursor-not-allowed'
          }`}
          aria-label="Continue to character creation step"
        >
          Next
        </button>
      </div>

      {/* Validation Helper */}
      {(!storyData.difficulty || !storyData.genre || !storyData.wordsPerChapter || !storyData.ageGroup) && (
        <div className="text-center">
          <p className="text-primary text-sm">
            Please set the age group, difficulty level, words per chapter, and select a genre to continue ✨
          </p>
          <p className="text-xs text-muted mt-1">
            Debug: Age={storyData.ageGroup ? 'selected' : 'missing'}, Difficulty={storyData.difficulty}, Words={storyData.wordsPerChapter}, Genre={storyData.genre ? 'selected' : 'missing'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Step1StoryConcept;