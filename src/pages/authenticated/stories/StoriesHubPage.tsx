import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/atoms/Icon';
import Button from '@/components/atoms/Button';

const StoriesHubPage: React.FC = () => {
  // Handle body background for this page
  useEffect(() => {
    const body = document.body;
    const originalBackground = body.style.background;
    const originalBackgroundImage = body.style.backgroundImage;
    const originalBackgroundAttachment = body.style.backgroundAttachment;
    const originalBackgroundSize = body.style.backgroundSize;
    const originalBackgroundPosition = body.style.backgroundPosition;
    const originalBackgroundRepeat = body.style.backgroundRepeat;
    
    body.style.background = 'none';
    body.style.backgroundImage = 'url(/images/pages/home/cosmic-library.png)';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
    
    // Cleanup function to restore original background
    return () => {
      body.style.background = originalBackground;
      body.style.backgroundImage = originalBackgroundImage;
      body.style.backgroundAttachment = originalBackgroundAttachment;
      body.style.backgroundSize = originalBackgroundSize;
      body.style.backgroundPosition = originalBackgroundPosition;
      body.style.backgroundRepeat = originalBackgroundRepeat;
    };
  }, []);

  const quickActions = [
    {
      title: 'Discover Stories',
      description: 'Browse our magical collection of community-created tales',
      icon: '🌟',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      link: '/stories/discover',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    },
    {
      title: 'My Story Library',
      description: 'View and manage your personal collection of stories',
      icon: '📚',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      link: '/stories/library',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    },
    {
      title: 'Search Stories',
      description: 'Find stories by genre, age group, or specific keywords',
      icon: '🔍',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      link: '/stories/search',
      borderColor: 'border-green-500/30 hover:border-green-500/60',
    },
  ];

  const recentActivities = [
    {
      action: 'Discovered',
      story: 'Cosmic Space Adventure',
      time: '2 hours ago',
      icon: 'star',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
    },
    {
      action: 'Started Reading',
      story: 'The Enchanted Forest Kingdom',
      time: '1 day ago',
      icon: 'book',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      action: 'Completed',
      story: 'Gentle Moon Dreams',
      time: '3 days ago',
      icon: 'check',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
    },
  ];

  return (
    <div className="min-h-screen py-8 container-lg">
      {/* Header - Simplified */}
      <div className="text-center mb-12">
        <h1 className="title-hero mb-4 text-white">Your Story Universe</h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          Welcome to your personal story hub - discover new tales, manage your library, and dive into magical worlds
        </p>
      </div>

      {/* Quick Actions Grid - Cleaner Design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {quickActions.map((action, index) => (
          <Link 
            key={index}
            to={action.link}
            className={`bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border ${action.borderColor} hover:transform hover:scale-105 transition-all duration-300 group`}
          >
            <div className="flex items-center mb-4">
              <div className={`${action.iconBg} rounded-xl p-3 mr-4 shadow-lg`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-white group-hover:text-orange-400 transition-colors">
                {action.title}
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              {action.description}
            </p>
            <div className="flex items-center text-orange-400 group-hover:text-orange-300 transition-colors">
              <span className="mr-2">Explore</span>
              <Icon name="star" size={16} />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Overview - Single Clean Container */}
      <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-8 mb-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Your Story Journey</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400 mb-2">12</div>
            <div className="text-gray-400">Stories Read</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">3</div>
            <div className="text-gray-400">Stories Created</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">8</div>
            <div className="text-gray-400">Stories Completed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">45</div>
            <div className="text-gray-400">Reading Hours</div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Simplified */}
      <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
        
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center p-4 rounded-lg hover:bg-white/5 transition-colors">
              <div className={`${activity.iconBg} rounded-full p-3 mr-4`}>
                <Icon name={activity.icon as any} size={20} className={activity.iconColor} />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">
                  {activity.action} <span className="text-orange-400">"{activity.story}"</span>
                </div>
                <div className="text-gray-500 text-sm">
                  {activity.time}
                </div>
              </div>
              <Icon name="star" size={16} className="text-orange-400/30" />
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/account/history">
            <Button variant="ghost" size="medium" className="hover:bg-white/10">
              <Icon name="search" size={16} className="mr-2" />
              View All Activity
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StoriesHubPage;