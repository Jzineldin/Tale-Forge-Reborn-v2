import React from 'react';
import { Sparkles, RefreshCw, Check } from 'lucide-react';

interface StorySeedSelectorProps {
  availableSeeds: string[];
  selectedSeedIndex: number;
  isGenerating: boolean;
  onSelectSeed: (index: number) => void;
  onGenerateNewSeeds: () => void;
}

const StorySeedSelector: React.FC<StorySeedSelectorProps> = ({
  availableSeeds,
  selectedSeedIndex,
  isGenerating,
  onSelectSeed,
  onGenerateNewSeeds
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Story Ideas
        </h3>
        <button
          onClick={onGenerateNewSeeds}
          className="btn btn-secondary btn-sm"
          disabled={isGenerating}
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          New Ideas
        </button>
      </div>

      {/* 3-Card Grid for Story Seeds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isGenerating ? (
          // Loading state - show 3 skeleton cards
          [...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border border-white/20 rounded-lg animate-pulse bg-gray-900/60">
              <div className="space-y-2">
                <div className="h-3 bg-white/20 rounded w-3/4"></div>
                <div className="h-3 bg-white/20 rounded w-full"></div>
                <div className="h-3 bg-white/20 rounded w-5/6"></div>
              </div>
            </div>
          ))
        ) : availableSeeds.length > 0 ? (
          // Show available seeds
          availableSeeds.slice(0, 3).map((seed, index) => (
            <button
              key={index}
              onClick={() => onSelectSeed(index)}
              className={`
                p-4 text-left transition-all duration-200 rounded-lg border
                ${selectedSeedIndex === index 
                  ? 'border-amber-500 bg-amber-900/30' 
                  : 'border-white/20 hover:border-white/30 hover:bg-gray-900/60 bg-gray-900/40'
                }
              `}
            >
              {selectedSeedIndex === index && (
                <div className="absolute top-2 right-2">
                  <Check className="w-5 h-5 text-amber-500" />
                </div>
              )}
              
              <p className="text-white text-sm leading-relaxed">
                {seed}
              </p>
            </button>
          ))
        ) : (
          // Empty state - prompt to generate
          <div className="col-span-3 p-8 text-center border border-white/20 rounded-lg bg-gray-900/40">
            <p className="text-gray-300 mb-4">Click 'New Ideas' to generate story options</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default StorySeedSelector;