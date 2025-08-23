import React, { useState, useEffect, useRef } from 'react';
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
  const [imageSrc, setImageSrc] = useState(src);
  const [forceRender, setForceRender] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    setHasError(false);
    setImageSrc(src);
    setForceRender(prev => prev + 1);
  }, [src]);

  // Simplified visibility tracking - remove excessive logging
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const visible = entry.isIntersecting;
        
        // Only update if visibility actually changed
        if (visible !== isVisible) {
          setIsVisible(visible);
          
          if (visible && !isLoading && imgRef.current) {
            // Simple visibility fix
            const img = imgRef.current;
            img.style.opacity = '1';
            img.style.display = 'block';
            img.style.visibility = 'visible';
          }
        }
      });
    }, { 
      threshold: [0.1],
      rootMargin: '20px'
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isLoading, src, isVisible]);

  // Simplified tab focus fix - remove excessive logging and timeouts
  useEffect(() => {
    const forceImageVisibility = () => {
      if (!isLoading && imgRef.current) {
        const img = imgRef.current;
        
        // Simple visibility enforcement
        img.style.opacity = '1';
        img.style.display = 'block';
        img.style.visibility = 'visible';
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        forceImageVisibility();
      }
    };

    const handleWindowFocus = () => {
      forceImageVisibility();
    };

    // Add event listeners for tab switching detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isLoading, src]);

  const handleLoad = () => {
    // Simple image load handler
    if (imgRef.current) {
      const img = imgRef.current;
      img.style.opacity = '1';
      img.style.display = 'block';
      img.style.visibility = 'visible';
    }
    
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
          <div className="text-center">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4-4m-6 6l-4-4m-2 6l4-4" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">Image unavailable</p>
          </div>
        </div>
      </div>
    );
  }

  // Remove excessive state monitoring logs

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`} 
      style={{ 
        minHeight: '200px',
        position: 'relative',
        overflow: 'visible',
        zIndex: 1
      }}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
      )}
      <img
        ref={imgRef}
        key={`${imageSrc}-${forceRender}`}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        style={{
          opacity: isLoading ? 0 : 1,
          display: 'block',
          visibility: 'visible',
          position: 'relative',
          zIndex: 2
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default StoryImage;