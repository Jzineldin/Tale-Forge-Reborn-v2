import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { achievementService } from '@/services/achievementService';
import { goalService } from '@/services/goalService';
import StoryImage from '@/components/atoms/StoryImage';
import StoryChoices from '@/components/molecules/StoryChoices';
import StoryProgress from '@/components/molecules/StoryProgress';
import { TTSPlayer } from '@/components/molecules/TTSPlayer';
import { useStory, useGenerateStorySegment, useGenerateStoryEnding, useGenerateAudio } from '@/utils/performance.tsx';
import { PageLayout, CardLayout, TypographyLayout } from '@/components/layout';
import { BookOpen, Settings, Volume2, VolumeX, ArrowLeft, Sparkles, Play } from 'lucide-react';

// Helper function to convert age format back to difficulty display
const getDifficultyDisplay = (ageGroup: string): string => {
  if (!ageGroup) return 'Medium Difficulty';

  // Convert age ranges to difficulty labels
  if (ageGroup.includes('3-4') || ageGroup.includes('3') || ageGroup.includes('4')) return 'Very Easy';
  if (ageGroup.includes('4-6') || ageGroup.includes('5') || ageGroup.includes('6')) return 'Easy';
  if (ageGroup.includes('7-9') || ageGroup.includes('7') || ageGroup.includes('8') || ageGroup.includes('9')) return 'Medium';
  if (ageGroup.includes('10-12') || ageGroup.includes('10') || ageGroup.includes('11') || ageGroup.includes('12')) return 'Hard';
  if (ageGroup.includes('13-15') || ageGroup.includes('13') || ageGroup.includes('14') || ageGroup.includes('15')) return 'Very Hard';

  return 'Medium'; // Default fallback
};

const StoryReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [fontSize, setFontSize] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [segmentAudioUrls, setSegmentAudioUrls] = useState<{ [key: number]: string }>({});
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [generatingAudioForSegment, setGeneratingAudioForSegment] = useState<number | null>(null);
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null);
  // Removed unused state: imageRenderKey, setImageRenderKey

  // Get story data
  const { data: story, isLoading: isStoryLoading, error: storyError, refetch: refetchStory } = useStory(id || null);

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

    // Multiple event listeners for maximum compatibility
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Backup interval that runs even when tab is hidden (browsers may throttle this)
    if (story && (!story.segments || story.segments.length === 0)) {
      visibilityInterval = setInterval(() => {
        if (!document.hidden) { // Only when tab is visible
          forceRefreshDuringGeneration();
        }
      }, 3000);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (visibilityInterval) clearInterval(visibilityInterval);
      if (focusInterval) clearInterval(focusInterval);
    };
  }, [story, refetchStory]);

  // AI service hooks
  const { mutate: generateSegment, isLoading: isGeneratingSegment } = useGenerateStorySegment();
  const { mutate: generateEnding } = useGenerateStoryEnding();
  const { mutate: generateAudio, isLoading: isGeneratingAudio } = useGenerateAudio();
  // Removed unused hook: regenerateImage, isRegeneratingImage

  // Debug: Log the story data only when it changes (moved before conditional returns)
  React.useEffect(() => {
    if (story?.id) {
      console.log('🔍 Story data updated:', {
        storyId: story.id,
        title: story.title,
        segmentCount: story.segments?.length || 0,
        hasSegments: !!story.segments,
      });
    }
  }, [story?.id, story?.segments?.length]);

  // Compact font sizes
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  // Removed redundant line height classes

  // Handle choice selection
  const handleChoiceSelect = (choiceId: string) => {
    if (!story) return;

    // Handle restart case
    if (choiceId === 'restart') {
      setCurrentSegmentIndex(0);
      return;
    }

    setIsGenerating(true);

    // Find the choice index - handle both string choices and object choices
    const currentSegment = story.segments?.[currentSegmentIndex];
    let choiceIndex = -1;

    if (currentSegment?.choices) {
      // Check if choices are objects or strings
      if (typeof currentSegment.choices[0] === 'string') {
        // Choices are strings - extract index from choice ID (e.g., "choice-0" -> 0)
        const match = choiceId.match(/choice-(\d+)/);
        choiceIndex = match ? parseInt(match[1]) : -1;
      } else {
        // Choices are objects - find by ID
        choiceIndex = currentSegment.choices.findIndex((choice: any) => choice.id === choiceId);
      }
    }

    console.log('🎯 Choice selection:', {
      choiceId,
      choiceIndex,
      choicesType: currentSegment?.choices ? typeof currentSegment.choices[0] : 'none',
      totalChoices: currentSegment?.choices?.length || 0
    });

    if (choiceIndex === -1) {
      console.error('❌ Choice not found:', { choiceId, availableChoices: currentSegment?.choices });
      setIsGenerating(false);
      return;
    }

    generateSegment(
      { storyId: story.id, choiceIndex },
      {
        onSuccess: (data) => {
          console.log('✅ Segment generated successfully:', data);
          // CRITICAL FIX: Don't manually increment index - let React Query refetch handle it
          // The useGenerateStorySegment hook will invalidate the story cache,
          // causing useStory to refetch with the new segment data
          // React Query will then automatically re-render with the latest segment
          setIsGenerating(false);

          // Auto-navigate to the new segment once data is refreshed
          setTimeout(() => {
            setCurrentSegmentIndex(currentSegmentIndex + 1);
          }, 1000); // Give React Query time to refetch
        },
        onError: (error) => {
          console.error('❌ Error generating segment:', error);
          setIsGenerating(false);
        }
      }
    );
  };

  // Handle story ending
  const handleStoryEnding = () => {
    console.log('🎯 handleStoryEnding called');
    console.log('🔍 Story state:', {
      hasStory: !!story,
      storyId: story?.id,
      segmentCount: story?.segments?.length
    });

    if (!story) {
      console.log('❌ No story found for ending generation');
      return;
    }

    console.log('🎬 Starting story ending generation for:', story.id);
    setIsGenerating(true);

    generateEnding(
      { storyId: story.id },
      {
        onSuccess: (data) => {
          console.log('✅ Story ending generated successfully:', data);
          setIsGenerating(false);
          // Navigate to the new ending segment after a brief delay
          setTimeout(() => {
            if (story.segments) {
              const lastIndex = story.segments.length; // The new segment will be at this index
              setCurrentSegmentIndex(lastIndex);
            }
          }, 1500);
        },
        onError: (error) => {
          console.error('❌ Error generating ending:', error);
          setIsGenerating(false);
          // Show user-friendly error message
          alert('Failed to generate story ending. Please try again.');
        }
      }
    );
  };

  // Check if story is completed and show completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    if (!story || !story.segments || story.segments.length === 0) return;

    // Check if current segment is an ending
    const currentSegment = story.segments[currentSegmentIndex];
    if (currentSegment && currentSegment.is_end === true) {
      // Story is completed, show completion modal after a brief moment
      const timer = setTimeout(() => {
        setShowCompletionModal(true);
      }, 2000); // 2 second delay to show the ending

      return () => clearTimeout(timer);
    }
  }, [story, currentSegmentIndex]);

  // Handle per-chapter audio generation
  const handleGenerateSegmentAudio = (segmentIndex: number) => {
    if (!story || !story.segments[segmentIndex]) return;

    // Check if user is premium
    if (!user?.is_premium && user?.subscription_tier === 'free') {
      alert('Audio narration is a premium feature. Please upgrade to Basic Creator or Pro Storyteller to unlock audio!');
      navigate('/pricing');
      return;
    }

    setGeneratingAudioForSegment(segmentIndex);

    const segmentContent = story.segments[segmentIndex].content;
    generateAudio(
      {
        storyId: story.id,
        content: segmentContent,
        segmentIndex
      },
      {
        onSuccess: (data) => {
          setSegmentAudioUrls(prev => ({ ...prev, [segmentIndex]: data.audioUrl }));
          setGeneratingAudioForSegment(null);
          if (segmentIndex === currentSegmentIndex) {
            setShowAudioPlayer(true);
          }
        },
        onError: (error) => {
          console.error('Error generating audio:', error);
          alert('Failed to generate audio. Please try again.');
          setGeneratingAudioForSegment(null);
        }
      }
    );
  };

  // Removed unused function: handleRegenerateImage

  // Handle font size change
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
  };

  // Handle segment navigation
  const handleSegmentClick = (index: number) => {
    if (index < (story?.segments?.length || 0)) {
      setCurrentSegmentIndex(index);
    }
  };

  // Auto-refresh is now handled by react-query polling in performance.tsx
  // No need for manual refresh anymore

  // 🚀 SIMPLIFIED LOADING STATES: Reduce multiple confusing screens

  // Error state - critical errors only
  if (storyError) {
    return (
      <div className="page-container flex-center">
        <div className="glass-card text-center max-w-sm">
          <span className="text-4xl mb-3 block">😞</span>
          <h2 className="title-card mb-2">Something went wrong</h2>
          <p className="text-body mb-4">Failed to load your story</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No story found
  if (!story) {
    return (
      <div className="page-container flex-center">
        <div className="glass-card text-center max-w-sm">
          <span className="text-4xl mb-3 block">📚</span>
          <h2 className="title-card mb-2">Story not found</h2>
          <p className="text-body mb-4">This story doesn't exist</p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Story generation failed - show error
  if (story.status === 'error') {
    return (
      <div className="page-container flex-center">
        <div className="glass-card text-center max-w-sm">
          <span className="text-4xl mb-3 block">🔧</span>
          <h2 className="title-card mb-2">Generation Failed</h2>
          <p className="text-body mb-4">
            {story.error_message || 'Something went wrong'}
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary w-full"
            >
              Create New Story
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-secondary w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 UNIFIED LOADING STATE: Story still generating or no segments yet
  if (isStoryLoading || story.status === 'generating' || !story.segments || story.segments.length === 0) {
    return (
      <div className="page-container flex-center">
        <div className="glass-card text-center max-w-md">
          <div className="animate-bounce text-5xl mb-3">✨</div>
          <h2 className="title-card mb-2">Creating Your Story</h2>
          <p className="text-body mb-4">
            {story?.title ? `"${story.title}"` : 'Loading adventure...'}
          </p>

          {/* Simple loading indicator */}
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
          </div>

          <p className="text-muted text-xs">This takes 15-30 seconds</p>
        </div>
      </div>
    );
  }

  // Get current segment
  const currentSegment = story.segments?.[currentSegmentIndex] || null;

  // Clean the segment content to remove embedded story title if it exists
  const cleanSegmentContent = (content: string, storyTitle: string) => {
    if (!content || !storyTitle) return content;

    // Remove title patterns: **Title**, Title at start, etc.
    const titlePatterns = [
      new RegExp(`^\\*\\*${storyTitle.replace(/[.*+?^${}()|\\[\\]\\\\]/g, '\\$&')}\\*\\*\\s*`, 'i'),
      new RegExp(`^${storyTitle.replace(/[.*+?^${}()|\\[\\]\\\\]/g, '\\$&')}\\s*`, 'i'),
      new RegExp(`^\\*\\*${storyTitle.replace(/[.*+?^${}()|\\[\\]\\\\]/g, '\\$&')}\\*\\*\\s*(.*)`, 'i')
    ];

    let cleanContent = content;
    titlePatterns.forEach(pattern => {
      cleanContent = cleanContent.replace(pattern, '').trim();
    });

    return cleanContent;
  };

  // Clean current segment content
  const cleanedSegment = currentSegment ? {
    ...currentSegment,
    content: cleanSegmentContent(currentSegment.content, story.title)
  } : null;

  // Prepare choices for the StoryChoices component
  const formattedChoices = cleanedSegment?.choices?.map((choice: any, index: number) => ({
    id: choice.id || `choice-${index}`,
    text: choice.text
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Clean Header with Navigation */}
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Library</span>
            </button>
            
            <div className="flex items-center gap-3">
              {/* Font Size Selector */}
              <div className="flex items-center bg-black/30 rounded-lg p-1">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      fontSize === size 
                        ? 'bg-amber-500 text-white' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    A{size === 'large' ? '+' : size === 'small' ? '-' : ''}
                  </button>
                ))}
              </div>

              {/* Audio Control */}
              {user?.subscription_tier !== 'free' && cleanedSegment && (
                <button
                  onClick={() => 
                    segmentAudioUrls[currentSegmentIndex] 
                      ? setShowAudioPlayer(!showAudioPlayer)
                      : handleGenerateSegmentAudio(currentSegmentIndex)
                  }
                  disabled={generatingAudioForSegment === currentSegmentIndex}
                  className="p-2 bg-black/30 hover:bg-black/50 rounded-lg text-white/80 hover:text-white transition-colors"
                >
                  {generatingAudioForSegment === currentSegmentIndex ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : segmentAudioUrls[currentSegmentIndex] ? (
                    showAudioPlayer ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Story Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-3">
            <BookOpen className="w-4 h-4" />
            {story.genre} • {getDifficultyDisplay(story.age_group)}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {story.title}
          </h1>
          
          {/* Progress Bar */}
          {story.segments && story.segments.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <StoryProgress
                totalSegments={story.segments.length}
                currentSegmentIndex={currentSegmentIndex}
                onSegmentClick={handleSegmentClick}
                isStoryComplete={cleanedSegment?.is_end === true}
                className="bg-black/30 p-3 rounded-xl border border-white/10"
              />
            </div>
          )}
        </div>

        {/* Audio Player */}
        {showAudioPlayer && segmentAudioUrls[currentSegmentIndex] && (
          <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 font-medium">Chapter {currentSegmentIndex + 1} Audio</span>
              <button
                onClick={() => setShowAudioPlayer(false)}
                className="text-white/60 hover:text-white/80 transition-colors"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </div>
            <audio
              controls
              className="w-full"
              src={segmentAudioUrls[currentSegmentIndex]}
              style={{
                background: 'transparent',
                borderRadius: '8px'
              }}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Main Story Card */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Hero Image Section */}
          {cleanedSegment?.image_url ? (
            <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-b from-purple-900/50 to-black/50">
              <StoryImage
                src={cleanedSegment.image_url}
                alt={`Illustration for chapter ${currentSegmentIndex + 1}`}
                className="w-full h-full object-cover"
                onImageLoad={() => console.log('🖼️ Image loaded')}
                onImageError={() => console.log('Image failed to load')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white/90 text-sm">
                  Chapter {currentSegmentIndex + 1}
                </span>
              </div>
            </div>
          ) : cleanedSegment?.image_prompt ? (
            <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-amber-500 rounded-full w-16 h-16 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-white/80 text-lg font-medium mb-2">Creating your illustration...</p>
                <p className="text-white/60 text-sm">This usually takes 10-30 seconds</p>
              </div>
            </div>
          ) : (
            <div className="relative h-48 bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-white/60 mx-auto mb-3" />
                <p className="text-white/60 text-lg">Chapter {currentSegmentIndex + 1}</p>
              </div>
            </div>
          )}

          {/* Story Content */}
          <div className="p-6 md:p-8">
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 relative">
                  <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-amber-500 rounded-full w-12 h-12 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
                <p className="text-white/80 text-lg font-medium">
                  Creating your next chapter...
                </p>
              </div>
            ) : cleanedSegment ? (
              <>
                {/* Story Text */}
                <div className="prose prose-invert max-w-none mb-8">
                  <div
                    className={`leading-relaxed text-white/90 ${
                      fontSize === 'small' ? 'text-sm' : 
                      fontSize === 'large' ? 'text-lg md:text-xl' : 'text-base md:text-lg'
                    }`}
                    style={{
                      lineHeight: fontSize === 'large' ? '1.8' : '1.7'
                    }}
                  >
                    {cleanedSegment.content}
                  </div>
                </div>

                {/* Story Actions */}
                {cleanedSegment.is_end ? (
                  <div className="text-center py-8">
                    <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center shadow-2xl">
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="text-2xl font-bold text-white mb-2">Story Complete!</h2>
                      <p className="text-white/90 mb-4">What an amazing adventure!</p>
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Story Choices */}
                    <StoryChoices
                      choices={formattedChoices}
                      onSelect={handleChoiceSelect}
                      disabled={isGeneratingSegment}
                      loading={isGeneratingSegment}
                      onEndStory={handleStoryEnding}
                      segmentCount={story.segments?.length || 0}
                      isGeneratingEnding={isGenerating}
                    />
                    
                    {/* End Story Option */}
                    {story.segments && story.segments.length >= 2 && (
                      <div className="pt-4 border-t border-white/10">
                        <button
                          onClick={handleStoryEnding}
                          disabled={isGenerating}
                          className="w-full px-4 py-2 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 hover:border-red-400/50 transition-colors disabled:opacity-50"
                        >
                          End Story Here
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to begin your story?</h2>
                <button
                  onClick={() => handleChoiceSelect('begin')}
                  disabled={isGeneratingSegment}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {isGeneratingSegment ? 'Starting...' : 'Begin Adventure'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm">
            Created {new Date(story.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Story Completion Modal */}
      {showCompletionModal && story && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-6">
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  navigate('/dashboard');
                }}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Story Complete!</h2>
              <h3 className="text-xl text-amber-400 mb-2">"{story.title}"</h3>
              <p className="text-white/70">
                Finished {story.segments?.length || 0} chapters!
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-center">
                <BookOpen className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="font-semibold text-green-400 mb-1">Story Saved!</h3>
                <p className="text-green-400/80 text-sm">You can revisit or share it anytime.</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCurrentSegmentIndex(0);
                    setShowCompletionModal(false);
                  }}
                  className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🔁</span>
                  <span>Read Again</span>
                </button>

                <button
                  onClick={() => navigate(`/stories/${story.id}/complete`)}
                  className="w-full px-4 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <span>📤</span>
                  <span>Share Story</span>
                </button>

                <button
                  onClick={() => navigate('/create')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all"
                >
                  Create New Story
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{story.segments?.length || 0}</p>
                  <p className="text-white/60 text-sm">Chapters</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Math.ceil((story.segments?.reduce((sum, seg) => sum + (seg.content?.split(' ').length || 0), 0) || 0) / 100)}
                  </p>
                  <p className="text-white/60 text-sm">Credits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">100%</p>
                  <p className="text-white/60 text-sm">Complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryReaderPage;