import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/atoms/Icon';
import { useAuth } from '@/providers/AuthContext';

interface Collection {
  id: string;
  name: string;
  description: string;
  story_count: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  cover_image?: string;
}

interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  age_group: string;
  image_url?: string;
  author_name: string;
}

const CollectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionStories, setCollectionStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionPublic, setNewCollectionPublic] = useState(false);

  // Mock collections data
  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'Bedtime Favorites',
      description: 'Gentle stories perfect for winding down',
      story_count: 8,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      is_public: false,
      cover_image: '/images/genres/bedtime/peaceful-bedtime.png'
    },
    {
      id: '2',
      name: 'Space Adventures',
      description: 'Epic tales from across the galaxy',
      story_count: 12,
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-18T16:20:00Z',
      is_public: true,
      cover_image: '/images/genres/sci-fi/futuristic-space-adventure.png'
    },
    {
      id: '3',
      name: 'Educational Tales',
      description: 'Stories that teach while entertaining',
      story_count: 15,
      created_at: '2024-01-05T12:00:00Z',
      updated_at: '2024-01-22T09:45:00Z',
      is_public: true,
      cover_image: '/images/genres/educational/educational-content.png'
    }
  ];

  const mockStories: Story[] = [
    {
      id: '1',
      title: 'The Sleepy Moon Dragon',
      description: 'A gentle dragon helps children fall asleep with magical dreams',
      genre: 'bedtime',
      age_group: '4-6',
      image_url: '/images/genres/bedtime/peaceful-bedtime.png',
      author_name: 'DreamWeaver'
    },
    {
      id: '2',
      title: 'Counting Stars',
      description: 'Learn numbers while exploring the night sky',
      genre: 'bedtime',
      age_group: '4-6',
      author_name: 'StarCounter'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCollections(mockCollections);
      setIsLoading(false);
    }, 1000);
  }, []);

  const createCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDescription,
      story_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_public: newCollectionPublic
    };

    setCollections([newCollection, ...collections]);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setNewCollectionPublic(false);
    setShowCreateModal(false);
  };

  const deleteCollection = (collectionId: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      setCollections(collections.filter(c => c.id !== collectionId));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
        setCollectionStories([]);
      }
    }
  };

  const viewCollectionStories = (collection: Collection) => {
    setSelectedCollection(collection);
    setCollectionStories(mockStories); // In real app, fetch stories for this collection
  };

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

          {/* Loading Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-enhanced rounded-xl p-6 animate-pulse">
                <div className="h-32 bg-white/20 rounded-lg mb-4"></div>
                <div className="h-6 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="h-8 bg-white/10 rounded"></div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="fantasy-heading text-3xl font-bold mb-2">
                📂 My Collections
              </h1>
              <p className="text-white/70 text-lg">
                Organize your favorite stories into themed collections ({collections.length} collections)
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="fantasy-cta px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center"
            >
              <Icon name="plus" size={20} className="mr-2" />
              New Collection
            </button>
          </div>
        </div>
      </div>

      {selectedCollection ? (
        /* Collection Detail View */
        <div className="max-w-7xl mx-auto">
          {/* Back Button and Collection Header */}
          <div className="glass-enhanced p-6 rounded-2xl mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => {
                  setSelectedCollection(null);
                  setCollectionStories([]);
                }}
                className="glass-card text-white/80 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <Icon name="arrow-left" size={16} className="mr-2" />
                Back to Collections
              </button>
            </div>
            
            <div className="flex items-start space-x-6">
              <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={selectedCollection.cover_image || '/images/genres/fantasy/enchanted-world.png'}
                  alt={selectedCollection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="fantasy-heading text-2xl font-bold mb-2">{selectedCollection.name}</h2>
                <p className="text-white/80 mb-4">{selectedCollection.description}</p>
                <div className="flex items-center space-x-4 text-white/60 text-sm">
                  <span>{selectedCollection.story_count} stories</span>
                  <span>•</span>
                  <span>{selectedCollection.is_public ? 'Public' : 'Private'}</span>
                  <span>•</span>
                  <span>Updated {new Date(selectedCollection.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="glass-card text-white/80 hover:text-white px-4 py-2 rounded-lg transition-colors">
                  <Icon name="edit" size={16} />
                </button>
                <button
                  onClick={() => deleteCollection(selectedCollection.id)}
                  className="glass-card text-red-400 hover:text-red-300 px-4 py-2 rounded-lg transition-colors"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Collection Stories */}
          <div className="glass-enhanced p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Stories in Collection</h3>
              <button className="fantasy-cta px-4 py-2 rounded-lg text-sm hover:scale-105 transition-all duration-300">
                Add Stories
              </button>
            </div>

            {collectionStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collectionStories.map((story) => (
                  <div key={story.id} className="glass-card bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300">
                    <div className="relative h-48">
                      <img
                        src={story.image_url || '/images/genres/fantasy/enchanted-world.png'}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-lg font-bold text-white mb-2">{story.title}</h4>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-amber-400 text-sm font-medium">{story.genre}</span>
                        <span className="text-white/60">•</span>
                        <span className="text-white/60 text-sm">{story.age_group}</span>
                      </div>
                      <p className="text-white/80 text-sm mb-4 line-clamp-2">{story.description}</p>
                      <div className="flex space-x-2">
                        <Link to={`/stories/${story.id}`} className="flex-1">
                          <button className="w-full fantasy-cta px-4 py-2 text-sm rounded-lg hover:scale-105 transition-all duration-300">
                            Read Story
                          </button>
                        </Link>
                        <button className="glass-card text-white/80 hover:text-white border border-white/30 hover:border-red-400/50 px-4 py-2 text-sm rounded-lg transition-all duration-300">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">📖</div>
                <h4 className="text-xl font-bold text-white mb-4">No Stories Yet</h4>
                <p className="text-white/70 mb-6">Start building this collection by adding your favorite stories.</p>
                <button className="fantasy-cta px-8 py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
                  Browse Stories to Add
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collections Grid View */
        <div className="max-w-7xl mx-auto">
          {collections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <div key={collection.id} className="glass-enhanced rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 group">
                  {/* Collection Cover */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                    <img
                      src={collection.cover_image || '/images/genres/fantasy/enchanted-world.png'}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Collection Status */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        collection.is_public
                          ? 'bg-green-500/80 text-white'
                          : 'bg-blue-500/80 text-white'
                      }`}>
                        {collection.is_public ? '🌍 Public' : '🔒 Private'}
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-4 left-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteCollection(collection.id)}
                        className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600/80 transition-colors"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Collection Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-amber-400 font-medium">
                        {collection.story_count} stories
                      </span>
                      <span className="text-white/60 text-xs">
                        Updated {new Date(collection.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewCollectionStories(collection)}
                        className="flex-1 fantasy-cta px-4 py-2 text-sm rounded-lg hover:scale-105 transition-all duration-300"
                      >
                        View Collection
                      </button>
                      <button className="glass-card text-white/80 hover:text-white border border-white/30 hover:border-amber-400/50 px-4 py-2 text-sm rounded-lg transition-all duration-300">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="glass-enhanced rounded-xl p-12 text-center">
              <div className="text-6xl mb-6">📂</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Collections Yet</h3>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Create your first collection to organize your favorite stories by theme, genre, or any way you like!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="fantasy-cta px-8 py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
              >
                Create Your First Collection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-enhanced bg-black/40 border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="fantasy-heading text-2xl font-bold">
                ✨ Create Collection
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Bedtime Favorites, Space Adventures"
                  className="glass-input w-full p-3 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Describe what this collection is about..."
                  className="glass-input w-full p-3 rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="publicCollection"
                  checked={newCollectionPublic}
                  onChange={(e) => setNewCollectionPublic(e.target.checked)}
                  className="w-5 h-5 text-amber-500 bg-white/20 border-white/30 rounded focus:ring-amber-400 focus:ring-2"
                />
                <label htmlFor="publicCollection" className="text-white font-medium">
                  Make this collection public
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 glass-card text-white/80 hover:text-white border border-white/30 hover:border-white/50 py-3 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={createCollection}
                disabled={!newCollectionName.trim()}
                className="flex-1 fantasy-cta py-3 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;