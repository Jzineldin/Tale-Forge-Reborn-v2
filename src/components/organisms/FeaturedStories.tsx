import React from 'react';
import Text from '@/components/atoms/Text';
import StoryCard from '@/components/molecules/StoryCard';
import { useQuery } from 'react-query';

interface FeaturedStory {
  id: string;
  title: string;
  description: string;
  genre: string;
  ageGroup: string;
  imageUrl?: string;
}

const FeaturedStories: React.FC = () => {
  // In a real app, this would fetch from an API
  // For now, we'll simulate with mock data
  const { data: stories, isLoading, error } = useQuery<FeaturedStory[]>(
    'featured-stories',
    async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      return [
        {
          id: '1',
          title: 'The Space Adventure',
          description: 'Join Captain Luna on an exciting journey through the cosmos to find a new home for her people.',
          genre: 'Sci-Fi',
          ageGroup: '7-9',
          imageUrl: '/images/genres/sci-fi/friendly-astronaut.png'
        },
        {
          id: '2',
          title: 'The Magic Forest',
          description: 'Explore a mystical forest with talking animals and discover the secret of the ancient tree.',
          genre: 'Fantasy',
          ageGroup: '4-6',
          imageUrl: '/images/genres/fantasy/magical-story-collection.png'
        },
        {
          id: '3',
          title: 'The Detective\'s Mystery',
          description: 'Help Detective Whiskers solve the mystery of the missing toys in the playroom.',
          genre: 'Mystery',
          ageGroup: '6-8',
          imageUrl: '/images/genres/mystery/educational-content.png'
        }
      ];
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="mt-16">
        <div className="text-center mb-12">
          <Text variant="h2" weight="bold" className="text-3xl mb-4">
            Featured Stories
          </Text>
          <Text variant="p" size="xl" color="secondary" className="max-w-2xl mx-auto">
            Discover our most popular stories loved by children and parents alike.
          </Text>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="flex justify-between mb-4">
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-16">
        <div className="text-center mb-12">
          <Text variant="h2" weight="bold" className="text-3xl mb-4">
            Featured Stories
          </Text>
          <Text variant="p" size="xl" color="secondary" className="max-w-2xl mx-auto">
            Discover our most popular stories loved by children and parents alike.
          </Text>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Text variant="p" color="danger">
            Failed to load featured stories. Please try again later.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <Text variant="h2" weight="bold" className="text-3xl mb-4">
          Featured Stories
        </Text>
        <Text variant="p" size="xl" color="secondary" className="max-w-2xl mx-auto">
          Discover our most popular stories loved by children and parents alike.
        </Text>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stories?.map((story) => (
          <StoryCard
            key={story.id}
            title={story.title}
            description={story.description}
            genre={story.genre}
            ageGroup={story.ageGroup}
            imageUrl={story.imageUrl}
            onRead={() => console.log(`Reading story: ${story.title}`)}
            onEdit={() => console.log(`Editing story: ${story.title}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedStories;