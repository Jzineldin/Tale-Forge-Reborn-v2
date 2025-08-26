import React from 'react';

const TemplatesPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Coming Soon Section */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 text-center">
          <h1 className="fantasy-heading-cinzel text-4xl md:text-5xl font-bold mb-4">
            📚 Template Gallery
          </h1>
          <div className="text-6xl mb-6">🚧</div>
          <h2 className="text-3xl font-bold text-white mb-4">Coming Soon!</h2>
          <div className="text-lg text-white/90 space-y-4 mb-6">
            <p>
              Browse and create custom story templates to share with the community and speed up your story creation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base max-w-4xl mx-auto">
              <div className="glass-card bg-white/10 p-4 rounded-lg">
                <div className="text-xl mb-2">🎨</div>
                <div className="font-semibold text-amber-400">Template Creation</div>
                <div className="text-sm text-white/70">Design and save your own story templates</div>
              </div>
              <div className="glass-card bg-white/10 p-4 rounded-lg">
                <div className="text-xl mb-2">🌟</div>
                <div className="font-semibold text-purple-400">Community Gallery</div>
                <div className="text-sm text-white/70">Browse templates created by other users</div>
              </div>
              <div className="glass-card bg-white/10 p-4 rounded-lg">
                <div className="text-xl mb-2">🏷️</div>
                <div className="font-semibold text-blue-400">Smart Categories</div>
                <div className="text-sm text-white/70">Find templates by genre, age, and difficulty</div>
              </div>
              <div className="glass-card bg-white/10 p-4 rounded-lg">
                <div className="text-xl mb-2">⚡</div>
                <div className="font-semibold text-green-400">Quick Start</div>
                <div className="text-sm text-white/70">One-click story creation from templates</div>
              </div>
            </div>
          </div>
          <div className="text-amber-400 font-semibold">
            🎉 For now, use the 5-step wizard in Create Story to craft your perfect tale!
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;