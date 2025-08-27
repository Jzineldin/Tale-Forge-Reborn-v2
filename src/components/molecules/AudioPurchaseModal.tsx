import React, { useState } from 'react';
import { templateCreditsService } from '@/services';
import { useCredits } from '@/hooks/useCredits';

interface AudioPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  originalStoryCost: number;
  chapterCount: number;
  onPurchaseComplete: (audioUrl: string) => void;
}

const AudioPurchaseModal: React.FC<AudioPurchaseModalProps> = ({
  isOpen,
  onClose,
  storyId,
  originalStoryCost,
  chapterCount,
  onPurchaseComplete
}) => {
  const { balance, refreshBalance } = useCredits();
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioData = templateCreditsService.calculateStoryAudioCost(originalStoryCost);
  const currentBalance = balance || 0;

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      setError(null);

      if (currentBalance < audioData.audioCost) {
        setError(`Insufficient credits. You need ${audioData.audioCost} credits but only have ${currentBalance}.`);
        return;
      }

      const result = await templateCreditsService.purchaseStoryAudio(
        storyId,
        originalStoryCost
      );

      if (result.success && result.audioUrl) {
        refreshBalance();
        onPurchaseComplete(result.audioUrl);
        onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-enhanced bg-slate-900/95 border border-white/20 rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎧</span>
          </div>
          <h2 className="fantasy-heading-cinzel text-2xl font-bold mb-2">
            Add Professional Narration
          </h2>
          <p className="text-white/70 text-sm">
            Bring your story to life with high-quality AI voice narration
          </p>
        </div>

        {/* Audio Information */}
        <div className="glass-card bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-400/30 rounded-lg p-6 mb-6">
          <div className="text-center">
            <h3 className="text-white font-medium mb-2">Professional Story Narration</h3>
            <p className="text-white/60 text-sm mb-4">High-quality AI voice narration for your entire {chapterCount}-chapter story</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{audioData.audioCost}</p>
                <p className="text-xs text-white/50">credits</p>
              </div>
              <div className="text-white/40">
                <span className="text-sm">50% of story cost ({originalStoryCost} credits)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Balance */}
        <div className="glass-card bg-slate-800/30 border border-white/10 rounded-lg p-3 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Your Credit Balance:</span>
            <span className="text-amber-400 font-medium">{currentBalance} credits</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-white/70">After Purchase:</span>
            <span className={`font-medium ${
              currentBalance >= audioData.audioCost ? 'text-green-400' : 'text-red-400'
            }`}>
              {currentBalance - audioData.audioCost} credits
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card bg-red-900/30 border border-red-500/50 p-3 rounded-lg mb-4">
            <p className="text-red-200 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 glass-card hover:glass-enhanced border border-white/20 hover:border-white/30 py-3 rounded-lg text-white/80 hover:text-white transition-all duration-300"
          >
            Maybe Later
          </button>
          <button
            onClick={handlePurchase}
            disabled={purchasing || currentBalance < audioData.audioCost}
            className="flex-1 fantasy-cta py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {purchasing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Purchase for ${audioData.audioCost} Credits`
            )}
          </button>
        </div>

        {/* Features List */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-white/80 text-sm font-medium mb-3">What's Included:</h4>
          <div className="space-y-2 text-xs text-white/60">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Professional AI voice narration</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Multiple voice options</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Download for offline listening</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✓</span>
              <span>Perfect for bedtime stories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPurchaseModal;