import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/atoms/Icon';
import Button from '@/components/atoms/Button';

const StoriesHubPage: React.FC = () => {
  const quickActions = [
    {
      title: 'Discover Stories',
      description: 'Browse our magical collection of community-created tales',
      icon: '🌟',
      iconBg: 'bg-purple-500',
      link: '/stories/discover',
      color: 'hover:border-purple-400/50',
    },
    {
      title: 'My Story Library',
      description: 'View and manage your personal collection of stories',
      icon: '📚',
      iconBg: 'bg-blue-500',
      link: '/stories/library',
      color: 'hover:border-blue-400/50',
    },
    {
      title: 'Search Stories',
      description: 'Find stories by genre, age group, or specific keywords',
      icon: '🔍',
      iconBg: 'bg-green-500',
      link: '/stories/search',
      color: 'hover:border-green-400/50',
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
    <div className="min-h-screen py-8">
      <div className="container-lg">
        {/* Header */}
        <div className="glass-card p-8 mb-8">
          <h1 className="title-hero mb-4 text-center">
            Your Story Universe
          </h1>
          <p className="text-body text-xl text-center max-w-3xl mx-auto">
            Welcome to your personal story hub - discover new tales, manage your library, and dive into magical worlds
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              to={action.link}
              className={`glass-card p-6 ${action.color} hover:transform hover:scale-105 transition-all duration-300 group`}
            >
              <div className="flex items-center mb-4">
                <div className={`${action.iconBg} rounded-lg p-3 mr-4`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <h3 className="title-card group-hover:text-amber-400 transition-colors">
                  {action.title}
                </h3>
              </div>
              <p className="text-body mb-6">
                {action.description}
              </p>
              <div className="flex items-center text-amber-400 group-hover:text-white transition-colors">
                <span className="mr-2">Explore</span>
                <Icon name="star" size={16} />
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="glass-card p-6 mb-8">
          <h2 className="title-section mb-6">
            Your Story Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">12</div>
              <div className="text-body">Stories Read</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">3</div>
              <div className="text-body">Stories Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">8</div>
              <div className="text-body">Stories Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">45</div>
              <div className="text-body">Reading Hours</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="title-section mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="glass-card p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center">
                  <div className={`${activity.iconBg} rounded-full p-3 mr-4`}>
                    <Icon name={activity.icon as any} size={20} className={activity.iconColor} />
                  </div>
                  <div className="flex-1">
                    <div className="text-body font-medium">
                      {activity.action} "{activity.story}"
                    </div>
                    <div className="text-white/60 text-sm">
                      {activity.time}
                    </div>
                  </div>
                  <Icon name="star" size={16} className="text-amber-400/50" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/account/history">
              <Button variant="ghost" size="medium">
                <Icon name="search" size={16} className="mr-2" />
                View All Activity
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesHubPage;