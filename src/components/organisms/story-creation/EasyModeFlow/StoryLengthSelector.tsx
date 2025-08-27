import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, BookOpen } from 'lucide-react';

interface StoryLengthSelectorProps {
  selected: 'short' | 'medium' | 'long' | null;
  onSelect: (length: 'short' | 'medium' | 'long') => void;
}

const lengths = [
  {
    id: 'short' as const,
    icon: Zap,
    emoji: '⚡',
    title: 'Short Story',
    duration: '2-3 minutes',
    words: '40-80 words',
    ageRange: 'Ages 3-6',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 via-emerald-600/5 to-transparent',
    description: 'Simple & Sweet'
  },
  {
    id: 'medium' as const,
    icon: BookOpen,
    emoji: '📚',
    title: 'Medium Story',
    duration: '4-5 minutes',
    words: '100-150 words',
    ageRange: 'Ages 6-9',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-500/10 via-blue-600/5 to-transparent',
    description: 'POPULAR',
    recommended: true
  },
  {
    id: 'long' as const,
    icon: Clock,
    emoji: '🎭',
    title: 'Long Story',
    duration: '6-8 minutes',
    words: '160-200 words',
    ageRange: 'Ages 8-12',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-500/10 via-purple-600/5 to-transparent',
    description: 'Rich Adventure'
  }
];

const StoryLengthSelector: React.FC<StoryLengthSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
          How long should your story be?
        </h2>
        <p className="text-gray-400 text-lg">
          Choose based on attention span and reading time
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {lengths.map((length, index) => {
          const Icon = length.icon;
          const isSelected = selected === length.id;

          return (
            <motion.div
              key={length.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {length.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(length.id)}
                className={`
                  relative w-full p-6 rounded-2xl backdrop-blur-xl
                  transition-all duration-300 group
                  ${isSelected 
                    ? `bg-gradient-to-br ${length.bgGradient} ring-2 ring-${length.color}-500 ring-opacity-50` 
                    : 'bg-gray-800/40 hover:bg-gray-800/60'
                  }
                  border border-gray-700/50 hover:border-gray-600/50
                  shadow-xl hover:shadow-2xl
                `}
              >
                {/* Background decoration */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${length.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`
                    w-16 h-16 rounded-xl mb-4
                    bg-gradient-to-br ${length.gradient}
                    flex items-center justify-center
                    shadow-lg group-hover:shadow-xl
                    transition-all duration-300
                    ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                  `}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <span>{length.emoji}</span>
                    <span>{length.title}</span>
                  </h3>

                  {/* Duration badge */}
                  <div className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4
                    ${isSelected 
                      ? `bg-gradient-to-r ${length.gradient} text-white` 
                      : 'bg-gray-700/50 text-gray-300'
                    }
                  `}>
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">{length.duration}</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-300 text-sm">{length.words}</p>
                    <p className="text-gray-400 text-xs">Ideal for {length.ageRange}</p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm italic">
                    {length.description}
                  </p>

                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4"
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${length.gradient} flex items-center justify-center shadow-lg`}>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Hover effect overlay */}
                <div className={`
                  absolute inset-0 rounded-2xl pointer-events-none
                  bg-gradient-to-t from-${length.color}-500/20 via-transparent to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500
                `} />
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryLengthSelector;