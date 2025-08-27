import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, X, Volume2, VolumeX, Headphones } from 'lucide-react';
import { TTSPlayer } from '@/components/molecules/TTSPlayer';
import { Button } from '@/components/ui/button';

interface StorySegment {
  id: string;
  segment_text: string;
  image_url?: string | null;
  audio_url?: string | null;
  chapter_number: number;
}

interface StoryPlayerProps {
  segments: StorySegment[];
  storyTitle: string;
  onClose: () => void;
  autoPlay?: boolean;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({
  segments,
  storyTitle,
  onClose,
  autoPlay = false
}) => {
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);
  const [showTTSPanel, setShowTTSPanel] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-advance when audio/TTS completes
  const handleAudioEnd = useCallback(() => {
    if (isAutoPlay && currentSegment < segments.length - 1) {
      setTimeout(() => {
        setCurrentSegment(prev => prev + 1);
      }, 1000); // Brief pause between segments
    } else {
      setIsPlaying(false);
    }
  }, [isAutoPlay, currentSegment, segments.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentSegment(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          setCurrentSegment(prev => Math.min(segments.length - 1, prev + 1));
          break;
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const goToSegment = (index: number) => {
    if (index >= 0 && index < segments.length) {
      setCurrentSegment(index);
      setIsPlaying(false); // Stop audio when manually navigating
    }
  };

  const currentSegmentData = segments[currentSegment];

  if (!currentSegmentData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">{storyTitle}</h1>
          <span className="text-sm text-white/70">
            Chapter {currentSegment + 1} of {segments.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`text-white hover:bg-white/10 ${isAutoPlay ? 'bg-purple-600/30' : ''}`}
          >
            {isAutoPlay ? '🔄 Auto Play ON' : '⏸️ Auto Play OFF'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTTSPanel(!showTTSPanel)}
            className="text-white hover:bg-white/10"
          >
            <Headphones className="w-4 h-4 mr-1" />
            TTS
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Story Content */}
        <div className="flex-1 flex flex-col">
          {/* Image Section */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 relative">
            {currentSegmentData.image_url ? (
              <img
                src={currentSegmentData.image_url}
                alt={`Chapter ${currentSegment + 1} illustration`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <div className="w-full max-w-2xl aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="text-6xl mb-4">📖</div>
                  <p className="text-lg">Chapter {currentSegment + 1}</p>
                  <p className="text-sm">Image not generated</p>
                </div>
              </div>
            )}

            {/* Navigation Overlays */}
            {currentSegment > 0 && (
              <button
                onClick={() => goToSegment(currentSegment - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {currentSegment < segments.length - 1 && (
              <button
                onClick={() => goToSegment(currentSegment + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Text Section */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 border-t border-white/10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-amber-400">
                  Chapter {currentSegment + 1}
                </h2>
                
                {/* Audio Controls */}
                <div className="flex items-center gap-2">
                  {currentSegmentData.audio_url ? (
                    <div className="flex items-center gap-2">
                      <audio
                        ref={audioRef}
                        src={currentSegmentData.audio_url}
                        onEnded={handleAudioEnd}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (audioRef.current) {
                            if (isPlaying) {
                              audioRef.current.pause();
                            } else {
                              audioRef.current.play();
                            }
                          }
                        }}
                        className="text-white hover:bg-white/10"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                        ✓ Audio Available
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-white/50">
                      No audio generated
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-lg text-white leading-relaxed">
                {currentSegmentData.segment_text}
              </p>
            </div>
          </div>
        </div>

        {/* TTS Panel (Slide-in from right) */}
        {showTTSPanel && (
          <div className="w-96 bg-gradient-to-b from-slate-800 to-slate-900 border-l border-white/10 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-2">Generate Audio</h3>
              <p className="text-sm text-white/70">
                Generate AI narration for this chapter
              </p>
            </div>
            
            <TTSPlayer
              text={currentSegmentData.segment_text}
              storyType="fantasy"
              className="bg-slate-800/50 border border-white/10"
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-t border-white/10 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Segment Dots */}
          <div className="flex items-center gap-2">
            {segments.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSegment(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSegment
                    ? 'bg-amber-400 scale-125'
                    : index < currentSegment
                    ? 'bg-green-400'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                title={`Chapter ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress */}
          <div className="text-sm text-white/70">
            {currentSegment + 1} / {segments.length}
            {currentSegment === segments.length - 1 && (
              <span className="ml-2 text-amber-400">✨ The End</span>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToSegment(currentSegment - 1)}
              disabled={currentSegment === 0}
              className="text-white hover:bg-white/10 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToSegment(currentSegment + 1)}
              disabled={currentSegment === segments.length - 1}
              className="text-white hover:bg-white/10 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;