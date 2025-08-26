import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { CreditBalanceIndicator } from '@/components/business/CreditDisplay';
// Achievement service disabled
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const PrimaryNavigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [showComingSoonDropdown, setShowComingSoonDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowComingSoonDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Achievements disabled for now
  useEffect(() => {
    setUnclaimedCount(0);
  }, []);

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

  const comingSoonItems = [
    { name: 'Templates', path: '/templates', icon: 'book', description: 'Browse story templates' },
    { name: 'Achievements', path: '/achievements', icon: 'trophy', description: 'Track your progress', hasNotification: user && unclaimedCount > 0, notificationCount: unclaimedCount },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="glass-enhanced sticky top-0 z-50 border-b border-amber-400/10 bg-slate-900/95">
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
                  className={`${
                    isActive(link.path)
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-white/80 hover:border-white/30 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 relative`}
                >
                  <Icon name={link.icon} size={16} className="mr-2" />
                  {link.name}
                </Link>
              ))}
              
              {/* Coming Soon Dropdown */}
              <div className="relative inline-flex items-center" ref={dropdownRef}>
                <button
                  onClick={() => setShowComingSoonDropdown(!showComingSoonDropdown)}
                  className={`${
                    comingSoonItems.some(item => isActive(item.path))
                      ? 'border-amber-400 text-amber-400'
                      : 'border-transparent text-white/80 hover:border-white/30 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 relative h-full`}
                >
                  <Icon name="clock" size={16} className="mr-2" />
                  Coming Soon
                  <Icon name="chevron-down" size={14} className="ml-1" />
                  {comingSoonItems.some(item => item.hasNotification) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unclaimedCount}
                    </span>
                  )}
                </button>
                
                {/* Dropdown Menu */}
                {showComingSoonDropdown && (
                  <div className="absolute left-0 top-full mt-1 w-64 rounded-lg glass-enhanced bg-slate-900/95 border border-white/20 shadow-xl z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                        Features Coming Soon
                      </div>
                      {comingSoonItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowComingSoonDropdown(false)}
                          className={`${
                            isActive(item.path)
                              ? 'bg-amber-400/10 text-amber-400'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          } flex items-center px-4 py-3 transition-colors duration-200 relative group`}
                        >
                          <Icon name={item.icon} size={18} className="mr-3" />
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-white/60 group-hover:text-white/80">
                              {item.description}
                            </div>
                          </div>
                          {item.hasNotification && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {item.notificationCount}
                            </span>
                          )}
                        </Link>
                      ))}
                      <div className="px-4 py-3 border-t border-white/10">
                        <div className="text-xs text-amber-400/80 text-center">
                          🚧 More features coming soon!
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <CreditBalanceIndicator size="sm" />
                <Link
                  to="/notifications"
                  className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
                  title="Notifications"
                >
                  <Icon name="bell" size={18} />
                </Link>
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={logout} 
                  className="glass-card text-white border-white/30"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
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