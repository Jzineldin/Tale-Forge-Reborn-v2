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
      console.error('Missing required fields');
      return;
    }

    const storyData = convertToBackendFormat(data);
    
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
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="animate-pulse text-9xl">✨</div>
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

      {/* Progress Indicator */}
      <div className="glass-card mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center relative
                      font-bold text-lg transition-all duration-500 transform
                      ${step >= stepNum 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30 scale-110' 
                        : step === stepNum
                        ? 'glass-enhanced text-white/80 ring-2 ring-amber-400 ring-opacity-50 animate-pulse'
                        : 'glass-enhanced text-white/40'
                      }
                    `}
                  >
                    {step > stepNum ? (
                      <span className="animate-bounce text-xl">✨</span>
                    ) : (
                      <span className="text-lg">{stepNum}</span>
                    )}
                    
                    {/* Celebration sparkles for completed steps */}
                    {step > stepNum && (
                      <div className="absolute inset-0 animate-ping">
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-20"></div>
                      </div>
                    )}
                  </div>
                  
                  <TypographyLayout 
                    variant="body" 
                    className={`mt-3 text-body-sm font-semibold transition-all duration-300 ${
                      step > stepNum 
                        ? 'text-amber-400' 
                        : step === stepNum
                        ? 'text-amber-300 animate-pulse'
                        : 'text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {stepNum === 1 && '📚 Length'}
                      {stepNum === 2 && '🎭 Genre'} 
                      {stepNum === 3 && '⭐ Character'}
                      {step > stepNum && (
                        <span className="text-xs animate-bounce">✓</span>
                      )}
                    </div>
                  </TypographyLayout>
                </div>
                {stepNum < 3 && (
                  <div className={`
                    flex-1 h-2 mx-4 rounded-full transition-all duration-700 relative overflow-hidden
                    ${step > stepNum ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-700'}
                  `}>
                    {step > stepNum && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div 
          className="rounded-3xl p-8 mb-8 shadow-2xl border backdrop-blur-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
            borderColor: 'rgba(255,255,255,0.3)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="glass-enhanced p-8 flex flex-col items-center gap-4 max-w-md">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
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

          {/* Step Components */}
          <div className="min-h-[400px]">
            {step === 1 && (
              <DifficultySelector
                selected={data.difficulty}
                onSelect={(difficulty) => setData({ ...data, difficulty })}
              />
            )}
            
            {step === 2 && (
              <GenreSelector
                selected={data.genre}
                onSelect={(genre) => setData({ ...data, genre })}
              />
            )}
            
            {step === 3 && (
              <CharacterSetup
                characterName={data.characterName}
                characterTraits={data.characterTraits}
                storySeed={data.storySeed}
                genre={data.genre || ''}
                difficulty={data.difficulty}
                onNameChange={(characterName) => setData({ ...data, characterName })}
                onTraitsChange={(characterTraits) => setData({ ...data, characterTraits })}
                onSeedChange={(storySeed) => setData({ ...data, storySeed })}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleBack}
              className="btn btn-secondary group hover:scale-105 transition-transform duration-200"
              disabled={isLoading}
            >
              <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
              <span className="ml-1">
                {step === 1 ? 'Exit Setup' : 'Previous Step'}
              </span>
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className={`btn btn-primary group transition-all duration-300 ${
                  isStepValid() 
                    ? 'hover:scale-105 shadow-lg shadow-amber-500/25' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isStepValid() || isLoading}
              >
                <span className="mr-1">
                  {step === 1 && 'Choose Genre'}
                  {step === 2 && 'Add Character'}
                </span>
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
            ) : (
              <button
                onClick={handleCreateStory}
                className={`btn btn-primary flex items-center gap-2 group relative overflow-hidden transition-all duration-300 ${
                  isStepValid() 
                    ? 'hover:scale-105 shadow-xl shadow-amber-500/30 hover:shadow-2xl' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isStepValid() || isLoading}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <Sparkles className="w-5 h-5 group-hover:animate-spin transition-transform duration-300" />
                <span className="font-semibold">✨ Create My Story!</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <div className={`
            glass-panel inline-flex items-center gap-3 px-6 py-4 transition-all duration-300
            ${isStepValid() 
              ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10' 
              : 'border-white/10'
            }
          `}>
            <span className={`text-2xl transition-transform duration-300 ${
              isStepValid() ? 'animate-bounce' : ''
            }`}>
              {step === 1 && (isStepValid() ? "✅" : "📚")}
              {step === 2 && (isStepValid() ? "✅" : "🎭")}
              {step === 3 && (isStepValid() ? "✅" : "⭐")}
            </span>
            <div className="text-left">
              <div className="text-body font-semibold text-white">
                {step === 1 && (
                  isStepValid() 
                    ? "Perfect! Length selected 🎯" 
                    : "Choose your story length"
                )}
                {step === 2 && (
                  isStepValid() 
                    ? "Great genre choice! 🌟" 
                    : "Pick an exciting genre"
                )}
                {step === 3 && (
                  isStepValid() 
                    ? "Character ready for adventure! ⚡" 
                    : "Create your main character"
                )}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {step === 1 && "Sets the perfect reading time for your child"}
                {step === 2 && "Matches your child's interests and imagination"}
                {step === 3 && "Makes the story uniquely theirs to enjoy"}
              </div>
            </div>
            {isStepValid() && (
              <div className="ml-2 animate-pulse">
                <span className="text-amber-400 text-lg">⚡</span>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default EasyModeFlow;