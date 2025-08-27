import { useEffect } from 'react';

export interface UseStoryPollingOptions {
  story: any;
  refetchStory: () => void;
}

export const useStoryPolling = ({ story, refetchStory }: UseStoryPollingOptions) => {
  // Reasonable polling for story generation updates
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    let lastRefetch = 0;

    const checkForUpdates = () => {
      // Only refetch if story is being generated AND we haven't refetched recently
      const shouldRefetch = story && 
        (!story.segments || story.segments.length === 0) &&
        Date.now() - lastRefetch > 3000; // Wait at least 3 seconds between refetches

      if (shouldRefetch) {
        console.log('📖 Checking for story updates...');
        refetchStory();
        lastRefetch = Date.now();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became visible - checking for updates');
        checkForUpdates();
      }
    };

    // Only add reasonable event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Poll every 10 seconds only when story is being generated
    const startPolling = () => {
      if (story && (!story.segments || story.segments.length === 0)) {
        pollingInterval = setInterval(checkForUpdates, 10000); // Much more reasonable
      }
    };

    startPolling();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [story, refetchStory]);
};