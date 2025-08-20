// Shared utility functions between frontend and backend

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateAgeGroupLabel = (ageGroup: string): string => {
  switch (ageGroup) {
    case '4-6':
      return 'Ages 4-6 (50-90 words)';
    case '7-9':
      return 'Ages 7-9 (80-120 words)';
    case '10-12':
      return 'Ages 10-12 (150-180 words)';
    default:
      return ageGroup;
  }
};

export const getGenreIcon = (genre: string): string => {
  const icons: Record<string, string> = {
    'Bedtime Stories': '🌙',
    'Fantasy & Magic': '🧙‍♂️',
    'Adventure & Exploration': '🗺️',
    'Mystery & Detective': '🔍',
    'Science Fiction & Space': '🚀',
    'Educational Stories': '📚',
    'Values & Life Lessons': '💎',
    'Silly & Humorous Stories': '😄',
  };
  
  return icons[genre] || '📖';
};