import React from 'react';
import Text from '@/components/atoms/Text';

const ShowcasePage: React.FC = () => {
  // Mock data for showcase stories
  const showcaseStories = [
    {
      id: '1',
      title: "The Brave Little Explorer",
      author: "Emma Thompson",
      description: "A young explorer discovers a hidden world beneath the ocean waves.",
      image: "https://images.unsplash.com/photo-1560346418-93d6f4c8c24c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      likes: 245,
      views: 1200
    },
    {
      id: '2',
      title: "The Magic Garden Adventure",
      author: "Michael Chen",
      description: "Children discover that their garden is home to tiny magical creatures.",
      image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      likes: 189,
      views: 950
    },
    {
      id: '3',
      title: "Journey to the Star Kingdom",
      author: "Sophia Rodriguez",
      description: "A bedtime story about a girl who travels to a kingdom made of stars.",
      image: "https://images.unsplash.com/photo-1532016723176-915c0701d0c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      likes: 321,
      views: 2100
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <Text variant="h1" weight="bold" className="text-3xl md:text-4xl">
          Community Showcase
        </Text>
        <Text variant="p" size="lg" color="secondary" className="mt-4 max-w-2xl mx-auto">
          Discover amazing stories created by our community of parents and educators.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {showcaseStories.map((story) => (
          <div key={story.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img 
              src={story.image} 
              alt={story.title} 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <Text variant="h3" weight="semibold" className="mb-2">
                {story.title}
              </Text>
              <Text variant="p" color="secondary" className="mb-4">
                by {story.author}
              </Text>
              <Text variant="p" className="mb-4">
                {story.description}
              </Text>
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <span className="flex items-center">
                    👍 {story.likes}
                  </span>
                  <span className="flex items-center">
                    👁️ {story.views}
                  </span>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Read Story
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <Text variant="h2" weight="bold" className="text-2xl mb-6">
          Create Your Own Story
        </Text>
        <Text variant="p" size="lg" color="secondary" className="max-w-2xl mx-auto mb-8">
          Join our community and share your creative stories with children around the world.
        </Text>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors">
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default ShowcasePage;