import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/atoms/Icon';
// Removed unused imports: Text, Input, Button, StoryCard
import ShareStoryModal from '@/components/organisms/story-management/ShareStoryModal';
import { useStories } from '@/utils/performance.tsx';
import { useAuth } from '@/providers/AuthContext';

type ViewMode = 'grid' | 'list';
type SortMode = 'recent' | 'alphabetical' | 'genre' | 'status';

const StoryLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { data: userStories = [], isLoading, isError } = useStories(user?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set());
  const [shareModalStory, setShareModalStory] = useState<any>(null);
  
  // Filter and sort stories
  const filteredAndSortedStories = userStories
    .filter((story: any) => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.genre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || story.status === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a: any, b: any) => {
      switch (sortMode) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'genre':
          return a.genre.localeCompare(b.genre);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'recent':
        default:
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      }
    });

  // Export functionality
  const exportStories = (format: 'json' | 'text') => {
    const stories = selectedStories.size > 0 
      ? filteredAndSortedStories.filter(story => selectedStories.has(story.id))
      : filteredAndSortedStories;

    if (format === 'json') {
      const dataStr = JSON.stringify(stories, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'my-stories.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else {
      const textContent = stories.map(story => 
        `Title: ${story.title}\nGenre: ${story.genre}\nDescription: ${story.description}\n\n`
      ).join('---\n\n');
      const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(textContent);
      const exportFileDefaultName = 'my-stories.txt';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const toggleStorySelection = (storyId: string) => {
    const newSelected = new Set(selectedStories);
    if (newSelected.has(storyId)) {
      newSelected.delete(storyId);
    } else {
      newSelected.add(storyId);
    }
    setSelectedStories(newSelected);
  };

  const selectAllStories = () => {
    const allIds = new Set(filteredAndSortedStories.map(story => story.id));
    setSelectedStories(allIds);
  };

  const clearSelection = () => {
    setSelectedStories(new Set());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        {/* Loading Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="glass-enhanced p-6 rounded-2xl">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded-lg w-64 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-96"></div>
            </div>
          </div>
        </div>

        {/* Loading Controls */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="glass-enhanced p-6 rounded-2xl">
            <div className="animate-pulse">
              <div className="h-12 bg-white/20 rounded-xl mb-6"></div>
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-24 bg-white/10 rounded-lg"></div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 w-32 bg-white/10 rounded-lg"></div>
                  <div className="h-10 w-20 bg-white/10 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Loading Stories Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-enhanced rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-white/20"></div>
                <div className="p-6">
                  <div className="h-6 bg-white/20 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded mb-3"></div>
                  <div className="h-4 bg-white/10 rounded mb-4 w-3/4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 flex-1 bg-white/20 rounded"></div>
                    <div className="h-8 w-16 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="glass-enhanced p-6 rounded-2xl">
            <h1 className="fantasy-heading-cinzel text-3xl font-bold mb-2">
              📚 My Story Library
            </h1>
            <p className="text-white/70 text-lg">
              Manage your personal collection of magical tales
            </p>
          </div>
        </div>
        
        {/* Error State */}
        <div className="max-w-7xl mx-auto">
          <div className="glass-enhanced rounded-xl p-12 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h3 className="text-2xl font-bold text-white mb-4">Unable to Load Stories</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              We couldn't load your story library right now. Please check your connection and try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="fantasy-cta px-8 py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              Try Again
            </button>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="fantasy-heading-cinzel text-3xl font-bold mb-2">
                📚 My Story Library
              </h1>
              <p className="text-white/70 text-lg">
                Manage your personal collection of magical tales ({filteredAndSortedStories.length} stories)
              </p>
            </div>
            <Link to="/create">
              <button className="fantasy-cta px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center">
                <Icon name="plus" size={20} className="mr-2" />
                Create New Story
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass-enhanced p-6 rounded-2xl">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, genre, or description..."
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

          {/* Filters and Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Stories', icon: '📖' },
                { key: 'published', label: 'Published', icon: '✅' },
                { key: 'draft', label: 'Drafts', icon: '📝' },
                { key: 'in-progress', label: 'In Progress', icon: '⏳' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`${filter === filterOption.key ? 'btn btn-primary' : 'btn btn-secondary'} flex items-center space-x-2`}
                >
                  <span>{filterOption.icon}</span>
                  <TypographyLayout variant="body">{filterOption.label}</TypographyLayout>
                </button>
              ))
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-white/70 text-sm">Sort by:</span>
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="glass-input px-3 py-2 rounded-lg text-sm"
                >
                  <option value="recent">Most Recent</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="genre">Genre</option>
                  <option value="status">Status</option>
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

              {/* Selection Actions */}
              {selectedStories.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400 text-sm">{selectedStories.size} selected</span>
                  <button
                    onClick={() => exportStories('json')}
                    className="glass-card text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Bulk Actions */}
              <button
                onClick={selectedStories.size === filteredAndSortedStories.length ? clearSelection : selectAllStories}
                className="glass-card text-white/80 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                {selectedStories.size === filteredAndSortedStories.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
      </CardLayout>

      {/* Stories Display */}
      <div className="">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStories.map((story: any) => (
              <div key={story.id} className="relative group">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedStories.has(story.id)}
                    onChange={() => toggleStorySelection(story.id)}
                    className="w-5 h-5 text-amber-500 bg-white/20 border-white/30 rounded focus:ring-amber-400 focus:ring-2"
                  />
                </div>

                {/* Story Card */}
                <div className="glass-enhanced rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 group">
                  {/* Story Image */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                    <img 
                      src={story.imageUrl || '/images/genres/fantasy/enchanted-world.png'} 
                      alt={story.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = '/images/genres/fantasy/enchanted-world.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        story.status === 'published' ? 'bg-green-500/80 text-white' :
                        story.status === 'draft' ? 'bg-yellow-500/80 text-white' :
                        'bg-blue-500/80 text-white'
                      }`}>
                        {story.status === 'published' ? '✅ Published' :
                         story.status === 'draft' ? '📝 Draft' :
                         '⏳ In Progress'}
                      </span>
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
                        <span className="text-white/60 text-sm">{story.age_group || 'All Ages'}</span>
                      </div>
                      <p className="text-white/80 text-sm line-clamp-2">{story.description}</p>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-white/60 text-xs">
                        Updated: {new Date(story.updated_at || story.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link to={`/stories/${story.id}`} className="flex-1">
                        <button className="w-full fantasy-cta px-4 py-2 text-sm rounded-lg hover:scale-105 transition-all duration-300">
                          Read Story
                        </button>
                      </Link>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setShareModalStory(story)}
                          className="glass-card text-white/80 hover:text-white border border-white/30 hover:border-amber-400/50 px-3 py-2 text-sm rounded-lg transition-all duration-300"
                          title="Share story"
                        >
                          <Icon name="share" size={14} />
                        </button>
                        <Link to={`/stories/${story.id}/edit`}>
                          <button className="glass-card text-white/80 hover:text-white border border-white/30 hover:border-amber-400/50 px-3 py-2 text-sm rounded-lg transition-all duration-300">
                            <Icon name="edit" size={14} />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredAndSortedStories.map((story: any) => (
              <div key={story.id} className="glass-enhanced rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-6">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedStories.has(story.id)}
                    onChange={() => toggleStorySelection(story.id)}
                    className="w-5 h-5 text-amber-500 bg-white/20 border-white/30 rounded focus:ring-amber-400 focus:ring-2"
                  />

                  {/* Story Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={story.imageUrl || '/images/genres/fantasy/enchanted-world.png'} 
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
                          <span className="text-white/60 text-sm">{story.age_group || 'All Ages'}</span>
                          <span className="text-white/60">•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            story.status === 'published' ? 'bg-green-500/80 text-white' :
                            story.status === 'draft' ? 'bg-yellow-500/80 text-white' :
                            'bg-blue-500/80 text-white'
                          }`}>
                            {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm">{story.description}</p>
                        <span className="text-white/60 text-xs">
                          Updated: {new Date(story.updated_at || story.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link to={`/stories/${story.id}`}>
                          <button className="fantasy-cta px-4 py-2 text-sm rounded-lg hover:scale-105 transition-all duration-300">
                            Read
                          </button>
                        </Link>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setShareModalStory(story)}
                            className="glass-card text-white/80 hover:text-white border border-white/30 hover:border-amber-400/50 px-3 py-2 text-sm rounded-lg transition-all duration-300"
                            title="Share story"
                          >
                            <Icon name="share" size={14} />
                          </button>
                          <Link to={`/stories/${story.id}/edit`}>
                            <button className="glass-card text-white/80 hover:text-white border border-white/30 hover:border-amber-400/50 px-3 py-2 text-sm rounded-lg transition-all duration-300">
                              <Icon name="edit" size={14} />
                            </button>
                          </Link>
                        </div>
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
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Stories Found</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? "No stories match your search criteria. Try adjusting your filters or search terms."
                : "You haven't created any stories yet. Start your storytelling journey today!"
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Link to="/create">
                <button className="fantasy-cta px-8 py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
                  Create Your First Story
                </button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModalStory && (
        <ShareStoryModal
          story={{
            id: shareModalStory.id,
            title: shareModalStory.title,
            description: shareModalStory.description,
            author_name: user?.full_name || user?.email || 'Anonymous'
          }}
          isOpen={!!shareModalStory}
          onClose={() => setShareModalStory(null)}
        />
      )}
    </div>
  );
};

export default StoryLibraryPage;