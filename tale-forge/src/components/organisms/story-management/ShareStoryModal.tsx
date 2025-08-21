import React, { useState } from 'react';
import Icon from '@/components/atoms/Icon';

interface ShareStoryModalProps {
  story: {
    id: string;
    title: string;
    description: string;
    author_name?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const ShareStoryModal: React.FC<ShareStoryModalProps> = ({ story, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  if (!isOpen) return null;

  const storyUrl = `${window.location.origin}/stories/${story.id}`;
  
  const shareText = shareMessage || 
    `Check out "${story.title}" on Tale Forge! ${story.description.slice(0, 100)}${story.description.length > 100 ? '...' : ''}`;

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: 'link',
      action: () => {
        navigator.clipboard.writeText(storyUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      color: 'bg-gray-500'
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storyUrl)}`;
        window.open(twitterUrl, '_blank');
      },
      color: 'bg-blue-500'
    },
    {
      name: 'Facebook',
      icon: 'facebook',
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, '_blank');
      },
      color: 'bg-blue-600'
    },
    {
      name: 'WhatsApp',
      icon: 'whatsapp',
      action: () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${storyUrl}`)}`;
        window.open(whatsappUrl, '_blank');
      },
      color: 'bg-green-500'
    },
    {
      name: 'Email',
      icon: 'email',
      action: () => {
        const emailUrl = `mailto:?subject=${encodeURIComponent(`Check out "${story.title}" on Tale Forge`)}&body=${encodeURIComponent(`${shareText}\n\n${storyUrl}`)}`;
        window.location.href = emailUrl;
      },
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-enhanced bg-black/40 border border-white/20 rounded-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="fantasy-heading text-2xl font-bold">
            📤 Share Story
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Story Info */}
        <div className="glass-card bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <h4 className="text-white font-bold mb-1">{story.title}</h4>
          {story.author_name && (
            <p className="text-white/60 text-sm mb-2">by {story.author_name}</p>
          )}
          <p className="text-white/80 text-sm line-clamp-2">{story.description}</p>
        </div>

        {/* Custom Message */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            placeholder="Add a personal message..."
            className="glass-input w-full p-3 rounded-lg resize-none"
            rows={3}
          />
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={option.action}
              className={`${option.color} hover:scale-105 transition-all duration-300 text-white p-3 rounded-lg flex items-center justify-center space-x-2 font-medium`}
            >
              <Icon name={option.icon as any} size={20} />
              <span>{option.name === 'Copy Link' && copied ? 'Copied!' : option.name}</span>
            </button>
          ))}
        </div>

        {/* URL Display */}
        <div className="glass-card bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="link" size={16} className="text-white/60 flex-shrink-0" />
            <input
              type="text"
              value={storyUrl}
              readOnly
              className="bg-transparent text-white/80 text-sm flex-1 outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(storyUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareStoryModal;