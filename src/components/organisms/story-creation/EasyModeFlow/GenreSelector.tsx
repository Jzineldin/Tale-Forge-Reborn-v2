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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Choose Your Genre
        </h2>
        <p className="text-gray-400 text-sm">
          Pick your favorite story type
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {genres.map((genre) => {
          const isSelected = selected === genre.id;
          
          return (
            <button
              key={genre.id}
              onClick={() => onSelect(genre.id)}
              className="group"
            >
              <div className={`
                p-4 rounded-xl border transition-all duration-200
                ${isSelected 
                  ? `bg-gradient-to-br ${genre.gradient} border-transparent` 
                  : 'bg-gray-900/80 border-gray-600 hover:border-gray-500 hover:bg-gray-800/80'
                }
              `}>

                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="text-2xl">
                    {genre.icon}
                  </div>

                  {/* Content */}
                  <div className="text-left flex-1">
                    <h3 className={`
                      text-sm font-bold mb-0.5
                      ${isSelected ? 'text-white' : 'text-white/90'}
                    `}>
                      {genre.name}
                      {genre.popular && (
                        <span className="ml-1 text-xs text-amber-400">★</span>
                      )}
                    </h3>
                    
                    <p className={`
                      text-xs
                      ${isSelected ? 'text-white/70' : 'text-gray-400'}
                    `}>
                      {genre.description}
                    </p>
                  </div>

                  {/* Check mark for selected */}
                  {isSelected && (
                    <span className="text-white">✓</span>
                  )}
                </div>

              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default GenreSelector;