import React, { useState } from 'react';
import Text from '@/components/atoms/Text';
import Input from '@/components/atoms/Input';
import StoryCard from '@/components/molecules/StoryCard';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  
  // Mock search results
  const searchResults = [
    {
      id: '1',
      title: 'The Magic Forest Adventure',
      description: 'Join Emma on her journey through a magical forest filled with talking animals.',
      genre: 'Fantasy',
      ageGroup: '6-8',
      imageUrl: 'https://images.unsplash.com/photo-1560346418-93d6f4c8c24c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      type: 'my-story',
      author: 'You'
    },
    {
      id: '2',
      title: 'Space Explorer',
      description: 'Travel to distant planets and meet alien friends in this space adventure.',
      genre: 'Science Fiction',
      ageGroup: '8-10',
      imageUrl: 'https://images.unsplash.com/photo-1532016723176-915c0701d0c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      type: 'my-story',
      author: 'You'
    },
    {
      id: '3',
      title: 'The Brave Little Explorer',
      description: 'A young explorer discovers a hidden world beneath the ocean waves.',
      genre: 'Adventure',
      ageGroup: '6-8',
      imageUrl: 'https://images.unsplash.com/photo-1560346418-93d6f4c8c24c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      type: 'public-story',
      author: 'Emma Thompson'
    },
    {
      id: '4',
      title: 'Reading History: The Lost Treasure',
      description: 'Chapter 3: The Secret Cave - Last read 2 days ago',
      type: 'reading-history',
      date: '2025-08-17'
    },
    {
      id: '5',
      title: 'The Mystery of the Missing Cookies',
      description: 'A detective story about solving the mystery of who ate all the cookies.',
      genre: 'Mystery',
      ageGroup: '7-9',
      imageUrl: 'https://images.unsplash.com/photo-1589993330970-513505854f89?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      type: 'my-story',
      author: 'You'
    }
  ];

  const filteredResults = searchResults.filter(result => {
    if (searchType === 'all') return true;
    return result.type === searchType;
  });

  return (
    <div className="py-6">
      <div className="mb-8">
        <Text variant="h1" weight="bold" className="text-3xl mb-2">
          Search
        </Text>
        <Text variant="p" color="secondary">
          Find stories, reading history, and more
        </Text>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Search"
              placeholder="Search stories, history, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search In
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All</option>
              <option value="my-story">My Stories</option>
              <option value="public-story">Public Stories</option>
              <option value="reading-history">Reading History</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <Text variant="h2" weight="semibold" className="text-xl mb-4">
          Search Results
        </Text>
        
        {filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((result) => (
              <div key={result.id}>
                {result.type === 'reading-history' ? (
                  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <span className="text-lg">📖</span>
                      </div>
                      <Text variant="h3" weight="semibold">
                        {result.title}
                      </Text>
                    </div>
                    <Text variant="p" color="secondary" className="mb-4">
                      {result.description}
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      {result.date}
                    </Text>
                  </div>
                ) : (
                  <StoryCard
                    title={result.title}
                    description={result.description}
                    genre={result.genre}
                    ageGroup={result.ageGroup}
                    imageUrl={result.imageUrl}
                    onRead={() => console.log(`Reading story ${result.id}`)}
                    onEdit={() => console.log(`Editing story ${result.id}`)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Text variant="p" size="lg" color="secondary">
              No results found. Try adjusting your search terms.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;