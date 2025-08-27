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
      // Check if we need to refetch for various reasons
      const noSegments = story && (!story.segments || story.segments.length === 0);
      
      // Check if any segments are missing images
      const hasMissingImages = story?.segments?.some((seg: any) => 
        !seg.image_url && seg.image_generation_status !== 'failed'
      );
      
      const shouldRefetch = (noSegments || hasMissingImages) &&
        Date.now() - lastRefetch > 3000; // Wait at least 3 seconds between refetches

      if (shouldRefetch) {
        console.log('📖 Checking for updates...', {
          noSegments,
          hasMissingImages,
          segmentsWithoutImages: story?.segments?.filter((seg: any) => !seg.image_url).length
        });
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

    // Poll every 10 seconds when story needs updates
    const startPolling = () => {
      const needsPolling = story && (
        (!story.segments || story.segments.length === 0) ||
        story.segments?.some((seg: any) => !seg.image_url && seg.image_generation_status !== 'failed')
      );
      
      if (needsPolling) {
        pollingInterval = setInterval(checkForUpdates, 10000); // Poll every 10 seconds
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