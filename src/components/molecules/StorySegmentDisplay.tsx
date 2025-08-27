import React from 'react';
import { Volume2, Play } from 'lucide-react';
import StoryImage from '@/components/atoms/StoryImage';
import { TypographyLayout } from '@/components/layout';
import { getFontSizeClass } from '@/utils/storyReaderUtils';

interface StorySegmentDisplayProps {
  segment: any;
  segmentIndex: number;
  fontSize: string;
  hasAudio: boolean;
  isGeneratingAudio: boolean;
  onGenerateAudio: (segmentIndex: number, content: string) => void;
  onPlayAudio: () => void;
}

const StorySegmentDisplay: React.FC<StorySegmentDisplayProps> = ({
  segment,
  segmentIndex,
  fontSize,
  hasAudio,
  isGeneratingAudio,
  onGenerateAudio,
  onPlayAudio
}) => {
  return (
    <div className="space-y-6">
      {/* Story Image */}
      {segment.image_url && (
        <div className="relative w-full aspect-video max-w-2xl mx-auto">
          <StoryImage
            src={segment.image_url}
            alt={`Story illustration for segment ${segmentIndex + 1}`}
            className="rounded-2xl shadow-2xl border border-white/20"
          />
        </div>
      )}

      {/* Story Content */}
      <div className="max-w-4xl mx-auto">
        <div className={`${getFontSizeClass(fontSize)} leading-relaxed text-white/95 text-center space-y-4`}>
          {segment.content?.split('\n\n').map((paragraph: string, index: number) => (
            <TypographyLayout key={index} variant="body" className="text-inherit">
              {paragraph}
            </TypographyLayout>
          ))}
        </div>

        {/* Audio Controls */}
        <div className="mt-6 flex justify-center">
          {hasAudio ? (
            <button
              onClick={onPlayAudio}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Play Audio
            </button>
          ) : (
            <button
              onClick={() => onGenerateAudio(segmentIndex, segment.content)}
              disabled={isGeneratingAudio}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              {isGeneratingAudio ? 'Generating Audio...' : 'Generate Audio'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorySegmentDisplay;