import React from 'react';

const AchievementsPage: React.FC = () => {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="p-section text-center">
        <div className="container-lg">
          <div className="glass-card">
            <h1 className="title-hero mb-6">
              🏆 Achievements
            </h1>
            <div className="text-6xl mb-6">🚧</div>
            <h2 className="title-section mb-6">Coming Soon!</h2>
            <p className="text-body text-lg mb-8">
              Track your storytelling journey with meaningful milestones and earn rewards for your creative adventures.
            </p>
          </div>
        </div>
      </section>

      {/* Achievement Categories */}
      <section className="p-section">
        <div className="container-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="glass-card text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="title-card text-amber-400 mb-3">Story Milestones</h3>
              <p className="text-body-sm">Unlock rewards for creating 1, 5, 10+ stories</p>
            </div>
            
            <div className="glass-card text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="title-card text-purple-400 mb-3">Creative Excellence</h3>
              <p className="text-body-sm">Earn badges for story quality and engagement</p>
            </div>
            
            <div className="glass-card text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="title-card text-blue-400 mb-3">Daily Challenges</h3>
              <p className="text-body-sm">Complete tasks for bonus credits</p>
            </div>
            
            <div className="glass-card text-center">
              <div className="text-4xl mb-4">👑</div>
              <h3 className="title-card text-green-400 mb-3">Special Rewards</h3>
              <p className="text-body-sm">Unlock exclusive templates and features</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="p-section text-center">
        <div className="container-lg">
          <div className="glass-card">
            <p className="text-body text-amber-400 font-semibold">
              🎉 Achievement system will unlock more ways to earn credits and showcase your creativity!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AchievementsPage;