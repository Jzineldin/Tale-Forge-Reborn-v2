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
    gradient: 'from-green-500 to-emerald-600',
    shadowColor: 'shadow-green-500/25'
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
    gradient: 'from-blue-500 to-indigo-600',
    shadowColor: 'shadow-blue-500/25',
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
    gradient: 'from-purple-500 to-pink-600',
    shadowColor: 'shadow-purple-500/25'
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

      <div className="space-y-4">
        {difficulties.map((difficulty) => {
          const IconComponent = difficulty.iconComponent;
          const isSelected = selected === difficulty.id;
          
          return (
            <button
              key={difficulty.id}
              onClick={() => onSelect(difficulty.id)}
              className={`
                w-full text-left transition-all duration-300 transform
                ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
              `}
            >
              <div className={`
                relative p-6 rounded-xl border-2 transition-all duration-300
                ${isSelected 
                  ? `bg-gradient-to-r ${difficulty.gradient} border-transparent shadow-xl ${difficulty.shadowColor}` 
                  : 'glass border-white/10 hover:border-white/20 hover:bg-white/5'
                }
              `}>
                {difficulty.recommended && !isSelected && (
                  <div className="absolute -top-3 right-4">
                    <span className="px-3 py-1 text-xs font-bold bg-amber-500 text-white rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    text-4xl p-3 rounded-lg
                    ${isSelected ? 'bg-white/20' : 'bg-white/10'}
                  `}>
                    {difficulty.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`
                          text-xl font-bold mb-2
                          ${isSelected ? 'text-white' : 'text-white/90'}
                        `}>
                          {difficulty.title}
                        </h3>
                        
                        <div className={`
                          space-y-1 text-sm
                          ${isSelected ? 'text-white/90' : 'text-gray-400'}
                        `}>
                          <p className="font-medium">{difficulty.words} • {difficulty.age}</p>
                          <p>{difficulty.description} • {difficulty.time}</p>
                        </div>
                      </div>

                      {/* Right side icon */}
                      <IconComponent className={`
                        w-6 h-6 mt-1
                        ${isSelected ? 'text-white/80' : 'text-gray-500'}
                      `} />
                    </div>

                    {/* Selection indicator */}
                    <div className={`
                      mt-3 flex items-center gap-2
                      ${isSelected ? 'opacity-100' : 'opacity-0'}
                      transition-opacity duration-300
                    `}>
                      <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white" />
                      </div>
                      <span className="text-sm font-medium text-white/90">Selected</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex gap-3">
          <span className="text-amber-500 text-xl">💡</span>
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