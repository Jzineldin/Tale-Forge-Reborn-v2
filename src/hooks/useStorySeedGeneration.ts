import { useState } from 'react';
import { generateStorySeeds, getContextFromGenre, convertSeedToString } from '@/services/storySeedsService';
import { STORY_SEEDS } from '@/constants/storySeeds';

interface UseStorySeedGenerationProps {
  genre: string;
  difficulty: 'short' | 'medium' | 'long' | null;
  characterName: string;
}

export const useStorySeedGeneration = ({ genre, difficulty, characterName }: UseStorySeedGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableSeeds, setAvailableSeeds] = useState<string[]>([]);
  const [selectedSeedIndex, setSelectedSeedIndex] = useState(0);

  const generateNewSeed = async () => {
    if (!genre || !difficulty) return [];
    
    setIsGenerating(true);
    
    try {
      const context = getContextFromGenre(genre);
      const seeds = await generateStorySeeds({
        context,
        difficulty: difficulty,
        genre,
        childName: characterName || 'the child'
      });
      
      const seedTexts = seeds.map(seed => convertSeedToString(seed));
      setAvailableSeeds(seedTexts);
      setSelectedSeedIndex(0);
      return seedTexts;
      
    } catch (error) {
      console.error('Failed to generate story seeds:', error);
      
      // Fallback to hardcoded seeds if AI fails
      const seeds = STORY_SEEDS[genre] || STORY_SEEDS.FANTASY;
      const shuffledSeeds = [...seeds].sort(() => Math.random() - 0.5);
      const fallbackSeeds = shuffledSeeds.slice(0, 3);
      
      setAvailableSeeds(fallbackSeeds);
      setSelectedSeedIndex(0);
      return fallbackSeeds;
      
    } finally {
      setIsGenerating(false);
    }
  };

  const selectSeed = (index: number) => {
    setSelectedSeedIndex(index);
    return availableSeeds[index];
  };

  return {
    isGenerating,
    availableSeeds,
    selectedSeedIndex,
    generateNewSeed,
    selectSeed,
    currentSeed: availableSeeds[selectedSeedIndex] || ''
  };
};