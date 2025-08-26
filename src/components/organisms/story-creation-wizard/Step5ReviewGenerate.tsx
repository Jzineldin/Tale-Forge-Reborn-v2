import React from 'react';
import Icon from '@/components/atoms/Icon';
import { CreditCostDisplay } from '@/components/business/CreditDisplay';
import { useCredits } from '@/hooks/useCredits';

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
  const [isNavigating, setIsNavigating] = React.useState(false);
  const [storyCost, setStoryCost] = React.useState<any>(null);
  const [canAfford, setCanAfford] = React.useState(true);
  
  // Get user credits and check affordability
  const { credits, calculateStoryCost, canAffordStory, loading: creditsLoading } = useCredits();
  
  // Calculate story cost when component mounts or story type changes
  React.useEffect(() => {
    const checkAffordability = async () => {
      try {
        const storyType = 'short'; // Default to short for now - could be configurable
        const cost = await calculateStoryCost(storyType, true, true);
        const affordability = await canAffordStory(storyType, true, true);
        
        setStoryCost(cost);
        setCanAfford(affordability.canAfford);
      } catch (error) {
        console.error('Error checking story affordability:', error);
        // In case of error, assume user can afford it (graceful fallback)
        setCanAfford(true);
      }
    };
    
    checkAffordability();
  }, [calculateStoryCost, canAffordStory]);
  
  const handleSubmit = () => {
    if (!canAfford) {
      // Don't allow submission if user can't afford it
      return;
    }
    
    setIsNavigating(true);
    onSubmit();
  };
  
  // Button should be disabled during generation, navigation, or if user can't afford
  const isButtonDisabled = isGenerating || isNavigating || creditsLoading || !canAfford;
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
        <h2 className="title-section mb-3">
          {usingTemplate ? '⚡ Quick Story Generation' : '📜 Story Preview'}
        </h2>
        <p className="text-body text-lg max-w-2xl mx-auto">
          {usingTemplate 
            ? 'Your template is loaded and ready! Add a child name or generate immediately'
            : 'Your magical story is ready to come to life! Review the details and generate your tale'
          }
        </p>
      </div>

      {/* Story Blueprint Card */}
      <div className="glass-card">
        <div className="text-center mb-6">
          <h3 className="title-card text-primary mb-2">
            ✨ {storyData.childName || 'Your Child'}'s Story Blueprint
          </h3>
          <div className="text-lg text-white/90">
            A {storyData.atmosphere?.toLowerCase() || 'magical'} {getGenreDisplay(storyData.genre).name.toLowerCase()} tale
          </div>
        </div>

        {/* Story Elements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Child & Genre */}
          <div className="glass-card">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                👤
              </div>
              <h4 className="title-small">For This Reader</h4>
            </div>
            <div className="space-y-2 text-body">
              <div><strong className="text-primary">Name:</strong> {storyData.childName || 'Your Child'}</div>
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
          <div className="glass-card">
            <div className="flex items-center mb-4">
              <div className="bg-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                🎭
              </div>
              <h4 className="title-small">Characters</h4>
            </div>
            <div className="space-y-2 text-white/90">
              {storyData.characters && storyData.characters.length > 0 ? (
                storyData.characters.map((char: any, index: number) => (
                  <div key={index} className="flex items-center">
                    <span className="text-amber-400 mr-2">•</span>
                    <strong className="text-primary">{char.name}</strong>
                    <span className="ml-2 text-muted">- {char.role}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted">Characters will be created by AI</div>
              )}
            </div>
          </div>

          {/* Setting & World */}
          <div className="glass-card">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                🌍
              </div>
              <h4 className="title-small">Story World</h4>
            </div>
            <div className="space-y-2 text-body">
              <div><strong className="text-primary">Location:</strong> {storyData.location || 'To be determined'}</div>
              <div><strong className="text-amber-400">Time Period:</strong> {storyData.timePeriod || 'Timeless'}</div>
              <div><strong className="text-amber-400">Atmosphere:</strong> {storyData.atmosphere || 'Magical'}</div>
              {storyData.settingDescription && (
                <div className="text-sm text-muted mt-2 p-2 bg-white/5 rounded">
                  "{storyData.settingDescription}"
                </div>
              )}
            </div>
          </div>

          {/* Plot & Adventure */}
          <div className="glass-card">
            <div className="flex items-center mb-4">
              <div className="bg-red-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                ⚔️
              </div>
              <h4 className="title-small">Adventure Plot</h4>
            </div>
            <div className="space-y-2 text-body">
              <div><strong className="text-primary">Conflict:</strong> {storyData.conflict || 'A challenge awaits'}</div>
              <div><strong className="text-amber-400">Quest:</strong> {storyData.quest || 'A goal to achieve'}</div>
              {storyData.moralLesson && (
                <div className="mt-3">
                  <strong className="text-amber-400">Moral Lesson:</strong>
                  <div className="badge badge-lg bg-amber-500/10 text-amber-200 mt-1">
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
              <h4 className="title-small">Special Elements</h4>
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
            <h4 className="title-small">Personalize Your Story (Optional)</h4>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-white/80 text-sm mb-2">Child's Name</label>
              <input
                type="text"
                placeholder="Enter child's name (optional)"
                value={storyData.childName || ''}
                onChange={(e) => onUpdateChildName?.(e.target.value)}
                className="input-primary w-full"
              />
              <p className="text-muted text-sm mt-2">
                The story will be customized with this name throughout the adventure
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Credit Information */}
      <div className="space-y-4">
        {/* User Credits Display */}
        <div className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-xl mr-3">
                💳
              </div>
              <h4 className="title-small">Your Credits</h4>
            </div>
            {storyCost && (
              <CreditCostDisplay storyType="short" />
            )}
          </div>
          
          {creditsLoading ? (
            <div className="animate-pulse h-8 bg-white/20 rounded"></div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-white/90">
                <div className="text-2xl font-bold text-white">
                  {credits?.currentBalance || 0} Credits Available
                </div>
                <div className="text-sm text-muted">
                  {canAfford 
                    ? '✅ You have enough credits for this story!'
                    : '❌ Insufficient credits for this story'
                  }
                </div>
              </div>
              
              {!canAfford && (
                <button className="btn btn-primary btn-sm">
                  Get More Credits
                </button>
              )}
            </div>
          )}
        </div>

        {/* Insufficient Credits Warning */}
        {!canAfford && !creditsLoading && (
          <div className="glass-card bg-red-500/10 border-red-400/30">
            <div className="flex items-start">
              <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 flex-shrink-0">
                ⚠️
              </div>
              <div className="flex-1">
                <h4 className="title-small text-danger mb-2">Insufficient Credits</h4>
                <p className="text-red-100/90 mb-3">
                  You need {storyCost?.totalCost || 15} credits to create this story, but you only have {credits?.currentBalance || 0} credits remaining.
                </p>
                <div className="flex items-center text-sm text-red-200/80 space-x-4">
                  <span>• Upgrade to Premium for unlimited stories</span>
                  <span>• Get 15 credits free each month</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generation Notice */}
      <div className="glass-card bg-amber-500/10 border-amber-400/30">
        <div className="flex items-start">
          <div className="bg-amber-500 w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4 flex-shrink-0">
            🪄
          </div>
          <div>
            <h4 className="title-small text-primary mb-2">Ready to Create Magic?</h4>
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
          disabled={isButtonDisabled}
          className={`btn ${
            isButtonDisabled 
              ? 'btn-ghost opacity-50 cursor-not-allowed' 
              : 'btn-secondary'
          }`}
        >
          ← Back: Plot Elements
        </button>
        <button 
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`btn btn-lg ${
            !canAfford
              ? 'btn-danger opacity-50 cursor-not-allowed'
              : isButtonDisabled
                ? 'btn-primary opacity-50 cursor-not-allowed'
                : 'btn-primary'
          }`}
        >
          {!canAfford ? (
            <div className="flex items-center">
              <Icon name="lock" size={20} className="mr-2" />
              Insufficient Credits
            </div>
          ) : isButtonDisabled ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-3"></div>
              {isNavigating ? 'Launching Your Story...' : 'Creating Your Story...'}
            </div>
          ) : (
            <div className="flex items-center">
              <Icon name="plus" size={20} className="mr-2" />
              Create My Story! 🪄 ({storyCost?.totalCost || 15} credits)
            </div>
          )}
        </button>
      </div>

      {/* Progress Indicator for Generation and Navigation */}
      {isButtonDisabled && (
        <div className="glass-card">
          <div className="text-center">
            <div className="animate-pulse text-primary text-2xl mb-4">✨ 🪄 ✨</div>
            <h4 className="title-small mb-2">
              {isNavigating ? 'Launching Your Story...' : 'Weaving Your Tale...'}
            </h4>
            <p className="text-body mb-4">
              {isNavigating 
                ? 'Story created successfully! Taking you to your adventure...'
                : `The AI is crafting a personalized story just for ${storyData.childName || 'your child'}`
              }
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