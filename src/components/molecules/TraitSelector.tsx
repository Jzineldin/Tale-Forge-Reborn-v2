import React, { useState, useEffect } from 'react';
import { Star, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { validateCharacterTraits, logSafetyEvent, SafetyValidationResult } from '@/utils/contentSafety';
import { TypographyLayout } from '@/components/layout';

interface TraitSelectorProps {
  characterName: string;
  characterTraits: string[];
  onTraitsChange: (traits: string[]) => void;
  disabled?: boolean;
}

// Safe, pre-approved traits for children's stories
const APPROVED_TRAITS = [
  { name: 'Brave', emoji: '🦁', description: 'Faces challenges with courage' },
  { name: 'Kind', emoji: '💖', description: 'Always helps others' },
  { name: 'Curious', emoji: '🔍', description: 'Loves to explore and learn' },
  { name: 'Smart', emoji: '🧠', description: 'Great at solving problems' },
  { name: 'Funny', emoji: '😄', description: 'Makes everyone laugh' },
  { name: 'Creative', emoji: '🎨', description: 'Full of amazing ideas' },
  { name: 'Adventurous', emoji: '🗺️', description: 'Ready for any quest' },
  { name: 'Gentle', emoji: '🌸', description: 'Caring and thoughtful' },
  { name: 'Clever', emoji: '💡', description: 'Quick thinking and smart' },
  { name: 'Caring', emoji: '🤗', description: 'Looks after friends and family' },
  { name: 'Bold', emoji: '⚡', description: 'Not afraid to try new things' },
  { name: 'Imaginative', emoji: '🌟', description: 'Dreams up wonderful stories' },
  { name: 'Loyal', emoji: '🐕', description: 'A true and faithful friend' },
  { name: 'Cheerful', emoji: '☀️', description: 'Spreads happiness everywhere' },
  { name: 'Patient', emoji: '🧘', description: 'Good at waiting and thinking' },
  { name: 'Helpful', emoji: '🤝', description: 'Always ready to lend a hand' }
];

const MAX_TRAITS = 5;

const TraitSelector: React.FC<TraitSelectorProps> = ({
  characterName,
  characterTraits,
  onTraitsChange,
  disabled = false
}) => {
  const [validationResult, setValidationResult] = useState<SafetyValidationResult | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<string[]>(characterTraits);

  // Validate traits whenever they change
  useEffect(() => {
    if (selectedTraits.length === 0) {
      setValidationResult(null);
      return;
    }

    const validateTraits = async () => {
      try {
        const result = validateCharacterTraits(selectedTraits);
        setValidationResult(result);

        // Log safety event for monitoring
        await logSafetyEvent({
          type: result.isValid ? 'validation' : 'block',
          content: selectedTraits.join(', '),
          result,
          mode: 'easy'
        });

        // Update parent if valid
        if (result.isValid) {
          onTraitsChange(selectedTraits);
        }
      } catch (error) {
        console.error('Trait validation error:', error);
        setValidationResult({
          isValid: false,
          issues: ['Unable to validate trait safety'],
          severity: 'high',
          action: 'block'
        });
      }
    };

    validateTraits();
  }, [selectedTraits, onTraitsChange]);

  const handleTraitToggle = (traitName: string) => {
    if (disabled) return;

    const isSelected = selectedTraits.includes(traitName);
    
    if (isSelected) {
      // Remove trait
      const newTraits = selectedTraits.filter(trait => trait !== traitName);
      setSelectedTraits(newTraits);
    } else {
      // Add trait (if under limit)
      if (selectedTraits.length < MAX_TRAITS) {
        const newTraits = [...selectedTraits, traitName];
        setSelectedTraits(newTraits);
      }
    }
  };


  const getValidationMessage = () => {
    if (!validationResult || validationResult.issues.length === 0) return null;

    const isError = validationResult.action === 'block';
    const isWarning = validationResult.action === 'sanitize';

    return (
      <div className={`mt-4 p-4 rounded-lg border backdrop-blur-sm ${
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
              {isError ? 'Too Many Traits Selected' : 'Traits Updated'}
            </div>
            <ul className="text-sm space-y-1">
              {validationResult.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-xs mt-1">•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Simplified Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Character Traits
        </h3>
        <p className="text-gray-400 text-sm">
          Pick up to {MAX_TRAITS} traits • {selectedTraits.length} selected
        </p>
      </div>

      {/* Simplified Trait Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-3xl mx-auto">
        {APPROVED_TRAITS.map((trait) => {
          const isSelected = selectedTraits.includes(trait.name);
          const canSelect = selectedTraits.length < MAX_TRAITS || isSelected;
          
          return (
            <button
              key={trait.name}
              onClick={() => handleTraitToggle(trait.name)}
              disabled={disabled || (!canSelect && !isSelected)}
              className={`
                p-3 rounded-lg border transition-all duration-200 text-left
                ${isSelected 
                  ? 'bg-purple-600/30 border-purple-500' 
                  : canSelect
                  ? 'bg-gray-900/40 border-gray-700 hover:border-gray-600'
                  : 'bg-gray-900/20 border-gray-800 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{trait.emoji}</span>
                <span className={`text-sm font-medium ${
                  isSelected ? 'text-white' : 'text-gray-300'
                }`}>
                  {trait.name}
                  {isSelected && <span className="ml-1 text-purple-400">✓</span>}
                </span>
              </div>
            </button>
          );
        })}
      </div>


      {/* Simple Selected traits display */}
      {selectedTraits.length > 0 && (
        <div className="text-center">
          <div className="inline-flex flex-wrap gap-2 justify-center">
            {selectedTraits.map((trait) => {
              const traitData = APPROVED_TRAITS.find(t => t.name === trait);
              return (
                <span key={trait} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">
                  {traitData?.emoji} {trait}
                </span>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default TraitSelector;