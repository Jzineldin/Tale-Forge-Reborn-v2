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
  // Handle specific known ranges first
  switch (ageGroup) {
    case '3-4':
      return 'Ages 3-4 (20-40 words)';
    case '4-6':
      return 'Ages 4-6 (50-90 words)';
    case '7-9':
      return 'Ages 7-9 (80-120 words)';
    case '10-12':
      return 'Ages 10-12 (150-180 words)';
    case '7-12':
      return 'Ages 7-12 (80-150 words)';
    case '5-10':
      return 'Ages 5-10 (60-140 words)';
  }
  
  // Handle flexible age formats
  if (ageGroup.includes('-')) {
    const [start, end] = ageGroup.split('-').map(Number);
    if (!isNaN(start) && !isNaN(end)) {
      // Estimate word count based on age range
      const avgAge = (start + end) / 2;
      let wordRange;
      if (avgAge <= 4) wordRange = '20-40';
      else if (avgAge <= 6) wordRange = '50-90';
      else if (avgAge <= 9) wordRange = '80-120';
      else wordRange = '120-180';
      
      return `Ages ${ageGroup} (${wordRange} words)`;
    }
  }
  
  // Handle single age numbers
  const age = parseInt(ageGroup);
  if (!isNaN(age)) {
    let wordRange;
    if (age <= 4) wordRange = '20-40';
    else if (age <= 6) wordRange = '50-90';
    else if (age <= 9) wordRange = '80-120';
    else wordRange = '120-180';
    
    return `Age ${age} (${wordRange} words)`;
  }
  
  // For any other format, just return it as is
  return ageGroup;
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