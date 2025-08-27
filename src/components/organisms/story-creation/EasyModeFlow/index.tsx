import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateStory } from '@/utils/storyHooks';
import DifficultySelector from './DifficultySelector';
import GenreSelector from './GenreSelector';
import CharacterSetup from './CharacterSetup';
import { convertToBackendFormat } from './utils';
import { Sparkles, Loader2 } from 'lucide-react';
import { PageLayout, CardLayout, TypographyLayout } from '@/components/layout';

export interface EasyModeData {
  difficulty: 'short' | 'medium' | 'long' | null;
  genre: string | null;
  characterName: string;
  characterTraits: string[];
  storySeed: string;
}

interface EasyModeFlowProps {
  onBack?: () => void;
}

const EasyModeFlow: React.FC<EasyModeFlowProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { mutate: createStory, isLoading } = useCreateStory();
  
  const [step, setStep] = useState(1);
  const [data, setData] = useState<EasyModeData>({
    difficulty: null,
    genre: null,
    characterName: '',
    characterTraits: [],
    storySeed: ''
  });

  const handleNext = () => {
    // Log current step completion
    console.log(`📝 [EASY MODE] Completed Step ${step}:`, {
      step,
      selection: step === 1 ? data.difficulty : step === 2 ? data.genre : data.characterName,
      currentData: data
    });
    
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Go back to mode selection
      if (onBack) {
        onBack();
      } else {
        navigate('/create');
      }
    }
  };

  const handleCreateStory = async () => {
    if (!data.difficulty || !data.genre) {
      console.error('❌ [EASY MODE] Missing required fields');
      return;
    }

    console.log('🎯 [EASY MODE] Final Story Creation - User Selections:', {
      mode: 'Easy Mode',
      difficulty: data.difficulty,
      genre: data.genre,
      characterName: data.characterName,
      characterTraits: data.characterTraits,
      storySeed: data.storySeed,
      wordCount: data.difficulty === 'short' ? '40-80 words' : data.difficulty === 'medium' ? '100-150 words' : '160-200 words',
      targetAge: data.difficulty === 'short' ? 'Ages 3-6' : data.difficulty === 'medium' ? 'Ages 6-9' : 'Ages 8-12'
    });

    const storyData = convertToBackendFormat(data);
    
    console.log('🚀 [EASY MODE] Converted Backend Format:', storyData);
    
    createStory(storyData, {
      onSuccess: (story) => {
        console.log('Story created successfully:', story);
        navigate(`/stories/${story.id}`);
      },
      onError: (error: any) => {
        console.error('Failed to create story:', error);
        // TODO: Show error toast
        alert(`Failed to create story: ${error.message || 'Unknown error'}`);
      }
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return data.difficulty !== null;
      case 2:
        return data.genre !== null;
      case 3:
        return data.characterName.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="text-9xl">✨</div>
        </div>
        <div className="relative z-10">
          <h1 className="title-hero mb-4 animate-fade-in">
            🎭 Easy Story Magic 🎭
          </h1>
          <p className="text-body text-lg max-w-2xl mx-auto text-gray-300">
            Create magical personalized stories in just 3 simple steps - no writing experience needed!
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-amber-400 text-sm font-medium">⚡ AI-Powered</span>
            <span className="text-gray-500">•</span>
            <span className="text-blue-400 text-sm font-medium">🎯 Personalized</span>
            <span className="text-gray-500">•</span>
            <span className="text-purple-400 text-sm font-medium">✨ Magical</span>
          </div>
        </div>
      </div>

      {/* Main Container - Single glass-card for everything */}
      <div className="glass-card" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)' }}>
        {/* Progress Indicator */}
        <div className="pb-6 mb-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center relative
                      font-bold text-lg transition-all duration-500 transform
                      ${step >= stepNum 
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl shadow-amber-600/20 scale-105' 
                        : step === stepNum
                        ? 'glass-enhanced text-white/80 ring-2 ring-amber-500 ring-opacity-50'
                        : 'glass-enhanced text-white/40'
                      }
                    `}
                  >
                    {step > stepNum ? (
                      <span className="text-xl">✨</span>
                    ) : (
                      <span className="text-lg">{stepNum}</span>
                    )}
                    
                  </div>
                  
                  <TypographyLayout 
                    variant="body" 
                    className={`mt-3 text-body-sm font-semibold transition-all duration-300 ${
                      step > stepNum 
                        ? 'text-amber-500' 
                        : step === stepNum
                        ? 'text-amber-400'
                        : 'text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {stepNum === 1 && '📚 Length'}
                      {stepNum === 2 && '🎭 Genre'} 
                      {stepNum === 3 && '⭐ Character'}
                      {step > stepNum && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                  </TypographyLayout>
                </div>
                {stepNum < 3 && (
                  <div className={`
                    flex-1 h-2 mx-4 rounded-full transition-all duration-700 relative overflow-hidden
                    ${step > stepNum ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gray-700'}
                  `}>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

          {/* Step Content */}
        <div className="px-4">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="glass-enhanced p-8 flex flex-col items-center gap-4 max-w-md">
                <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                <TypographyLayout variant="section" as="h3" align="center">
                  Creating Your Story...
                </TypographyLayout>
                <TypographyLayout variant="body" color="secondary" align="center">
                  This may take up to 30 seconds
                </TypographyLayout>
                <div className="mt-4 space-y-2">
                  <TypographyLayout variant="body" className="text-body-sm text-white/70">✨ Crafting narrative...</TypographyLayout>
                  <TypographyLayout variant="body" className="text-body-sm text-white/70">🎨 Generating illustrations...</TypographyLayout>
                  <TypographyLayout variant="body" className="text-body-sm text-white/70">🎯 Personalizing for {data.characterName || 'your child'}...</TypographyLayout>
                </div>
              </div>
            </div>
          )}

          {/* Step Components - with relative positioning */}
          <div className="relative z-10">
            <div className={`transition-all duration-700 transform ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'}`}>
              {step === 1 && (
                <DifficultySelector
                  selected={data.difficulty}
                  onSelect={(difficulty) => {
                    console.log('📏 [EASY MODE] Story Length Selected:', {
                      selection: difficulty,
                      wordRange: difficulty === 'short' ? '40-80 words' : difficulty === 'medium' ? '100-150 words' : '160-200 words',
                      targetAge: difficulty === 'short' ? 'Ages 3-6' : difficulty === 'medium' ? 'Ages 6-9' : 'Ages 8-12'
                    });
                    setData({ ...data, difficulty });
                  }}
                />
              )}
            </div>
            
            <div className={`transition-all duration-700 transform ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'}`}>
              {step === 2 && (
                <GenreSelector
                  selected={data.genre}
                  onSelect={(genre) => {
                    console.log('🎭 [EASY MODE] Genre Selected:', {
                      selection: genre,
                      themes: `Themes suitable for ${data.difficulty || 'medium'} stories`
                    });
                    setData({ ...data, genre });
                  }}
                />
              )}
            </div>
            
            <div className={`transition-all duration-700 transform ${step === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'}`}>
              {step === 3 && (
                <CharacterSetup
                  characterName={data.characterName}
                  characterTraits={data.characterTraits}
                  storySeed={data.storySeed}
                  genre={data.genre || ''}
                  difficulty={data.difficulty}
                  onNameChange={(characterName) => {
                    console.log('👤 [EASY MODE] Character Name Set:', {
                      name: characterName,
                      personalizedStory: `Story will be personalized for "${characterName}"`
                    });
                    setData({ ...data, characterName });
                  }}
                  onTraitsChange={(characterTraits) => {
                    console.log('✨ [EASY MODE] Character Traits Updated:', {
                      traits: characterTraits,
                      count: characterTraits.length
                    });
                    setData({ ...data, characterTraits });
                  }}
                  onSeedChange={(storySeed) => {
                    console.log('🌱 [EASY MODE] Story Seed Selected:', {
                      seed: storySeed,
                      genre: data.genre,
                      difficulty: data.difficulty
                    });
                    setData({ ...data, storySeed });
                  }}
                />
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/10">
            <button
              onClick={handleBack}
              className="group relative px-8 py-4 rounded-2xl border-2 border-white/20 bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 text-white font-semibold transition-all duration-300 hover:scale-105 hover:border-white/30 disabled:opacity-50"
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <span className="group-hover:-translate-x-1 transition-transform duration-200 text-xl">←</span>
                <span>
                  {step === 1 ? '🚪 Exit Setup' : '↩️ Previous Step'}
                </span>
              </div>
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className={`group relative px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  isStepValid() 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xl shadow-amber-600/20 hover:scale-105 hover:shadow-2xl' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                disabled={!isStepValid() || isLoading}
              >
                <div className="flex items-center gap-3">
                  <span>
                    {step === 1 && '🎭 Choose Genre'}
                    {step === 2 && '⭐ Add Character'}
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200 text-xl">→</span>
                </div>
                
                {/* Pulse effect for valid state */}
                {isStepValid() && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-15"></div>
                )}
              </button>
            ) : (
              <button
                onClick={handleCreateStory}
                className={`group relative px-12 py-5 rounded-2xl font-black text-xl transition-all duration-500 overflow-hidden ${
                  isStepValid() 
                    ? 'bg-gradient-to-r from-purple-700 via-pink-700 to-red-700 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white shadow-2xl shadow-purple-700/20 hover:scale-110 hover:shadow-purple-600/30' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                disabled={!isStepValid() || isLoading}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative flex items-center gap-3">
                  <Sparkles className="w-7 h-7 transition-transform duration-300" />
                  <span>🌟 CREATE MY STORY! 🌟</span>
                </div>

              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EasyModeFlow;