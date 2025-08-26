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
      description: 'Start the 5-step wizard',
      icon: 'plus',
      color: 'bg-green-500',
      link: '/create'
    },
    {
      title: 'My Stories',
      description: 'View all your stories',
      icon: 'book',
      color: 'bg-blue-500',
      link: '/stories'
    },
    {
      title: 'Template Gallery',
      description: 'Coming soon!',
      icon: 'book',
      color: 'bg-purple-500/50',
      link: '/templates'
    },
    {
      title: 'Achievements',
      description: 'Coming soon!',
      icon: 'trophy',
      color: 'bg-amber-500/50',
      link: '/achievements'
    }
  ];

  return (
    <div className="page-content">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="title-hero mb-4">
          Welcome back{user?.full_name ? `, ${user.full_name}` : ''}! ✨
        </h1>
        <p className="text-body text-xl max-w-3xl mx-auto">
          Ready to continue your storytelling journey? Create magical tales with our 5-step wizard and discover new adventures.
        </p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Stats Dashboard */}
          <div className="lg:col-span-2">
            <div className="glass-card">
              <h2 className="title-section text-center mb-6">
                📊 Your Story Journey
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {userStats.storiesCreated}
                  </div>
                  <div className="text-white/70 text-sm">Stories Created</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    {userStats.storiesRead}
                  </div>
                  <div className="text-white/70 text-sm">Stories Read</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-amber-400 mb-1">
                    {userStats.readingStreak}
                  </div>
                  <div className="text-white/70 text-sm">Day Streak</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {userStats.readingTime}
                  </div>
                  <div className="text-white/70 text-sm">Hours Read</div>
                </div>
              </div>

              {/* Motivational Section */}
              <div className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="title-card mb-2">Keep Creating Magic!</h3>
                <p className="text-muted mb-6">
                  Every story you create adds to your amazing collection of adventures.
                </p>

                {userStats.storiesCreated === 0 ? (
                  <Link
                    to="/create"
                    className="btn btn-primary btn-lg"
                  >
                    Create Your First Story! 🎉
                  </Link>
                ) : (
                  <Link
                    to="/create"
                    className="btn btn-primary btn-lg"
                  >
                    Create Another Adventure! 🚀
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Stories & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Stories */}
            <div className="glass-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="title-card">
                  📚 Recent Stories
                </h2>
                <Link
                  to="/stories"
                  className="btn btn-primary btn-sm"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="space-y-2">
                        <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                        <div className="h-3 bg-white/15 rounded animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ))
                ) : recentStories.length > 0 ? (
                  recentStories.slice(0, 3).map((story) => (
                    <Link
                      key={story.id}
                      to={`/stories/${story.id}`}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 group flex items-center space-x-3"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg flex items-center justify-center">
                        <Icon name="book" size={20} className="text-amber-400/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium group-hover:text-primary transition-colors truncate">
                          {story.title}
                        </h3>
                        <p className="text-muted text-xs">
                          {story.isCompleted ? 'Complete' : `${story.progress}% read`} • {story.lastRead}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icon name="book" size={32} className="text-amber-400/50 mx-auto mb-2" />
                    <p className="text-muted text-sm">No stories yet. Create your first story!</p>
                  </div>
                )}
              </div>

              {/* Continue Reading Prompt */}
              {recentStories.length > 0 && !recentStories[0].isCompleted && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg">
                  <div className="text-center">
                    <p className="text-white text-sm mb-2">
                      📖 Continue "{recentStories[0].title}"
                    </p>
                    <Link
                      to={`/stories/${recentStories[0].id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Continue Reading →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="glass-card">
              <h3 className="title-card text-center mb-6">
                ⚡ Quick Actions
              </h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 group flex items-center space-x-3"
                  >
                    <div className={`${action.color} rounded-lg p-2 group-hover:scale-110 transition-transform`}>
                      <Icon name={action.icon as any} size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium group-hover:text-primary transition-colors text-sm">
                        {action.title}
                      </div>
                      <div className="text-muted text-xs">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default DashboardPage;