import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, X } from 'lucide-react';

interface StoryGenreSelectorProps {
  selected: string | null;
  onSelect: (genre: string) => void;
}

const genres = [
  // Popular genres - displayed first
  {
    id: 'FANTASY',
    title: 'Fantasy',
    emoji: '🧙',
    description: 'Magic, dragons & enchanted worlds',
    tags: ['magic', 'wizards', 'dragons'],
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    popular: true
  },
  {
    id: 'ADVENTURE',
    title: 'Adventure',
    emoji: '🗺️',
    description: 'Quests, exploration & discovery',
    tags: ['exploration', 'heroes', 'treasure'],
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    popular: true
  },
  {
    id: 'ANIMALS',
    title: 'Animals',
    emoji: '🦁',
    description: 'Wild creatures & pet friends',
    tags: ['pets', 'wildlife', 'friendship'],
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    popular: true
  },
  {
    id: 'FAIRYTALE',
    title: 'Fairytale',
    emoji: '👑',
    description: 'Princes, princesses & castles',
    tags: ['royalty', 'castles', 'magic'],
    gradient: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    popular: true
  },
  // Regular genres
  {
    id: 'SCI-FI',
    title: 'Sci-Fi',
    emoji: '🚀',
    description: 'Space adventures & robots',
    tags: ['space', 'robots', 'future'],
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'MYSTERY',
    title: 'Mystery',
    emoji: '🔍',
    description: 'Puzzles & detective stories',
    tags: ['detective', 'puzzles', 'secrets'],
    gradient: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10'
  },
  {
    id: 'FUNNY',
    title: 'Funny',
    emoji: '😂',
    description: 'Silly jokes & laughter',
    tags: ['humor', 'jokes', 'silly'],
    gradient: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-500/10'
  },
  {
    id: 'EDUCATION',
    title: 'Educational',
    emoji: '🎓',
    description: 'Learning through stories',
    tags: ['learning', 'facts', 'discovery'],
    gradient: 'from-teal-500 to-green-500',
    bgColor: 'bg-teal-500/10'
  },
  {
    id: 'NATURE',
    title: 'Nature',
    emoji: '🌲',
    description: 'Forests, oceans & outdoors',
    tags: ['forest', 'ocean', 'environment'],
    gradient: 'from-green-600 to-teal-600',
    bgColor: 'bg-green-600/10'
  },
  {
    id: 'SUPERHERO',
    title: 'Superhero',
    emoji: '🦸',
    description: 'Heroes with super powers',
    tags: ['powers', 'heroes', 'action'],
    gradient: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/10'
  },
  {
    id: 'PIRATES',
    title: 'Pirates',
    emoji: '🏴‍☠️',
    description: 'Sea adventures & treasure',
    tags: ['ships', 'treasure', 'ocean'],
    gradient: 'from-gray-600 to-gray-800',
    bgColor: 'bg-gray-600/10'
  },
  {
    id: 'DINOSAURS',
    title: 'Dinosaurs',
    emoji: '🦕',
    description: 'Prehistoric adventures',
    tags: ['prehistoric', 'ancient', 'discovery'],
    gradient: 'from-orange-600 to-red-600',
    bgColor: 'bg-orange-600/10'
  }
];

const StoryGenreSelector: React.FC<StoryGenreSelectorProps> = ({ selected, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);

  const filteredGenres = genres.filter(genre =>
    genre.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    genre.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    genre.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const popularGenres = filteredGenres.filter(g => g.popular);
  const otherGenres = filteredGenres.filter(g => !g.popular);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
          What kind of story would you like?
        </h2>
        <p className="text-gray-400 text-lg">
          Choose a genre that sparks your imagination
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search genres..."
            className="w-full pl-12 pr-12 py-4 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors"
            >
              <X />
            </button>
          )}
        </div>
      </motion.div>

      {/* Popular Genres Section */}
      {popularGenres.length > 0 && (
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-4"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-300">Most Popular</h3>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularGenres.map((genre, index) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                isSelected={selected === genre.id}
                isHovered={hoveredGenre === genre.id}
                onSelect={onSelect}
                onHover={setHoveredGenre}
                delay={index * 0.05}
                isPopular={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Genres Section */}
      {otherGenres.length > 0 && (
        <div>
          {popularGenres.length > 0 && (
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-semibold text-gray-300 mb-4"
            >
              More Genres
            </motion.h3>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherGenres.map((genre, index) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                isSelected={selected === genre.id}
                isHovered={hoveredGenre === genre.id}
                onSelect={onSelect}
                onHover={setHoveredGenre}
                delay={(popularGenres.length + index) * 0.05}
                isPopular={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {filteredGenres.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 text-lg">No genres found matching "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 text-amber-500 hover:text-amber-400 transition-colors"
          >
            Clear search
          </button>
        </motion.div>
      )}
    </div>
  );
};

interface GenreCardProps {
  genre: typeof genres[0];
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  delay: number;
  isPopular: boolean;
}

const GenreCard: React.FC<GenreCardProps> = ({
  genre,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  delay,
  isPopular
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(genre.id)}
      onMouseEnter={() => onHover(genre.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        relative p-5 rounded-xl backdrop-blur-xl
        transition-all duration-300 group overflow-hidden
        ${isSelected 
          ? `${genre.bgColor} ring-2 ring-offset-2 ring-offset-gray-900` 
          : 'bg-gray-800/40 hover:bg-gray-800/60'
        }
        border border-gray-700/50 hover:border-gray-600/50
        shadow-lg hover:shadow-xl
      `}
      style={{
        ...(isSelected && {
          '--tw-ring-color': `rgb(${genre.gradient.includes('purple') ? '168 85 247' : 
            genre.gradient.includes('amber') ? '245 158 11' :
            genre.gradient.includes('green') ? '34 197 94' :
            genre.gradient.includes('pink') ? '236 72 153' :
            genre.gradient.includes('blue') ? '59 130 246' :
            genre.gradient.includes('indigo') ? '99 102 241' :
            genre.gradient.includes('yellow') ? '234 179 8' :
            genre.gradient.includes('teal') ? '20 184 166' :
            genre.gradient.includes('red') ? '239 68 68' :
            genre.gradient.includes('orange') ? '249 115 22' :
            '107 114 128'} / 0.5)`
        } as any)
      }}
    >
      {/* Background gradient effect */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${genre.gradient}
        opacity-0 group-hover:opacity-20 transition-opacity duration-500
      `} />

      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-amber-500" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Emoji and Title */}
        <div className="flex flex-col items-center mb-3">
          <span className="text-3xl mb-2">{genre.emoji}</span>
          <h3 className={`
            font-bold text-sm
            ${isSelected ? 'text-white' : 'text-gray-200'}
          `}>
            {genre.title}
          </h3>
        </div>

        {/* Description */}
        <p className={`
          text-xs leading-relaxed
          ${isSelected ? 'text-gray-200' : 'text-gray-400'}
        `}>
          {genre.description}
        </p>

        {/* Tags (shown on hover) */}
        <AnimatePresence>
          {(isHovered || isSelected) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex flex-wrap gap-1 justify-center"
            >
              {genre.tags.map(tag => (
                <span
                  key={tag}
                  className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-700/50 text-gray-400'
                    }
                  `}
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${genre.gradient} flex items-center justify-center shadow-lg`}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
};

export default StoryGenreSelector;