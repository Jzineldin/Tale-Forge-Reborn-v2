  return (
    <PageLayout variant="story" maxWidth="md" noPadding>
      <div className="story-reader-container">
        {/* Compact Story Header with better visibility */}
        <CardLayout variant="default" padding="md" className="mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <TypographyLayout variant="section" as="h1" className="mb-1">
                  {story.title}
                </TypographyLayout>
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
        </CardLayout>

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
        <CardLayout variant="default" padding="md" className="overflow-hidden mb-4">
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
        </CardLayout>

        {/* Footer Info - Even smaller */}
        <div className="text-center">
          <TypographyLayout variant="caption" color="muted" align="center" className="text-[10px]">
            Created {new Date(story.created_at).toLocaleDateString()}
          </TypographyLayout>
        </div>

        {/* Story Completion Modal */}
        {showCompletionModal && story && (
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
                <h2 className="title-section mb-2">Story Complete!</h2>
                <h3 className="title-card text-amber-400 mb-1">
                  "{story.title}"
                </h3>
                <p className="text-body text-sm">
                  Finished {story.segments?.length || 0} chapters!
                </p>
              </div>

              <div>
                <div className="glass-card p-4 mb-4 bg-green-500/10 border-green-400/20">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📚</div>
                    <h3 className="title-card mb-1">Story saved!</h3>
                    <p className="text-body text-xs">You can revisit or share it anytime.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCurrentSegmentIndex(0);
                      setShowCompletionModal(false);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    <span>🔁</span>
                    <span>Read Again</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate(`/stories/${story.id}/complete`);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    <span>📤</span>
                    <span>Share Story</span>
                  </button>

                  <button
                    onClick={() => navigate('/create')}
                    className="btn btn-primary w-full"
                  >
                    Create New Story
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-amber-400">{story.segments?.length || 0}</p>
                    <p className="text-body text-xs">Chapters</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-400">
                      {Math.ceil((story.segments?.reduce((sum, seg) => sum + (seg.content?.split(' ').length || 0), 0) || 0) / 100)}
                    </p>
                    <p className="text-body text-xs">Credits</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-400">100%</p>
                    <p className="text-body text-xs">Done</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};