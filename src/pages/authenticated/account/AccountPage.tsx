import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import Button from '@/components/atoms/Button';

const AccountPage: React.FC = () => {
  const { user } = useAuth();

  const accountSections = [
    {
      title: 'Profile',
      description: 'Manage your personal information and preferences',
      icon: '👤',
      link: '/account/profile'
    },
    {
      title: 'Settings',
      description: 'Customize your experience and notification preferences',
      icon: '⚙️',
      link: '/account/settings'
    },
    {
      title: 'Billing',
      description: 'Manage your subscription and payment methods',
      icon: '💳',
      link: '/account/billing'
    },
    {
      title: 'Export',
      description: 'Download your stories and data',
      icon: '📤',
      link: '/account/export'
    },
    {
      title: 'History',
      description: 'View your reading and creation history',
      icon: '📋',
      link: '/account/history'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" 
                  style={{ fontFamily: 'Cinzel, serif' }}>
                ⚙️ Account Management
              </h1>
              <p className="text-xl text-white/90">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center text-3xl font-bold text-white">
              {(user?.full_name || user?.email)?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.full_name || 'User'}
              </h2>
              <p className="text-white/70 text-lg">
                {user?.email}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-green-400 text-sm flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Active Account
                </span>
                <span className="text-white/60 text-sm">
                  Role: {user?.role || 'User'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/account/profile">
              <Button className="fantasy-btn bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 w-full flex items-center justify-center space-x-2">
                <span>👤</span>
                <span>Edit Profile</span>
              </Button>
            </Link>
            <Link to="/account/settings">
              <Button className="fantasy-btn bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 w-full flex items-center justify-center space-x-2">
                <span>🔒</span>
                <span>Account Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Account Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accountSections.map((section, index) => (
            <Link 
              key={index} 
              to={section.link}
              className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {section.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {section.title}
              </h3>
              <p className="text-white/70">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;