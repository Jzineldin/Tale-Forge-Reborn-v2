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
import { UnifiedCard, FloatingElements, DESIGN_TOKENS } from '@/components/design-system';
import { CreditBalanceIndicator } from '@/components/business/CreditDisplay';

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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
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
  
  // Font size classes for immersive reading
  const fontSizeClasses = {
    small: 'text-base md:text-lg leading-relaxed',
    medium: 'text-lg md:text-xl leading-relaxed',
    large: 'text-xl md:text-2xl leading-relaxed'
  };
  
  // Line height classes for better readability
  const lineHeightClasses = {
    small: 'leading-relaxed',
    medium: 'leading-relaxed',
    large: 'leading-relaxed'
  };
  
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
          // Story ending generated successfully - the story will refresh and detect completion
          setIsGenerating(false);
          // Don't manually increment - let the story refresh handle the new segment
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

  // Check if story is completed and redirect to completion page
  useEffect(() => {
    if (!story || !story.segments || story.segments.length === 0) return;
    
    // Check if current segment is an ending
    const currentSegment = story.segments[currentSegmentIndex];
    if (currentSegment && currentSegment.is_end === true) {
      // Story is completed, redirect to completion page after a brief moment
      const timer = setTimeout(() => {
        navigate(`/stories/${story.id}/complete`, { 
          replace: true,
          state: { story, currentSegment } 
        });
      }, 2000); // 2 second delay to show the ending
      
      return () => clearTimeout(timer);
    }
  }, [story, currentSegmentIndex, navigate]);
  
  // Handle audio generation - Premium only
  const handleGenerateAudio = () => {
    if (!story) return;
    
    // Check if user is premium
    if (!user?.is_premium && user?.subscription_tier === 'free') {
      alert('Audio narration is a premium feature. Please upgrade to Basic Creator or Pro Storyteller to unlock audio!');
      navigate('/pricing');
      return;
    }
    
    generateAudio(
      { storyId: story.id },
      {
        onSuccess: (data) => {
          setAudioUrl(data.audioUrl);
          setShowAudioPlayer(true);
        },
        onError: (error) => {
          console.error('Error generating audio:', error);
          alert('Failed to generate audio. Please try again.');
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10">
          <UnifiedCard variant="enhanced" padding="large" className="text-center max-w-md">
            <span className="text-6xl mb-4 block">😞</span>
            <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-white/70 mb-4">Failed to load your story</p>
            <button 
              onClick={() => window.location.reload()}
              className={DESIGN_TOKENS.components.button.primary}
            >
              Try Again
            </button>
          </UnifiedCard>
        </div>
      </div>
    );
  }

  // No story found
  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10">
          <UnifiedCard variant="enhanced" padding="large" className="text-center max-w-md">
            <span className="text-6xl mb-4 block">📚</span>
            <h2 className="text-xl font-bold text-white mb-2">Story not found</h2>
            <p className="text-white/70 mb-4">This story doesn't exist or you don't have permission to view it</p>
            <button 
              onClick={() => window.history.back()}
              className={DESIGN_TOKENS.components.button.primary}
            >
              Go Back
            </button>
          </UnifiedCard>
        </div>
      </div>
    );
  }

  // Story generation failed - show error
  if (story.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10">
          <UnifiedCard variant="enhanced" padding="large" className="text-center max-w-md">
            <span className="text-6xl mb-4 block">🔧</span>
            <h2 className="text-xl font-bold text-white mb-2">Story Generation Failed</h2>
            <p className="text-white/70 mb-4">
              {story.error_message || 'Something went wrong while creating your story'}
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => window.history.back()}
                className={`${DESIGN_TOKENS.components.button.primary} w-full`}
              >
                Create a New Story
              </button>
              <button 
                onClick={() => window.location.reload()}
                className={`${DESIGN_TOKENS.components.button.secondary} w-full`}
              >
                Try Again
              </button>
            </div>
          </UnifiedCard>
        </div>
      </div>
    );
  }

  // 🎯 UNIFIED LOADING STATE: Story still generating or no segments yet
  if (isStoryLoading || story.status === 'generating' || !story.segments || story.segments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10">
          <UnifiedCard variant="enhanced" padding="large" className="text-center max-w-lg">
            <div className="animate-bounce text-6xl mb-4 block">✨</div>
            <h2 className="text-xl font-bold text-white mb-2">Your Story is Being Created</h2>
            <p className="text-white/70 mb-4">
              {story?.title ? `"${story.title}" is being crafted by AI...` : 'Loading your magical adventure...'}
            </p>
            
            {/* Live progress indicator */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm">Generating story text & choices</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-white/60 text-sm">Creating illustrations</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-2 mb-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            
            <p className="text-white/50 text-sm mb-4">This usually takes 15-30 seconds ⚡</p>
            <p className="text-white/40 text-xs">Page will refresh automatically when ready</p>
          </UnifiedCard>
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
    <div className="min-h-screen py-6 relative overflow-hidden">
      <FloatingElements />
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Story Header */}
          <div className="mb-6">
            <UnifiedCard variant="enhanced" className="transition-all duration-300 hover:border-amber-400/30">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white" style={{ fontFamily: DESIGN_TOKENS.fonts.heading }}>
                    {story.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <p className="text-amber-400 text-lg">
                      {story.genre} • {getDifficultyDisplay(story.age_group)}
                    </p>
                    {user && <CreditBalanceIndicator size="sm" />}
                  </div>
                </div>
        
                {/* Reading Controls */}
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  <div className="flex bg-white/5 border border-white/20 rounded-lg p-1">
                    <button 
                      onClick={() => handleFontSizeChange('small')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${fontSize === 'small' ? 'bg-amber-500 text-white shadow' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                      aria-label="Small font size"
                    >
                      A
                    </button>
                    <button 
                      onClick={() => handleFontSizeChange('medium')}
                      className={`px-3 py-1 rounded text-base font-medium transition-all ${fontSize === 'medium' ? 'bg-amber-500 text-white shadow' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                      aria-label="Medium font size"
                    >
                      A
                    </button>
                    <button 
                      onClick={() => handleFontSizeChange('large')}
                      className={`px-3 py-1 rounded text-lg font-medium transition-all ${fontSize === 'large' ? 'bg-amber-500 text-white shadow' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                      aria-label="Large font size"
                    >
                      A
                    </button>
                  </div>
                
                {/* Audio generation - Premium only */}
                {user?.subscription_tier !== 'free' && (story.audio_url || audioUrl ? (
                  <button 
                    onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                    className="glass-card text-white/80 hover:text-white border border-white/20 hover:border-amber-400/50 px-4 py-2 text-sm rounded-lg transition-all duration-300 flex items-center"
                    aria-label={showAudioPlayer ? "Hide audio player" : "Show audio player"}
                  >
                    {showAudioPlayer ? '🔇 Hide Audio' : '🔊 Show Audio'}
                  </button>
                ) : (
                  <button 
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                    className="fantasy-cta px-4 py-2 text-sm rounded-lg disabled:opacity-50 flex items-center"
                    aria-label="Generate audio narration"
                    title={`Premium feature - ${audioCreditsNeeded} credits (${totalWords} words)`}
                  >
                    {isGeneratingAudio ? '⏳ Generating...' : `🎵 Generate Audio (${audioCreditsNeeded} credits)`}
                  </button>
                ))}
                </div>
              </div>
            </UnifiedCard>
          </div>
      
      {/* Enhanced TTS Audio Player - Premium only */}
      {showAudioPlayer && user?.subscription_tier !== 'free' && (
        <div className="mb-6">
          <TTSPlayer 
            text={cleanedSegment?.content || ''}
            storyType={story.genre === 'Bedtime Story' ? 'bedtime' : 
                      story.genre === 'Adventure' ? 'adventure' : 'fantasy'}
            className="transform transition-all duration-300"
          />
        </div>
      )}
      
        {/* Story Content Card */}
        <UnifiedCard variant="enhanced" className="overflow-hidden mb-6 transition-all duration-300 hover:transform hover:scale-[1.01]">
          {/* Story Image - Show appropriate state based on image availability */}
          {cleanedSegment?.image_url ? (
            <div className="relative">
              <StoryImage 
                src={cleanedSegment.image_url} 
                alt={`Illustration for segment ${currentSegmentIndex + 1}`} 
                className="w-full h-64 md:h-80 object-cover"
                onImageLoad={() => {
                  console.log('🖼️ Parent: Image loaded');
                }}
                onImageError={() => console.log('Image failed to load')}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60"></div>
            </div>
          ) : cleanedSegment?.image_prompt ? (
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                <p className="text-white/60 text-sm">Creating illustration...</p>
                <p className="text-white/40 text-xs mt-2">This usually takes 10-30 seconds</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60"></div>
            </div>
          ) : (
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-white/60 text-sm">No illustration available</p>
                <p className="text-white/40 text-xs mt-2">This segment was created without image generation</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60"></div>
            </div>
          )}
          
          {/* Story Text Content */}
          <div className="p-6 md:p-8">
            {isGenerating ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400"></div>
                </div>
                <p className="text-white text-xl mb-2">
                  Creating your next story segment...
                </p>
                <p className="text-white/70">
                  Our AI is crafting your personalized adventure
                </p>
              </div>
            ) : cleanedSegment ? (
              <>
                <div 
                  className={`${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]} ${lineHeightClasses[fontSize as keyof typeof lineHeightClasses]} text-white mb-8 font-serif leading-relaxed text-shadow-sm`}
                >
                  {cleanedSegment.content}
                </div>
                
                {/* Check if this is the ending segment */}
                {cleanedSegment.is_end ? (
                  <div className="mt-8 text-center">
                    <UnifiedCard variant="enhanced" padding="large" className="mb-6">
                      <div className="text-6xl mb-4">🎉</div>
                      <h2 className="fantasy-heading text-3xl mb-4">Story Complete!</h2>
                      <p className="text-white/80 text-lg mb-4">
                        What an amazing adventure! Redirecting you to celebrate your story...
                      </p>
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
                      </div>
                    </UnifiedCard>
                  </div>
                ) : (
                  // Story Choices for non-ending segments
                  <div className="mt-8">
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
              <div className="text-center py-12">
                <p className="text-white text-xl mb-6">
                  Ready to begin your story adventure?
                </p>
                <button 
                  onClick={() => handleChoiceSelect('begin')}
                  disabled={isGeneratingSegment}
                  className="fantasy-cta px-8 py-3 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                  {isGeneratingSegment ? 'Starting...' : 'Begin Story'}
                </button>
              </div>
            )}
          </div>
        </UnifiedCard>
      
        {/* Story Progress */}
        {story.segments && story.segments.length > 0 && (
          <div className="mb-6">
            <UnifiedCard variant="glass" padding="medium">
              <StoryProgress
                totalSegments={story.segments.length}
                currentSegmentIndex={currentSegmentIndex}
                onSegmentClick={handleSegmentClick}
                isStoryComplete={cleanedSegment?.is_end === true || (cleanedSegment?.choices && cleanedSegment.choices.length === 0)}
              />
            </UnifiedCard>
          </div>
        )}
        
        {/* Story Metadata */}
        <UnifiedCard variant="glass" className="text-center">
          <p className="text-white/60 text-sm">
            Story ID: {story.id} • Created: {new Date(story.created_at).toLocaleDateString()}
          </p>
        </UnifiedCard>
        </div>
      </div>
    </div>
  );
};

export default StoryReaderPage;