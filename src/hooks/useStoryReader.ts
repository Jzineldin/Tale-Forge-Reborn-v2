import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { achievementService } from '@/services/achievementService';
import { goalService } from '@/services/goalService';
import { useStory } from '@/utils/performance.tsx';

export interface UseStoryReaderOptions {
  storyId: string | null;
}

export interface UseStoryReaderReturn {
  story: any;
  isStoryLoading: boolean;
  storyError: any;
  refetchStory: () => void;
  currentSegmentIndex: number;
  setCurrentSegmentIndex: (index: number) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  readingStartTime: Date | null;
  totalWords: number;
  audioCreditsNeeded: number;
}

export const useStoryReader = ({ storyId }: UseStoryReaderOptions): UseStoryReaderReturn => {
  const { user } = useAuth();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [fontSize, setFontSize] = useState('medium');
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null);

  // Get story data
  const { data: story, isLoading: isStoryLoading, error: storyError, refetch: refetchStory } = useStory(storyId);

  // Calculate total word count for audio pricing
  const calculateTotalWords = () => {
    if (!story?.segments) return 0;
    return story.segments.reduce((total, segment) => {
      const words = segment.content ? segment.content.split(' ').length : 0;
      return total + words;
    }, 0);
  };

  const totalWords = calculateTotalWords();
  const audioCreditsNeeded = Math.ceil(totalWords / 100); // 1 credit per 100 words

  // Track reading session start
  useEffect(() => {
    setReadingStartTime(new Date());
  }, []);

  // Track progress for achievements and goals when segments change
  // DISABLED: Achievement system temporarily disabled
  // useEffect(() => {
  //   if (user?.id && story && currentSegmentIndex > 0) {
  //     const trackReadingProgress = async () => {
  //       try {
  //         // Update reading progress for achievements
  //         await achievementService.updateUserProgress(user.id, {
  //           total_reading_time: 1, // Increment by 1 minute per segment read
  //           stories_read: currentSegmentIndex === 1 ? 1 : 0, // Count as story started on first segment
  //           current_streak: 1
  //         });

  //         // Update daily reading goal
  //         await goalService.updateGoalProgress(user.id, 'daily_engagement', 1);
  //       } catch (error) {
  //         console.error('Error tracking reading progress:', error);
  //       }
  //     };

  //     // Debounce progress tracking
  //     const timer = setTimeout(trackReadingProgress, 5000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [user?.id, story, currentSegmentIndex]);

  return {
    story,
    isStoryLoading,
    storyError,
    refetchStory,
    currentSegmentIndex,
    setCurrentSegmentIndex,
    fontSize,
    setFontSize,
    readingStartTime,
    totalWords,
    audioCreditsNeeded
  };
};