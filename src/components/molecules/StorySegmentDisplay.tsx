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
  // Console debug logging (not visible in UI)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📖 [StorySegmentDisplay] Segment data:', {
        segmentIndex,
        hasText: !!(segment.segment_text || segment.content),
        textField: segment.segment_text ? 'segment_text' : segment.content ? 'content' : 'none',
        textLength: (segment.segment_text || segment.content || '').length,
        hasImage: !!segment.image_url,
        imageUrl: segment.image_url,
        imageStatus: segment.image_generation_status,
        hasAudio,
        allFields: Object.keys(segment),
        timestamp: new Date().toISOString()
      });
      
      // Log when image URL changes
      if (segment.image_url) {
        console.log('🖼️ [StorySegmentDisplay] Image detected:', {
          segmentIndex,
          imageUrl: segment.image_url,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [segment, segmentIndex, hasAudio]);

  return (
    <div className="space-y-6">
      {/* Story Image */}
      {segment.image_url && (
        <div className="relative w-full max-w-4xl mx-auto">
          <div className="aspect-video">
            <StoryImage
              src={segment.image_url}
              alt={`Story illustration for segment ${segmentIndex + 1}`}
              className="w-full h-full object-cover rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

      {/* Story Content */}
      <div className="max-w-4xl mx-auto bg-slate-950/60 backdrop-blur-sm rounded-xl p-8">
        
        <div className={`${getFontSizeClass(fontSize)} leading-relaxed text-gray-100 text-center space-y-4`}>
          {(segment.segment_text || segment.content)?.split('\n\n').map((paragraph: string, index: number) => (
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
              onClick={() => onGenerateAudio(segmentIndex, segment.segment_text || segment.content)}
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