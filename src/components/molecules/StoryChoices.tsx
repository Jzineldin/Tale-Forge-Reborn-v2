import React from 'react';
import Button from '@/components/atoms/Button';
import Text from '@/components/atoms/Text';

interface Choice {
  id: string;
  text: string;
}

interface StoryChoicesProps {
  choices: Choice[];
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
  loading?: boolean;
  onEndStory?: () => void;
  segmentCount?: number;
  isGeneratingEnding?: boolean;
}

const StoryChoices: React.FC<StoryChoicesProps> = ({ 
  choices, 
  onSelect, 
  disabled = false,
  loading = false,
  onEndStory,
  segmentCount = 0,
  isGeneratingEnding = false
}) => {
  // Filter out choices with empty or invalid text
  const validChoices = choices.filter(choice => choice && choice.text && choice.text.trim().length > 0);
  
  if (validChoices.length === 0) {
    return (
      <div className="text-center py-6">
        <Text variant="p" className="mb-4">
          The end of your story!
        </Text>
        <Button variant="primary" onClick={() => onSelect('restart')}>
          Read Again
        </Button>
      </div>
    );
  }

  // Show "End Story" option if story has multiple segments and onEndStory is provided
  const showEndStoryOption = onEndStory && segmentCount >= 2;
  
  // Debug logging
  console.log('🔍 StoryChoices debug:', {
    hasOnEndStory: !!onEndStory,
    segmentCount,
    showEndStoryOption,
    validChoices: validChoices.length,
    isGeneratingEnding
  });

  return (
    <div className="space-y-3">
      <p className="text-white/70 text-xs font-medium">
        What should happen next?
      </p>
      
      {/* Story Choices - Enhanced glass effect to match theme */}
      <div className="space-y-3">
        {validChoices.map((choice, index) => (
          <button
            key={choice.id}
            className="w-full text-left py-4 px-5 glass-card hover:bg-white/10 rounded-xl transition-all duration-300 border border-amber-400/20 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/10 group"
            onClick={() => onSelect(choice.id)}
            disabled={disabled || loading}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-sm">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-white text-sm flex-grow">
                {choice.text}
              </span>
              <span className="text-amber-400/60 group-hover:text-amber-400 transition-colors text-sm">
                →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* End Story Option - Matches main theme */}
      {showEndStoryOption && (
        <div className="pt-3 mt-3 border-t border-white/10">
          <p className="text-white/40 text-[11px] mb-2 text-center">
            Or wrap up your adventure:
          </p>
          <button
            className="w-full py-4 px-5 glass-card bg-gradient-to-r from-amber-500/20 to-orange-600/20 hover:from-amber-500/30 hover:to-orange-600/30 rounded-xl transition-all duration-300 text-amber-400 font-medium border border-amber-400/30 hover:border-amber-400/50 shadow-lg hover:shadow-amber-500/20"
            onClick={() => {
              console.log('🎬 End Story button clicked');
              onEndStory?.();
            }}
            disabled={disabled || loading || isGeneratingEnding}
          >
            <span className="text-sm">
              {isGeneratingEnding ? 'Creating Finale...' : '✨ End Story & Create Finale'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryChoices;