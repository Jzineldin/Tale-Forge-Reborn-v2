import React from 'react';
import { PrimaryNavigation } from '@/components/navigation';
import { MobileNavigation } from '@/components/navigation';
import Text from '@/components/atoms/Text';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PrimaryNavigation />
      <MobileNavigation />
      
      <main className="flex-grow pt-16 pb-16 md:pb-0">
        {children}
      </main>
      
      {showFooter && (
        <footer className="nav-glass border-t-0 mt-8">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex justify-center md:justify-start">
                <Text variant="p" size="sm" className="text-white/80">
                  © 2025 Tale Forge. All rights reserved.
                </Text>
              </div>
              <div className="mt-4 md:mt-0 flex justify-center space-x-6">
                <a href="/legal/privacy" className="text-white/70 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="/legal/terms" className="text-white/70 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="/contact" className="text-white/70 hover:text-white transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;