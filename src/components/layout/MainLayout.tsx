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
        <footer className="nav-glass border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Brand Section */}
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Tale Forge</h3>
                <p className="text-orange-400 text-sm mb-3">Where Every Story Becomes Legend</p>
                <p className="text-white/60 text-xs">Solo Dev Project ❤️</p>
                
                {/* PayPal Support Button */}
                <div className="mt-4">
                  <a 
                    href="https://www.paypal.me/zinfinityhs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="mr-2">☕</span>
                    Support on PayPal
                  </a>
                </div>
              </div>

              {/* What's Coming Next */}
              <div className="text-center md:text-left">
                <h4 className="text-lg font-semibold text-white mb-3">🚀 What's Coming Next</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    <span>Voice Cloning for Narration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    <span>Image to Video Animation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    <span>Physical Story Books</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    <span>Multi-language Support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    <span>Collaborative Storytelling</span>
                  </li>
                </ul>
              </div>

              {/* Links & Legal */}
              <div className="text-center md:text-right">
                <h4 className="text-lg font-semibold text-white mb-3">Quick Links</h4>
                <div className="space-y-2">
                  <a href="/features" className="block text-white/70 hover:text-orange-400 transition-colors text-sm">
                    Features
                  </a>
                  <a href="/pricing" className="block text-white/70 hover:text-orange-400 transition-colors text-sm">
                    Pricing
                  </a>
                  <a href="/legal/privacy" className="block text-white/70 hover:text-orange-400 transition-colors text-sm">
                    Privacy Policy
                  </a>
                  <a href="/legal/terms" className="block text-white/70 hover:text-orange-400 transition-colors text-sm">
                    Terms of Service
                  </a>
                  <a href="/contact" className="block text-white/70 hover:text-orange-400 transition-colors text-sm">
                    Contact
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <Text variant="p" size="sm" className="text-white/60 mb-2 md:mb-0">
                  © 2025 Tale Forge. Made with 🧡 for storytellers everywhere.
                </Text>
                <div className="flex space-x-4">
                  <a href="https://twitter.com/taleforge" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-orange-400 transition-colors">
                    <span className="sr-only">Twitter</span>
                    𝕏
                  </a>
                  <a href="https://github.com/taleforge" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-orange-400 transition-colors">
                    <span className="sr-only">GitHub</span>
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;