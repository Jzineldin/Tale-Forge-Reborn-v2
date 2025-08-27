// Helper function to convert age format back to difficulty display
export const getDifficultyDisplay = (ageGroup: string): string => {
  if (!ageGroup) return 'Medium Difficulty';

  // Convert age ranges to difficulty labels
  if (ageGroup.includes('3-4') || ageGroup.includes('3') || ageGroup.includes('4')) return 'Very Easy';
  if (ageGroup.includes('4-6') || ageGroup.includes('5') || ageGroup.includes('6')) return 'Easy';
  if (ageGroup.includes('7-9') || ageGroup.includes('7') || ageGroup.includes('8') || ageGroup.includes('9')) return 'Medium';
  if (ageGroup.includes('10-12') || ageGroup.includes('10') || ageGroup.includes('11') || ageGroup.includes('12')) return 'Hard';
  if (ageGroup.includes('13-15') || ageGroup.includes('13') || ageGroup.includes('14') || ageGroup.includes('15')) return 'Very Hard';

  return 'Medium'; // Default fallback
};

export const getFontSizeClass = (fontSize: string): string => {
  switch (fontSize) {
    case 'small': return 'text-lg';
    case 'large': return 'text-2xl';
    case 'xl': return 'text-3xl';
    default: return 'text-xl'; // medium
  }
};