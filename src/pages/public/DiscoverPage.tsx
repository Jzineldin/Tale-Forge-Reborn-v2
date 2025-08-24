import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/atoms/Icon';
import { useAuth } from '@/providers/AuthContext';

interface PublicStory {
  id: string;
  title: string;
  description: string;
  genre: string;
  age_group: string;
  author_name: string;
  author_id: string;
  image_url?: string;
  created_at: string;
  likes_count: number;
  reads_count: number;
  tags: string[];
  is_featured: boolean;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

type SortMode = 'popular' | 'recent' | 'likes' | 'reads';
type ViewMode = 'grid' | 'list';

const DiscoverPage: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<PublicStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());
  const [bookmarkedStories, setBookmarkedStories] = useState<Set<string>>(new Set());

  // Mock data for demonstration
  const mockStories: PublicStory[] = [
    {
      id: '1',
      title: 'The Cosmic Adventure of Luna',
      description: 'Join brave Luna as she explores distant galaxies and meets friendly alien creatures in this exciting space adventure.',
      genre: 'sci-fi',
      age_group: '7-9',
      author_name: 'SpaceExplorer42',
      author_id: 'user1',
      image_url: '/images/genres/sci-fi/futuristic-space-adventure.png',
      created_at: '2024-01-15T10:00:00Z',
      likes_count: 127,
      reads_count: 543,
      tags: ['space', 'friendship', 'adventure'],
      is_featured: true
    },
    {
      id: '2', 
      title: 'The Enchanted Forest Mystery',
      description: 'A magical tale of woodland creatures solving mysterious disappearances in their enchanted home.',
      genre: 'fantasy',
      age_group: '10-12',
      author_name: 'MysticalStoryteller',
      author_id: 'user2',
      image_url: '/images/genres/fantasy/enchanted-world.png',
      created_at: '2024-01-12T14:30:00Z',
      likes_count: 89,
      reads_count: 234,
      tags: ['magic', 'mystery', 'animals'],
      is_featured: false
    },
    {
      id: '3',
      title: 'Bedtime with the Sleepy Dragon',
      description: 'A gentle tale perfect for bedtime about a sleepy dragon who helps children fall asleep with magical dreams.',
      genre: 'bedtime',
      age_group: '4-6',
      author_name: 'DreamWeaver',
      author_id: 'user3',
      image_url: '/images/genres/bedtime/peaceful-bedtime.png',
      created_at: '2024-01-10T20:00:00Z',
      likes_count: 156,
      reads_count: 678,
      tags: ['sleep', 'dragons', 'dreams'],
      is_featured: true
    }
  ];

  const genres = [
    { id: 'all', label: 'All Genres', icon: '🌟' },
    { id: 'fantasy', label: 'Fantasy', icon: '🧙‍♂️' },
    { id: 'sci-fi', label: 'Sci-Fi', icon: '🚀' },
    { id: 'adventure', label: 'Adventure', icon: '🗺️' },
    { id: 'mystery', label: 'Mystery', icon: '🔍' },
    { id: 'bedtime', label: 'Bedtime', icon: '🌙' },
    { id: 'educational', label: 'Educational', icon: '📚' },
    { id: 'humorous', label: 'Funny', icon: '😄' }
  ];

  const ageGroups = [
    { id: 'all', label: 'All Ages' },
    { id: '4-6', label: '4-6 years' },
    { id: '7-9', label: '7-9 years' },
    { id: '10-12', label: '10-12 years' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStories(mockStories);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and sort stories
  const filteredAndSortedStories = stories
    .filter((story) => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGenre = selectedGenre === 'all' || story.genre === selectedGenre;
      const matchesAge = selectedAge === 'all' || story.age_group === selectedAge;
      
      return matchesSearch && matchesGenre && matchesAge;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'likes':
          return b.likes_count - a.likes_count;
        case 'reads':
          return b.reads_count - a.reads_count;
        case 'popular':
        default:
          return (b.likes_count + b.reads_count) - (a.likes_count + a.reads_count);
      }
    });

  const toggleLike = (storyId: string) => {
    if (!user) return;
    
    const newLiked = new Set(likedStories);
    if (newLiked.has(storyId)) {
      newLiked.delete(storyId);
    } else {
      newLiked.add(storyId);
    }
    setLikedStories(newLiked);
    
    // Update story likes count
    setStories(stories.map(story => 
      story.id === storyId 
        ? { ...story, likes_count: story.likes_count + (newLiked.has(storyId) ? 1 : -1) }
        : story
    ));
  };

  const toggleBookmark = (storyId: string) => {
    if (!user) return;
    
    const newBookmarked = new Set(bookmarkedStories);
    if (newBookmarked.has(storyId)) {
      newBookmarked.delete(storyId);
    } else {
      newBookmarked.add(storyId);
    }
    setBookmarkedStories(newBookmarked);
  };

  const featuredStories = stories.filter(story => story.is_featured);

  if (isLoading) {
    return (
      <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading Header */}
          <div className="glass-enhanced p-6 rounded-2xl mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded-lg w-64 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-96"></div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-enhanced rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-white/20"></div>
                <div className="p-6">
                  <div className="h-6 bg-white/20 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded mb-3"></div>
                  <div className="h-4 bg-white/10 rounded mb-4 w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass-enhanced p-6 rounded-2xl">
          <h1 className="fantasy-heading-cinzel text-3xl font-bold mb-2">
            🌟 Discover Stories
          </h1>
          <p className="text-white/70 text-lg">
            Explore magical tales created by our community of storytellers ({filteredAndSortedStories.length} stories)
          </p>
        </div>
      </div>

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="glass-enhanced p-6 rounded-2xl">
            <h2 className="fantasy-heading-cinzel text-2xl font-bold mb-6">✨ Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStories.slice(0, 3).map((story) => (
                <div key={story.id} className="glass-card bg-amber-500/10 border border-amber-400/30 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300">
                  <div className="relative h-48">
                    <img 
                      src={story.image_url || '/images/genres/fantasy/enchanted-world.png'} 
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ✨ Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-amber-400 text-sm font-medium">{story.genre}</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/60 text-sm">{story.age_group}</span>
                    </div>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2">{story.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">by {story.author_name}</span>
                      <Link to={`/stories/${story.id}`}>
                        <button className="fantasy-cta px-4 py-2 text-sm rounded-lg hover:scale-105 transition-all duration-300">
                          Read Story
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass-enhanced p-6 rounded-2xl">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stories, authors, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-12 pr-4 py-3 text-lg rounded-xl"
              />
              <Icon name="search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Genre Filters */}
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => setSelectedGenre(genre.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedGenre === genre.id
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'glass-card text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{genre.icon}</span>
                  <span>{genre.label}</span>
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Age Filter */}
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="glass-input px-3 py-2 rounded-lg text-sm"
              >
                {ageGroups.map((age) => (
                  <option key={age.id} value={age.id}>{age.label}</option>
                ))}
              </select>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-white/70 text-sm">Sort:</span>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="glass-input px-3 py-2 rounded-lg text-sm"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Most Recent</option>
                  <option value="likes">Most Liked</option>
                  <option value="reads">Most Read</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Icon name="grid" size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Icon name="list" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Display */}
      <div className="max-w-7xl mx-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStories.map((story) => (
              <div key={story.id} className="glass-enhanced rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 group">
                {/* Story Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                  <img 
                    src={story.image_url || '/images/genres/fantasy/enchanted-world.png'} 
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {user && (
                      <>
                        <button
                          onClick={() => toggleLike(story.id)}
                          className={`p-2 rounded-full transition-colors ${
                            likedStories.has(story.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Icon name="heart" size={16} />
                        </button>
                        <button
                          onClick={() => toggleBookmark(story.id)}
                          className={`p-2 rounded-full transition-colors ${
                            bookmarkedStories.has(story.id)
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <Icon name="bookmark" size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Story Info */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {story.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-amber-400 text-sm font-medium">{story.genre}</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/60 text-sm">{story.age_group}</span>
                    </div>
                    <p className="text-white/80 text-sm line-clamp-2 mb-3">{story.description}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {story.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats and Author */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60 text-sm">by {story.author_name}</span>
                    <div className="flex items-center space-x-3 text-white/60 text-sm">
                      <span className="flex items-center space-x-1">
                        <Icon name="heart" size={14} />
                        <span>{story.likes_count}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Icon name="eye" size={14} />
                        <span>{story.reads_count}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link to={`/stories/${story.id}`}>
                    <button className="w-full fantasy-cta px-4 py-2 text-sm rounded-lg hover:scale-105 transition-all duration-300">
                      Read Story
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredAndSortedStories.map((story) => (
              <div key={story.id} className="glass-enhanced rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-6">
                  {/* Story Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={story.image_url || '/images/genres/fantasy/enchanted-world.png'} 
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Story Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{story.title}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-amber-400 text-sm font-medium">{story.genre}</span>
                          <span className="text-white/60">•</span>
                          <span className="text-white/60 text-sm">{story.age_group}</span>
                          <span className="text-white/60">•</span>
                          <span className="text-white/60 text-sm">by {story.author_name}</span>
                        </div>
                        <p className="text-white/80 text-sm mb-3">{story.description}</p>
                        
                        {/* Tags and Stats */}
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-wrap gap-1">
                            {story.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="bg-white/10 text-white/70 px-2 py-1 rounded-full text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-3 text-white/60 text-sm">
                            <span className="flex items-center space-x-1">
                              <Icon name="heart" size={14} />
                              <span>{story.likes_count}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Icon name="eye" size={14} />
                              <span>{story.reads_count}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {user && (
                          <>
                            <button
                              onClick={() => toggleLike(story.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                likedStories.has(story.id)
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'glass-card text-white/60 hover:text-white'
                              }`}
                            >
                              <Icon name="heart" size={16} />
                            </button>
                            <button
                              onClick={() => toggleBookmark(story.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                bookmarkedStories.has(story.id)
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'glass-card text-white/60 hover:text-white'
                              }`}
                            >
                              <Icon name="bookmark" size={16} />
                            </button>
                          </>
                        )}
                        <Link to={`/stories/${story.id}`}>
                          <button className="fantasy-cta px-4 py-2 text-sm rounded-lg hover:scale-105 transition-all duration-300">
                            Read
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedStories.length === 0 && (
          <div className="glass-enhanced rounded-xl p-12 text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Stories Found</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              No stories match your search criteria. Try adjusting your filters or search terms to discover more amazing tales!
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('all');
                setSelectedAge('all');
              }}
              className="fantasy-cta px-8 py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;