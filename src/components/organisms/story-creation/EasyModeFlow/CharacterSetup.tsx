import React, { useEffect } from 'react';
import { useStorySeedGeneration } from '@/hooks/useStorySeedGeneration';
import CharacterNameInput from '@/components/molecules/CharacterNameInput';
import TraitSelector from '@/components/molecules/TraitSelector';
import StorySeedDisplay from '@/components/molecules/StorySeedDisplay';
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
    generateNewSeed
  } = useStorySeedGeneration({ genre, difficulty, characterName });

  // Auto-generate initial story seed when genre changes
  useEffect(() => {
    if (genre && !storySeed) {
      handleGenerateNewSeed();
    }
  }, [genre]);

  const handleGenerateNewSeed = async () => {
    const seeds = await generateNewSeed();
    if (seeds.length > 0) {
      onSeedChange(seeds[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3 animate-fade-in">
          ✨ Let's Create Your Hero! ✨
        </h2>
        <p className="text-gray-300 text-lg">
          Time to make this story uniquely yours with personality and magic
        </p>
      </div>

      <StorySeedDisplay
        storySeed={storySeed}
        isGenerating={isGenerating}
        onGenerateNewSeed={handleGenerateNewSeed}
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