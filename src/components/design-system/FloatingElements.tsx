import React from 'react';

// Reusable floating elements animation component
// Used across all pages for visual consistency
const FloatingElements: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary floating dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/20 rounded-full animate-pulse"></div>
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-500/25 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-amber-300/15 rounded-full animate-pulse delay-2000"></div>
      <div className="absolute top-1/3 right-2/3 w-1 h-1 bg-amber-600/20 rounded-full animate-pulse delay-3000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-amber-400/30 rounded-full animate-pulse delay-4000"></div>
      
      {/* Additional subtle elements for depth */}
      <div className="absolute top-1/6 right-1/4 w-0.5 h-0.5 bg-amber-500/10 rounded-full animate-pulse delay-5000"></div>
      <div className="absolute bottom-1/3 right-1/5 w-0.5 h-0.5 bg-amber-400/15 rounded-full animate-pulse delay-6000"></div>
      <div className="absolute top-2/3 left-1/6 w-1 h-1 bg-amber-300/20 rounded-full animate-pulse delay-7000"></div>
    </div>
  );
};

export default FloatingElements;