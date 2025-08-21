import React, { useState, useRef, useEffect } from 'react';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

interface AudioPlayerProps {
  audioUrl: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  onPlay,
  onPause,
  onEnded,
  className = ''
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleLoad = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('canplay', handleLoad);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('canplay', handleLoad);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setHasError(true);
      });
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (hasError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <Text variant="p" color="danger" className="text-center">
          Failed to load audio. Please try again later.
        </Text>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        aria-label="Story narration audio player"
      />
      
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <Text variant="h3" weight="semibold">
            Audio Narration
          </Text>
          <Button
            variant="secondary"
            size="small"
            onClick={togglePlayPause}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading
              </span>
            ) : isPlaying ? (
              '⏸️ Pause'
            ) : (
              '▶️ Play'
            )}
          </Button>
        </div>
        
        {!isLoading && (
          <>
            <div className="flex items-center space-x-3">
              <Text variant="span" color="secondary" className="text-sm">
                {formatTime(currentTime)}
              </Text>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-label="Seek audio position"
              />
              <Text variant="span" color="secondary" className="text-sm">
                {formatTime(duration)}
              </Text>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;