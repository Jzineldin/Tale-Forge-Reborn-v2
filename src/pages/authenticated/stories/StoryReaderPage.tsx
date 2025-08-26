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

  // Track progress for achievements and goals when segments change
  useEffect(() => {
    if (user?.id && story && currentSegmentIndex > 0) {
      const trackReadingProgress = async () => {
        try {
          // Update reading progress for achievements
          await achievementService.updateUserProgress(user.id, {
            total_reading_time: 1, // Increment by 1 minute per segment read
            stories_read: currentSegmentIndex === 1 ? 1 : 0, // Count as story started on first segment
            current_streak: 1
          });

          // Update daily reading goal
          await goalService.updateGoalProgress(user.id, 'daily_engagement', 1);
        } catch (error) {
          console.error('Error tracking reading progress:', error);
        }
      };

      // Debounce progress tracking
      const timer = setTimeout(trackReadingProgress, 5000);
      return () => clearTimeout(timer);
    }
  }, [user?.id, story, currentSegmentIndex]);

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
      new RegExp(`^\\*\\*${storyTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\s*`, 'i'),
      new RegExp(`^${storyTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'),
      new RegExp(`^\\*\\*${storyTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\s*(.*)`, 'i')
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
    <div className="story-reader-container">
      {/* Compact Story Header with better visibility */}
      <div className="story-segment mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="title-section mb-1">
                {story.title}
              </h1>
              <div className="flex items-center gap-2 text-muted text-xs">
                <span>{story.genre}</span>
                <span>•</span>
                <span>{getDifficultyDisplay(story.age_group)}</span>
              </div>
            </div>

            {/* Compact Controls */}
            <div className="flex items-center gap-2">
              {/* Font Size Control - Smaller */}
              <div className="flex items-center glass rounded-lg p-0.5">
                <button
                  onClick={() => handleFontSizeChange('small')}
                  className={`px-2 py-1 rounded-md transition-all ${fontSize === 'small' ? 'bg-amber-500 text-white' : 'text-muted hover:text-primary'}`}
                  aria-label="Small font"
                >
                  <span className="text-xs font-medium">A</span>
                </button>
                <button
                  onClick={() => handleFontSizeChange('medium')}
                  className={`px-2 py-1 rounded-md transition-all ${fontSize === 'medium' ? 'bg-amber-500 text-white' : 'text-muted hover:text-primary'}`}
                  aria-label="Medium font"
                >
                  <span className="text-sm font-medium">A</span>
                </button>
                <button
                  onClick={() => handleFontSizeChange('large')}
                  className={`px-2 py-1 rounded-md transition-all ${fontSize === 'large' ? 'bg-amber-500 text-white' : 'text-muted hover:text-primary'}`}
                  aria-label="Large font"
                >
                  <span className="text-base font-medium">A</span>
                </button>
              </div>

              {/* End Story Button - Compact */}
              {story.segments && story.segments.length >= 2 && !cleanedSegment?.is_end && (
                <button
                  onClick={handleStoryEnding}
                  disabled={isGenerating}
                  className="btn btn-sm btn-primary"
                  aria-label="End story"
                >
                  End Story
                </button>
              )}

              {/* Audio Button - Compact */}
              {user?.subscription_tier !== 'free' && cleanedSegment && (
                segmentAudioUrls[currentSegmentIndex] ? (
                  <button
                    onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                    className="btn btn-sm btn-ghost"
                    aria-label={showAudioPlayer ? "Hide audio" : "Show audio"}
                  >
                    {showAudioPlayer ? '🔇' : '🔊'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleGenerateSegmentAudio(currentSegmentIndex)}
                    disabled={generatingAudioForSegment === currentSegmentIndex}
                    className="btn btn-sm btn-ghost disabled:opacity-50"
                    aria-label="Generate audio"
                  >
                    {generatingAudioForSegment === currentSegmentIndex ? '⏳' : '🎵'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Navigation - Compact with better visibility */}
      {story.segments && story.segments.length > 0 && (
        <div className="mb-3">
          <StoryProgress
            totalSegments={story.segments.length}
            currentSegmentIndex={currentSegmentIndex}
            onSegmentClick={handleSegmentClick}
            isStoryComplete={cleanedSegment?.is_end === true}
            className="bg-slate-900/80 p-1.5 rounded-lg border border-white/10"
          />
        </div>
      )}

      {/* Audio Player - Compact */}
      {showAudioPlayer && segmentAudioUrls[currentSegmentIndex] && (
        <div className="mb-3 bg-black/10 rounded-lg p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/60 text-xs">Chapter {currentSegmentIndex + 1}</span>
            <button
              onClick={() => setShowAudioPlayer(false)}
              className="text-white/40 hover:text-white/60 text-xs"
            >
              ✕
            </button>
          </div>
          <audio
            controls
            className="w-full h-8"
            src={segmentAudioUrls[currentSegmentIndex]}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Main Story Content - Compact with better visibility */}
      <div className="story-segment overflow-hidden mb-4">
        {/* Story Image - Balanced size */}
        {cleanedSegment?.image_url ? (
          <div className="story-image-container" style={{ height: '200px' }}>
            <StoryImage
              src={cleanedSegment.image_url}
              alt={`Illustration for segment ${currentSegmentIndex + 1}`}
              className="w-full h-full object-contain"
              onImageLoad={() => {
                console.log('🖼️ Parent: Image loaded');
              }}
              onImageError={() => console.log('Image failed to load')}
            />
          </div>
        ) : cleanedSegment?.image_prompt ? (
          <div className="relative bg-black/10 flex items-center justify-center" style={{ height: '200px' }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-400 mx-auto mb-3"></div>
              <p className="text-white/60 text-sm">Creating illustration...</p>
              <p className="text-white/40 text-xs mt-1">This usually takes 10-30 seconds</p>
            </div>
          </div>
        ) : (
          <div className="relative bg-black/10 flex items-center justify-center" style={{ height: '200px' }}>
            <div className="text-center">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-white/60 text-sm">No illustration available</p>
              <p className="text-white/40 text-xs mt-1">This segment was created without image generation</p>
            </div>
          </div>
        )}

        {/* Story Text - Better background for readability */}
        <div className="p-content">
          {isGenerating ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
              <p className="text-body">
                Creating your next chapter...
              </p>
            </div>
          ) : cleanedSegment ? (
            <>
              <div
                className={`story-text ${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]} mb-4`}
              >
                {cleanedSegment.content}
              </div>

              {/* Check if this is the ending segment */}
              {cleanedSegment.is_end ? (
                <div className="mt-4 text-center">
                  <div className="achievement-card">
                    <div className="text-3xl mb-2">🎉</div>
                    <h2 className="achievement-title">Story Complete!</h2>
                    <p className="achievement-description mb-2">
                      What an amazing adventure!
                    </p>
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
                    </div>
                  </div>
                </div>
              ) : (
                // Story Choices - Compact spacing
                <div className="mt-4">
                  <StoryChoices
                    choices={formattedChoices}
                    onSelect={handleChoiceSelect}
                    disabled={isGeneratingSegment}
                    loading={isGeneratingSegment}
                    onEndStory={handleStoryEnding}
                    segmentCount={story.segments?.length || 0}
                    isGeneratingEnding={isGenerating}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-body mb-3">
                Ready to begin your story?
              </p>
              <button
                onClick={() => handleChoiceSelect('begin')}
                disabled={isGeneratingSegment}
                className="btn btn-primary btn-lg disabled:opacity-50"
              >
                {isGeneratingSegment ? 'Starting...' : 'Begin Story'}
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Footer Info - Even smaller */}
      <div className="text-center">
        <p className="text-muted text-[10px]">
          Created {new Date(story.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
    </div>

  {/* Story Completion Modal */}
{
  showCompletionModal && story && (
    <div className="modal-backdrop">
      <div className="modal-content p-6">
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
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold mb-2 text-white">Story Complete!</h2>
          <h3 className="text-lg text-amber-400 mb-1">
            "{story.title}"
          </h3>
          <p className="text-white/60 text-sm">
            Finished {story.segments?.length || 0} chapters!
          </p>
        </div>

        <div>
          <div className="bg-green-900/20 border border-green-400/20 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-base font-semibold text-white mb-1">Story saved!</h3>
              <p className="text-white/60 text-xs">You can revisit or share it anytime.</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setCurrentSegmentIndex(0);
                setShowCompletionModal(false);
              }}
              className="w-full bg-black/20 hover:bg-black/30 border border-white/10 hover:border-white/20 py-2.5 rounded-lg text-white text-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>🔁</span>
              <span>Read Again</span>
            </button>

            <button
              onClick={() => {
                navigate(`/stories/${story.id}/complete`);
              }}
              className="w-full bg-black/20 hover:bg-black/30 border border-white/10 hover:border-white/20 py-2.5 rounded-lg text-white text-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>📤</span>
              <span>Share Story</span>
            </button>

            <button
              onClick={() => navigate('/create')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all"
            >
              Create New Story
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-amber-400">{story.segments?.length || 0}</p>
              <p className="text-[10px] text-white/50">Chapters</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">
                {Math.ceil((story.segments?.reduce((sum, seg) => sum + (seg.content?.split(' ').length || 0), 0) || 0) / 100)}
              </p>
              <p className="text-[10px] text-white/50">Credits</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-400">100%</p>
              <p className="text-[10px] text-white/50">Done</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  );
};

export default StoryReaderPage;