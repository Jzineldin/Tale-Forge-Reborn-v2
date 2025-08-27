import React from 'react';

interface GenreSelectorProps {
  selected: string | null;
  onSelect: (genre: string) => void;
}

const genres = [
  {
    id: 'FANTASY',
    icon: '🧙‍♂️',
    name: 'FANTASY',
    description: 'Magic and mythical creatures',
    gradient: 'from-purple-700 to-pink-700',
    popular: true
  },
  {
    id: 'ADVENTURE',
    icon: '🗺️',
    name: 'ADVENTURE',
    description: 'Exciting quests and exploration',
    gradient: 'from-orange-700 to-red-700',
    popular: true
  },
  {
    id: 'ANIMALS',
    icon: '🐾',
    name: 'ANIMALS',
    description: 'Furry friends and pets',
    gradient: 'from-green-700 to-emerald-700',
    popular: true
  },
  {
    id: 'SCI-FI',
    icon: '🚀',
    name: 'SCI-FI',
    description: 'Space and future technology',
    gradient: 'from-blue-700 to-cyan-700'
  },
  {
    id: 'MYSTERY',
    icon: '🔍',
    name: 'MYSTERY',
    description: 'Puzzles and detective work',
    gradient: 'from-indigo-700 to-purple-700'
  },
  {
    id: 'FAIRYTALE',
    icon: '👸',
    name: 'FAIRYTALE',
    description: 'Classic princess and prince tales',
    gradient: 'from-pink-700 to-rose-700'
  },
  {
    id: 'EDUCATION',
    icon: '🎓',
    name: 'EDUCATION',
    description: 'Learning while having fun',
    gradient: 'from-amber-700 to-orange-700'
  },
  {
    id: 'FUNNY',
    icon: '😄',
    name: 'FUNNY',
    description: 'Silly humor and laughter',
    gradient: 'from-yellow-700 to-amber-700'
  },
  {
    id: 'NATURE',
    icon: '🌳',
    name: 'NATURE',
    description: 'Forests, oceans, and outdoors',
    gradient: 'from-green-800 to-teal-700'
  }
];

const GenreSelector: React.FC<GenreSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">
          🎭 What Adventure Awaits? 🎭
        </h2>
        <p className="text-gray-300 text-lg">
          Pick the perfect genre for your magical story adventure
        </p>
        {selected && (
          <div className="mt-3">
            <span className="px-4 py-2 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-full text-amber-400 text-sm font-medium border border-amber-600/30">
              ✨ {selected} Adventure Selected!
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {genres.map((genre) => {
          const isSelected = selected === genre.id;
          
          return (
            <button
              key={genre.id}
              onClick={() => onSelect(genre.id)}
              className={`
                relative group text-left transition-all duration-300 transform
                ${isSelected ? 'scale-105 z-10' : 'hover:scale-102 hover:z-20'}
              `}
            >
              <div className={`
                relative p-6 rounded-xl border-2 transition-all duration-300 overflow-hidden
                ${isSelected 
                  ? `bg-gradient-to-br ${genre.gradient} border-transparent shadow-xl shadow-black/20` 
                  : 'glass border-white/10 hover:border-white/20 hover:bg-white/5'
                }
              `}>
                {/* Popular Badge */}
                {genre.popular && !isSelected && (
                  <div className="absolute top-2 right-2 z-20">
                    <span className="px-2 py-1 text-xs font-bold bg-amber-600/80 text-white rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}

                {/* Background Pattern for selected state */}
                {isSelected && (
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`
                    text-4xl mb-4 p-3 rounded-lg inline-block
                    ${isSelected ? 'bg-white/20' : 'bg-white/10'}
                    transition-all duration-300
                  `}>
                    {genre.icon}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className={`
                      text-lg font-bold mb-2
                      ${isSelected ? 'text-white' : 'text-white/90'}
                      transition-colors duration-300
                    `}>
                      {genre.name}
                    </h3>
                    
                    <p className={`
                      text-sm leading-relaxed
                      ${isSelected ? 'text-white/80' : 'text-gray-400'}
                      transition-colors duration-300
                    `}>
                      {genre.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div className={`
                    mt-4 flex items-center gap-2
                    ${isSelected ? 'opacity-100' : 'opacity-0'}
                    transition-all duration-300
                  `}>
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-600/30">
                      <span className="text-white text-xs font-bold">✨</span>
                    </div>
                    <span className="text-sm font-bold text-white">Adventure Chosen!</span>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className={`
                  absolute inset-0 rounded-xl transition-opacity duration-300
                  bg-gradient-to-br ${genre.gradient} opacity-0
                  ${!isSelected && 'group-hover:opacity-3'}
                `} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Popular Genres Highlight */}
      <div className="mt-8 p-4 rounded-lg bg-blue-600/10 border border-blue-600/20">
        <div className="flex gap-3">
          <span className="text-blue-500 text-xl">⭐</span>
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Most popular with kids:</p>
            <p className="text-gray-400">
              Fantasy, Adventure, and Animals are the top choices that children love most!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenreSelector;