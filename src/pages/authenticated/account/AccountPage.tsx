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
    <div className="page-container">
      {/* Header */}
      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card">
            <h1 className="title-hero mb-4">
              ⚙️ Account Management
            </h1>
            <p className="text-body text-xl">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </section>

      {/* User Profile Card */}
      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card">
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center text-3xl font-bold text-white">
                {(user?.full_name || user?.email)?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6">
                <h2 className="title-card mb-1">
                  {user?.full_name || 'User'}
                </h2>
                <p className="text-body text-lg">
                  {user?.email}
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-green-400 text-sm flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Active Account
                  </span>
                  <span className="text-body-sm">
                    Role: {user?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/account/profile">
                <Button variant="primary" className="w-full">
                  👤 Edit Profile
                </Button>
              </Link>
              <Link to="/account/settings">
                <Button variant="secondary" className="w-full">
                  🔒 Account Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Account Sections */}
      <section className="p-section">
        <div className="container-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountSections.map((section, index) => (
              <Link 
                key={index} 
                to={section.link}
                className="glass-card hover:bg-black/30 transition-all duration-300 group block"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {section.icon}
                </div>
                <h3 className="title-card mb-2">
                  {section.title}
                </h3>
                <p className="text-body-sm">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountPage;