import React from 'react';
import { Clock, BookOpen, Sparkle } from 'lucide-react';

interface DifficultySelectorProps {
  selected: 'short' | 'medium' | 'long' | null;
  onSelect: (difficulty: 'short' | 'medium' | 'long') => void;
}

const difficulties = [
  {
    id: 'short' as const,
    icon: '🌟',
    title: 'SHORT STORY',
    words: '40-80 words',
    age: 'Ages 4-6',
    time: '2-3 minutes',
    description: 'Perfect for bedtime',
    iconComponent: Sparkle,
    gradient: 'from-green-700/60 to-emerald-800/60',
    shadowColor: 'shadow-green-900/20'
  },
  {
    id: 'medium' as const,
    icon: '📖',
    title: 'MEDIUM STORY',
    words: '100-150 words',
    age: 'Ages 6-9',
    time: '4-5 minutes',
    description: 'Great for reading practice',
    iconComponent: BookOpen,
    gradient: 'from-blue-700/60 to-indigo-800/60',
    shadowColor: 'shadow-blue-900/20',
    recommended: true
  },
  {
    id: 'long' as const,
    icon: '📚',
    title: 'LONG STORY',
    words: '160-200 words',
    age: 'Ages 9-12',
    time: '6-8 minutes',
    description: 'Chapter book style',
    iconComponent: Clock,
    gradient: 'from-purple-700/60 to-pink-800/60',
    shadowColor: 'shadow-purple-900/20'
  }
];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          How long should your story be?
        </h2>
        <p className="text-gray-400">
          Choose based on your child's attention span and reading level
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {difficulties.map((difficulty) => {
          const IconComponent = difficulty.iconComponent;
          const isSelected = selected === difficulty.id;
          
          return (
            <button
              key={difficulty.id}
              onClick={() => onSelect(difficulty.id)}
              className={`
                group relative text-center transition-all duration-300
                ${isSelected ? 'z-10' : ''}
              `}
            >
              {/* Recommended Badge */}
              {difficulty.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className={`
                    px-4 py-1 text-xs font-black rounded-full border-2 shadow-lg
                    ${isSelected 
                      ? 'bg-white text-purple-700 border-white' 
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500'
                    }
                  `}>
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}

              <div className={`
                relative p-8 rounded-2xl border-3 transition-all duration-500 overflow-hidden
                ${isSelected 
                  ? `bg-gradient-to-br ${difficulty.gradient} border-transparent shadow-2xl ${difficulty.shadowColor} ring-4 ring-white/20` 
                  : 'bg-gradient-to-br from-white/5 to-white/10 border-white/20 hover:border-white/40 hover:shadow-xl hover:from-white/10 hover:to-white/15'
                }
              `}>
                
                {/* Animated background effect for selected */}
                {isSelected && (
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse"></div>
                  </div>
                )}

                {/* Large Icon */}
                <div className={`
                  text-6xl mb-4 transition-all duration-300
                  ${isSelected ? '' : 'group-hover:scale-110'}
                `}>
                  {difficulty.icon}
                </div>

                {/* Title with enhanced visibility */}
                <h3 className={`
                  text-2xl font-black mb-3 tracking-wide
                  ${isSelected ? 'text-white drop-shadow-lg' : 'text-white/95 group-hover:text-white'}
                `}>
                  {difficulty.title}
                </h3>
                
                {/* Enhanced stats display */}
                <div className="space-y-2 mb-4">
                  <div className={`
                    text-lg font-bold px-4 py-2 rounded-xl
                    ${isSelected 
                      ? 'bg-white/20 text-white backdrop-blur-sm' 
                      : 'bg-white/10 text-white/90 group-hover:bg-white/15'
                    }
                  `}>
                    {difficulty.words}
                  </div>
                  
                  <div className={`
                    text-base font-semibold
                    ${isSelected ? 'text-white/95' : 'text-amber-400 group-hover:text-amber-300'}
                  `}>
                    {difficulty.age}
                  </div>
                </div>

                {/* Reading time with icon */}
                <div className={`
                  flex items-center justify-center gap-2 text-base font-medium mb-4
                  ${isSelected ? 'text-white/90' : 'text-gray-300 group-hover:text-white/80'}
                `}>
                  <IconComponent className="w-5 h-5" />
                  <span>{difficulty.time}</span>
                </div>

                {/* Description */}
                <p className={`
                  text-sm font-medium italic
                  ${isSelected ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-300'}
                `}>
                  "{difficulty.description}"
                </p>

                {/* Selection indicator - enhanced */}
                <div className={`
                  absolute bottom-4 right-4 transition-all duration-300
                  ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-60 group-hover:scale-75'}
                `}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${isSelected 
                      ? 'bg-white/30 ring-2 ring-white/50' 
                      : 'bg-white/20 ring-1 ring-white/30'
                    }
                  `}>
                    {isSelected ? (
                      <span className="text-white font-bold text-lg">✓</span>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-white/60" />
                    )}
                  </div>
                </div>

                {/* Hover glow effect */}
                {!isSelected && (
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 bg-gradient-to-br from-amber-600/30 to-orange-600/30 transition-opacity duration-300 pointer-events-none"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 rounded-lg bg-amber-600/10 border border-amber-600/20">
        <div className="flex gap-3">
          <span className="text-amber-600 text-xl">💡</span>
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Not sure which to choose?</p>
            <p className="text-gray-400">
              Start with a medium story - it's perfect for most children and you can adjust next time based on their engagement!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultySelector;