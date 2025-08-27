import React, { useState, useEffect } from 'react';
import Text from '@/components/atoms/Text';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import StoryCard from '@/components/molecules/StoryCard';

const StorySearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('all');
  const [ageGroup, setAgeGroup] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Handle body background for this page
  useEffect(() => {
    const body = document.body;
    const originalBackground = body.style.background;
    const originalBackgroundImage = body.style.backgroundImage;
    const originalBackgroundAttachment = body.style.backgroundAttachment;
    const originalBackgroundSize = body.style.backgroundSize;
    const originalBackgroundPosition = body.style.backgroundPosition;
    const originalBackgroundRepeat = body.style.backgroundRepeat;
    
    body.style.background = 'none';
    body.style.backgroundImage = 'url(/images/pages/home/cosmic-library.png)';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
    
    // Cleanup function to restore original background
    return () => {
      body.style.background = originalBackground;
      body.style.backgroundImage = originalBackgroundImage;
      body.style.backgroundAttachment = originalBackgroundAttachment;
      body.style.backgroundSize = originalBackgroundSize;
      body.style.backgroundPosition = originalBackgroundPosition;
      body.style.backgroundRepeat = originalBackgroundRepeat;
    };
  }, []);
  
  // Mock data for stories
  const stories = [
    {
      id: '1',
      title: 'The Magic Forest Adventure',
      description: 'Join Emma on her journey through a magical forest filled with talking animals.',
      genre: 'Fantasy',
      ageGroup: '6-8',
      imageUrl: 'https://images.unsplash.com/photo-1560346418-93d6f4c8c24c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      author: 'John Doe',
      publishedDate: '2025-08-15',
      likes: 124,
    },
    {
      id: '2',
      title: 'Space Explorer',
      description: 'Travel to distant planets and meet alien friends in this space adventure.',
      genre: 'Science Fiction',
      ageGroup: '8-10',
      imageUrl: 'https://images.unsplash.com/photo-1532016723176-915c0701d0c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      author: 'Jane Smith',
      publishedDate: '2025-08-10',
      likes: 89,
    },
    {
      id: '3',
      title: 'The Lost Treasure',
      description: 'Follow Captain Jack as he searches for buried treasure on a mysterious island.',
      genre: 'Adventure',
      ageGroup: '7-9',
      imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      author: 'Bob Johnson',
      publishedDate: '2025-08-05',
      likes: 210,
    },
    {
      id: '4',
      title: 'The Mystery of the Missing Cookies',
      description: 'A detective story about solving the mystery of who ate all the cookies.',
      genre: 'Mystery',
      ageGroup: '7-9',
      imageUrl: 'https://images.unsplash.com/photo-1589993330970-513505854f89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      author: 'Alice Brown',
      publishedDate: '2025-08-01',
      likes: 156,
    },
    {
      id: '5',
      title: 'The Dragon Who Lost His Fire',
      description: 'A heartwarming tale about a dragon who learns about friendship.',
      genre: 'Fantasy',
      ageGroup: '6-8',
      imageUrl: 'https://images.unsplash.com/photo-1519046823539-44e53c927d8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      author: 'Charlie Wilson',
      publishedDate: '2025-07-28',
      likes: 178,
    },
  ];

  const filteredStories = stories.filter(story => {
    const matchesSearch = searchTerm === '' || 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = genre === 'all' || story.genre === genre;
    const matchesAgeGroup = ageGroup === 'all' || story.ageGroup === ageGroup;
    
    return matchesSearch && matchesGenre && matchesAgeGroup;
  });

  // Sort stories
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
    } else if (sortBy === 'popular') {
      return b.likes - a.likes;
    }
    return 0;
  });

  // Unique genres and age groups for filter options
  const genres = ['all', ...new Set(stories.map(story => story.genre))];
  const ageGroups = ['all', ...new Set(stories.map(story => story.ageGroup))];

  return (
    <div className="py-6">
      <div className="mb-8">
        <Text variant="h1" weight="bold" className="text-3xl mb-2">
          Search Stories
        </Text>
        <Text variant="p" color="secondary">
          Find the perfect story for your child
        </Text>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Input
              label="Search terms"
              placeholder="Title, author, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {genres.map(g => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age Group
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {ageGroups.map(ag => (
                <option key={ag} value={ag}>
                  {ag === 'all' ? 'All Ages' : `Ages ${ag}`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Text variant="p" color="secondary">
            {sortedStories.length} stories found
          </Text>
          <Button variant="primary" size="small">
            Save Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedStories.map((story) => (
          <StoryCard
            key={story.id}
            title={story.title}
            description={story.description}
            genre={story.genre}
            ageGroup={story.ageGroup}
            imageUrl={story.imageUrl}
            onRead={() => console.log(`Reading story ${story.id}`)}
            onEdit={() => console.log(`Editing story ${story.id}`)}
          />
        ))}
      </div>

      {sortedStories.length === 0 && (
        <div className="text-center py-12">
          <Text variant="p" size="lg" color="secondary">
            No stories found matching your search criteria.
          </Text>
          <Button variant="primary" className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default StorySearchPage;