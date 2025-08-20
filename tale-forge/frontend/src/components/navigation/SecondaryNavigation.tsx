import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Text from '@/components/atoms/Text';

interface SecondaryNavigationProps {
  context: 'stories' | 'account' | 'admin' | 'none';
}

const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({ context }) => {
  const location = useLocation();

  const getNavLinks = () => {
    switch (context) {
      case 'stories':
        return [
          { name: 'Discover', path: '/stories/discover' },
          { name: 'My Library', path: '/stories/library' },
          { name: 'Search', path: '/stories/search' },
        ];
      case 'account':
        return [
          { name: 'Profile', path: '/account/profile' },
          { name: 'Settings', path: '/account/settings' },
          { name: 'Billing', path: '/account/billing' },
          { name: 'Export', path: '/account/export' },
          { name: 'History', path: '/account/history' },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin' },
          { name: 'Analytics', path: '/admin/analytics' },
          { name: 'Users', path: '/admin/users' },
          { name: 'Content', path: '/admin/content' },
          { name: 'System', path: '/admin/system' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (navLinks.length === 0) {
    return null;
  }

  // Use cosmic theme for admin context
  if (context === 'admin') {
    return (
      <div className="glass-enhanced backdrop-blur-lg bg-black/30 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navLinks.map((link) => {
              const linkIcons = {
                'Dashboard': '🏠',
                'Analytics': '📊',
                'Users': '👥',
                'Content': '🛡️',
                'System': '⚙️'
              };
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-white/70 hover:text-white hover:border-white/30'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 flex items-center space-x-2`}
                >
                  <span>{linkIcons[link.name as keyof typeof linkIcons]}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${
                isActive(link.path)
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecondaryNavigation;