import { useState } from 'react';
import { useGenerateAudio } from '@/utils/performance.tsx';

export interface UseStoryAudioOptions {
  storyId: string | null;
}

export interface UseStoryAudioReturn {
  segmentAudioUrls: { [key: number]: string };
  setSegmentAudioUrls: (urls: { [key: number]: string }) => void;
  showAudioPlayer: boolean;
  setShowAudioPlayer: (show: boolean) => void;
  generatingAudioForSegment: number | null;
  setGeneratingAudioForSegment: (segment: number | null) => void;
  generateAudioForSegment: (segmentIndex: number, content: string) => Promise<void>;
}

export const useStoryAudio = ({ storyId }: UseStoryAudioOptions): UseStoryAudioReturn => {
  const [segmentAudioUrls, setSegmentAudioUrls] = useState<{ [key: number]: string }>({});
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [generatingAudioForSegment, setGeneratingAudioForSegment] = useState<number | null>(null);

  const generateAudioMutation = useGenerateAudio();

  const generateAudioForSegment = async (segmentIndex: number, content: string) => {
    if (!storyId) return;
    
    setGeneratingAudioForSegment(segmentIndex);
    try {
      const result = await generateAudioMutation.mutateAsync({
        storyId,
        content
      });

      if (result?.audioUrl) {
        setSegmentAudioUrls(prev => ({
          ...prev,
          [segmentIndex]: result.audioUrl
        }));
      }
    } catch (error) {
      console.error('Failed to generate audio:', error);
    } finally {
      setGeneratingAudioForSegment(null);
    }
  };

  return {
    segmentAudioUrls,
    setSegmentAudioUrls,
    showAudioPlayer,
    setShowAudioPlayer,
    generatingAudioForSegment,
    setGeneratingAudioForSegment,
    generateAudioForSegment
  };
};