import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import FounderBadge from '@/components/atoms/FounderBadge';

interface FounderProgramStatus {
  elite_founders_count: number;
  elite_founders_limit: number;
  elite_program_active: boolean;
  elite_spots_remaining: number;
  pioneer_founders_count: number;
  pioneer_founders_limit: number;
  pioneer_program_active: boolean;
  pioneer_spots_remaining: number;
  any_program_active: boolean;
  total_founders_count: number;
}

interface FounderProgramBannerProps {
  className?: string;
}

const FounderProgramBanner: React.FC<FounderProgramBannerProps> = ({
  className = ''
}) => {
  const [founderStatus, setFounderStatus] = useState<FounderProgramStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFounderProgramStatus();
  }, []);

  const fetchFounderProgramStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_founder_program_status');
      
      if (error) {
        console.error('Error fetching founder program status:', error);
        return;
      }

      if (data && data.length > 0) {
        setFounderStatus(data[0]);
      }
    } catch (error) {
      console.error('Error fetching founder program status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !founderStatus || !founderStatus.any_program_active) {
    return null;
  }

  return (
    <div className={`
      bg-gradient-to-r from-slate-900/90 to-slate-800/90 
      backdrop-blur-sm rounded-xl p-6 
      border border-amber-400/30 
      shadow-xl shadow-amber-500/10
      ${className}
    `}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🔥 Limited Time: Founder Program
        </h2>
        <p className="text-amber-300 text-lg">
          Subscribe now and become a founder with lifetime benefits!
        </p>
      </div>

      {/* Tier Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pioneer Founders (Premium) */}
        {founderStatus.pioneer_program_active && (
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg p-4 border border-amber-400/30">
            <div className="flex items-center justify-between mb-3">
              <FounderBadge tier="pioneer" size="small" />
              <span className="text-amber-400 font-bold">
                {founderStatus.pioneer_spots_remaining} spots left
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium">Premium Subscribers Get:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Pioneer Founder Badge</li>
                <li>• 60% lifetime discount on credits</li>
                <li>• Exclusive founder leaderboard</li>
                <li>• Priority support access</li>
              </ul>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Pioneer Founders</span>
                  <span>{founderStatus.pioneer_founders_count}/{founderStatus.pioneer_founders_limit}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(founderStatus.pioneer_founders_count / founderStatus.pioneer_founders_limit) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Elite Founders (Starter) */}
        {founderStatus.elite_program_active && (
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-400/30">
            <div className="flex items-center justify-between mb-3">
              <FounderBadge tier="elite" size="small" />
              <span className="text-blue-400 font-bold">
                {founderStatus.elite_spots_remaining} spots left
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-white font-medium">Starter Subscribers Get:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Elite Founder Badge</li>
                <li>• 50% lifetime discount on credits</li>
                <li>• Exclusive founder leaderboard</li>
                <li>• Early access to features</li>
              </ul>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Elite Founders</span>
                  <span>{founderStatus.elite_founders_count}/{founderStatus.elite_founders_limit}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(founderStatus.elite_founders_count / founderStatus.elite_founders_limit) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-6 pt-4 border-t border-gray-700">
        <p className="text-gray-300 text-sm">
          ⏰ Limited spots available • Founder status granted immediately upon subscription
        </p>
        <p className="text-amber-400 text-xs mt-1">
          Total Founders: {founderStatus.total_founders_count}/200 • Once it's gone, it's gone forever!
        </p>
      </div>
    </div>
  );
};

export default FounderProgramBanner;