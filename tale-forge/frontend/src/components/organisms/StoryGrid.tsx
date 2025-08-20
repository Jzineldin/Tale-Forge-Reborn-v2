import React from 'react';
import StoryCard from '@/components/molecules/StoryCard';
import Text from '@/components/atoms/Text';

interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  ageGroup: string;
  imageUrl?: string;
}

interface StoryGridProps {
  stories: Story[];
  onStoryRead: (id: string) => void;
  onStoryEdit: (id: string) => void;
}

const StoryGrid: React.FC<StoryGridProps> = ({
  stories,
  onStoryRead,
  onStoryEdit,
}) => {
  return (
    <div className="py-6">
      <Text variant="h2" weight="bold" className="mb-6 text-center">
        Your Stories
      </Text>
      {stories.length === 0 ? (
        <div className="text-center py-12">
          <Text variant="p" size="lg" color="secondary">
            You haven't created any stories yet.
          </Text>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => console.log('Create new story')}
          >
            Create Your First Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              title={story.title}
              description={story.description}
              genre={story.genre}
              ageGroup={story.ageGroup}
              imageUrl={story.imageUrl}
              onRead={() => onStoryRead(story.id)}
              onEdit={() => onStoryEdit(story.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StoryGrid;