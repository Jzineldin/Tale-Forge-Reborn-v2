import React from 'react';
import { PrimaryNavigation } from '@/components/navigation';
import { SecondaryNavigation } from '@/components/navigation';
import { MobileNavigation } from '@/components/navigation';
interface AdminLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, showFooter = true }) => {

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Floating Cosmic Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-500/20 blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-blue-500/20 blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-full bg-amber-500/20 blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <PrimaryNavigation />
      <SecondaryNavigation context="admin" />
      <MobileNavigation />
      
      <main className="flex-grow pt-16 pb-16 md:pb-0 relative z-10">
        {children}
      </main>
      
      {showFooter && (
        <footer className="glass-enhanced backdrop-blur-lg bg-black/20 border-t border-white/20 mt-8 relative z-10">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex justify-center md:justify-start">
                <p className="text-white/70 text-sm">
                  © 2025 Tale Forge. All rights reserved.
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex justify-center space-x-6">
                <a href="/legal/privacy" className="text-white/60 hover:text-white/80 text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="/legal/terms" className="text-white/60 hover:text-white/80 text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="/contact" className="text-white/60 hover:text-white/80 text-sm transition-colors">
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

export default AdminLayout;