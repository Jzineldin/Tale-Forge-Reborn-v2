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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-semibold text-white">
            ✨ Choose Your Adventure
          </h3>
        </div>
        <button
          onClick={onGenerateNewSeeds}
          className="btn btn-secondary btn-sm group"
          disabled={isGenerating}
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          Generate New Ideas
        </button>
      </div>

      {/* 3-Card Grid for Story Seeds */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isGenerating ? (
          // Loading state - show 3 skeleton cards
          [...Array(3)].map((_, index) => (
            <div key={index} className="glass-panel p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
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
                glass-panel p-6 text-left transition-all duration-300
                hover:scale-105 hover:shadow-2xl relative group
                ${selectedSeedIndex === index 
                  ? 'ring-2 ring-amber-500 bg-gradient-to-br from-amber-900/30 to-orange-900/30' 
                  : 'hover:bg-white/5'
                }
              `}
            >
              {/* Selected indicator */}
              {selectedSeedIndex === index && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Seed number badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-2 py-1 rounded-full">
                  Option {index + 1}
                </span>
                {index === 0 && (
                  <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                    Recommended
                  </span>
                )}
              </div>

              {/* Seed content */}
              <p className="text-white/90 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none">
                {seed}
              </p>

              {/* Hover effect */}
              <div className="mt-3 text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to select this adventure →
              </div>
            </button>
          ))
        ) : (
          // Empty state - prompt to generate
          <div className="col-span-3 glass-panel p-12 text-center">
            <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No story ideas yet!</p>
            <button
              onClick={onGenerateNewSeeds}
              className="btn btn-primary"
            >
              Generate Story Ideas
            </button>
          </div>
        )}
      </div>

      {/* Selected seed preview */}
      {availableSeeds.length > 0 && !isGenerating && (
        <div className="glass-panel p-4 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-500/30">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Selected Story:
              </p>
              <p className="text-white/90 text-sm leading-relaxed">
                {availableSeeds[selectedSeedIndex]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorySeedSelector;