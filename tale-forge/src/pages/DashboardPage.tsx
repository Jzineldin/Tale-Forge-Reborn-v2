import React from 'react';
import DashboardTemplate from '@/components/templates/DashboardTemplate';
import StoryGrid from '@/components/organisms/StoryGrid';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

// Mock data for stories
const mockStories = [
  {
    id: '1',
    title: 'The Magic Forest Adventure',
    description: 'Join Emma on her journey through a magical forest filled with talking animals.',
    genre: 'Fantasy',
    ageGroup: '6-8',
    imageUrl: 'https://example.com/story1.jpg',
  },
  {
    id: '2',
    title: 'Space Explorer',
    description: 'Travel to distant planets and meet alien friends in this space adventure.',
    genre: 'Science Fiction',
    ageGroup: '8-10',
    imageUrl: 'https://example.com/story2.jpg',
  },
  {
    id: '3',
    title: 'The Lost Treasure',
    description: 'Follow Captain Jack as he searches for buried treasure on a mysterious island.',
    genre: 'Adventure',
    ageGroup: '7-9',
    imageUrl: 'https://example.com/story3.jpg',
  },
];

const DashboardPage: React.FC = () => {
  const handleStoryRead = (id: string) => {
    console.log(`Reading story with id: ${id}`);
  };

  const handleStoryEdit = (id: string) => {
    console.log(`Editing story with id: ${id}`);
  };

  const handleCreateStory = () => {
    console.log('Creating new story');
  };

  const header = (
    <div className="flex justify-between items-center">
      <Text variant="h1" weight="bold">
        My Dashboard
      </Text>
      <Button variant="primary" onClick={handleCreateStory}>
        Create New Story
      </Button>
    </div>
  );

  return (
    <DashboardTemplate header={header}>
      <StoryGrid 
        stories={mockStories} 
        onStoryRead={handleStoryRead}
        onStoryEdit={handleStoryEdit}
      />
    </DashboardTemplate>
  );
};

export default DashboardPage;