import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const PrimaryNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = user
    ? [
        { name: 'Home', path: '/', icon: 'home' },
        { name: 'Dashboard', path: '/dashboard', icon: 'user' },
        { name: 'Stories', path: '/stories', icon: 'book' },
        { name: 'Create', path: '/create', icon: 'plus' },
      ]
    : [
        { name: 'Home', path: '/', icon: 'home' },
        { name: 'Features', path: '/features', icon: 'star' },
        { name: 'Help', path: '/help', icon: 'help-circle' },
      ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="glass-enhanced sticky top-0 z-50 border-b border-amber-400/10 bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-3">
                <Icon name="tale-forge" size={36} animated={true} variation="default" />
                <span className="fantasy-heading-cinzel text-2xl sm:text-3xl font-bold text-amber-400 tracking-wide">
                  Tale Forge
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-white/80 hover:border-white/30 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 text-shadow-sm`}
                >
                  <span className="mr-2">
                    <Icon name={link.icon} size={16} />
                  </span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/notifications"
                  className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                >
                  <Icon name="bell" size={20} />
                </Link>
                <Link
                  to="/account"
                  className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                >
                  <Icon name="user" size={20} />
                </Link>
                <Button variant="secondary" size="small" onClick={logout} className="glass-card text-white border-white/30">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/signin">
                  <Button variant="secondary" size="small" className="glass-card text-white border-white/30">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="small" className="bg-amber-500 hover:bg-amber-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PrimaryNavigation;