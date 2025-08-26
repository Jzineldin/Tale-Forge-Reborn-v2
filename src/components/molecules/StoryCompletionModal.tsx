import React, { useState } from 'react';
import { templateCreditsService } from '@/services';
import { useCredits } from '@/hooks/useCredits';

interface StoryCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  originalStoryCost: number;
  chapterCount: number;
  onAudioPurchased?: (audioUrl: string) => void;
}

const StoryCompletionModal: React.FC<StoryCompletionModalProps> = ({
  isOpen,
  onClose,
  storyId,
  storyTitle,
  originalStoryCost,
  chapterCount,
  onAudioPurchased
}) => {
  const { credits, refreshCredits } = useCredits();
  const [purchasing, setPurchasing] = useState(false);
  const [showAudioOffer, setShowAudioOffer] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentBalance = credits?.currentBalance || 0;
  const audioInfo = templateCreditsService.calculateStoryAudioCost(originalStoryCost);

  const handleAudioPurchase = async () => {
    try {
      setPurchasing(true);
      setError(null);

      if (currentBalance < audioInfo.audioCost) {
        setError(`You need ${audioInfo.audioCost} credits but only have ${currentBalance}.`);
        return;
      }

      const result = await templateCreditsService.purchaseStoryAudio(storyId, originalStoryCost);

      if (result.success) {
        await refreshCredits();
        if (result.audioUrl && onAudioPurchased) {
          onAudioPurchased(result.audioUrl);
        }
        setShowAudioOffer(false);
      } else {
        setError('Failed to purchase audio. Please try again.');
      }
    } catch (err) {
      console.error('Error purchasing audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to purchase audio');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSkipAudio = () => {
    setShowAudioOffer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-enhanced bg-slate-900/95 border border-white/20 rounded-2xl p-8 max-w-lg w-full">
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="fantasy-heading-cinzel text-3xl font-bold mb-2">
            Story Complete!
          </h2>
          <h3 className="text-xl text-amber-400 font-medium mb-2">
            "{storyTitle}"
          </h3>
          <p className="text-white/70">
            You've finished reading all {chapterCount} chapters!
          </p>
        </div>

        {showAudioOffer ? (
          /* Audio Upsell */
          <div>
            <div className="glass-card bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-400/30 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎧</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Preserve Your Story with Professional Narration
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    Turn your completed story into an audiobook with high-quality AI narration. 
                    Perfect for bedtime listening or preserving this special tale!
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-amber-400">{audioInfo.audioCost} Credits</p>
                      <p className="text-xs text-white/50">Full story narration</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60">Your Balance: {currentBalance}</p>
                      <p className="text-sm text-white/50">After: {currentBalance - audioInfo.audioCost}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-card bg-red-900/30 border border-red-500/50 p-3 rounded-lg mb-4">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Audio Purchase Actions */}
            <div className="flex space-x-3 mb-4">
              <button
                onClick={handleSkipAudio}
                className="flex-1 glass-card hover:glass-enhanced border border-white/20 hover:border-white/30 py-3 rounded-lg text-white/80 hover:text-white transition-all duration-300"
              >
                Maybe Later
              </button>
              <button
                onClick={handleAudioPurchase}
                disabled={purchasing || currentBalance < audioInfo.audioCost}
                className="flex-1 fantasy-cta py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Add Narration`
                )}
              </button>
            </div>

            {/* Benefits */}
            <div className="text-xs text-white/50 text-center">
              <p className="mb-1">✓ Professional AI voice • ✓ Download for offline listening</p>
              <p>✓ Perfect for bedtime • ✓ Share with family</p>
            </div>
          </div>
        ) : (
          /* Story Complete Actions */
          <div>
            <div className="glass-card bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-400/30 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Your story is now complete!
                </h3>
                <p className="text-white/70 text-sm">
                  You can always revisit this story in your library or share it with friends and family.
                </p>
              </div>
            </div>

            {/* Story Actions */}
            <div className="space-y-3">
              <button className="w-full glass-card hover:glass-enhanced border border-white/20 hover:border-amber-400/50 py-3 rounded-lg text-white hover:text-amber-400 transition-all duration-300 flex items-center justify-center space-x-2">
                <span>📖</span>
                <span>Read Again</span>
              </button>
              
              <button className="w-full glass-card hover:glass-enhanced border border-white/20 hover:border-amber-400/50 py-3 rounded-lg text-white hover:text-amber-400 transition-all duration-300 flex items-center justify-center space-x-2">
                <span>📤</span>
                <span>Share Story</span>
              </button>
              
              <button 
                onClick={onClose}
                className="w-full fantasy-cta py-3 rounded-lg"
              >
                Create New Story
              </button>
            </div>
          </div>
        )}

        {/* Story Stats */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-400">{chapterCount}</p>
              <p className="text-xs text-white/60">Chapters</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{originalStoryCost}</p>
              <p className="text-xs text-white/60">Credits Used</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">100%</p>
              <p className="text-xs text-white/60">Complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCompletionModal;