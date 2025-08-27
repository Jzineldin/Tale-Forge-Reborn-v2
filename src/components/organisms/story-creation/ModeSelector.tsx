import React from 'react';
import { Sparkles, BookOpen, Settings } from 'lucide-react';
import { TypographyLayout } from '@/components/layout';

interface ModeSelectorProps {
  onEasyMode: () => void;
  onTemplateMode: () => void;
  onCustomMode: () => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  onEasyMode,
  onTemplateMode,
  onCustomMode
}) => {
  return (
    <div className="py-4">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Easy Mode - Recommended */}
          <div className="relative transform hover:scale-105 transition-all duration-500">
            <button
              onClick={onEasyMode}
              className="w-full h-full group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-green-400/20 via-emerald-500/15 to-green-600/20 backdrop-blur-xl border border-green-400/30 hover:border-green-300/60 transition-all duration-500 hover:shadow-2xl hover:shadow-green-400/30 flex flex-col"
            >
              {/* Recommended banner */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                TOP PICK
              </div>

              <div className="text-center pt-8 flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  {/* Large icon */}
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* Title */}
                  <TypographyLayout variant="section" as="h3" align="center" className="mb-3 text-xl font-bold text-white group-hover:text-green-300 transition-colors bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
                    Easy Mode
                  </TypographyLayout>
                  
                  {/* Subtitle */}
                  <TypographyLayout variant="body" align="center" className="mb-6 text-lg text-green-200 font-semibold drop-shadow-md">
                    Perfect for beginners • 3 simple steps
                  </TypographyLayout>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Choose story length</TypographyLayout>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Pick favorite genre</TypographyLayout>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Add child's name</TypographyLayout>
                    </div>
                  </div>
                </div>
                
                <div>
                  {/* CTA */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-full shadow-xl group-hover:shadow-2xl group-hover:shadow-green-400/50 transition-all duration-300 mb-4">
                    <TypographyLayout variant="body" className="font-bold text-lg drop-shadow-md">Start Creating! 🚀</TypographyLayout>
                  </div>
                  
                  {/* Time indicator */}
                  <div className="bg-green-500/20 border border-green-400/30 rounded-full py-2 px-4">
                    <TypographyLayout variant="body" className="text-green-300 text-sm font-semibold">⏱️ Under 60 seconds</TypographyLayout>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Template Mode - COMING SOON */}
          <div className="relative transform transition-all duration-500">
            <div
              className="w-full h-full group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-400/20 via-cyan-500/15 to-blue-600/20 backdrop-blur-xl border border-blue-400/30 cursor-not-allowed flex flex-col"
            >
              {/* Coming Soon badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                COMING SOON
              </div>

              <div className="text-center pt-8 flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  {/* Large icon */}
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* Title */}
                  <TypographyLayout variant="section" as="h3" align="center" className="mb-3 text-xl font-bold text-white bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                    Template Mode
                  </TypographyLayout>
                  
                  {/* Subtitle */}
                  <TypographyLayout variant="body" align="center" className="mb-6 text-lg text-blue-200 font-semibold drop-shadow-md">
                    Pre-crafted stories • Instant results
                  </TypographyLayout>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Curated templates</TypographyLayout>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Professional structures</TypographyLayout>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Minimal setup needed</TypographyLayout>
                    </div>
                  </div>
                </div>
                
                <div>
                  {/* CTA - Disabled */}
                  <div className="bg-gradient-to-r from-blue-500/60 to-cyan-600/60 text-white py-3 px-6 rounded-full shadow-xl mb-4 cursor-not-allowed">
                    <TypographyLayout variant="body" className="font-bold text-lg drop-shadow-md">Coming Soon! 🔜</TypographyLayout>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-full py-2 px-4">
                    <TypographyLayout variant="body" className="text-blue-300 text-sm font-semibold">🚧 In Development</TypographyLayout>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Mode - COMING SOON */}
          <div className="relative transform transition-all duration-500">
            <div
              className="w-full h-full group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-orange-400/20 via-red-500/15 to-orange-600/20 backdrop-blur-xl border border-orange-400/30 cursor-not-allowed flex flex-col"
            >
              {/* Coming Soon badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                COMING SOON
              </div>

              <div className="text-center pt-8 flex-1 flex flex-col justify-between">
                <div className="flex-1">
                  {/* Large icon */}
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                    <Settings className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* Title */}
                  <TypographyLayout variant="section" as="h3" align="center" className="mb-3 text-xl font-bold text-white bg-gradient-to-r from-orange-300 via-red-300 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">
                    Advanced Mode
                  </TypographyLayout>
                  
                  {/* Subtitle */}
                  <TypographyLayout variant="body" align="center" className="mb-6 text-lg text-orange-200 font-semibold drop-shadow-md">
                    Complete control • 5 detailed steps
                  </TypographyLayout>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-orange-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Full customization</TypographyLayout>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-orange-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Detailed characters</TypographyLayout>
                    </div>
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-2 h-2 bg-orange-400 rounded-full shadow-lg"></div>
                      <TypographyLayout variant="body" className="text-white font-medium drop-shadow-md">Custom plots & settings</TypographyLayout>
                    </div>
                  </div>
                </div>
                
                <div>
                  {/* CTA - Disabled */}
                  <div className="bg-gradient-to-r from-orange-500/60 to-red-600/60 text-white py-3 px-6 rounded-full shadow-xl mb-4 cursor-not-allowed">
                    <TypographyLayout variant="body" className="font-bold text-lg drop-shadow-md">Coming Soon! 🔜</TypographyLayout>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="bg-orange-500/20 border border-orange-400/30 rounded-full py-2 px-4">
                    <TypographyLayout variant="body" className="text-orange-300 text-sm font-semibold">🚧 In Development</TypographyLayout>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/20">
          <TypographyLayout variant="section" as="h4" align="center" className="mb-4 text-2xl text-white">
            ✨ New to Tale Forge? ✨
          </TypographyLayout>
          <TypographyLayout variant="body" align="center" className="mb-8 text-lg text-white/90 max-w-2xl mx-auto">
            We recommend starting with <strong className="text-green-400 bg-green-400/20 px-2 py-1 rounded-full">Easy Mode</strong> to 
            create your first magical story in under a minute!
          </TypographyLayout>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <span className="text-2xl">🎨</span>
              <TypographyLayout variant="body" className="text-white/90 font-medium">AI-powered illustrations</TypographyLayout>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <span className="text-2xl">🎵</span>
              <TypographyLayout variant="body" className="text-white/90 font-medium">Optional narration</TypographyLayout>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <span className="text-2xl">📱</span>
              <TypographyLayout variant="body" className="text-white/90 font-medium">Mobile-friendly</TypographyLayout>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;