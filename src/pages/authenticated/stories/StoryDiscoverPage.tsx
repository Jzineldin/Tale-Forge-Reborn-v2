import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/atoms/Icon';

// Story interface based on your PRD
interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  ageGroup: string;
  imageUrl: string;
  author: string;
  likes: number;
  isCompleted: boolean;
  segments: number;
}

const StoryDiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'title'>('popular');

  // Genre data from your PRD with actual image paths
  const genres = [
    { id: 'all', name: 'All Stories', emoji: '📚', color: 'bg-purple-500' },
    { id: 'bedtime', name: 'Bedtime Stories', emoji: '🌙', color: 'bg-indigo-500' },
    { id: 'fantasy', name: 'Fantasy & Magic', emoji: '🧙‍♂️', color: 'bg-purple-600' },
    { id: 'adventure', name: 'Adventure & Exploration', emoji: '🗺️', color: 'bg-green-500' },
    { id: 'mystery', name: 'Mystery & Detective', emoji: '🔍', color: 'bg-yellow-600' },
    { id: 'sci-fi', name: 'Science Fiction & Space', emoji: '🚀', color: 'bg-blue-500' },
    { id: 'educational', name: 'Educational Stories', emoji: '📚', color: 'bg-emerald-500' },
    { id: 'values', name: 'Values & Life Lessons', emoji: '💎', color: 'bg-pink-500' },
    { id: 'humorous', name: 'Silly & Humorous Stories', emoji: '😄', color: 'bg-orange-500' },
  ];

  const ageGroups = [
    { id: 'all', name: 'All Ages', range: '' },
    { id: '4-6', name: 'Little Ones', range: '4-6 years' },
    { id: '7-9', name: 'Young Readers', range: '7-9 years' },
    { id: '10-12', name: 'Big Kids', range: '10-12 years' },
  ];

  // Sample stories using your actual genre images
  const publicStories: Story[] = [
    {
      id: '1',
      title: 'Cosmic Space Adventure',
      description: 'Join friendly astronauts on an amazing journey through the galaxy, discovering new planets and meeting alien friends.',
      genre: 'sci-fi',
      ageGroup: '7-9',
      imageUrl: '/images/genres/sci-fi/futuristic-space-adventure.png',
      author: 'Space Explorer Emma',
      likes: 342,
      isCompleted: true,
      segments: 8,
    },
    {
      id: '2',
      title: 'The Enchanted Forest Kingdom',
      description: 'Discover magical creatures and mystical powers in this enchanting fantasy adventure through ancient woodlands.',
      genre: 'fantasy',
      ageGroup: '7-9',
      imageUrl: '/images/genres/fantasy/enchanted-world.png',
      author: 'Wizard Michael',
      likes: 278,
      isCompleted: true,
      segments: 6,
    },
    {
      id: '3',
      title: 'Gentle Moon Dreams',
      description: 'A soothing bedtime tale about a little star who helps children have wonderful dreams under the moonlight.',
      genre: 'bedtime',
      ageGroup: '4-6',
      imageUrl: '/images/genres/bedtime/peaceful-bedtime.png',
      author: 'Dreamy Sofia',
      likes: 189,
      isCompleted: true,
      segments: 4,
    },
    {
      id: '4',
      title: 'The Great Treasure Hunt',
      description: 'An exciting adventure where brave explorers search for hidden treasures across mysterious islands.',
      genre: 'adventure',
      ageGroup: '7-9',
      imageUrl: '/images/genres/adventure/futuristic-adventure.png',
      author: 'Captain Alex',
      likes: 156,
      isCompleted: true,
      segments: 10,
    },
    {
      id: '5',
      title: 'Learning with Robot Friends',
      description: 'Educational fun with friendly robots who teach math, science, and problem-solving skills.',
      genre: 'educational',
      ageGroup: '7-9',
      imageUrl: '/images/genres/educational/educational-content.png',
      author: 'Teacher bot',
      likes: 134,
      isCompleted: true,
      segments: 7,
    },
    {
      id: '6',
      title: 'The Silly Space Pets',
      description: 'Hilarious adventures with the goofiest alien pets in the galaxy who love to play pranks.',
      genre: 'humorous',
      ageGroup: '4-6',
      imageUrl: '/images/genres/humorous/comical-space-adventure.png',
      author: 'Funny Felix',
      likes: 225,
      isCompleted: true,
      segments: 5,
    },
    {
      id: '7',
      title: 'The Kind Heart Dragon',
      description: 'A heartwarming story about sharing, friendship, and being kind to others in a magical kingdom.',
      genre: 'values',
      ageGroup: '4-6',
      imageUrl: '/images/genres/values/friendly-character.png',
      author: 'Wise Owl Maya',
      likes: 298,
      isCompleted: true,
      segments: 6,
    },
    {
      id: '8',
      title: 'Journey Through the Stars',
      description: 'An epic space adventure exploring distant galaxies, black holes, and alien civilizations.',
      genre: 'sci-fi',
      ageGroup: '10-12',
      imageUrl: '/images/genres/sci-fi/ultra-futuristic.png',
      author: 'Galactic Guide Zoe',
      likes: 187,
      isCompleted: true,
      segments: 12,
    },
  ];

  // Filtering and sorting logic
  const filteredAndSortedStories = useMemo(() => {
    let filtered = publicStories.filter(story => {
      const matchesSearch = 
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = selectedGenre === 'all' || story.genre === selectedGenre;
      const matchesAge = selectedAge === 'all' || story.ageGroup === selectedAge;
      
      return matchesSearch && matchesGenre && matchesAge;
    });

    // Sort stories
    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => b.likes - a.likes);
      case 'newest':
        return filtered.sort((a, b) => a.title.localeCompare(b.title)); // Placeholder for creation date
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [searchTerm, selectedGenre, selectedAge, sortBy]);

  const handleStoryRead = (storyId: string) => {
    navigate(`/stories/${storyId}`);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center" 
              style={{ fontFamily: 'Cinzel, serif' }}>
            Discover Amazing Stories
          </h1>
          <p className="text-xl text-white/90 text-center max-w-3xl mx-auto">
            Explore a magical collection of community-created tales filled with adventure, wonder, and imagination
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stories, authors, or themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-3 text-lg rounded-xl"
              />
              <Icon name="search" size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
            </div>
          </div>

          {/* Genre Filters */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Choose Genre</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`${
                    selectedGenre === genre.id
                      ? 'bg-amber-500 text-white border-amber-400'
                      : 'glass-card text-white/80 border-white/20 hover:border-amber-400/50'
                  } p-3 rounded-lg border-2 transition-all duration-200 text-center group hover:scale-105`}
                >
                  <div className="text-2xl mb-1">{genre.emoji}</div>
                  <div className="text-sm font-medium">{genre.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Age and Sort Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-white text-sm font-medium mb-2">Age Group</label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="glass-input w-full py-2 px-3 rounded-lg"
              >
                {ageGroups.map((age) => (
                  <option key={age.id} value={age.id} className="bg-slate-800 text-white">
                    {age.name} {age.range && `(${age.range})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-white text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'newest' | 'title')}
                className="glass-input w-full py-2 px-3 rounded-lg"
              >
                <option value="popular" className="bg-slate-800 text-white">Most Popular</option>
                <option value="newest" className="bg-slate-800 text-white">Newest First</option>
                <option value="title" className="bg-slate-800 text-white">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-white/80 text-lg">
            Found <span className="text-amber-400 font-semibold">{filteredAndSortedStories.length}</span> amazing stories
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedStories.map((story) => (
            <div
              key={story.id}
              className="glass-enhanced backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group"
              onClick={() => handleStoryRead(story.id)}
            >
              {/* Story Image */}
              <div className="relative aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                <img 
                  src={story.imageUrl} 
                  alt={story.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                  <Icon name="book" size={64} className="text-amber-400/50" />
                </div>
                
                {/* Genre Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    genres.find(g => g.id === story.genre)?.color || 'bg-purple-500'
                  } text-white`}>
                    {genres.find(g => g.id === story.genre)?.emoji} {genres.find(g => g.id === story.genre)?.name}
                  </span>
                </div>

                {/* Likes */}
                <div className="absolute top-3 right-3 flex items-center glass-card backdrop-blur-sm bg-black/30 px-2 py-1 rounded-full">
                  <span className="text-red-400 text-sm mr-1">❤️</span>
                  <span className="text-white text-sm font-medium">{story.likes}</span>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {story.title}
                </h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                  {story.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                      Age {story.ageGroup}
                    </span>
                    <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                      {story.segments} parts
                    </span>
                  </div>
                  {story.isCompleted && (
                    <span className="text-xs text-green-400 flex items-center">
                      <Icon name="check" size={14} className="mr-1" />
                      Complete
                    </span>
                  )}
                </div>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">
                    by <span className="text-white/80 font-medium">{story.author}</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <Icon name="book" size={16} className="text-amber-400" />
                    <span className="text-amber-400 text-sm font-medium">Read Story</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedStories.length === 0 && (
          <div className="text-center py-16">
            <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-12 max-w-md mx-auto">
              <Icon name="search" size={64} className="text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Stories Found</h3>
              <p className="text-white/70 mb-6">
                Try adjusting your search terms or filters to discover more stories.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGenre('all');
                  setSelectedAge('all');
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDiscoverPage;