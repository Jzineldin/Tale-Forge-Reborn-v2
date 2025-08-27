import React from 'react';
import Button from '@/components/atoms/Button';
import { ContentItem } from '@/hooks/useContentManagement';

interface ContentReviewModalProps {
  content: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (contentId: string, action: 'approve' | 'remove' | 'warn') => void;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-500/20';
    case 'high': return 'text-orange-400 bg-orange-500/20';
    case 'medium': return 'text-amber-400 bg-amber-500/20';
    case 'low': return 'text-green-400 bg-green-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

const ContentReviewModal: React.FC<ContentReviewModalProps> = ({ 
  content, 
  isOpen, 
  onClose, 
  onAction 
}) => {
  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-enhanced bg-black/40 border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="fantasy-heading text-2xl font-bold">
            🔍 Content Review
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Title</label>
              <p className="text-white text-lg">{content.title}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300">Author</label>
              <p className="text-white">{content.author}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Type</label>
              <span className="inline-block bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm ml-2">
                {content.type.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Status</label>
              <span className={`inline-block px-2 py-1 rounded text-sm ml-2 ${
                content.status === 'published' ? 'bg-green-500/20 text-green-300' :
                content.status === 'reported' ? 'bg-red-500/20 text-red-300' :
                content.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {content.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Reports</label>
              <p className="text-red-400 text-xl font-bold">{content.reports}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Severity</label>
              <span className={`inline-block px-2 py-1 rounded text-sm ml-2 ${getSeverityColor(content.severity)}`}>
                {content.severity.toUpperCase()}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300">Created</label>
              <p className="text-white">{new Date(content.createdAt).toLocaleDateString()}</p>
            </div>

            {content.genre && (
              <div>
                <label className="text-sm font-medium text-gray-300">Genre</label>
                <p className="text-white">{content.genre}</p>
              </div>
            )}

            {content.ageGroup && (
              <div>
                <label className="text-sm font-medium text-gray-300">Age Group</label>
                <p className="text-white">{content.ageGroup}</p>
              </div>
            )}
          </div>
        </div>

        {/* Report Reasons */}
        {content.reportReasons.length > 0 && (
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-300 block mb-2">Report Reasons</label>
            <div className="flex flex-wrap gap-2">
              {content.reportReasons.map((reason, index) => (
                <span 
                  key={index} 
                  className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-sm"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content Preview */}
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-300 block mb-2">Content</label>
          <div className="bg-black/20 border border-white/10 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-white text-sm whitespace-pre-wrap">
              {content.content.substring(0, 1000)}
              {content.content.length > 1000 && '...'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-end">
          <Button
            onClick={() => onAction(content.id, 'approve')}
            className="fantasy-btn bg-green-600 hover:bg-green-700 text-white"
          >
            ✅ Approve
          </Button>
          
          <Button
            onClick={() => onAction(content.id, 'warn')}
            className="fantasy-btn bg-amber-600 hover:bg-amber-700 text-white"
          >
            ⚠️ Warn Author
          </Button>
          
          <Button
            onClick={() => onAction(content.id, 'remove')}
            className="fantasy-btn bg-red-600 hover:bg-red-700 text-white"
          >
            🗑️ Remove
          </Button>

          <Button
            onClick={onClose}
            className="fantasy-btn bg-gray-600 hover:bg-gray-700 text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentReviewModal;