import React, { useEffect } from 'react';

const StoryLibraryPage: React.FC = () => {
  // Handle body background for this page
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

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-white mb-4">Story Library</h1>
          <p className="text-gray-400">Coming Soon - This page is under maintenance.</p>
          <p className="text-gray-500 mt-2">The Easy Mode story creation is working!</p>
        </div>
      </div>
    </div>
  );
};

export default StoryLibraryPage;