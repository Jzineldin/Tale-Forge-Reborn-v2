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
    <div className="max-w-4xl mx-auto bg-slate-950/60 backdrop-blur-sm rounded-xl p-8 space-y-4">
      <p className="text-gray-300 text-sm font-medium">
        What should happen next?
      </p>
      
      {/* Story Choices - Same container style as segment text with orange accent */}
      <div className="space-y-3">
        {validChoices.map((choice, index) => (
          <button
            key={choice.id}
            className="w-full text-left py-4 px-5 bg-slate-900/40 hover:bg-slate-900/60 rounded-lg transition-all duration-300 border border-orange-500/30 hover:border-orange-500/50 group"
            onClick={() => onSelect(choice.id)}
            disabled={disabled || loading}
          >
            <div className="flex items-start gap-3">
              <span className="text-orange-500 font-bold text-sm">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-gray-100 text-sm flex-grow">
                {choice.text}
              </span>
              <span className="text-orange-500/60 group-hover:text-orange-500 transition-colors text-sm">
                →
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* End Story Option - Matches main theme */}
      {showEndStoryOption && (
        <div className="pt-3 mt-3 border-t border-slate-800/50">
          <p className="text-gray-400 text-xs mb-2 text-center">
            Or wrap up your adventure:
          </p>
          <button
            className="w-full py-4 px-5 bg-gradient-to-r from-orange-600/20 to-amber-600/20 hover:from-orange-600/30 hover:to-amber-600/30 rounded-lg transition-all duration-300 text-orange-400 font-medium border border-orange-500/30 hover:border-orange-500/50"
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