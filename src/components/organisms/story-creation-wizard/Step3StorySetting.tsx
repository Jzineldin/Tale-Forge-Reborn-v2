import React from 'react';
import Icon from '@/components/atoms/Icon';

interface Step3StorySettingProps {
  storyData: any;
  handleInputChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Step3StorySetting: React.FC<Step3StorySettingProps> = ({
  storyData,
  handleInputChange,
  onNext,
  onPrevious
}) => {
  // Location presets based on popular story settings
  const locationPresets = [
    { 
      id: 'enchanted-forest', 
      name: 'Enchanted Forest', 
      emoji: '🌲', 
      description: 'Magical woodland with talking animals',
      image: '/images/genres/fantasy/enchanted-world.png'
    },
    { 
      id: 'space-station', 
      name: 'Space Station', 
      emoji: '🚀', 
      description: 'Futuristic orbital outpost among stars',
      image: '/images/genres/sci-fi/futuristic-space-adventure.png'
    },
    { 
      id: 'cozy-home', 
      name: 'Cozy Home', 
      emoji: '🏠', 
      description: 'Warm, familiar family environment',
      image: '/images/genres/bedtime/peaceful-bedtime.png'
    },
    { 
      id: 'treasure-island', 
      name: 'Treasure Island', 
      emoji: '🏝️', 
      description: 'Mysterious tropical island with secrets',
      image: '/images/genres/adventure/futuristic-adventure.png'
    },
    { 
      id: 'magical-castle', 
      name: 'Magical Castle', 
      emoji: '🏰', 
      description: 'Majestic castle with hidden chambers',
      image: '/images/genres/fantasy/enchanted-world.png'
    },
    { 
      id: 'underwater-world', 
      name: 'Underwater World', 
      emoji: '🌊', 
      description: 'Deep ocean realm with sea creatures',
      image: '/images/genres/adventure/futuristic-adventure.png'
    }
  ];

  // Time period options with emojis
  const timePeriods = [
    { id: 'modern', name: 'Modern Day', emoji: '🏙️', description: 'Present day with current technology' },
    { id: 'historical', name: 'Historical Past', emoji: '🏛️', description: 'Long ago with old-fashioned settings' },
    { id: 'future', name: 'Future', emoji: '🔮', description: 'Tomorrow with advanced technology' },
    { id: 'fantasy', name: 'Fantasy Era', emoji: '🗡️', description: 'Magical time with wizards and dragons' },
    { id: 'timeless', name: 'Timeless', emoji: '⏰', description: 'Could happen anytime, anywhere' }
  ];

  // Atmosphere options with colors and emojis
  const atmospheres = [
    { id: 'magical', name: 'Magical', emoji: '✨', color: 'bg-purple-500', description: 'Full of wonder and enchantment' },
    { id: 'adventurous', name: 'Adventurous', emoji: '⚔️', color: 'bg-green-500', description: 'Exciting and full of action' },
    { id: 'peaceful', name: 'Peaceful', emoji: '🕊️', color: 'bg-blue-500', description: 'Calm and soothing' },
    { id: 'mysterious', name: 'Mysterious', emoji: '🔍', color: 'bg-indigo-500', description: 'Full of secrets and puzzles' },
    { id: 'cheerful', name: 'Cheerful', emoji: '☀️', color: 'bg-yellow-500', description: 'Happy and uplifting' },
    { id: 'epic', name: 'Epic', emoji: '⚡', color: 'bg-red-500', description: 'Grand and heroic' },
    { id: 'whimsical', name: 'Whimsical', emoji: '🎭', color: 'bg-pink-500', description: 'Playful and imaginative' },
    { id: 'cozy', name: 'Cozy', emoji: '🧸', color: 'bg-orange-500', description: 'Warm and comfortable' }
  ];

  const isValid = storyData.location && storyData.timePeriod && storyData.atmosphere;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
          🌍 Story Setting
        </h2>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Create the magical world where your story unfolds - choose the perfect location, time, and atmosphere
        </p>
      </div>

      {/* Location Selection */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6" data-testid="setting-select">
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          📍 Choose Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {locationPresets.map((location) => (
            <button
              key={location.id}
              type="button"
              className={`glass-card backdrop-blur-md border-2 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 group ${
                storyData.location === location.name
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
              onClick={() => handleInputChange('location', location.name)}
            >
              {/* Location Image */}
              <div className="relative h-24 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                <img 
                  src={location.image} 
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                  <span className="text-3xl">{location.emoji}</span>
                </div>
                
                {/* Selected indicator */}
                {storyData.location === location.name && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ✓
                  </div>
                )}
              </div>

              {/* Location Info */}
              <div className="p-4">
                <h4 className={`font-bold mb-1 ${
                  storyData.location === location.name ? 'text-amber-400' : 'text-white'
                }`}>
                  {location.emoji} {location.name}
                </h4>
                <p className="text-xs text-white/70">
                  {location.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Location Input */}
        <div className="border-t border-white/20 pt-6">
          <label className="block text-white font-semibold mb-3">
            🎨 Or Create Your Own Location
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Describe your custom location (e.g., floating cloud city, underground kingdom)"
              value={storyData.location && !locationPresets.find(l => l.name === storyData.location) ? storyData.location : ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="glass-input w-full pl-12 pr-4 py-3 text-lg rounded-xl"
            />
            <Icon name="search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
          </div>
        </div>
      </div>

      {/* Time Period Selection */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          ⏰ Choose Time Period
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {timePeriods.map((period) => (
            <button
              key={period.id}
              type="button"
              className={`glass-card backdrop-blur-md border-2 rounded-lg p-4 text-center transition-all duration-300 hover:scale-105 ${
                storyData.timePeriod === period.name
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
              onClick={() => handleInputChange('timePeriod', period.name)}
            >
              <div className="text-3xl mb-2">{period.emoji}</div>
              <h4 className={`font-bold mb-2 ${
                storyData.timePeriod === period.name ? 'text-amber-400' : 'text-white'
              }`}>
                {period.name}
              </h4>
              <p className="text-xs text-white/70">
                {period.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Atmosphere Selection */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          🎭 Choose Story Atmosphere
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {atmospheres.map((atmosphere) => (
            <button
              key={atmosphere.id}
              type="button"
              className={`glass-card backdrop-blur-md border-2 rounded-lg p-4 text-center transition-all duration-300 hover:scale-105 ${
                storyData.atmosphere === atmosphere.name
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
              onClick={() => handleInputChange('atmosphere', atmosphere.name)}
            >
              <div className={`${atmosphere.color} w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-3`}>
                {atmosphere.emoji}
              </div>
              <h4 className={`font-semibold text-sm mb-1 ${
                storyData.atmosphere === atmosphere.name ? 'text-amber-400' : 'text-white'
              }`}>
                {atmosphere.name}
              </h4>
              <p className="text-xs text-white/60">
                {atmosphere.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Setting Details */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
        <label className="block text-white font-semibold mb-3">
          📝 Additional Setting Details (Optional)
        </label>
        <textarea
          placeholder="Add more details about your story world (e.g., special landmarks, unique features, important objects)"
          value={storyData.settingDescription}
          onChange={(e) => handleInputChange('settingDescription', e.target.value)}
          rows={4}
          className="glass-input w-full p-4 text-lg rounded-xl resize-none"
        />
        <p className="text-sm text-white/60 mt-2">
          These details help create a richer, more immersive story world
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button 
          onClick={onPrevious}
          className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition-all duration-300 hover:scale-105"
        >
          ← Back: Characters
        </button>
        <button 
          onClick={onNext}
          disabled={!isValid}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
            isValid
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:scale-105'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          Next: Plot Elements →
        </button>
      </div>

      {/* Validation Helper */}
      {(!storyData.location || !storyData.timePeriod || !storyData.atmosphere) && (
        <div className="text-center">
          <p className="text-amber-400 text-sm">
            Please choose a location, time period, and atmosphere to continue ✨
          </p>
        </div>
      )}
    </div>
  );
};

export default Step3StorySetting;