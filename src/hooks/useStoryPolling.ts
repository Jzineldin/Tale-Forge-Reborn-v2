import { useEffect } from 'react';

export interface UseStoryPollingOptions {
  story: any;
  refetchStory: () => void;
}

export const useStoryPolling = ({ story, refetchStory }: UseStoryPollingOptions) => {
  // Aggressive tab switching fix - multiple event listeners and interval backup
  useEffect(() => {
    let visibilityInterval: NodeJS.Timeout | null = null;
    let focusInterval: NodeJS.Timeout | null = null;

    const forceRefreshDuringGeneration = () => {
      if (story && (!story.segments || story.segments.length === 0)) {
        console.log('👁️ Forcing story refresh - story still generating');
        refetchStory();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab became visible');
        forceRefreshDuringGeneration();

        // Start aggressive polling for a few seconds after becoming visible
        if (focusInterval) clearInterval(focusInterval);
        focusInterval = setInterval(forceRefreshDuringGeneration, 1000);

        setTimeout(() => {
          if (focusInterval) {
            clearInterval(focusInterval);
            focusInterval = null;
          }
        }, 5000); // Stop aggressive polling after 5 seconds
      }
    };

    const handleFocus = () => {
      console.log('👁️ Window focused');
      forceRefreshDuringGeneration();
    };

    const handleMouseEnter = () => {
      console.log('👁️ Mouse entered window');
      forceRefreshDuringGeneration();
    };

    const handleKeyPress = () => {
      console.log('👁️ Key pressed');
      forceRefreshDuringGeneration();
    };

    // Add multiple event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('keydown', handleKeyPress);

    // Set up continuous polling every 2 seconds as backup
    visibilityInterval = setInterval(forceRefreshDuringGeneration, 2000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('keydown', handleKeyPress);
      
      if (visibilityInterval) {
        clearInterval(visibilityInterval);
      }
      if (focusInterval) {
        clearInterval(focusInterval);
      }
    };
  }, [story, refetchStory]);
};