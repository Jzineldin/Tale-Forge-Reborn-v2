import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface StoryProgressProps {
  totalSegments: number;
  currentSegmentIndex: number;
  onSegmentClick?: (index: number) => void;
  className?: string;
  isStoryComplete?: boolean;
}

const StoryProgress: React.FC<StoryProgressProps> = ({ 
  totalSegments, 
  currentSegmentIndex, 
  onSegmentClick,
  className = '',
  isStoryComplete = false
}) => {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-900/20 rounded-full border border-orange-500/30">
        <BookOpen className="w-5 h-5 text-orange-400" />
        <span className="text-white font-medium">
          Chapter {currentSegmentIndex + 1}
        </span>
        {totalSegments > 0 && isStoryComplete && (
          <>
            <span className="text-orange-400">/</span>
            <span className="text-orange-400">{totalSegments}</span>
          </>
        )}
        {!isStoryComplete && (
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse ml-1" />
        )}
      </div>
      
      {/* Chapter dots for navigation */}
      {totalSegments > 1 && (
        <div className="flex gap-1.5">
          {Array.from({ length: Math.min(totalSegments, 10) }).map((_, index) => (
            <button
              key={index}
              onClick={() => onSegmentClick?.(index)}
              disabled={!onSegmentClick || index >= totalSegments}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSegmentIndex
                  ? 'bg-orange-400 w-8'
                  : index < totalSegments
                  ? 'bg-orange-600/50 hover:bg-orange-500/70'
                  : 'bg-gray-600/30'
              }`}
              aria-label={`Go to chapter ${index + 1}`}
            />
          ))}
          {totalSegments > 10 && (
            <span className="text-gray-500 text-sm">...</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryProgress;