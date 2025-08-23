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

  // Enhanced visibility tracking with browser tab focus detection
  useEffect(() => {
    if (!containerRef.current) return;

    console.log('🖼️ Setting up StoryImage visibility monitoring for:', src);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        
        if (visible && !isLoading && imgRef.current) {
          console.log('🔍 Image container became visible, ensuring image is shown');
          
          // Force image visibility with multiple methods
          const img = imgRef.current;
          img.style.opacity = '1';
          img.style.display = 'block';
          img.style.visibility = 'visible';
          
          // Force browser repaint
          requestAnimationFrame(() => {
            if (img.parentElement) {
              img.parentElement.style.transform = 'translateZ(0)';
              img.offsetHeight; // Force reflow
              img.parentElement.style.transform = '';
            }
          });
        }
      });
    }, { 
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: '50px'
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isLoading, src]);

  // CRITICAL: Tab focus visibility fix - Force image visibility when tab becomes active
  useEffect(() => {
    const forceImageVisibility = () => {
      if (!isLoading && imgRef.current) {
        console.log('👁️ Browser tab focused - forcing image visibility for:', src?.substring(src?.lastIndexOf('/') + 1, src?.lastIndexOf('/') + 20));
        const img = imgRef.current;
        
        // Aggressive visibility enforcement with multiple techniques
        img.style.setProperty('opacity', '1', 'important');
        img.style.setProperty('display', 'block', 'important');
        img.style.setProperty('visibility', 'visible', 'important');
        img.style.setProperty('position', 'relative', 'important');
        img.style.setProperty('z-index', '10', 'important');
        
        // Force multiple layout recalculations
        img.offsetHeight;
        img.offsetWidth;
        
        // GPU acceleration to force render
        img.style.transform = 'translateZ(0) scale(1.0001)';
        setTimeout(() => {
          if (img && img.parentNode) {
            img.style.transform = 'translateZ(0)';
            setTimeout(() => {
              if (img && img.parentNode) img.style.transform = '';
            }, 100);
          }
        }, 50);
        
        // Ensure parent container is also visible
        if (img.parentElement) {
          img.parentElement.style.setProperty('display', 'block', 'important');
          img.parentElement.style.setProperty('overflow', 'visible', 'important');
          img.parentElement.offsetHeight; // Force parent reflow
        }
        
        // Final check - if image has src but still not visible, log for debugging
        setTimeout(() => {
          if (img && img.src && img.complete) {
            const rect = img.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(img);
            const actuallyVisible = rect.width > 0 && rect.height > 0 && computedStyle.opacity !== '0';
            if (!actuallyVisible) {
              console.warn('🚨 Image still not visible after force:', {
                src: img.src.substring(img.src.lastIndexOf('/') + 1, img.src.lastIndexOf('/') + 20),
                width: rect.width,
                height: rect.height,
                opacity: computedStyle.opacity,
                display: computedStyle.display
              });
            }
          }
        }, 300);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Document became visible - will check images');
        // Multiple delayed attempts to catch React re-renders
        setTimeout(forceImageVisibility, 10);
        setTimeout(forceImageVisibility, 100);
        setTimeout(forceImageVisibility, 300);
        setTimeout(forceImageVisibility, 800);
      }
    };

    const handleWindowFocus = () => {
      console.log('👁️ Window focused - will check images');
      setTimeout(forceImageVisibility, 10);
      setTimeout(forceImageVisibility, 150);
      setTimeout(forceImageVisibility, 400);
    };

    // Add event listeners for tab switching detection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pageshow', forceImageVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pageshow', forceImageVisibility);
    };
  }, [isLoading, src]);

  const handleLoad = () => {
    console.log('🖼️ Image loaded successfully:', src);
    
    // Force immediate visibility and state update
    if (imgRef.current) {
      const img = imgRef.current;
      img.style.opacity = '1';
      img.style.display = 'block';
      img.style.visibility = 'visible';
      img.style.position = 'relative';
      img.style.zIndex = '1';
    }
    
    setIsLoading(false);
    onImageLoad?.();
    
    // Aggressive visibility enforcement
    const enforceVisibility = () => {
      if (imgRef.current && !isLoading) {
        const img = imgRef.current;
        img.style.opacity = '1';
        img.style.display = 'block';
        img.style.visibility = 'visible';
        
        // Force layout recalculation
        img.offsetHeight;
        
        // Ensure parent container doesn't hide the image
        if (img.parentElement) {
          img.parentElement.style.overflow = 'visible';
        }
      }
    };
    
    // Multiple enforcement attempts
    requestAnimationFrame(enforceVisibility);
    setTimeout(enforceVisibility, 100);
    setTimeout(enforceVisibility, 500);
    setTimeout(enforceVisibility, 1000);
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

  // Component stability monitoring
  useEffect(() => {
    console.log(`🖼️ StoryImage component state: loading=${isLoading}, visible=${isVisible}, src=${src?.substring(src?.lastIndexOf('/') + 1, src?.lastIndexOf('/') + 20) || 'none'}`);
  }, [isLoading, isVisible, src]);

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