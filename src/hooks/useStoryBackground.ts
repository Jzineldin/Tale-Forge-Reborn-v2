import { useEffect } from 'react';

export const useStoryBackground = () => {
  // Handle body background for story reader page
  useEffect(() => {
    const body = document.body;
    const originalBackground = body.style.background;
    const originalBackgroundImage = body.style.backgroundImage;
    const originalBackgroundAttachment = body.style.backgroundAttachment;
    const originalBackgroundSize = body.style.backgroundSize;
    const originalBackgroundPosition = body.style.backgroundPosition;
    const originalBackgroundRepeat = body.style.backgroundRepeat;
    
    body.style.background = 'none';
    body.style.backgroundImage = 'url(/images/pages/home/cosmic-library.png)';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
    
    // Cleanup function to restore original background
    return () => {
      body.style.background = originalBackground;
      body.style.backgroundImage = originalBackgroundImage;
      body.style.backgroundAttachment = originalBackgroundAttachment;
      body.style.backgroundSize = originalBackgroundSize;
      body.style.backgroundPosition = originalBackgroundPosition;
      body.style.backgroundRepeat = originalBackgroundRepeat;
    };
  }, []);
};