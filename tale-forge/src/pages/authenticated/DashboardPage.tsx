import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import Icon from '@/components/atoms/Icon';
import { supabase } from '@/lib/supabase';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [recentStories, setRecentStories] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    storiesCreated: 0,
    storiesRead: 0,
    readingStreak: 0,
    readingTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        console.log('Fetching dashboard data for user:', user.id);
        
        // Fetch recent stories
        const { data: stories, error: storiesError } = await supabase
          .from('stories')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(4);

        if (storiesError) {
          console.error('Error fetching stories:', storiesError);
          setRecentStories([]);
        } else {
          console.log('Fetched stories:', stories);
          
          // Transform stories to match the expected format
          const transformedStories = stories?.map(story => ({
            id: story.id,
            title: story.title,
            description: story.description || 'No description available',
            genre: story.genre || 'fantasy',
            genreLabel: (story.genre || 'fantasy').charAt(0).toUpperCase() + (story.genre || 'fantasy').slice(1),
            ageGroup: story.target_age || '7-9',
            imageUrl: story.cover_image_url || story.thumbnail_url || '/images/placeholder-story.png',
            progress: 85, // Could calculate this from reading progress later
            lastRead: formatTimeAgo(story.updated_at || story.created_at),
            isCompleted: story.is_completed || false
          })) || [];
          
          setRecentStories(transformedStories);
        }

        // Fetch user statistics
        const { count: totalStoriesCreated } = await supabase
          .from('stories')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // For now, use basic stats - could be enhanced with reading_progress table later
        setUserStats({
          storiesCreated: totalStoriesCreated || 0,
          storiesRead: Math.floor((totalStoriesCreated || 0) * 1.5), // Estimate
          readingStreak: 7, // Could track this with login data
          readingTime: Math.floor((totalStoriesCreated || 0) * 2) // Estimate based on stories
        });

      } catch (error) {
        console.error('Unexpected error fetching dashboard data:', error);
        setRecentStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    return 'Less than an hour ago';
  };

  // Mock data as fallback (keeping the structure)
  const fallbackStories = [
    {
      id: '1',
      title: 'The Magic Forest Adventure',
      description: 'Join Emma on her journey through a magical forest filled with talking animals and mystical creatures.',
      genre: 'fantasy',
      genreLabel: 'Fantasy',
      ageGroup: '6-8',
      imageUrl: '/images/genres/fantasy/enchanted-world.png',
      progress: 85,
      lastRead: '2 hours ago',
      isCompleted: false
    },
    {
      id: '2',
      title: 'Cosmic Space Explorer',
      description: 'Travel to distant galaxies and meet friendly alien civilizations in this space adventure.',
      genre: 'sci-fi',
      genreLabel: 'Space Adventure',
      ageGroup: '8-10',
      imageUrl: '/images/genres/sci-fi/futuristic-space-adventure.png',
      progress: 100,
      lastRead: '1 day ago',
      isCompleted: true
    },
    {
      id: '3',
      title: 'The Lost Treasure Island',
      description: 'Follow brave Captain Luna as she searches for buried treasure on a mysterious tropical island.',
      genre: 'adventure',
      genreLabel: 'Adventure',
      ageGroup: '7-9',
      imageUrl: '/images/genres/adventure/futuristic-adventure.png',
      progress: 45,
      lastRead: '3 days ago',
      isCompleted: false
    },
    {
      id: '4',
      title: 'Gentle Moonlight Dreams',
      description: 'A peaceful bedtime story about a little star who helps children have wonderful dreams.',
      genre: 'bedtime',
      genreLabel: 'Bedtime Story',
      ageGroup: '4-6',
      imageUrl: '/images/genres/bedtime/peaceful-bedtime.png',
      progress: 100,
      lastRead: '5 days ago',
      isCompleted: true
    }
  ];

  const quickActions = [
    {
      title: 'Create New Story',
      description: 'Start crafting a magical tale',
      icon: 'plus',
      color: 'bg-green-500',
      link: '/create'
    },
    {
      title: 'Discover Stories',
      description: 'Browse community tales',
      icon: 'search',
      color: 'bg-purple-500',
      link: '/stories/discover'
    },
    {
      title: 'My Story Library',
      description: 'View all your stories',
      icon: 'book',
      color: 'bg-blue-500',
      link: '/stories/library'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" 
              style={{ fontFamily: 'Cinzel, serif' }}>
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}! ✨
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Ready to continue your storytelling journey? Here's what's waiting for you in your magical universe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Recent Stories */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Stories */}
            <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cinzel, serif' }}>
                  📚 Recent Stories
                </h2>
                <Link 
                  to="/stories/library"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  View All Stories →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <div className="h-32 bg-white/10 animate-pulse"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                        <div className="h-3 bg-white/15 rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-white/10 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : recentStories.length > 0 ? (
                  recentStories.map((story) => (
                  <Link
                    key={story.id}
                    to={`/stories/${story.id}`}
                    className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
                  >
                    {/* Story Image */}
                    <div className="relative h-32 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                      <img 
                        src={story.imageUrl} 
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                        <Icon name="book" size={32} className="text-amber-400/50" />
                      </div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        {story.isCompleted ? (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            ✓ Complete
                          </span>
                        ) : (
                          <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {story.progress}% Read
                          </span>
                        )}
                      </div>

                      {/* Genre Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                          {story.genreLabel}
                        </span>
                      </div>
                    </div>

                    {/* Story Info */}
                    <div className="p-4">
                      <h3 className="text-white font-bold mb-2 group-hover:text-amber-400 transition-colors line-clamp-1">
                        {story.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">
                        {story.description}
                      </p>

                      {/* Progress Bar */}
                      {!story.isCompleted && (
                        <div className="mb-3">
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${story.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-white/60">
                        <span>Age {story.ageGroup}</span>
                        <span>{story.lastRead}</span>
                      </div>
                    </div>
                  </Link>
                ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60">No stories found. Create your first story to get started!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Reading Prompt */}
            {recentStories.length > 0 && !recentStories[0].isCompleted && (
              <div className="glass-enhanced backdrop-blur-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      📖 Ready to continue reading?
                    </h3>
                    <p className="text-white/80">
                      Pick up where you left off in "{recentStories[0].title}"
                    </p>
                  </div>
                  <Link 
                    to={`/stories/${recentStories[0].id}`}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold hover:scale-105 transform duration-200"
                  >
                    Continue Story →
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
                ⚡ Quick Actions
              </h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 hover:scale-105 group flex items-center space-x-4"
                  >
                    <div className={`${action.color} rounded-lg p-3 group-hover:scale-110 transition-transform`}>
                      <Icon name={action.icon as any} size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                        {action.title}
                      </div>
                      <div className="text-white/60 text-sm">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Stats */}
            <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
                📊 Your Story Journey
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Stories Created</span>
                  <span className="text-2xl font-bold text-amber-400">{userStats.storiesCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Stories Read</span>
                  <span className="text-2xl font-bold text-blue-400">{userStats.storiesRead}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Reading Streak</span>
                  <span className="text-2xl font-bold text-green-400">{userStats.readingStreak} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Reading Time</span>
                  <span className="text-2xl font-bold text-purple-400">{userStats.readingTime}h</span>
                </div>
              </div>
              
              {/* Achievement */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="text-white font-semibold">Story Explorer!</div>
                    <div className="text-white/70 text-sm">You've read 5+ different genres</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;