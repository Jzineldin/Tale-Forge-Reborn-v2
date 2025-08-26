import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateStory } from '@/utils/storyHooks';
import DifficultySelector from './DifficultySelector';
import GenreSelector from './GenreSelector';
import CharacterSetup from './CharacterSetup';
import { convertToBackendFormat } from './utils';
import { Sparkles, Loader2 } from 'lucide-react';

export interface EasyModeData {
  difficulty: 'short' | 'medium' | 'long' | null;
  genre: string | null;
  characterName: string;
  characterTraits: string[];
  storySeed: string;
}

const EasyModeFlow: React.FC = () => {
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
      navigate('/create');
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
        navigate(`/story/${story.id}`);
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      font-bold text-lg transition-all duration-300
                      ${step >= stepNum 
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25' 
                        : 'glass border border-white/20 text-gray-400'
                      }
                    `}
                  >
                    {step > stepNum ? '✓' : stepNum}
                  </div>
                  <span className={`
                    mt-2 text-sm font-medium
                    ${step >= stepNum ? 'text-amber-400' : 'text-gray-500'}
                  `}>
                    {stepNum === 1 ? 'Length' : stepNum === 2 ? 'Genre' : 'Character'}
                  </span>
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
        <div className="glass-panel p-8">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="glass-panel p-8 flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <h3 className="text-xl font-semibold text-white">Creating Your Story...</h3>
                <p className="text-gray-300">This may take up to 30 seconds</p>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p>✨ Crafting narrative...</p>
                  <p>🎨 Generating illustrations...</p>
                  <p>🎯 Personalizing for {data.characterName || 'your child'}...</p>
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
              className="btn btn-secondary"
              disabled={isLoading}
            >
              ← Back
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary"
                disabled={!isStepValid() || isLoading}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleCreateStory}
                className="btn btn-primary btn-lg group"
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
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            {step === 1 && "Choose how long you want your story to be"}
            {step === 2 && "Pick a genre that your child will love"}
            {step === 3 && "Personalize the story with your child's name"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EasyModeFlow;