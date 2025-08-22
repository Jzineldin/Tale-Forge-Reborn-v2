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
}

const StoryChoices: React.FC<StoryChoicesProps> = ({ 
  choices, 
  onSelect, 
  disabled = false,
  loading = false
}) => {
  if (choices.length === 0) {
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

  return (
    <div className="space-y-4">
      <Text variant="h3" weight="semibold" className="mb-3">
        What should happen next?
      </Text>
      <div className="grid grid-cols-1 gap-3">
        {choices.map((choice) => (
          <Button
            key={choice.id}
            variant="primary"
            className="w-full text-left justify-start py-4 px-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            onClick={() => onSelect(choice.id)}
            disabled={disabled || loading}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <Text variant="span" weight="semibold" className="text-indigo-800">
                  {choice.id.charAt(0).toUpperCase()}
                </Text>
              </div>
              <Text variant="p" className="flex-grow text-left">
                {choice.text}
              </Text>
              <div className="flex-shrink-0 ml-2">
                <svg 
                  className="h-5 w-5 text-gray-400" 
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
    </div>
  );
};

export default StoryChoices;