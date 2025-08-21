import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import StoryImage from '@/components/atoms/StoryImage';
import StoryChoices from '@/components/molecules/StoryChoices';
import StoryProgress from '@/components/molecules/StoryProgress';
import AudioPlayer from '@/components/molecules/AudioPlayer';
import { useStory, useGenerateStorySegment, useGenerateStoryEnding, useGenerateAudio, useRegenerateImage } from '@/utils/performance.tsx';
import { LoadingState, ErrorState } from '@/utils/performance.tsx';

const StoryReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [fontSize, setFontSize] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  
  // Get story data
  const { data: story, isLoading: isStoryLoading, error: storyError } = useStory(id || null);
  
  // AI service hooks
  const { mutate: generateSegment, isLoading: isGeneratingSegment } = useGenerateStorySegment();
  const { mutate: generateEnding, isLoading: isGeneratingEnding } = useGenerateStoryEnding();
  const { mutate: generateAudio, isLoading: isGeneratingAudio } = useGenerateAudio();
  const { mutate: regenerateImage, isLoading: isRegeneratingImage } = useRegenerateImage();
  
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
    
    // Find the choice index based on ID
    const currentSegment = story.segments?.[currentSegmentIndex];
    const choiceIndex = currentSegment?.choices?.findIndex((choice: any) => choice.id === choiceId) ?? -1;
    
    if (choiceIndex === -1) {
      console.error('Choice not found');
      setIsGenerating(false);
      return;
    }
    
    generateSegment(
      { storyId: story.id, choiceIndex },
      {
        onSuccess: (data) => {
          // In a real app, we would update the story state with the new segment
          // For now, we'll just simulate moving to the next segment
          setCurrentSegmentIndex(currentSegmentIndex + 1);
          setIsGenerating(false);
        },
        onError: (error) => {
          console.error('Error generating segment:', error);
          setIsGenerating(false);
        }
      }
    );
  };
  
  // Handle story ending
  const handleStoryEnding = () => {
    if (!story) return;
    
    setIsGenerating(true);
    
    generateEnding(
      { storyId: story.id },
      {
        onSuccess: (data) => {
          // In a real app, we would update the story state with the ending
          // For now, we'll just simulate moving to the ending
          setCurrentSegmentIndex(currentSegmentIndex + 1);
          setIsGenerating(false);
        },
        onError: (error) => {
          console.error('Error generating ending:', error);
          setIsGenerating(false);
        }
      }
    );
  };
  
  // Handle audio generation
  const handleGenerateAudio = () => {
    if (!story) return;
    
    generateAudio(
      { storyId: story.id },
      {
        onSuccess: (data) => {
          setAudioUrl(data.audioUrl);
          setShowAudioPlayer(true);
        },
        onError: (error) => {
          console.error('Error generating audio:', error);
        }
      }
    );
  };
  
  // Handle image regeneration
  const handleRegenerateImage = (segmentId: string, imagePrompt: string) => {
    regenerateImage(
      { segmentId, imagePrompt },
      {
        onSuccess: (data) => {
          // In a real app, we would update the segment with the new image
          console.log('Image regenerated:', data);
        },
        onError: (error) => {
          console.error('Error regenerating image:', error);
        }
      }
    );
  };
  
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

  // Loading state
  if (isStoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-enhanced p-8 rounded-2xl text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading your story...</h2>
          <p className="text-white/70">Fetching your magical adventure</p>
        </div>
      </div>
    );
  }

  // Error state
  if (storyError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-enhanced p-8 rounded-2xl text-center max-w-md">
          <span className="text-6xl mb-4 block">😞</span>
          <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-white/70 mb-4">Failed to load your story</p>
          <button 
            onClick={() => window.location.reload()}
            className="fantasy-cta px-4 py-2 rounded-lg"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-enhanced p-8 rounded-2xl text-center max-w-md">
          <span className="text-6xl mb-4 block">📚</span>
          <h2 className="text-xl font-bold text-white mb-2">Story not found</h2>
          <p className="text-white/70 mb-4">This story doesn't exist or you don't have permission to view it</p>
          <button 
            onClick={() => window.history.back()}
            className="fantasy-cta px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Story is still generating
  if (story.status === 'generating') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-enhanced p-8 rounded-2xl text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Creating Your Story ✨</h2>
          <p className="text-white/70 mb-4">Our AI is crafting your personalized adventure...</p>
          <p className="text-white/50 text-sm">This usually takes 30-60 seconds</p>
          <div className="mt-4 w-full bg-white/20 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Story generation failed
  if (story.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-enhanced p-8 rounded-2xl text-center max-w-md">
          <span className="text-6xl mb-4 block">🔧</span>
          <h2 className="text-xl font-bold text-white mb-2">Story Generation Failed</h2>
          <p className="text-white/70 mb-4">
            {story.error_message || 'Something went wrong while creating your story'}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.history.back()}
              className="fantasy-cta px-4 py-2 rounded-lg w-full"
            >
              Create a New Story
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="glass-card text-white border border-white/20 px-4 py-2 rounded-lg w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log the story data to see what we're getting
  console.log('🔍 Story data in reader:', {
    storyId: story?.id,
    title: story?.title,
    hasSegments: !!story?.segments,
    segmentCount: story?.segments?.length || 0,
    segments: story?.segments,
    hasContent: story?.has_content,
    segmentCountMeta: story?.segment_count,
    status: story?.status,
    fullStory: story
  });

  // Story has no content yet - show live loading state
  if (!story.segments || story.segments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-enhanced p-8 rounded-2xl text-center max-w-lg">
          <div className="animate-bounce text-6xl mb-4 block">✨</div>
          <h2 className="text-xl font-bold text-white mb-2">Creating Your Magical Story</h2>
          <p className="text-white/70 mb-4">Your story "{story.title}" is being crafted by our AI...</p>
          
          {/* Live progress indicator */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">Generating story text</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <span className="text-white/60 text-sm">Creating illustrations</span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '45%' }}></div>
          </div>
          
          <p className="text-white/50 text-sm mb-4">This usually takes 30-60 seconds</p>
          <p className="text-white/40 text-xs">The page will automatically update when ready ⚡</p>
        </div>
      </div>
    );
  }
  
  // Get current segment
  const currentSegment = story.segments?.[currentSegmentIndex] || null;
  
  // Prepare choices for the StoryChoices component
  const formattedChoices = currentSegment?.choices?.map((choice: any, index: number) => ({
    id: choice.id || `choice-${index}`,
    text: choice.text
  })) || [];
  
  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Story Header */}
        <div className="mb-6">
          <div className="glass-enhanced p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="fantasy-heading text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                  {story.title}
                </h1>
                <p className="text-amber-400 text-lg">
                  {story.genre} • Age {story.age_group}
                </p>
              </div>
        
              {/* Reading Controls */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <div className="flex glass-card rounded-lg p-1 border border-white/20">
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
                
                {story.audio_url || audioUrl ? (
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
                  >
                    {isGeneratingAudio ? '⏳ Generating...' : '🎵 Generate Audio'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      
      {/* Audio Player */}
      {showAudioPlayer && (story.audio_url || audioUrl) && (
        <div className="mb-6">
          <AudioPlayer 
            audioUrl={audioUrl || story.audio_url || ''} 
            onEnded={() => console.log('Audio finished playing')}
          />
        </div>
      )}
      
        {/* Story Content Card */}
        <div className="glass-enhanced rounded-2xl overflow-hidden mb-6 transition-all duration-300 hover:transform hover:scale-[1.01]">
          {/* Story Image - Show placeholder while loading */}
          {currentSegment?.image_url ? (
            <div className="relative">
              <StoryImage 
                src={currentSegment.image_url} 
                alt={`Illustration for segment ${currentSegmentIndex + 1}`} 
                className="w-full h-64 md:h-80 object-cover"
                onImageError={() => console.log('Image failed to load')}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/60"></div>
            </div>
          ) : (
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                <p className="text-white/60 text-sm">Creating illustration...</p>
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
            ) : currentSegment ? (
              <>
                <div 
                  className={`${fontSizeClasses[fontSize as keyof typeof fontSizeClasses]} ${lineHeightClasses[fontSize as keyof typeof lineHeightClasses]} text-white mb-8 font-serif leading-relaxed text-shadow-sm`}
                >
                  {currentSegment.content}
                </div>
                
                {/* Story Choices */}
                <div className="mt-8">
                  <StoryChoices
                    choices={formattedChoices}
                    onSelect={handleChoiceSelect}
                    disabled={isGeneratingSegment}
                    loading={isGeneratingSegment}
                  />
                </div>
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
        </div>
      
        {/* Story Progress */}
        {story.segments && story.segments.length > 0 && (
          <div className="mb-6">
            <div className="glass-card p-4 rounded-lg">
              <StoryProgress
                totalSegments={story.segments.length}
                currentSegmentIndex={currentSegmentIndex}
                onSegmentClick={handleSegmentClick}
              />
            </div>
          </div>
        )}
        
        {/* Story Metadata */}
        <div className="glass-card p-4 rounded-lg text-center">
          <p className="text-white/60 text-sm">
            Story ID: {story.id} • Created: {new Date(story.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoryReaderPage;