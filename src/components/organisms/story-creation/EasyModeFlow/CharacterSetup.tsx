import React, { useEffect, useRef } from 'react';
import { useStorySeedGeneration } from '@/hooks/useStorySeedGeneration';
import CharacterNameInput from '@/components/molecules/CharacterNameInput';
import TraitSelector from '@/components/molecules/TraitSelector';
import StorySeedSelector from '@/components/molecules/StorySeedSelector';
import CharacterPreview from '@/components/molecules/CharacterPreview';

interface CharacterSetupProps {
  characterName: string;
  characterTraits: string[];
  storySeed: string;
  genre: string;
  difficulty: 'short' | 'medium' | 'long' | null;
  onNameChange: (name: string) => void;
  onTraitsChange: (traits: string[]) => void;
  onSeedChange: (seed: string) => void;
}

const CharacterSetup: React.FC<CharacterSetupProps> = ({
  characterName,
  characterTraits,
  storySeed,
  genre,
  difficulty,
  onNameChange,
  onTraitsChange,
  onSeedChange
}) => {
  const {
    isGenerating,
    availableSeeds,
    selectedSeedIndex,
    generateNewSeed,
    selectSeed
  } = useStorySeedGeneration({ genre, difficulty, characterName });
  
  const hasInitialized = useRef(false);

  // Auto-generate initial story seeds when genre is set
  useEffect(() => {
    if (genre && availableSeeds.length === 0 && !isGenerating && !hasInitialized.current) {
      hasInitialized.current = true;
      generateNewSeed();
    }
  }, [genre]); // Only depend on genre to avoid re-runs

  // Update parent when seed selection changes
  useEffect(() => {
    if (availableSeeds.length > 0 && availableSeeds[selectedSeedIndex]) {
      onSeedChange(availableSeeds[selectedSeedIndex]);
    }
  }, [selectedSeedIndex, availableSeeds]);

  const handleSelectSeed = (index: number) => {
    selectSeed(index);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          ✨ Let's Create Your Hero! ✨
        </h2>
        <p className="text-gray-300 text-lg">
          Choose your adventure and name your character
        </p>
      </div>

      <StorySeedSelector
        availableSeeds={availableSeeds}
        selectedSeedIndex={selectedSeedIndex}
        isGenerating={isGenerating}
        onSelectSeed={handleSelectSeed}
        onGenerateNewSeeds={generateNewSeed}
      />

      <CharacterNameInput
        characterName={characterName}
        onNameChange={onNameChange}
      />

      <TraitSelector
        characterName={characterName}
        characterTraits={characterTraits}
        onTraitsChange={onTraitsChange}
      />

      <CharacterPreview
        characterName={characterName}
        characterTraits={characterTraits}
        genre={genre}
      />
    </div>
  );
};

export default CharacterSetup;