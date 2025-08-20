import React from 'react';
import Text from '@/components/atoms/Text';

interface StoryProgressProps {
  totalSegments: number;
  currentSegmentIndex: number;
  onSegmentClick?: (index: number) => void;
  className?: string;
}

const StoryProgress: React.FC<StoryProgressProps> = ({ 
  totalSegments, 
  currentSegmentIndex, 
  onSegmentClick,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <Text variant="h3" weight="semibold">
          Story Progress
        </Text>
        <Text variant="span" color="secondary" className="text-sm">
          {currentSegmentIndex + 1} of {totalSegments}
        </Text>
      </div>
      
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${totalSegments > 0 ? ((currentSegmentIndex + 1) / totalSegments) * 100 : 0}%` }}
          ></div>
        </div>
        
        {/* Segment indicators */}
        <div className="flex overflow-x-auto pb-2 -mx-1 px-1">
          {Array.from({ length: totalSegments }).map((_, index) => (
            <div 
              key={index} 
              className="flex items-center flex-shrink-0 px-1"
              onClick={() => onSegmentClick?.(index)}
            >
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  index === currentSegmentIndex
                    ? 'bg-indigo-600 text-white scale-110 shadow-md'
                    : index < currentSegmentIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
                aria-label={`Go to segment ${index + 1}`}
                disabled={!onSegmentClick}
              >
                {index + 1}
              </button>
              {index < totalSegments - 1 && (
                <div className={`w-6 h-1 ${
                  index < currentSegmentIndex 
                    ? 'bg-indigo-600' 
                    : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryProgress;