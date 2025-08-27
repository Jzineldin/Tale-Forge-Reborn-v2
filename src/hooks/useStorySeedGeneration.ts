import { useState, useRef } from 'react';
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
  const generationCount = useRef(0);

  const generateNewSeed = async () => {
    if (!genre || !difficulty) return [];
    
    setIsGenerating(true);
    
    // Clear existing seeds to show loading state
    setAvailableSeeds([]);
    
    // Increment generation counter to force new API call
    generationCount.current += 1;
    
    try {
      const context = getContextFromGenre(genre);
      
      // Add timestamp to force cache bypass
      const timestamp = Date.now();
      console.log(`🎲 Generating new seeds (attempt #${generationCount.current}, timestamp: ${timestamp})`);
      
      const seeds = await generateStorySeeds({
        context,
        difficulty: difficulty,
        genre,
        childName: characterName || 'the child'
      });
      
      const seedTexts = seeds.map(seed => convertSeedToString(seed));
      console.log(`✅ Received ${seedTexts.length} new seeds`);
      
      // Don't shuffle here - the service should return different seeds
      setAvailableSeeds(seedTexts);
      setSelectedSeedIndex(0);
      return seedTexts;
      
    } catch (error) {
      console.error('Failed to generate story seeds:', error);
      
      // Fallback to hardcoded seeds if AI fails
      const seeds = STORY_SEEDS[genre] || STORY_SEEDS.FANTASY;
      
      // Create a larger pool by combining different genres for more variety
      const allSeeds = [...seeds];
      if (STORY_SEEDS.FANTASY && genre !== 'FANTASY') {
        allSeeds.push(...STORY_SEEDS.FANTASY);
      }
      if (STORY_SEEDS.ADVENTURE && genre !== 'ADVENTURE') {
        allSeeds.push(...STORY_SEEDS.ADVENTURE);
      }
      
      // Properly shuffle using Fisher-Yates algorithm for true randomness
      for (let i = allSeeds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSeeds[i], allSeeds[j]] = [allSeeds[j], allSeeds[i]];
      }
      
      // Take 3 different seeds
      const fallbackSeeds = allSeeds.slice(0, 3);
      
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