import React from 'react';
import { PasswordStrengthResult } from '@/utils/authSecurity';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrengthResult | null;
  password?: string;
  className?: string;
  showDetails?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  password,
  className = '',
  showDetails = true
}) => {
  if (!strength || !password) {
    return null;
  }

  const getStrengthText = (score: number): string => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Strong';
      default:
        return 'Unknown';
    }
  };

  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0:
        return 'bg-red-500';
      case 1:
        return 'bg-red-400';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-green-400';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStrengthTextColor = (score: number): string => {
    switch (score) {
      case 0:
        return 'text-red-400';
      case 1:
        return 'text-red-300';
      case 2:
        return 'text-yellow-400';
      case 3:
        return 'text-green-400';
      case 4:
        return 'text-green-300';
      default:
        return 'text-gray-400';
    }
  };

  const strengthText = getStrengthText(strength.score);
  const strengthColor = getStrengthColor(strength.score);
  const textColor = getStrengthTextColor(strength.score);

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-white/70 text-sm">Strength:</span>
        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${textColor}`}>
          {strengthText}
        </span>
      </div>

      {showDetails && (
        <>
          {/* Requirements Checklist */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            {[
              { key: 'minLength', label: '8+ characters', met: strength.requirements.minLength },
              { key: 'hasUppercase', label: 'Uppercase (A-Z)', met: strength.requirements.hasUppercase },
              { key: 'hasLowercase', label: 'Lowercase (a-z)', met: strength.requirements.hasLowercase },
              { key: 'hasNumbers', label: 'Numbers (0-9)', met: strength.requirements.hasNumbers },
              { key: 'hasSpecialChars', label: 'Special chars (!@#)', met: strength.requirements.hasSpecialChars }
            ].map((req) => (
              <div key={req.key} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full flex items-center justify-center text-xs ${
                  req.met 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-white/10 text-white/40'
                }`}>
                  {req.met ? '✓' : '○'}
                </div>
                <span className={`text-xs ${
                  req.met ? 'text-green-400' : 'text-white/60'
                }`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          {/* Feedback Messages */}
          {strength.feedback.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-2">
              <p className="text-xs text-white/70 mb-1">Suggestions:</p>
              <ul className="space-y-1">
                {strength.feedback.map((feedback, index) => (
                  <li key={index} className="text-xs text-amber-300 flex items-start">
                    <span className="mr-1">•</span>
                    <span>{feedback}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Security Tips */}
          {strength.score >= 3 && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 mt-2">
              <div className="flex items-center space-x-1">
                <span className="text-green-400 text-xs">✓</span>
                <p className="text-xs text-green-300">
                  {strength.score === 4 
                    ? 'Excellent! Your password is very secure.' 
                    : 'Good password! Your account is well protected.'
                  }
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;