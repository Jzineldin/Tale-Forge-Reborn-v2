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
      <div className="text-center mb-8">
        <h1 className="title-hero mb-4">Easy Story Creation</h1>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Create magical stories in just 3 simple steps. Perfect for busy parents who want personalized tales for their children.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="glass-card mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      font-bold text-lg transition-all duration-300
                      ${step >= stepNum 
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' 
                        : 'glass-enhanced text-white/60'
                      }
                    `}
                  >
                    {step > stepNum ? '✓' : stepNum}
                  </div>
                  <TypographyLayout 
                    variant="body" 
                    className={`mt-2 text-body-sm font-medium ${
                      step >= stepNum ? 'text-amber-400' : 'text-gray-500'
                    }`}
                  >
                    {stepNum === 1 ? 'Length' : stepNum === 2 ? 'Genre' : 'Character'}
                  </TypographyLayout>
                </div>
                {stepNum < 3 && (
                  <div className={`
                    flex-1 h-1 mx-4 rounded-full transition-all duration-500
                    ${step > stepNum ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gray-700'}
                  `} />
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
              <div 
                className="rounded-3xl p-8 shadow-2xl border backdrop-blur-lg flex flex-col items-center gap-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}
              >
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
                onNameChange={(characterName) => setData({ ...data, characterName })}
                onTraitsChange={(characterTraits) => setData({ ...data, characterTraits })}
                onSeedChange={(storySeed) => setData({ ...data, storySeed })}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleBack}
              className="text-white/80 hover:text-white transition-all duration-300 px-6 py-3 rounded-2xl hover:bg-white/10 text-sm font-medium border border-white/20 hover:border-white/30 backdrop-blur-sm"
              disabled={isLoading}
            >
              ← Back
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!isStepValid() || isLoading}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleCreateStory}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-2xl text-base font-medium transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group flex items-center gap-2"
                disabled={!isStepValid() || isLoading}
              >
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                Create Story
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <div 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <span className="text-amber-400 text-lg">
              {step === 1 && "📚"}
              {step === 2 && "🎭"}
              {step === 3 && "👤"}
            </span>
            <TypographyLayout variant="body" className="text-white/90 font-medium">
              {step === 1 && "Choose how long you want your story to be"}
              {step === 2 && "Pick a genre that your child will love"}
              {step === 3 && "Personalize the story with your child's name"}
            </TypographyLayout>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EasyModeFlow;