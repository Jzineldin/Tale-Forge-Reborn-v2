import React from 'react';
import { Sparkles, BookOpen, Settings } from 'lucide-react';

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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Create Your Story ✨
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose how you'd like to create your personalized children's story
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Easy Mode */}
          <button
            onClick={onEasyMode}
            className="group relative p-8 rounded-2xl border-2 border-transparent bg-gradient-to-br from-green-500/10 to-emerald-600/10 hover:from-green-500/20 hover:to-emerald-600/20 transition-all duration-300 transform hover:scale-105 hover:border-green-500/30"
          >
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 text-xs font-bold bg-green-500 text-white rounded-full animate-pulse">
                NEW!
              </span>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-green-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                Easy Mode
              </h3>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Quick & Simple • 3 Steps
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Choose story length</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Pick your favorite genre</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Add your child's name</span>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-green-500/10 rounded-lg">
                <span className="text-xs font-medium text-green-400">⏱️ Under 60 seconds</span>
              </div>
            </div>
          </button>

          {/* Template Mode */}
          <button
            onClick={onTemplateMode}
            className="group relative p-8 rounded-2xl border-2 border-transparent bg-gradient-to-br from-blue-500/10 to-purple-600/10 hover:from-blue-500/20 hover:to-purple-600/20 transition-all duration-300 transform hover:scale-105 hover:border-blue-500/30"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-blue-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                Template Mode
              </h3>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Pre-made Stories • Instant
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Choose from curated templates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Professional story structures</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Minimal customization needed</span>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-blue-500/10 rounded-lg">
                <span className="text-xs font-medium text-blue-400">⚡ Fastest option</span>
              </div>
            </div>
          </button>

          {/* Advanced Mode */}
          <button
            onClick={onCustomMode}
            className="group relative p-8 rounded-2xl border-2 border-transparent bg-gradient-to-br from-orange-500/10 to-red-600/10 hover:from-orange-500/20 hover:to-red-600/20 transition-all duration-300 transform hover:scale-105 hover:border-orange-500/30"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Settings className="w-10 h-10 text-orange-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                Advanced Mode
              </h3>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                Full Control • 5 Steps
              </p>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Complete story customization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Detailed character creation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Custom settings & plots</span>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-orange-500/10 rounded-lg">
                <span className="text-xs font-medium text-orange-400">🎯 Maximum creativity</span>
              </div>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 glass-panel p-6 text-center">
          <h4 className="text-lg font-semibold text-white mb-3">New to Tale Forge?</h4>
          <p className="text-gray-400 mb-4">
            We recommend starting with <strong className="text-green-400">Easy Mode</strong> to 
            create your first story in under a minute!
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>🎨 AI-powered illustrations</span>
            <span>🎵 Optional narration</span>
            <span>📱 Mobile-friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;