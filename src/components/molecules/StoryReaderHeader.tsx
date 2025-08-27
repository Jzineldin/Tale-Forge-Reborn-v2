import React from 'react';
import { ArrowLeft, BookOpen, Settings } from 'lucide-react';
import { TypographyLayout } from '@/components/layout';
import { getDifficultyDisplay } from '@/utils/storyReaderUtils';

interface StoryReaderHeaderProps {
  story: any;
  onBack: () => void;
  onSettings: () => void;
}

const StoryReaderHeader: React.FC<StoryReaderHeaderProps> = ({
  story,
  onBack,
  onSettings
}) => {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <div>
            <TypographyLayout variant="section" as="h1" className="text-white text-xl font-bold">
              {story?.title || 'Loading Story...'}
            </TypographyLayout>
            {story?.age_group && (
              <div className="text-sm text-gray-300">
                {getDifficultyDisplay(story.age_group)} • {story.genre}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={onSettings}
        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        aria-label="Settings"
      >
        <Settings className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default StoryReaderHeader;