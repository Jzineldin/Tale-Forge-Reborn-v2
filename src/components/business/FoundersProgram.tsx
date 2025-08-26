import React, { useState, useEffect } from 'react';
import { UnifiedCard, DESIGN_TOKENS } from '@/components/design-system';
import { useFoundersProgram } from '@/hooks/useFoundersProgram';
import { useAuth } from '@/providers/AuthContext';

interface FounderTier {
  id: string;
  name: string;
  range: string;
  spotsTotal: number;
  spotsRemaining: number;
  discount: number;
  bonusCredits: number;
  badge: string;
  benefits: string[];
  urgency: string;
  className: string;
}

interface FoundersProgramProps {
  onSelectTier?: (tierId: string) => void;
  showCompact?: boolean;
}

const FoundersProgram: React.FC<FoundersProgramProps> = ({ onSelectTier, showCompact = false }) => {
  const { user } = useAuth();
  const { status, founderProfile, loading, error, registerAsFounder } = useFoundersProgram();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Handle tier selection with real founder registration
  const handleTierSelection = async (tierId: string) => {
    if (!user) {
      alert('Please sign in to join the founders program');
      return;
    }

    if (founderProfile) {
      alert(`You are already Founder #${founderProfile.founderNumber}!`);
      return;
    }

    // Map tier IDs to subscription tiers
    const tierMap = {
      'elite': 'professional',
      'pioneer': 'premium', 
      'charter': 'premium'
    } as const;

    const subscriptionTier = tierMap[tierId as keyof typeof tierMap] || 'premium';
    
    try {
      const success = await registerAsFounder(subscriptionTier);
      if (success) {
        alert('Congratulations! You are now a Tale Forge Founder! 🎉');
      }
    } catch (err) {
      console.error('Founder registration error:', err);
    }

    // Also call the parent callback if provided
    onSelectTier?.(tierId);
  };

  // Generate founder tiers based on real status data
  const founderTiers: FounderTier[] = React.useMemo(() => {
    if (!status) return [];
    
    const totalClaimed = status.spotsClaimed;
    
    return [
      {
        id: 'elite',
        name: 'Elite Founders',
        range: '#001-025',
        spotsTotal: 25,
        spotsRemaining: Math.max(0, 25 - Math.min(25, totalClaimed)),
        discount: 60,
        bonusCredits: 100,
        badge: '👑 Elite',
        benefits: [
          'LIFETIME 60% discount on all plans',
          '+100 bonus credits every month for LIFE',
          'Personal 1-on-1 onboarding call',
          'Custom voice cloning included',
          'Exclusive Elite-only community',
          'Direct founder access via private Discord',
          'First access to ALL new features forever',
          'Personalized thank you video from founders',
          'Physical founder certificate mailed to you'
        ],
        urgency: totalClaimed >= 25 ? 'SOLD OUT!' : `Only ${Math.max(0, 25 - Math.min(25, totalClaimed))} spots left!`,
        className: 'ring-4 ring-yellow-400 bg-gradient-to-br from-yellow-500/20 to-amber-600/30'
      },
      {
        id: 'pioneer',
        name: 'Pioneer Founders',
        range: '#026-100', 
        spotsTotal: 75,
        spotsRemaining: Math.max(0, 100 - Math.min(100, totalClaimed)),
        discount: 45,
        bonusCredits: 75,
        badge: '⚡ Pioneer',
        benefits: [
          'LIFETIME 45% discount on all plans',
          '+75 bonus credits every month for LIFE',
          'Priority support with <4hr response',
          'Pioneer-only Discord community',
          'Beta access to all new features',
          'Quarterly founder Q&A sessions',
          'Digital founder certificate',
          '3x referral bonuses',
          'Custom founder profile badge'
        ],
        urgency: totalClaimed >= 100 ? 'SOLD OUT!' : totalClaimed < 25 ? `Available after Elite tier fills` : `${Math.max(0, 100 - Math.min(100, totalClaimed))} spots remaining`,
        className: 'ring-2 ring-blue-400 bg-gradient-to-br from-blue-500/20 to-purple-600/30'
      },
      {
        id: 'charter',
        name: 'Charter Founders',
        range: '#101-200',
        spotsTotal: 100,
        spotsRemaining: Math.max(0, 200 - Math.min(200, totalClaimed)),
        discount: 30,
        bonusCredits: 50,
        badge: '🌟 Charter',
        benefits: [
          'LIFETIME 30% discount on all plans',
          '+50 bonus credits every month for LIFE',
          'Charter founder Discord access',
          'Early access to major features',
          'Founder badge on profile',
          '2x referral bonuses',
          'Founder newsletter access',
          'Special founder pricing protection'
        ],
        urgency: totalClaimed >= 200 ? 'SOLD OUT!' : totalClaimed < 100 ? `Available after Pioneer tier fills` : `${Math.max(0, 200 - Math.min(200, totalClaimed))} spots remaining`,
        className: 'ring-1 ring-green-400 bg-gradient-to-br from-green-500/20 to-teal-600/30'
      }
    ];
  }, [status]);

  // Countdown timer using real program end date
  useEffect(() => {
    if (!status?.programEndDate) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endDate = new Date(status.programEndDate).getTime();
      const distance = endDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status?.programEndDate]);

  // Get current available tier based on real data
  const getCurrentTier = (): FounderTier | null => {
    if (!status || founderTiers.length === 0) return null;
    
    const totalClaimed = status.spotsClaimed;
    if (totalClaimed < 25) return founderTiers[0]; // Elite
    if (totalClaimed < 100) return founderTiers[1]; // Pioneer
    return founderTiers[2]; // Charter
  };

  const currentTier = getCurrentTier();

  // Show loading state
  if (loading) {
    return (
      <UnifiedCard variant="refined" className="mb-8 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mr-4"></div>
          <p className="text-white/80">Loading founders program...</p>
        </div>
      </UnifiedCard>
    );
  }

  // Show error state
  if (error) {
    return (
      <UnifiedCard variant="refined" className="mb-8 bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-400/30">
        <div className="text-center py-8">
          <p className="text-red-400 font-medium mb-2">Error loading founders program</p>
          <p className="text-white/70 text-sm">{error}</p>
        </div>
      </UnifiedCard>
    );
  }

  // Show inactive program state
  if (!status?.isActive) {
    return (
      <UnifiedCard variant="refined" className="mb-8 bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-400/30">
        <div className="text-center py-8">
          <p className="text-gray-400 font-medium mb-2">Founders Program Currently Inactive</p>
          <p className="text-white/70 text-sm">Check back soon for exclusive early adopter benefits!</p>
        </div>
      </UnifiedCard>
    );
  }

  if (showCompact && currentTier) {
    return (
      <UnifiedCard variant="refined" className="mb-8 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="text-xl font-bold text-white">Limited Founders Program</h3>
                <p className="text-amber-400 font-medium">
                  {currentTier.name} {currentTier.range} • {currentTier.spotsRemaining} spots left
                </p>
                {founderProfile && (
                  <p className="text-green-400 font-medium text-sm">
                    ✅ You're Founder #{founderProfile.founderNumber}!
                  </p>
                )}
              </div>
            </div>
            <p className="text-white/80">
              Join the first {currentTier.range.includes('025') ? '25' : currentTier.range.includes('100') ? '100' : '200'} subscribers for {currentTier.discount}% lifetime discount + {currentTier.bonusCredits} monthly bonus credits!
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{status.spotsClaimed}</div>
              <div className="text-white/70 text-sm">Claimed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{timeLeft.days}</div>
              <div className="text-white/70 text-sm">Days Left</div>
            </div>
          </div>
        </div>
      </UnifiedCard>
    );
  }

  return (
    <div className="mb-16">
      {/* Program Header */}
      <UnifiedCard variant="enhanced" className="mb-8 text-center">
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-white mb-4">🚀 Founders Program</h2>
          <p className="text-xl text-white/90 mb-4">
            Limited to the <span className="text-amber-400 font-bold">first 200 subscribers</span> - get lifetime benefits that will NEVER be offered again
          </p>
          
          {/* Live Stats */}
          <div className="flex justify-center items-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{status.spotsClaimed}</div>
              <div className="text-white/70">Founders Joined</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{status.spotsRemaining}</div>
              <div className="text-white/70">Spots Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full max-w-2xl mx-auto mb-6">
            <div className="w-full bg-white/20 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${(status.spotsClaimed / status.totalSpots) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-white/60 text-sm mt-2">
              <span>0</span>
              <span className="font-medium text-amber-400">#{status.spotsClaimed + 1} is YOU</span>
              <span>{status.totalSpots}</span>
            </div>
          </div>

          {/* Last Founder */}
          {status.lastFounderNumber > 0 && (
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 inline-block">
              <p className="text-green-400 font-medium">
                🎉 Latest: Founder #{status.lastFounderNumber} just joined the program!
              </p>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds }
          ].map((item, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{item.value.toString().padStart(2, '0')}</div>
              <div className="text-white/70 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
        <p className="text-white/60 text-sm mt-4">Program ends when 200 spots fill OR time runs out</p>
      </UnifiedCard>

      {/* Founder Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {founderTiers.map((tier) => {
          const totalClaimed = status.spotsClaimed;
          const isAvailable = 
            (tier.id === 'elite' && totalClaimed < 25) ||
            (tier.id === 'pioneer' && totalClaimed >= 25 && totalClaimed < 100) ||
            (tier.id === 'charter' && totalClaimed >= 100 && totalClaimed < 200);
          
          const isSoldOut = 
            (tier.id === 'elite' && totalClaimed >= 25) ||
            (tier.id === 'pioneer' && totalClaimed >= 100) ||
            (tier.id === 'charter' && totalClaimed >= 200);

          return (
            <UnifiedCard
              key={tier.id}
              variant="enhanced"
              className={`${tier.className} ${isAvailable ? 'animate-pulse' : ''} relative`}
            >
              {isAvailable && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-bounce">
                    AVAILABLE NOW!
                  </span>
                </div>
              )}
              
              {isSoldOut && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <div className="text-xl font-bold text-white">SOLD OUT</div>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-3xl mb-3">{tier.badge}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-white/80 font-medium mb-2">{tier.range}</p>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-white">{tier.discount}%</div>
                  <div className="text-white/70">LIFETIME discount</div>
                </div>
                <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-3 mb-4">
                  <div className="text-amber-400 font-bold">+{tier.bonusCredits} Credits Monthly</div>
                  <div className="text-white/70 text-sm">For Life</div>
                </div>
                <p className={`font-medium text-sm ${isAvailable ? 'text-green-400' : 'text-white/70'}`}>
                  {tier.urgency}
                </p>
              </div>

              <ul className="space-y-2 mb-8">
                {tier.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-400 mr-2 mt-0.5">✓</span>
                    <span className="text-white/90 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleTierSelection(tier.id)}
                disabled={!isAvailable || !!founderProfile}
                className={`w-full ${
                  founderProfile
                    ? 'bg-green-600 cursor-not-allowed'
                    : isAvailable
                    ? DESIGN_TOKENS.components.button.primary + ' animate-pulse'
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                } font-bold`}
              >
                {founderProfile
                  ? `You're Founder #${founderProfile.founderNumber}!`
                  : isSoldOut
                  ? 'SOLD OUT'
                  : isAvailable
                  ? `Claim ${tier.name} Status`
                  : 'Coming Soon'}
              </button>
            </UnifiedCard>
          );
        })}
      </div>

      {/* Social Proof */}
      <UnifiedCard variant="glass" className="mt-8 text-center">
        <h4 className="text-lg font-bold text-white mb-4">Join These Amazing Founders</h4>
        <div className="flex flex-wrap justify-center gap-4">
          {['👨‍💼 Mark K. - #003', '👩‍🏫 Lisa M. - #007', '🧑‍💻 David R. - #012', '👩‍⚕️ Sarah J. - #018', '👨‍🎨 Alex P. - #024'].map((founder, index) => (
            <div key={index} className="bg-white/10 rounded-full px-3 py-1 text-white/80 text-sm">
              {founder}
            </div>
          ))}
        </div>
        <p className="text-white/60 text-sm mt-4">
          These founders are already saving thousands while building the future of storytelling
        </p>
      </UnifiedCard>
    </div>
  );
};

export default FoundersProgram;