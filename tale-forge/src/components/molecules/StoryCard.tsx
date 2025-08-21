import React from 'react';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import { useOptimizedImage } from '@/utils/performance';

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
      className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group"
      role="article"
      aria-label={`Story: ${title}`}
    >
      {imageUrl && (
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          <img 
            {...imageProps}
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              // Fallback to genre-appropriate placeholder
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
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
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-400/30"
            aria-label={`Genre: ${genre}`}
          >
            {genre}
          </span>
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-400/30"
            aria-label={`Age group: ${ageGroup}`}
          >
            Age {ageGroup}
          </span>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onRead}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-colors font-semibold text-sm hover:scale-105 transform duration-200"
            aria-label={`Read story: ${title}`}
          >
            📖 Read Story
          </button>
          {onEdit && (
            <button 
              onClick={onEdit}
              className="bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition-colors font-semibold text-sm hover:scale-105 transform duration-200"
              aria-label={`Edit story: ${title}`}
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryCard;