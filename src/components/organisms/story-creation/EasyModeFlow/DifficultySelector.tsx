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
    title: 'Short Story',
    words: '40-80 words',
    age: 'Ages 4-6',
    time: '2-3 minutes',
    description: 'Perfect for bedtime',
    iconComponent: Sparkle,
    gradient: 'from-green-400/20 via-emerald-500/15 to-green-600/20',
    borderColor: 'border-green-400/30',
    hoverBorder: 'hover:border-green-300/60',
    shadowColor: 'hover:shadow-green-400/30',
    iconGradient: 'from-green-400 to-emerald-500',
    textGradient: 'from-green-300 via-emerald-300 to-green-400',
    ctaGradient: 'from-green-500 to-emerald-600',
    accentText: 'text-green-200',
    bulletColor: 'bg-green-400',
    bgAccent: 'bg-green-500/20',
    borderAccent: 'border-green-400/30',
    textAccent: 'text-green-300'
  },
  {
    id: 'medium' as const,
    icon: '📖',
    title: 'Medium Story',
    words: '100-150 words',
    age: 'Ages 6-9',
    time: '4-5 minutes',
    description: 'Great for reading practice',
    iconComponent: BookOpen,
    gradient: 'from-blue-400/20 via-cyan-500/15 to-blue-600/20',
    borderColor: 'border-blue-400/30',
    hoverBorder: 'hover:border-blue-300/60',
    shadowColor: 'hover:shadow-blue-400/30',
    iconGradient: 'from-blue-400 to-cyan-500',
    textGradient: 'from-blue-300 via-cyan-300 to-blue-400',
    ctaGradient: 'from-blue-500 to-cyan-600',
    accentText: 'text-blue-200',
    bulletColor: 'bg-blue-400',
    bgAccent: 'bg-blue-500/20',
    borderAccent: 'border-blue-400/30',
    textAccent: 'text-blue-300',
    recommended: true
  },
  {
    id: 'long' as const,
    icon: '📚',
    title: 'Long Story',
    words: '160-200 words',
    age: 'Ages 9-12',
    time: '6-8 minutes',
    description: 'Chapter book style',
    iconComponent: Clock,
    gradient: 'from-orange-400/20 via-red-500/15 to-orange-600/20',
    borderColor: 'border-orange-400/30',
    hoverBorder: 'hover:border-orange-300/60',
    shadowColor: 'hover:shadow-orange-400/30',
    iconGradient: 'from-orange-400 to-red-500',
    textGradient: 'from-orange-300 via-red-300 to-orange-400',
    ctaGradient: 'from-orange-500 to-red-600',
    accentText: 'text-orange-200',
    bulletColor: 'bg-orange-400',
    bgAccent: 'bg-orange-500/20',
    borderAccent: 'border-orange-400/30',
    textAccent: 'text-orange-300'
  }
];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Story Length
        </h2>
        <p className="text-gray-400 text-sm">
          Choose based on reading time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficulties.map((difficulty) => {
          const IconComponent = difficulty.iconComponent;
          const isSelected = selected === difficulty.id;
          
          return (
            <div key={difficulty.id} className="relative">
              <button
                onClick={() => onSelect(difficulty.id)}
                className={`w-full group relative rounded-2xl p-6 bg-gradient-to-br ${difficulty.gradient} backdrop-blur-sm border ${difficulty.borderColor} ${difficulty.hoverBorder} transition-all duration-300 hover:shadow-lg ${difficulty.shadowColor}`}
              >
                {/* Recommended badge */}
                {difficulty.recommended && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    TOP PICK
                  </div>
                )}

                <div className="text-center">
                    {/* Icon and Title in one line */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${difficulty.iconGradient} flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {difficulty.title}
                      </h3>
                    </div>
                    
                    {/* Simplified info */}
                    <p className="text-white/80 text-sm mb-2">
                      {difficulty.words}
                    </p>
                    <p className="text-white/60 text-xs">
                      {difficulty.time} • {difficulty.age}
                    </p>
                    
                  
                    {/* Simple selection indicator */}
                    {isSelected && (
                      <div className="mt-3 inline-flex items-center gap-1 text-white/90 text-sm">
                        <span className="text-base">✓</span>
                        <span>Selected</span>
                      </div>
                    )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default DifficultySelector;