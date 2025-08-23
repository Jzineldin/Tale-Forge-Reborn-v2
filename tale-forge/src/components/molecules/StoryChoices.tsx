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
}

const StoryChoices: React.FC<StoryChoicesProps> = ({ 
  choices, 
  onSelect, 
  disabled = false,
  loading = false,
  onEndStory,
  segmentCount = 0
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

  return (
    <div className="space-y-4">
      <Text variant="h3" weight="semibold" className="mb-3 text-white">
        What should happen next?
      </Text>
      
      {/* Continue story choices */}
      <div className="grid grid-cols-1 gap-3">
        {validChoices.map((choice, index) => (
          <Button
            key={choice.id}
            variant="primary"
            className="w-full text-left justify-start py-4 px-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md glass-card bg-white/10 border border-white/20 hover:bg-white/20"
            onClick={() => onSelect(choice.id)}
            disabled={disabled || loading}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center mr-3">
                <Text variant="span" weight="semibold" className="text-slate-800">
                  {String.fromCharCode(65 + index)}
                </Text>
              </div>
              <Text variant="p" className="flex-grow text-left text-white">
                {choice.text}
              </Text>
              <div className="flex-shrink-0 ml-2">
                <svg 
                  className="h-5 w-5 text-white/60" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* End Story option */}
      {showEndStoryOption && (
        <div className="pt-4 border-t border-white/20">
          <Text variant="p" className="text-white/70 text-sm mb-3 text-center">
            Or wrap up your adventure:
          </Text>
          <Button
            variant="secondary"
            className="w-full py-4 px-5 glass-card bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 hover:from-green-600/30 hover:to-blue-600/30 transition-all duration-200"
            onClick={onEndStory}
            disabled={disabled || loading}
          >
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-400 flex items-center justify-center mr-3">
                <span className="text-slate-800 font-bold">✨</span>
              </div>
              <Text variant="p" className="text-white font-semibold">
                End Story & Create Finale
              </Text>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryChoices;