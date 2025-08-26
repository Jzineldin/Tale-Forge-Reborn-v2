// Tale Forge - Advanced TTS Player with Character Voices and Emotional Control
// 2025 Production-Ready Component with NVIDIA RIVA Integration

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Mic, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TTSPlayerProps {
  text: string;
  storyType?: 'bedtime' | 'adventure' | 'fantasy';
  className?: string;
}

interface TTSMetadata {
  character: string;
  characterDescription: string;
  storyType: string;
  emotion: string;
  ssmlEnhanced: boolean;
  voice: string;
  textLength: number;
}


const CHARACTER_OPTIONS = [
  { value: 'narrator', label: 'Narrator', emoji: '📖', description: 'Warm storytelling voice' },
  { value: 'child_protagonist', label: 'Child Hero', emoji: '👶', description: 'Young, curious voice' },
  { value: 'wise_character', label: 'Wise Guide', emoji: '🧙‍♂️', description: 'Deep, wise mentor' },
  { value: 'magical_being', label: 'Magical Creature', emoji: '🧚‍♀️', description: 'Ethereal, magical voice' },
  { value: 'villain', label: 'Villain', emoji: '🦹‍♂️', description: 'Dark, menacing voice' }
];

const EMOTION_OPTIONS = {
  bedtime: [
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'gentle', label: 'Gentle', emoji: '🤗' },
    { value: 'whisper', label: 'Whisper', emoji: '🤫' }
  ],
  adventure: [
    { value: 'excited', label: 'Excited', emoji: '🤩' },
    { value: 'suspenseful', label: 'Suspenseful', emoji: '😰' },
    { value: 'dramatic', label: 'Dramatic', emoji: '🎭' }
  ],
  fantasy: [
    { value: 'magical', label: 'Magical', emoji: '✨' },
    { value: 'mysterious', label: 'Mysterious', emoji: '🔮' },
    { value: 'heroic', label: 'Heroic', emoji: '⚔️' }
  ]
};

export const TTSPlayer: React.FC<TTSPlayerProps> = ({ 
  text, 
  storyType = 'fantasy', 
  className = '' 
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState('narrator');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TTSMetadata | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Update audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const generateTTS = useCallback(async () => {
    if (!text?.trim()) return;

    setIsLoading(true);
    
    try {
      console.log('🎙️ Generating TTS with NVIDIA RIVA...');
      
      const { data, error } = await supabase.functions.invoke('generate-tts-audio', {
        body: {
          text: text.trim(),
          storyType,
          emotion: selectedEmotion || undefined,
          characterType: selectedCharacter,
          ssmlEnhanced: true
        }
      });

      if (error) throw error;

      if (data.success && data.audio) {
        // Convert base64 to audio URL
        const audioBytes = atob(data.audio.data);
        const audioArray = new Uint8Array(audioBytes.length);
        for (let i = 0; i < audioBytes.length; i++) {
          audioArray[i] = audioBytes.charCodeAt(i);
        }
        
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const newAudioUrl = URL.createObjectURL(audioBlob);
        
        // Clean up previous URL
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        setAudioUrl(newAudioUrl);
        setMetadata(data.metadata);
        
        console.log('✅ TTS generated successfully:', data.metadata);
      } else if (data.fallback) {
        // Use browser speech synthesis as fallback
        console.log('🔄 Using browser TTS fallback');
        useBrowserTTS();
      }
    } catch (error) {
      console.error('❌ TTS generation failed:', error);
      // Fallback to browser TTS
      useBrowserTTS();
    } finally {
      setIsLoading(false);
    }
  }, [text, storyType, selectedCharacter, selectedEmotion, supabase, audioUrl]);

  const useBrowserTTS = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      console.error('❌ Browser does not support speech synthesis');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = selectedCharacter === 'child_protagonist' ? 1.1 : 
                     selectedCharacter === 'wise_character' ? 0.9 : 1.0;
    utterance.pitch = selectedCharacter === 'child_protagonist' ? 1.2 : 
                      selectedCharacter === 'wise_character' ? 0.8 : 1.0;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  }, [text, selectedCharacter]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    
    if (!audioUrl) {
      generateTTS();
      return;
    }
    
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
  }, [audioUrl, isPlaying, generateTTS]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const resetAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectedCharacterInfo = CHARACTER_OPTIONS.find(char => char.value === selectedCharacter);
  const availableEmotions = EMOTION_OPTIONS[storyType] || [];

  return (
    <div className={`bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 ${className}`}>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
      
      {/* Main Controls */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="flex items-center justify-center w-12 h-12 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-full transition-colors"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700">
              {selectedCharacterInfo?.emoji} {selectedCharacterInfo?.label}
            </span>
            {metadata && (
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                NVIDIA RIVA
              </span>
            )}
          </div>
          
          {duration > 0 && (
            <>
              <div className="w-full bg-amber-200 rounded-full h-2 cursor-pointer"
                   onClick={(e) => {
                     const audio = audioRef.current;
                     if (audio) {
                       const rect = e.currentTarget.getBoundingClientRect();
                       const percent = (e.clientX - rect.left) / rect.width;
                       audio.currentTime = percent * duration;
                     }
                   }}>
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <button
            onClick={resetAudio}
            className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
            disabled={!audioUrl}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <Wand2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div className="border-t border-amber-200 pt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mic className="w-4 h-4 inline mr-1" />
              Character Voice
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CHARACTER_OPTIONS.map((character) => (
                <button
                  key={character.value}
                  onClick={() => setSelectedCharacter(character.value)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    selectedCharacter === character.value
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div>{character.emoji} {character.label}</div>
                  <div className="text-xs opacity-75">{character.description}</div>
                </button>
              ))}
            </div>
          </div>

          {availableEmotions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emotion ({storyType} style)
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedEmotion('')}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedEmotion === ''
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                  }`}
                >
                  Default
                </button>
                {availableEmotions.map((emotion) => (
                  <button
                    key={emotion.value}
                    onClick={() => setSelectedEmotion(emotion.value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedEmotion === emotion.value
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    {emotion.emoji} {emotion.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={generateTTS}
            disabled={isLoading}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate New Audio'}
          </button>
        </div>
      )}

      {/* Metadata Display */}
      {metadata && (
        <div className="mt-3 p-2 bg-amber-100 rounded-lg">
          <div className="text-xs text-amber-700">
            <strong>Voice:</strong> {metadata.characterDescription} • 
            <strong> Style:</strong> {metadata.storyType} • 
            <strong> Emotion:</strong> {metadata.emotion} • 
            <strong> Enhanced:</strong> {metadata.ssmlEnhanced ? '✅ SSML' : '❌'}
          </div>
        </div>
      )}
    </div>
  );
};