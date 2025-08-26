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
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <TypographyLayout variant="hero" as="h1" align="center" className="mb-4">
            Create Your Story ✨
          </TypographyLayout>
          <TypographyLayout variant="body" align="center" className="text-xl max-w-2xl mx-auto">
            Choose how you'd like to create your personalized children's story
          </TypographyLayout>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Easy Mode */}
          <button
            onClick={onEasyMode}
            className="glass-card group relative p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:border-green-500/30"
          >
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-green-500 text-white rounded-full animate-pulse">
                <TypographyLayout variant="body" className="text-xs font-bold">NEW!</TypographyLayout>
              </span>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-green-400" />
              </div>
              
              <TypographyLayout variant="card" as="h3" align="center" className="mb-3 group-hover:text-green-400 transition-colors">
                Easy Mode
              </TypographyLayout>
              
              <TypographyLayout variant="body" color="muted" align="center" className="mb-6">
                Quick & Simple • 3 Steps
              </TypographyLayout>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Choose story length</TypographyLayout>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Pick your favorite genre</TypographyLayout>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Add your child's name</TypographyLayout>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-green-500/10 rounded-lg">
                <TypographyLayout variant="body" className="text-body-xs font-medium text-green-400">⏱️ Under 60 seconds</TypographyLayout>
              </div>
            </div>
          </button>

          {/* Template Mode */}
          <button
            onClick={onTemplateMode}
            className="glass-card group relative p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:border-blue-500/30"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-blue-400" />
              </div>
              
              <TypographyLayout variant="card" as="h3" align="center" className="mb-3 group-hover:text-blue-400 transition-colors">
                Template Mode
              </TypographyLayout>
              
              <TypographyLayout variant="body" color="muted" align="center" className="mb-6">
                Pre-made Stories • Instant
              </TypographyLayout>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Choose from curated templates</TypographyLayout>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Professional story structures</TypographyLayout>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Minimal customization needed</TypographyLayout>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-blue-500/10 rounded-lg">
                <TypographyLayout variant="body" className="text-body-xs font-medium text-blue-400">⚡ Fastest option</TypographyLayout>
              </div>
            </div>
          </button>

          {/* Advanced Mode */}
          <button
            onClick={onCustomMode}
            className="glass-card group relative p-8 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:border-orange-500/30"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Settings className="w-10 h-10 text-orange-400" />
              </div>
              
              <TypographyLayout variant="card" as="h3" align="center" className="mb-3 group-hover:text-orange-400 transition-colors">
                Advanced Mode
              </TypographyLayout>
              
              <TypographyLayout variant="body" color="muted" align="center" className="mb-6">
                Full Control • 5 Steps
              </TypographyLayout>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Complete story customization</TypographyLayout>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Detailed character creation</TypographyLayout>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <TypographyLayout variant="body" className="text-body-sm">Custom settings & plots</TypographyLayout>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-orange-500/10 rounded-lg">
                <TypographyLayout variant="body" className="text-body-xs font-medium text-orange-400">🎯 Maximum creativity</TypographyLayout>
              </div>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 glass-card p-6 text-center">
          <TypographyLayout variant="card" as="h4" align="center" className="mb-3">
            New to Tale Forge?
          </TypographyLayout>
          <TypographyLayout variant="body" color="muted" align="center" className="mb-4">
            We recommend starting with <strong className="text-green-400">Easy Mode</strong> to 
            create your first story in under a minute!
          </TypographyLayout>
          <div className="flex justify-center gap-4">
            <TypographyLayout variant="body" className="text-body-sm text-white/50">🎨 AI-powered illustrations</TypographyLayout>
            <TypographyLayout variant="body" className="text-body-sm text-white/50">🎵 Optional narration</TypographyLayout>
            <TypographyLayout variant="body" className="text-body-sm text-white/50">📱 Mobile-friendly</TypographyLayout>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;