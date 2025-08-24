import React from 'react';
import Text from '@/components/atoms/Text';

const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: "AI Story Generation",
      description: "Create unique stories with our advanced AI that adapts to your child's preferences and reading level.",
      icon: "🤖"
    },
    {
      title: "Interactive Choices",
      description: "Children can make decisions that affect the story's outcome, creating an engaging experience.",
      icon: "🎮"
    },
    {
      title: "Personalization",
      description: "Customize stories with your child's name, favorite characters, and interests.",
      icon: "👤"
    },
    {
      title: "Educational Value",
      description: "Stories designed to promote learning, vocabulary development, and critical thinking.",
      icon: "📖"
    },
    {
      title: "Multi-language Support",
      description: "Create stories in multiple languages to support bilingual education.",
      icon: "🌍"
    },
    {
      title: "Parental Controls",
      description: "Manage content, reading time, and ensure age-appropriate material.",
      icon: "👨‍👩‍👧‍👦"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Refined Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-500/25 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-amber-300/15 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-2/3 w-1 h-1 bg-amber-600/20 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="fantasy-heading-cinzel text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Powerful Features for Storytelling
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover how Tale Forge transforms the way you create and share stories with children.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-6 hover:transform hover:scale-105 hover:border-amber-400/30 transition-all duration-300 group">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="fantasy-heading text-xl font-semibold text-white mb-3 group-hover:text-amber-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/80 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Why Choose Section */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 md:p-12">
          <h2 className="fantasy-heading-cinzel text-2xl md:text-3xl font-bold text-center mb-8">
            Why Choose Tale Forge?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="refined-card backdrop-blur-lg bg-white/5 border border-amber-400/20 rounded-xl p-6">
              <h3 className="fantasy-heading text-lg font-semibold text-amber-300 mb-3">
                Safe & Educational
              </h3>
              <p className="text-white/80 leading-relaxed">
                All content is carefully curated to ensure it's appropriate and beneficial for children.
              </p>
            </div>
            <div className="refined-card backdrop-blur-lg bg-white/5 border border-amber-400/20 rounded-xl p-6">
              <h3 className="fantasy-heading text-lg font-semibold text-amber-300 mb-3">
                Time-Saving
              </h3>
              <p className="text-white/80 leading-relaxed">
                Create high-quality stories in minutes, not hours.
              </p>
            </div>
            <div className="refined-card backdrop-blur-lg bg-white/5 border border-amber-400/20 rounded-xl p-6">
              <h3 className="fantasy-heading text-lg font-semibold text-amber-300 mb-3">
                Customizable
              </h3>
              <p className="text-white/80 leading-relaxed">
                Tailor every aspect of the story to your child's unique needs and interests.
              </p>
            </div>
            <div className="refined-card backdrop-blur-lg bg-white/5 border border-amber-400/20 rounded-xl p-6">
              <h3 className="fantasy-heading text-lg font-semibold text-amber-300 mb-3">
                Engaging
              </h3>
              <p className="text-white/80 leading-relaxed">
                Interactive elements keep children engaged and excited about reading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;