import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Text from '@/components/atoms/Text';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const StoryEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('The Magic Forest Adventure');
  const [description, setDescription] = useState('Join Emma on her journey through a magical forest filled with talking animals.');
  const [genre, setGenre] = useState('Fantasy');
  const [ageGroup, setAgeGroup] = useState('6-8');
  const [currentChapter, setCurrentChapter] = useState(0);
  const [chapters, setChapters] = useState([
    {
      title: 'Chapter 1: The Mysterious Map',
      content: `Emma was exploring her grandmother's attic when she discovered an old, dusty map tucked away in a wooden chest. 
The map showed a path through a forest she had never seen before, with strange symbols marking various locations. 
As she studied the map more closely, the symbols began to glow with a soft, golden light.

"This must be magic!" Emma whispered to herself, her eyes wide with wonder.

She carefully folded the map and placed it in her backpack, determined to find this mysterious forest and see 
what adventures awaited her there.`
    },
    {
      title: 'Chapter 2: Into the Forest',
      content: `The next morning, Emma followed the map's directions to the edge of a forest that seemed to shimmer with 
an otherworldly light. As she stepped through the tree line, the world around her transformed. 
The trees grew taller and more magnificent, their leaves sparkling like emeralds in the sunlight.

A small fox with bright blue fur approached her, tipping its hat politely.

"Welcome to the Magic Forest, young explorer," the fox said with a gentle smile. 
"I am Ferdinand, and I've been waiting for you."

Emma's eyes widened in amazement. "You can talk!"`
    }
  ]);

  const handleChapterChange = (index: number) => {
    setCurrentChapter(index);
  };

  const handleAddChapter = () => {
    const newChapter = {
      title: `Chapter ${chapters.length + 1}: New Chapter`,
      content: 'Write your chapter content here...'
    };
    setChapters([...chapters, newChapter]);
    setCurrentChapter(chapters.length);
  };

  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) return;
    
    const newChapters = [...chapters];
    newChapters.splice(index, 1);
    setChapters(newChapters);
    
    if (currentChapter >= newChapters.length) {
      setCurrentChapter(newChapters.length - 1);
    }
  };

  const handleChapterTitleChange = (index: number, title: string) => {
    const newChapters = [...chapters];
    newChapters[index].title = title;
    setChapters(newChapters);
  };

  const handleChapterContentChange = (index: number, content: string) => {
    const newChapters = [...chapters];
    newChapters[index].content = content;
    setChapters(newChapters);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving story...', { title, description, genre, ageGroup, chapters });
    alert('Story saved successfully!');
  };

  const handlePublish = () => {
    // In a real app, this would publish the story
    console.log('Publishing story...', { title, description, genre, ageGroup, chapters });
    alert('Story published successfully!');
  };

  return (
    <div className="py-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <Text variant="h1" weight="bold" className="text-2xl md:text-3xl">
            {id ? 'Edit Story' : 'Create New Story'}
          </Text>
          <Text variant="p" color="secondary">
            {id ? 'Make changes to your story' : 'Create a new interactive story'}
          </Text>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="secondary" onClick={handleSave}>
            Save Draft
          </Button>
          <Button variant="primary" onClick={handlePublish}>
            Publish Story
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {chapters.map((chapter, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
                        currentChapter === index
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => handleChapterChange(index)}
                    >
                      {chapter.title}
                    </button>
                    {chapters.length > 1 && (
                      <button
                        className="text-red-500 hover:text-red-700 px-2"
                        onClick={() => handleRemoveChapter(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="px-4 py-3 font-medium text-sm text-indigo-600 hover:text-indigo-800"
                  onClick={handleAddChapter}
                >
                  + Add Chapter
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              <Input
                label="Chapter Title"
                value={chapters[currentChapter]?.title || ''}
                onChange={(e) => handleChapterTitleChange(currentChapter, e.target.value)}
                className="mb-4"
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Content
                </label>
                <textarea
                  value={chapters[currentChapter]?.content || ''}
                  onChange={(e) => handleChapterContentChange(currentChapter, e.target.value)}
                  rows={15}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <Text variant="h2" weight="semibold" className="text-xl mb-4">
              Story Details
            </Text>
            
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4"
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Fantasy">Fantasy</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Fairy Tale">Fairy Tale</option>
                  <option value="Educational">Educational</option>
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
                  <option value="3-5">3-5</option>
                  <option value="5-7">5-7</option>
                  <option value="6-8">6-8</option>
                  <option value="7-9">7-9</option>
                  <option value="8-10">8-10</option>
                  <option value="10-12">10-12</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="secondary" className="flex-1">
                Preview
              </Button>
              <Button variant="primary" className="flex-1">
                Generate AI
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <Text variant="h2" weight="semibold" className="text-xl mb-4">
              Story Elements
            </Text>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Characters
                </label>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Emma
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Ferdinand
                  </span>
                  <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    + Add
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Settings
                </label>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Magic Forest
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Grandmother's Attic
                  </span>
                  <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    + Add
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Themes
                </label>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Adventure
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Friendship
                  </span>
                  <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryEditorPage;