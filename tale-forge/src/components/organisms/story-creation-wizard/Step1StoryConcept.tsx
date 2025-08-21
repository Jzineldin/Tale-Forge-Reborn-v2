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
  onNext,
  onPrevious
}) => {
  // Dynamic age system with appropriate categories
  const getAgeDescription = (age: number) => {
    if (age <= 4) return { label: 'Preschool Tales', description: 'Very simple words and gentle stories', complexity: 'Beginner' };
    if (age <= 6) return { label: 'Early Readers', description: 'Short sentences and magical tales', complexity: 'Simple' };
    if (age <= 8) return { label: 'Young Adventurers', description: 'Fun adventures with brave heroes', complexity: 'Easy' };
    if (age <= 10) return { label: 'Story Enthusiasts', description: 'Engaging tales with meaningful choices', complexity: 'Intermediate' };
    if (age <= 12) return { label: 'Advanced Readers', description: 'Complex stories with deeper themes', complexity: 'Advanced' };
    return { label: 'Teen Readers', description: 'Sophisticated narratives and rich vocabulary', complexity: 'Expert' };
  };

  const getWordCountRange = (age: number) => {
    if (age <= 4) return { min: 30, max: 80, recommended: 50 };
    if (age <= 6) return { min: 50, max: 120, recommended: 80 };
    if (age <= 8) return { min: 80, max: 150, recommended: 120 };
    if (age <= 10) return { min: 120, max: 200, recommended: 160 };
    if (age <= 12) return { min: 150, max: 250, recommended: 200 };
    return { min: 200, max: 350, recommended: 275 };
  };

  const currentAge = storyData.targetAge || 7;
  const ageInfo = getAgeDescription(currentAge);
  const wordRange = getWordCountRange(currentAge);
  const currentWordsPerChapter = storyData.wordsPerChapter || wordRange.recommended;

  // Convert targetAge to ageGroup string for validation and AI
  const getAgeGroupString = (age: number): string => {
    if (age <= 4) return "3-4 years (Toddlers)";
    if (age <= 6) return "5-6 years (Preschool)";
    if (age <= 8) return "7-8 years (Early Elementary)";
    if (age <= 10) return "9-10 years (Elementary)";
    if (age <= 12) return "11-12 years (Middle School)";
    return "13-15 years (Young Teen)";
  };

  // Update ageGroup whenever targetAge changes
  React.useEffect(() => {
    const ageGroupString = getAgeGroupString(currentAge);
    console.log(`DEBUG: Age ${currentAge} → ageGroup: "${ageGroupString}" (current: "${storyData.ageGroup}")`);
    if (storyData.ageGroup !== ageGroupString) {
      console.log(`Setting ageGroup to: "${ageGroupString}"`);
      handleInputChange('ageGroup', ageGroupString);
    }
  }, [currentAge, storyData.ageGroup, handleInputChange]);

  // Auto-sync word count when age changes
  React.useEffect(() => {
    const recommendedWords = wordRange.recommended;
    // Always sync to recommended when age changes (user can manually adjust after)
    console.log(`Auto-syncing words: Age ${currentAge} → ${recommendedWords} words`);
    handleInputChange('wordsPerChapter', recommendedWords);
  }, [currentAge]); // Only trigger when age changes

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

  const isValid = storyData.targetAge && storyData.genre && storyData.ageGroup;

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

      {/* Dynamic Age Selection with Slider */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          🎯 Target Age & Complexity
        </h3>
        
        <div className="space-y-6">
          {/* Age Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-white font-semibold">Target Age</label>
              <div className="glass-card bg-purple-500/20 border border-purple-400/30 px-4 py-2 rounded-lg">
                <span className="text-purple-300 font-bold text-lg">{currentAge} years old</span>
              </div>
            </div>
            
            <div className="relative px-3 py-2">
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={currentAge}
                onChange={(e) => handleInputChange('targetAge', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/60 mt-2">
                <span>3</span>
                <span>6</span>
                <span>9</span>
                <span>12</span>
                <span>15</span>
              </div>
            </div>
          </div>

          {/* Age Category Display */}
          <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30">
            <h4 className="text-xl font-bold text-white mb-2">{ageInfo.label}</h4>
            <p className="text-purple-100 mb-3">{ageInfo.description}</p>
            <div className="inline-block bg-purple-500/20 border border-purple-400/50 px-3 py-1 rounded-full">
              <span className="text-purple-300 text-sm font-medium">Complexity: {ageInfo.complexity}</span>
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
                min={wordRange.min}
                max={wordRange.max}
                step="10"
                value={currentWordsPerChapter}
                onChange={(e) => handleInputChange('wordsPerChapter', parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-white/60 mt-2">
                <span>{wordRange.min}</span>
                <span className="text-green-400 font-medium">Recommended: {wordRange.recommended}</span>
                <span>{wordRange.max}</span>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <div className="inline-flex space-x-4 text-sm">
                <span className={`${currentWordsPerChapter <= wordRange.min + 20 ? 'text-blue-400' : 'text-white/60'}`}>
                  📖 Quick Reads
                </span>
                <span className={`${currentWordsPerChapter >= wordRange.recommended - 20 && currentWordsPerChapter <= wordRange.recommended + 20 ? 'text-green-400' : 'text-white/60'}`}>
                  ⭐ Recommended
                </span>
                <span className={`${currentWordsPerChapter >= wordRange.max - 20 ? 'text-purple-400' : 'text-white/60'}`}>
                  📚 Detailed Tales
                </span>
              </div>
            </div>
          </div>

          {/* Reading Time Estimate */}
          <div className="text-center p-4 bg-indigo-900/30 rounded-lg border border-indigo-400/30">
            <Icon name="clock" size={20} className="inline-block text-indigo-400 mr-2" />
            <span className="text-indigo-300 text-sm">
              Estimated reading time: {Math.ceil(currentWordsPerChapter / (currentAge <= 6 ? 30 : currentAge <= 10 ? 60 : 100))} minutes per chapter
            </span>
          </div>
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
      {(!storyData.targetAge || !storyData.genre || !storyData.ageGroup) && (
        <div className="text-center">
          <p className="text-amber-400 text-sm">
            Please set the target age and select a genre to continue ✨
          </p>
          <p className="text-xs text-white/60 mt-1">
            Debug: Age={storyData.targetAge}, Genre={storyData.genre ? 'selected' : 'missing'}, AgeGroup="{storyData.ageGroup}"
          </p>
        </div>
      )}
    </div>
  );
};

export default Step1StoryConcept;