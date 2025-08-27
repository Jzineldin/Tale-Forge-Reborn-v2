import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import StoryChoices from '@/components/molecules/StoryChoices';
import StoryProgress from '@/components/molecules/StoryProgress';
import { TTSPlayer } from '@/components/molecules/TTSPlayer';
import StoryReaderHeader from '@/components/molecules/StoryReaderHeader';
import StorySegmentDisplay from '@/components/molecules/StorySegmentDisplay';
import StorySettingsPanel from '@/components/molecules/StorySettingsPanel';
import { useGenerateStorySegment, useGenerateStoryEnding } from '@/utils/performance.tsx';
import { PageLayout, CardLayout, TypographyLayout } from '@/components/layout';
import { Sparkles } from 'lucide-react';
import { useStoryReader } from '@/hooks/useStoryReader';
import { useStoryAudio } from '@/hooks/useStoryAudio';
import { useStoryPolling } from '@/hooks/useStoryPolling';
import { useStoryBackground } from '@/hooks/useStoryBackground';

const StoryReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Custom hooks for story functionality
  const {
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
  } = useStoryReader({ storyId: id || null });

  const {
    segmentAudioUrls,
    setSegmentAudioUrls,
    showAudioPlayer,
    setShowAudioPlayer,
    generatingAudioForSegment,
    generateAudioForSegment
  } = useStoryAudio({ storyId: id || null });

  // Background and polling hooks
  useStoryBackground();
  useStoryPolling({ story, refetchStory });

  const generateStorySegmentMutation = useGenerateStorySegment();
  const generateStoryEndingMutation = useGenerateStoryEnding();

  if (!user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <TypographyLayout variant="section" className="text-white">
            Please log in to read stories.
          </TypographyLayout>
        </div>
      </PageLayout>
    );
  }

  if (isStoryLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <TypographyLayout variant="section" className="text-white">
              Loading your story...
            </TypographyLayout>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (storyError || !story) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <TypographyLayout variant="section" className="text-red-400 mb-4">
              Story not found or failed to load
            </TypographyLayout>
            <button
              onClick={() => navigate('/stories')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Back to Stories
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const currentSegment = story.segments?.[currentSegmentIndex];
  const isLastSegment = currentSegmentIndex >= (story.segments?.length || 0) - 1;
  const hasNextSegment = currentSegmentIndex < (story.segments?.length || 0) - 1;

  const handleNext = () => {
    if (hasNextSegment) {
      setCurrentSegmentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
    }
  };

  const handleGenerateSegment = async () => {
    if (!story || isGenerating) return;

    setIsGenerating(true);
    try {
      await generateStorySegmentMutation.mutateAsync({
        storyId: story.id,
        segmentIndex: currentSegmentIndex + 1
      });
      await refetchStory();
    } catch (error) {
      console.error('Failed to generate segment:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateEnding = async () => {
    if (!story || isGenerating) return;

    setIsGenerating(true);
    try {
      await generateStoryEndingMutation.mutateAsync({
        storyId: story.id
      });
      await refetchStory();
    } catch (error) {
      console.error('Failed to generate ending:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageLayout>
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <StoryReaderHeader
            story={story}
            onBack={() => navigate('/stories')}
            onSettings={() => setShowSettings(true)}
          />

          {/* Progress Bar */}
          <StoryProgress
            currentSegment={currentSegmentIndex}
            totalSegments={story.segments?.length || 0}
            className="mb-8"
          />

          {/* Main Story Content */}
          <CardLayout className="bg-slate-900/50 backdrop-blur-lg border-white/10">
            <div className="p-8">
              {currentSegment ? (
                <StorySegmentDisplay
                  segment={currentSegment}
                  segmentIndex={currentSegmentIndex}
                  fontSize={fontSize}
                  hasAudio={!!segmentAudioUrls[currentSegmentIndex]}
                  isGeneratingAudio={generatingAudioForSegment === currentSegmentIndex}
                  onGenerateAudio={generateAudioForSegment}
                  onPlayAudio={() => setShowAudioPlayer(true)}
                />
              ) : (
                <div className="text-center py-12">
                  <TypographyLayout variant="section" className="text-white mb-4">
                    Story is still being generated...
                  </TypographyLayout>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              )}

              {/* Story Choices */}
              {currentSegment?.choices && currentSegment.choices.length > 0 && (
                <div className="mt-8">
                  <StoryChoices
                    choices={currentSegment.choices}
                    onChoice={(choiceIndex) => {
                      // Handle choice selection logic here
                      console.log('Choice selected:', choiceIndex);
                    }}
                  />
                </div>
              )}
            </div>
          </CardLayout>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentSegmentIndex === 0}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Previous
            </button>

            <div className="text-white/60 text-center">
              Chapter {currentSegmentIndex + 1} of {story.segments?.length || '?'}
            </div>

            {hasNextSegment ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Next
              </button>
            ) : (
              <div className="space-x-4">
                {!isLastSegment && (
                  <button
                    onClick={handleGenerateSegment}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGenerating ? 'Generating...' : 'Continue Story'}
                  </button>
                )}
                
                <button
                  onClick={handleGenerateEnding}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'End Story'}
                </button>
              </div>
            )}
          </div>

          {/* Story Completion Stats */}
          {isLastSegment && (
            <CardLayout className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-lg border-purple-500/30">
              <div className="p-6 text-center">
                <TypographyLayout variant="section" className="text-white text-2xl font-bold mb-4">
                  🎉 Story Complete! 🎉
                </TypographyLayout>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-2xl font-bold text-white">{story.segments?.length || 0}</p>
                    <p className="text-white/60 text-sm">Chapters</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{audioCreditsNeeded}</p>
                    <p className="text-white/60 text-sm">Credits</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-400">100%</p>
                    <p className="text-white/60 text-sm">Complete</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => setCurrentSegmentIndex(0)}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    Read Again
                  </button>
                  
                  <button
                    onClick={() => navigate('/create')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors"
                  >
                    Create New Story
                  </button>
                </div>
              </div>
            </CardLayout>
          )}
        </div>
      </PageLayout>

      {/* Settings Panel */}
      {showSettings && (
        <StorySettingsPanel
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Audio Player */}
      {showAudioPlayer && segmentAudioUrls[currentSegmentIndex] && (
        <TTSPlayer
          audioUrl={segmentAudioUrls[currentSegmentIndex]}
          onClose={() => setShowAudioPlayer(false)}
        />
      )}
    </div>
  );
};

export default StoryReaderPage;