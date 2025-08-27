import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { CreditBalanceIndicator } from '@/components/business/CreditDisplay';
// Achievement service disabled
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const PrimaryNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = user
    ? [
      { name: 'Dashboard', path: '/dashboard', icon: 'user' },
      { name: 'Create', path: '/create', icon: 'plus' },
      { name: 'Stories', path: '/stories', icon: 'book' },
      { name: 'Pricing', path: '/pricing', icon: 'star' },
    ]
    : [
      { name: 'Features', path: '/features', icon: 'star' },
      { name: 'Pricing', path: '/pricing', icon: 'star' },
      { name: 'Help', path: '/help', icon: 'help-circle' },
    ];


  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <Icon name="tale-forge" size={36} animated={true} variation="default" />
                <span className="fantasy-heading-cinzel text-2xl sm:text-3xl font-bold text-amber-400 tracking-wide">
                  Tale Forge
                </span>
              </Link>
            </div>

            {/* Simple navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${isActive(link.path)
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-white/80 hover:border-white/30 hover:text-white'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 relative`}
                >
                  <Icon name={link.icon} size={16} className="mr-2" />
                  {link.name}
                </Link>
              ))}

            </div>
          </div>

          {/* Right side - User actions */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <CreditBalanceIndicator size="sm" />
                <Link
                  to="/account/settings"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm font-medium"
                  title="Settings"
                >
                  <Icon name="settings" size={18} />
                  <span>Settings</span>
                </Link>
                <Link
                  to="/notifications"
                  className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                  title="Notifications"
                >
                  <Icon name="bell" size={18} />
                </Link>
                <button
                  onClick={logout}
                  className="text-white/80 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm font-medium border border-white/20 hover:border-white/30"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/signin"
                  className="text-white/80 hover:text-white transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm font-medium border border-white/20 hover:border-white/30"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup"
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Sign Up
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