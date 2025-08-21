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
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Text variant="h1" weight="bold" className="text-3xl md:text-4xl">
          Powerful Features for Storytelling
        </Text>
        <Text variant="p" size="lg" color="secondary" className="mt-4 max-w-2xl mx-auto">
          Discover how Tale Forge transforms the way you create and share stories with children.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <Text variant="h3" weight="semibold" className="mb-2">
              {feature.title}
            </Text>
            <Text variant="p" color="secondary">
              {feature.description}
            </Text>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-indigo-50 rounded-lg p-8">
        <Text variant="h2" weight="bold" className="text-2xl text-center mb-6">
          Why Choose Tale Forge?
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Text variant="h3" weight="semibold" className="mb-2">
              Safe & Educational
            </Text>
            <Text variant="p" color="secondary">
              All content is carefully curated to ensure it's appropriate and beneficial for children.
            </Text>
          </div>
          <div>
            <Text variant="h3" weight="semibold" className="mb-2">
              Time-Saving
            </Text>
            <Text variant="p" color="secondary">
              Create high-quality stories in minutes, not hours.
            </Text>
          </div>
          <div>
            <Text variant="h3" weight="semibold" className="mb-2">
              Customizable
            </Text>
            <Text variant="p" color="secondary">
              Tailor every aspect of the story to your child's unique needs and interests.
            </Text>
          </div>
          <div>
            <Text variant="h3" weight="semibold" className="mb-2">
              Engaging
            </Text>
            <Text variant="p" color="secondary">
              Interactive elements keep children engaged and excited about reading.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;