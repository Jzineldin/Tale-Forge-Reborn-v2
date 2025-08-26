import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreditSummary } from '@/hooks/useCredits';
import { UnifiedCard, DESIGN_TOKENS } from '@/components/design-system';

interface CreditDisplayProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  className = '', 
  showDetails = false,
  compact = false 
}) => {
  const navigate = useNavigate();
  const { balance, canCreateShort, canCreateMedium, canCreateLong, loading, error, refreshSummary } = useCreditSummary();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-white/20 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-400 text-sm ${className}`}>
        <span>Credits unavailable</span>
        <button 
          onClick={refreshSummary}
          className="ml-2 text-xs text-white/60 hover:text-white/80"
          title="Retry loading credits"
        >
          🔄
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <span className="text-amber-400">💳</span>
          <span className="text-white font-medium">{balance}</span>
          <span className="text-white/60 text-sm">credits</span>
        </div>
        {balance < 15 && (
          <span className="text-red-400 text-xs">Low credits</span>
        )}
      </div>
    );
  }

  return (
    <UnifiedCard variant="glass" className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">💳</div>
          <div>
            <div className="text-lg font-bold text-white">{balance} Credits</div>
            <div className="text-white/60 text-sm">Available balance</div>
          </div>
        </div>
        
        {showDetails && (
          <div className="text-right">
            <div className="text-xs text-white/60 space-y-1">
              <div className={`flex items-center gap-2 ${canCreateShort ? 'text-green-400' : 'text-red-400'}`}>
                <span>{canCreateShort ? '✅' : '❌'}</span>
                <span>Short Story (15 credits)</span>
              </div>
              <div className={`flex items-center gap-2 ${canCreateMedium ? 'text-green-400' : 'text-red-400'}`}>
                <span>{canCreateMedium ? '✅' : '❌'}</span>
                <span>Medium Story (25 credits)</span>
              </div>
              <div className={`flex items-center gap-2 ${canCreateLong ? 'text-green-400' : 'text-red-400'}`}>
                <span>{canCreateLong ? '✅' : '❌'}</span>
                <span>Long Story (40 credits)</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {balance < 15 && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400">
            <span>⚠️</span>
            <span className="text-sm font-medium">Low Credits</span>
          </div>
          <p className="text-red-300 text-xs mt-1">
            You don't have enough credits for a complete story. Consider upgrading to Premium or Pro.
          </p>
          <button 
            className={`${DESIGN_TOKENS.components.button.primary} text-xs px-3 py-1 mt-2`}
            onClick={() => navigate('/pricing')}
          >
            Upgrade Now
          </button>
        </div>
      )}
    </UnifiedCard>
  );
};

interface CreditCostDisplayProps {
  storyType: 'short' | 'medium' | 'long';
  className?: string;
}

export const CreditCostDisplay: React.FC<CreditCostDisplayProps> = ({ 
  storyType, 
  className = '' 
}) => {
  const costs = {
    short: { chapters: 3, total: 15 },
    medium: { chapters: 5, total: 25 },
    long: { chapters: 8, total: 40 }
  };

  const cost = costs[storyType];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-amber-400">💳</span>
      <span className="text-white font-medium">{cost.total} credits</span>
      <span className="text-white/60 text-sm">
        ({cost.chapters} chapters with images & audio)
      </span>
    </div>
  );
};

interface CreditBalanceIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CreditBalanceIndicator: React.FC<CreditBalanceIndicatorProps> = ({ 
  className = '',
  size = 'md' 
}) => {
  const { balance, loading, error } = useCreditSummary();

  if (loading || error) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const getBalanceColor = (credits: number) => {
    if (credits >= 25) return 'bg-green-500/20 text-green-400 border-green-400/30';
    if (credits >= 15) return 'bg-amber-500/20 text-amber-400 border-amber-400/30';
    return 'bg-red-500/20 text-red-400 border-red-400/30';
  };

  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md
      ${sizeClasses[size]}
      ${getBalanceColor(balance)}
      ${className}
    `}>
      <span>💳</span>
      <span className="font-medium">{balance}</span>
      <span className="opacity-80">credits</span>
    </div>
  );
};