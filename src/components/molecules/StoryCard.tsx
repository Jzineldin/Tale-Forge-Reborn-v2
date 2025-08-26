import React from 'react';
import Button from '@/components/atoms/Button';
import { useOptimizedImage } from '@/utils/performance';

// Helper function to convert age format to difficulty display
const getDifficultyDisplay = (ageGroup: string): string => {
  if (!ageGroup) return 'Medium';
  
  // Convert age ranges to difficulty labels
  if (ageGroup.includes('3-4') || ageGroup.includes('3') || ageGroup.includes('4')) return 'Very Easy';
  if (ageGroup.includes('4-6') || ageGroup.includes('5') || ageGroup.includes('6')) return 'Easy';
  if (ageGroup.includes('7-9') || ageGroup.includes('7') || ageGroup.includes('8') || ageGroup.includes('9')) return 'Medium';
  if (ageGroup.includes('10-12') || ageGroup.includes('10') || ageGroup.includes('11') || ageGroup.includes('12')) return 'Hard';
  if (ageGroup.includes('13-15') || ageGroup.includes('13') || ageGroup.includes('14') || ageGroup.includes('15')) return 'Very Hard';
  
  return 'Medium'; // Default fallback
};

interface StoryCardProps {
  title: string;
  description: string;
  genre: string;
  ageGroup: string;
  imageUrl?: string;
  onRead?: () => void;
  onEdit?: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({
  title,
  description,
  genre,
  ageGroup,
  imageUrl,
  onRead,
  onEdit,
}) => {
  // Use optimized image loading
  const imageProps = useOptimizedImage(imageUrl || '', 400, 300);
  
  return (
    <div 
      className="refined-card bg-white/5 border border-amber-400/10 rounded-xl overflow-hidden hover:transform hover:scale-102 transition-all duration-200 group hover:border-amber-400/20"
      role="article"
      aria-label={`Story: ${title}`}
    >
      {imageUrl && (
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-900/10 to-slate-900/10">
          <img 
            {...imageProps}
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              // Fallback to genre-appropriate placeholder
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full bg-gradient-to-br from-amber-900/20 to-slate-900/20 flex items-center justify-center">
            <span className="text-4xl">📚</span>
          </div>
        </div>
      )}
      <div className="p-6">
        <h3 
          className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-1"
          id={`story-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {title}
        </h3>
        <p 
          className="text-white/80 text-sm mb-4 line-clamp-2"
          aria-describedby={`story-description-${title.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {description}
        </p>
        <div className="flex justify-between items-center mb-4">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-400/20"
            aria-label={`Genre: ${genre}`}
          >
            {genre}
          </span>
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-300 border border-slate-400/20"
            aria-label={`Difficulty: ${getDifficultyDisplay(ageGroup)}`}
          >
            {getDifficultyDisplay(ageGroup)}
          </span>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={onRead}
            variant="primary"
            size="small"
            className="flex-1"
            aria-label={`Read story: ${title}`}
          >
            📖 Read Story
          </Button>
          {onEdit && (
            <Button 
              onClick={onEdit}
              variant="secondary"
              size="small"
              aria-label={`Edit story: ${title}`}
            >
              ✏️ Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryCard;