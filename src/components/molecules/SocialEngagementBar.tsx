// Social Engagement Bar Component
// Displays likes, bookmarks, ratings, and sharing options for templates

import React, { useState } from 'react';
import { useStoryTemplateSocialStats, useStoryTemplateLikes, useStoryTemplateBookmarks, useStoryTemplateSharing } from '@/hooks/useSocialEngagement.adapted';

interface SocialEngagementBarProps {
  templateId: string;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export const SocialEngagementBar: React.FC<SocialEngagementBarProps> = ({
  templateId,
  variant = 'compact',
  className = ''
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  const socialStats = useStoryTemplateSocialStats(templateId);
  const { toggleLike, isToggling: isLiking } = useStoryTemplateLikes(templateId);
  const { toggleBookmark, isToggling: isBookmarking } = useStoryTemplateBookmarks(templateId);
  const { shareTemplate, isSharing } = useStoryTemplateSharing(templateId);
  
  const handleShare = async (platform: string) => {
    await shareTemplate(platform);
    setShowShareMenu(false);
  };
  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 text-xs text-white/70 ${className}`}>
        {/* Like Button */}
        <button
          onClick={() => toggleLike()}
          disabled={isLiking}
          className={`flex items-center gap-1 transition-colors ${
            socialStats.is_liked 
              ? 'text-red-400 hover:text-red-300' 
              : 'hover:text-red-400'
          }`}
        >
          <span>{socialStats.is_liked ? '❤️' : '🤍'}</span>
          <span>{socialStats.likes_count}</span>
        </button>
        
        {/* Rating */}
        {socialStats.rating_average > 0 && (
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>{socialStats.rating_average.toFixed(1)}</span>
            <span className="text-white/50">({socialStats.reviews_count})</span>
          </div>
        )}
        
        {/* Usage Count */}
        {socialStats.usage_count > 0 && (
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{socialStats.usage_count} used</span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Left side - Engagement metrics */}
      <div className="flex items-center gap-4">
        {/* Like Button */}
        <button
          onClick={() => toggleLike()}
          disabled={isLiking}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            socialStats.is_liked
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-red-400'
          }`}
        >
          <span className="text-sm">{socialStats.is_liked ? '❤️' : '🤍'}</span>
          <span className="text-sm font-medium">{socialStats.likes_count}</span>
        </button>
        
        {/* Bookmark Button */}
        <button
          onClick={() => toggleBookmark('default')}
          disabled={isBookmarking}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
            socialStats.is_bookmarked
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-amber-400'
          }`}
        >
          <span className="text-sm">{socialStats.is_bookmarked ? '🔖' : '📑'}</span>
          <span className="text-sm font-medium">{socialStats.bookmarks_count}</span>
        </button>
        
        {/* Rating Display */}
        {socialStats.rating_average > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-medium text-yellow-400">
              {socialStats.rating_average.toFixed(1)}
            </span>
            <span className="text-xs text-white/50">({socialStats.reviews_count})</span>
          </div>
        )}
        
        {/* Usage Count */}
        {socialStats.usage_count > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
            <span className="text-sm">👥</span>
            <span className="text-sm text-white/70">{socialStats.usage_count} created</span>
          </div>
        )}
      </div>
      
      {/* Right side - Share button */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
        >
          <span className="text-sm">📤</span>
          <span className="text-sm text-white/70">Share</span>
        </button>
        
        {/* Share Menu */}
        {showShareMenu && (
          <div className="absolute right-0 top-full mt-2 bg-black/80 backdrop-blur-lg border border-white/20 rounded-xl p-2 z-50">
            <div className="flex flex-col gap-1 min-w-[120px]">
              <button
                onClick={() => handleShare('twitter')}
                disabled={isSharing}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span>🐦</span> Twitter
              </button>
              <button
                onClick={() => handleShare('facebook')}
                disabled={isSharing}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span>📘</span> Facebook
              </button>
              <button
                onClick={() => handleShare('reddit')}
                disabled={isSharing}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span>🤖</span> Reddit
              </button>
              <button
                onClick={() => handleShare('link')}
                disabled={isSharing}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span>🔗</span> Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};