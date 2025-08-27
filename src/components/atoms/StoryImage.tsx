import React, { useState } from 'react';
import { Skeleton } from '@/utils/performance';

interface StoryImageProps {
  src: string;
  alt: string;
  className?: string;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

const StoryImage: React.FC<StoryImageProps> = ({ 
  src, 
  alt, 
  className = '',
  onImageLoad,
  onImageError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onImageLoad?.();
  };

  const handleError = () => {
    console.log('❌ Image failed to load:', src);
    setIsLoading(false);
    setHasError(true);
    onImageError?.();
  };

  // Fallback image URL
  const fallbackImage = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

  if (hasError) {
    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
        <img
          src={fallbackImage}
          alt={alt}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 text-center p-4">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm">Image not available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}
        style={{
          display: 'block',
          visibility: 'visible'
        }}
      />
    </div>
  );
};

export default StoryImage;