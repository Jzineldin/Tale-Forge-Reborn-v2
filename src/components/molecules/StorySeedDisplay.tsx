import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface StorySeedDisplayProps {
  storySeed: string;
  isGenerating: boolean;
  onGenerateNewSeed: () => void;
}

const StorySeedDisplay: React.FC<StorySeedDisplayProps> = ({
  storySeed,
  isGenerating,
  onGenerateNewSeed
}) => {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
        <h3 className="text-xl font-semibold text-white">
          🎭 AI Story Magic
        </h3>
        <span className="text-sm text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-500/20">
          ✨ Inspiration
        </span>
      </div>

      <div className="space-y-4">
        <div className={`
          p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 
          border border-purple-500/20 text-gray-200 italic leading-relaxed
          ${isGenerating ? 'animate-pulse' : ''}
        `}>
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-amber-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <div className="text-center">
                <p className="font-medium">🎭 Creating magical adventures...</p>
                <p className="text-sm text-amber-300 mt-1">Our AI is weaving your perfect story!</p>
              </div>
            </div>
          ) : storySeed ? (
            <div className="space-y-2">
              <p className="text-xs uppercase font-bold text-purple-400 tracking-wide">Your Story Inspiration:</p>
              <p className="text-white italic text-lg leading-relaxed">{storySeed}</p>
              <div className="flex gap-2 mt-3">
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">✨ Unique</span>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">🎯 Age-Appropriate</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 italic">Click below to generate your magical story idea! ✨</p>
            </div>
          )}
        </div>

        <button
          onClick={onGenerateNewSeed}
          className="btn btn-secondary btn-sm group hover:scale-105 transition-all duration-200"
          disabled={isGenerating}
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
          {storySeed ? '🎲 Try Another Adventure' : '✨ Create My Story Idea'}
        </button>
      </div>
    </div>
  );
};

export default StorySeedDisplay;