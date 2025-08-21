import React from 'react';
import Icon from '@/components/atoms/Icon';

interface Step5ReviewGenerateProps {
  storyData: any;
  onSubmit: () => void;
  onPrevious: () => void;
  isGenerating: boolean;
  usingTemplate?: boolean;
  onUpdateChildName?: (name: string) => void;
}

const Step5ReviewGenerate: React.FC<Step5ReviewGenerateProps> = ({
  storyData,
  onSubmit,
  onPrevious,
  isGenerating,
  usingTemplate = false,
  onUpdateChildName
}) => {
  // Genre mapping for display with emojis
  const genreMap: Record<string, { name: string; emoji: string }> = {
    'bedtime': { name: 'Bedtime Stories', emoji: '🌙' },
    'fantasy': { name: 'Fantasy & Magic', emoji: '✨' },
    'adventure': { name: 'Adventure & Exploration', emoji: '🗺️' },
    'mystery': { name: 'Mystery & Detective', emoji: '🔍' },
    'sci-fi': { name: 'Science Fiction & Space', emoji: '🚀' },
    'educational': { name: 'Educational Stories', emoji: '📚' },
    'values': { name: 'Values & Life Lessons', emoji: '💎' },
    'humorous': { name: 'Silly & Humorous Stories', emoji: '😄' }
  };

  // Get genre display info
  const getGenreDisplay = (genreKey: string) => {
    return genreMap[genreKey] || { name: genreKey, emoji: '📖' };
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
          {usingTemplate ? '⚡ Quick Story Generation' : '📜 Story Preview'}
        </h2>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          {usingTemplate 
            ? 'Your template is loaded and ready! Add a child name or generate immediately'
            : 'Your magical story is ready to come to life! Review the details and generate your tale'
          }
        </p>
      </div>

      {/* Story Blueprint Card */}
      <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            ✨ {storyData.childName || 'Your Child'}'s Story Blueprint
          </h3>
          <div className="text-lg text-white/90">
            A {storyData.atmosphere?.toLowerCase() || 'magical'} {getGenreDisplay(storyData.genre).name.toLowerCase()} tale
          </div>
        </div>

        {/* Story Elements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Child & Genre */}
          <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                👤
              </div>
              <h4 className="text-lg font-semibold text-white">For This Reader</h4>
            </div>
            <div className="space-y-2 text-white/90">
              <div><strong className="text-amber-400">Name:</strong> {storyData.childName || 'Your Child'}</div>
              <div><strong className="text-amber-400">Age:</strong> {storyData.ageGroup || 'Not specified'}</div>
              <div>
                <strong className="text-amber-400">Genre:</strong> 
                <span className="ml-2">{getGenreDisplay(storyData.genre).emoji} {getGenreDisplay(storyData.genre).name}</span>
              </div>
              {storyData.theme && (
                <div><strong className="text-amber-400">Theme:</strong> {storyData.theme}</div>
              )}
            </div>
          </div>

          {/* Characters */}
          <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                🎭
              </div>
              <h4 className="text-lg font-semibold text-white">Characters</h4>
            </div>
            <div className="space-y-2 text-white/90">
              {storyData.characters && storyData.characters.length > 0 ? (
                storyData.characters.map((char: any, index: number) => (
                  <div key={index} className="flex items-center">
                    <span className="text-amber-400 mr-2">•</span>
                    <strong className="text-amber-300">{char.name}</strong>
                    <span className="ml-2 text-white/70">- {char.role}</span>
                  </div>
                ))
              ) : (
                <div className="text-white/60">Characters will be created by AI</div>
              )}
            </div>
          </div>

          {/* Setting & World */}
          <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                🌍
              </div>
              <h4 className="text-lg font-semibold text-white">Story World</h4>
            </div>
            <div className="space-y-2 text-white/90">
              <div><strong className="text-amber-400">Location:</strong> {storyData.location || 'To be determined'}</div>
              <div><strong className="text-amber-400">Time Period:</strong> {storyData.timePeriod || 'Timeless'}</div>
              <div><strong className="text-amber-400">Atmosphere:</strong> {storyData.atmosphere || 'Magical'}</div>
              {storyData.settingDescription && (
                <div className="text-sm text-white/70 mt-2 p-2 bg-white/5 rounded">
                  "{storyData.settingDescription}"
                </div>
              )}
            </div>
          </div>

          {/* Plot & Adventure */}
          <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                ⚔️
              </div>
              <h4 className="text-lg font-semibold text-white">Adventure Plot</h4>
            </div>
            <div className="space-y-2 text-white/90">
              <div><strong className="text-amber-400">Conflict:</strong> {storyData.conflict || 'A challenge awaits'}</div>
              <div><strong className="text-amber-400">Quest:</strong> {storyData.quest || 'A goal to achieve'}</div>
              {storyData.moralLesson && (
                <div className="mt-3">
                  <strong className="text-amber-400">Moral Lesson:</strong>
                  <div className="text-sm bg-amber-500/10 text-amber-200 p-2 rounded mt-1">
                    💡 {storyData.moralLesson}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Additional Details */}
        {storyData.additionalDetails && (
          <div className="mt-6 glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <div className="bg-amber-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                ✨
              </div>
              <h4 className="text-lg font-semibold text-white">Special Elements</h4>
            </div>
            <div className="text-white/90 bg-white/5 p-4 rounded-lg">
              "{storyData.additionalDetails}"
            </div>
          </div>
        )}
      </div>

      {/* Quick Child Name Input for Templates */}
      {usingTemplate && (
        <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
              👶
            </div>
            <h4 className="text-lg font-semibold text-white">Personalize Your Story (Optional)</h4>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-white/80 text-sm mb-2">Child's Name</label>
              <input
                type="text"
                placeholder="Enter child's name (optional)"
                value={storyData.childName || ''}
                onChange={(e) => onUpdateChildName?.(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
              />
              <p className="text-white/60 text-sm mt-2">
                The story will be customized with this name throughout the adventure
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Notice */}
      <div className="glass-card backdrop-blur-md bg-amber-500/10 border border-amber-400/30 rounded-xl p-6">
        <div className="flex items-start">
          <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 flex-shrink-0">
            🪄
          </div>
          <div>
            <h4 className="text-lg font-semibold text-amber-300 mb-2">Ready to Create Magic?</h4>
            <p className="text-amber-100/90 mb-3">
              Your story will be crafted by AI in 10-30 seconds. Once created, you can read it together, 
              make edits, and even generate new chapters!
            </p>
            <div className="flex items-center text-sm text-amber-200/80">
              <Icon name="star" size={16} className="mr-2" />
              <span>Stories are saved to your library automatically</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button 
          onClick={onPrevious}
          disabled={isGenerating}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${
            isGenerating 
              ? 'bg-white/10 text-white/40 cursor-not-allowed' 
              : 'bg-white/20 hover:bg-white/30 text-white'
          }`}
        >
          ← Back: Plot Elements
        </button>
        <button 
          onClick={onSubmit}
          disabled={isGenerating}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            isGenerating
              ? 'bg-amber-500/50 text-white/70 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl hover:scale-105'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
              Creating Your Story...
            </div>
          ) : (
            <div className="flex items-center">
              <Icon name="plus" size={20} className="mr-2" />
              Create My Story! 🪄
            </div>
          )}
        </button>
      </div>

      {/* Progress Indicator for Generation */}
      {isGenerating && (
        <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-center">
            <div className="animate-pulse text-amber-400 text-2xl mb-4">✨ 🪄 ✨</div>
            <h4 className="text-lg font-semibold text-white mb-2">Weaving Your Tale...</h4>
            <p className="text-white/80 mb-4">
              The AI is crafting a personalized story just for {storyData.childName || 'your child'}
            </p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step5ReviewGenerate;