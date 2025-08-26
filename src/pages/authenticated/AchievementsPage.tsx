import React from 'react';

const AchievementsPage: React.FC = () => {
  return (
    <div className="min-h-screen py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Coming Soon Section */}
          <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 text-center">
            <h1 className="fantasy-heading-cinzel text-4xl md:text-5xl font-bold mb-4">
              🏆 Achievements
            </h1>
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon!</h2>
            <div className="text-lg text-white/90 space-y-4 mb-6">
              <p>
                Track your storytelling journey with meaningful milestones and earn rewards for your creative adventures.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base max-w-4xl mx-auto">
                <div className="glass-card bg-white/10 p-4 rounded-lg">
                  <div className="text-xl mb-2">📚</div>
                  <div className="font-semibold text-amber-400">Story Milestones</div>
                  <div className="text-sm text-white/70">Unlock rewards for creating 1, 5, 10+ stories</div>
                </div>
                <div className="glass-card bg-white/10 p-4 rounded-lg">
                  <div className="text-xl mb-2">⭐</div>
                  <div className="font-semibold text-purple-400">Creative Excellence</div>
                  <div className="text-sm text-white/70">Earn badges for story quality and engagement</div>
                </div>
                <div className="glass-card bg-white/10 p-4 rounded-lg">
                  <div className="text-xl mb-2">🎯</div>
                  <div className="font-semibold text-blue-400">Daily Challenges</div>
                  <div className="text-sm text-white/70">Complete tasks for bonus credits</div>
                </div>
                <div className="glass-card bg-white/10 p-4 rounded-lg">
                  <div className="text-xl mb-2">👑</div>
                  <div className="font-semibold text-green-400">Special Rewards</div>
                  <div className="text-sm text-white/70">Unlock exclusive templates and features</div>
                </div>
              </div>
            </div>
            <div className="text-amber-400 font-semibold">
              🎉 Achievement system will unlock more ways to earn credits and showcase your creativity!
            </div>
          </div>
        </div>
      </div>
  );
};

export default AchievementsPage;