import React from 'react';
import { Button } from '@/components/ui/button';

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

  const benefits = [
    {
      title: "Safe & Educational",
      description: "All content is carefully curated to ensure it's appropriate and beneficial for children."
    },
    {
      title: "Time-Saving",
      description: "Create high-quality stories in minutes, not hours."
    },
    {
      title: "Customizable",
      description: "Tailor every aspect of the story to your child's unique needs and interests."
    },
    {
      title: "Engaging",
      description: "Interactive elements keep children engaged and excited about reading."
    }
  ];

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="p-section text-center">
        <div className="container-lg">
          <div className="glass-card">
            <h1 className="title-hero mb-8">
              Powerful Features for Storytelling
            </h1>

            <p className="text-body text-xl max-w-4xl mx-auto mb-12 text-slate-200">
              Discover how Tale Forge transforms the way you create and share stories with children.
            </p>

            {/* Main Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="glass-card">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="title-card mb-3">{feature.title}</h3>
                  <p className="text-body text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card">
            <h2 className="title-section text-center mb-12">
              Why Choose Tale Forge?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="glass-card">
                  <h3 className="title-card mb-3">{benefit.title}</h3>
                  <p className="text-body text-slate-300">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="p-section text-center">
        <div className="container-lg">
          <div className="glass-card">
            <h2 className="title-section mb-6">
              Ready to Start Creating Amazing Stories?
            </h2>
            
            <p className="text-body text-xl mb-8 text-slate-200 max-w-2xl mx-auto">
              Join thousands of families who are already using Tale Forge to create magical storytelling experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg">
                Start Creating Stories
              </Button>
              <Button variant="secondary" size="lg">
                View Pricing Plans
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;