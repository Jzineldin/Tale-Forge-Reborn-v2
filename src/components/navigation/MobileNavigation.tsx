import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import { CreditBalanceIndicator } from '@/components/business/CreditDisplay';
import Text from '@/components/atoms/Text';
import Icon from '@/components/atoms/Icon';

const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = user
    ? [
        { name: 'Home', path: '/dashboard', icon: 'home' },
        { name: 'Stories', path: '/stories', icon: 'book' },
        { name: 'Create', path: '/create', icon: 'plus' },
        { name: 'More', path: '#more', icon: 'menu', isDropdown: true },
      ]
    : [
        { name: 'Home', path: '/', icon: 'home' },
        { name: 'Features', path: '/features', icon: 'star' },
        { name: 'Showcase', path: '/showcase', icon: 'star' },
        { name: 'Sign In', path: '/signin', icon: 'key' },
      ];

  const comingSoonItems = [
    { name: 'Templates', path: '/templates', icon: 'book' },
    { name: 'Achievements', path: '/achievements', icon: 'trophy' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="md:hidden">
      {/* Mobile menu button */}
      <div className="flex items-center justify-between p-4 glass-enhanced border-b border-white/20 sticky top-0 z-50">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
          <Icon name="tale-forge" size={28} />
          <Text variant="h1" weight="bold" className="text-xl text-amber-400 text-shadow-md fantasy-heading">
            Tale Forge
          </Text>
        </Link>
        <div className="flex items-center gap-3">
          {user && <CreditBalanceIndicator size="sm" />}
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 focus:outline-none transition-colors duration-200"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 glass-enhanced backdrop-blur-lg shadow-2xl z-50 border-b border-white/20">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  isActive(link.path)
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                    : 'border-transparent text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white'
                } block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all duration-200 flex items-center`}
                onClick={() => setIsOpen(false)}
              >
                <Icon name={link.icon} size={20} className="mr-3" />
                {link.name}
              </Link>
            ))}
          </div>
          {user && (
            <div className="pt-4 pb-3 border-t border-white/20">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/50">
                    <span className="text-amber-300 font-medium">{user.full_name?.charAt(0) || user.email?.charAt(0)}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.full_name || user.email}</div>
                  <div className="text-sm font-medium text-white/60">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/account/settings"
                  className="block px-4 py-2 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon name="settings" size={16} className="mr-3" />
                  Settings
                </Link>
                <Link
                  to="/pricing"
                  className="block px-4 py-2 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon name="star" size={16} className="mr-3" />
                  Pricing
                </Link>
                <Link
                  to="/notifications"
                  className="block px-4 py-2 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Icon name="bell" size={16} className="mr-3" />
                  Notifications
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 flex items-center"
                >
                  <Icon name="logout" size={16} className="mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 glass-enhanced border-t border-white/20 md:hidden backdrop-blur-lg safe-area-pb">
        <div className="grid grid-cols-5 gap-0">
          {navLinks.slice(0, 5).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${
                isActive(link.path)
                  ? 'text-amber-400'
                  : 'text-white/70 hover:text-white'
              } flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors duration-200`}
            >
              <Icon name={link.icon} size={24} className="mb-1" />
              <span className="text-shadow-sm">{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;