import React, { useState, useEffect } from 'react';
import { User, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { sanitizeCharacterName, logSafetyEvent, SafetyValidationResult } from '@/utils/contentSafety';
import { TypographyLayout } from '@/components/layout';

interface CharacterNameInputProps {
  characterName: string;
  onNameChange: (name: string) => void;
  disabled?: boolean;
}

const CharacterNameInput: React.FC<CharacterNameInputProps> = ({
  characterName,
  onNameChange,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(characterName);
  const [validationResult, setValidationResult] = useState<SafetyValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showSafetyDetails, setShowSafetyDetails] = useState(false);

  // Debounced validation
  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setValidationResult(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      
      try {
        const result = sanitizeCharacterName(inputValue);
        setValidationResult(result);

        // Log safety event for monitoring
        await logSafetyEvent({
          type: result.isValid ? 'validation' : 'block',
          content: inputValue,
          result,
          mode: 'easy'
        });

        // If valid and sanitized, update parent
        if (result.isValid && result.sanitizedContent) {
          onNameChange(result.sanitizedContent);
        }
      } catch (error) {
        console.error('Safety validation error:', error);
        setValidationResult({
          isValid: false,
          issues: ['Unable to validate name safety'],
          severity: 'high',
          action: 'block'
        });
      } finally {
        setIsValidating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [inputValue, onNameChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />;
    }
    
    if (!validationResult) {
      return <User className="w-5 h-5 text-gray-400" />;
    }

    switch (validationResult.action) {
      case 'approve':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'sanitize':
        return <Shield className="w-5 h-5 text-yellow-400" />;
      case 'block':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'manual_review':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getInputBorderColor = () => {
    if (!validationResult) return 'border-white/20 focus:border-purple-400';
    
    switch (validationResult.action) {
      case 'approve':
        return 'border-green-400/50 focus:border-green-400';
      case 'sanitize':
        return 'border-yellow-400/50 focus:border-yellow-400';
      case 'block':
        return 'border-red-400/50 focus:border-red-400';
      case 'manual_review':
        return 'border-orange-400/50 focus:border-orange-400';
      default:
        return 'border-white/20 focus:border-purple-400';
    }
  };

  const getValidationMessage = () => {
    if (!validationResult || validationResult.issues.length === 0) return null;

    const isError = validationResult.action === 'block';
    const isWarning = validationResult.action === 'sanitize' || validationResult.action === 'manual_review';

    return (
      <div className={`mt-3 p-3 rounded-lg border backdrop-blur-sm ${
        isError 
          ? 'bg-red-500/10 border-red-400/30 text-red-200' 
          : isWarning
          ? 'bg-yellow-500/10 border-yellow-400/30 text-yellow-200'
          : 'bg-green-500/10 border-green-400/30 text-green-200'
      }`}>
        <div className="flex items-start gap-2">
          {isError ? (
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          ) : (
            <Shield className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="font-medium text-sm mb-1">
              {isError ? 'Name Not Allowed' : 'Safety Check'}
            </div>
            <ul className="text-sm space-y-1">
              {validationResult.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-xs mt-1">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
            {!isError && validationResult.sanitizedContent && (
              <div className="mt-2 text-xs opacity-75">
                ✨ Auto-corrected to keep your story safe and fun!
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowSafetyDetails(!showSafetyDetails)}
          className="mt-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
        >
          {showSafetyDetails ? 'Hide' : 'Show'} safety details
        </button>
        
        {showSafetyDetails && (
          <div className="mt-2 pt-2 border-t border-current/20 text-xs opacity-75">
            <div>Safety Level: {validationResult.severity}</div>
            <div>Action: {validationResult.action}</div>
            <div>We check all names to make sure they're perfect for children's stories! 🛡️</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <TypographyLayout variant="section" as="h3" className="mb-2 text-2xl font-bold text-white">
          👦 What's Your Hero's Name? 👧
        </TypographyLayout>
        <TypographyLayout variant="body" className="text-gray-300">
          Give your main character a special name that will make the story uniquely theirs
        </TypographyLayout>
      </div>

      {/* Name Input */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled || isValidating}
            placeholder="Enter your hero's name..."
            className={`
              w-full px-4 py-4 pl-12 pr-16 rounded-2xl text-lg font-medium text-white
              bg-white/10 backdrop-blur-sm border-2 transition-all duration-300
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50
              disabled:opacity-50 disabled:cursor-not-allowed
              ${getInputBorderColor()}
            `}
            maxLength={50}
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
          
          {/* Character counter */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {inputValue.length}/50
          </div>
        </div>

        {/* Validation message */}
        {getValidationMessage()}

        {/* Safety badge */}
        {validationResult?.action === 'approve' && (
          <div className="mt-3 flex items-center justify-center gap-2 text-green-300 text-sm">
            <Shield className="w-4 h-4" />
            <span>✅ Safe and ready for adventure!</span>
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="text-center text-sm text-gray-400 max-w-lg mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium">Safety First!</span>
          </div>
          <div className="text-xs space-y-1">
            <div>• We automatically check all names for child safety</div>
            <div>• Special characters are cleaned up automatically</div>
            <div>• Your story will be perfectly personalized and safe</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterNameInput;