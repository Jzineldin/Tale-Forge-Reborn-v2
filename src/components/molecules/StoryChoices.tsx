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

      {/* End Story Option - Enhanced with clear explanation */}
      {showEndStoryOption && (
        <div className="pt-4 mt-4 border-t border-slate-800/50">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 mb-3">
            <p className="text-amber-400 text-sm font-semibold mb-1 text-center">
              Ready to wrap up your adventure?
            </p>
            <p className="text-gray-300 text-xs text-center">
              The AI will create a satisfying conclusion that brings your story to a beautiful ending
            </p>
          </div>
          <button
            className="w-full py-4 px-5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/40 hover:to-orange-600/40 rounded-lg transition-all duration-300 text-amber-400 font-bold border-2 border-amber-500/40 hover:border-amber-500/60 shadow-lg hover:shadow-amber-500/20 group"
            onClick={() => {
              console.log('🎬 End Story button clicked');
              onEndStory?.();
            }}
            disabled={disabled || loading || isGeneratingEnding}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-base flex items-center gap-2">
                {isGeneratingEnding ? (
                  <>
                    <span className="animate-spin">✨</span>
                    Creating Your Story Finale...
                  </>
                ) : (
                  <>
                    <span className="group-hover:animate-pulse">🎭</span>
                    Create Story Finale
                    <span className="group-hover:animate-pulse">✨</span>
                  </>
                )}
              </span>
              {!isGeneratingEnding && (
                <span className="text-xs text-amber-400/70">
                  AI will craft the perfect ending
                </span>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryChoices;