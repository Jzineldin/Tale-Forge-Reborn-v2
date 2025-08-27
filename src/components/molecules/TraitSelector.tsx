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

  const getTraitButtonClass = (traitName: string) => {
    const isSelected = selectedTraits.includes(traitName);
    const baseClass = `
      group relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300
      cursor-pointer hover:scale-105 transform backdrop-blur-sm
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    if (isSelected) {
      return baseClass + ` 
        bg-gradient-to-r from-purple-500/20 to-pink-500/20 
        border-purple-400/60 shadow-lg shadow-purple-500/20
        hover:shadow-xl hover:shadow-purple-500/30
      `;
    }

    return baseClass + `
      bg-white/10 border-white/20 hover:border-white/40 
      hover:bg-white/15
    `;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <TypographyLayout variant="section" as="h3" className="mb-2 text-2xl font-bold text-white">
          ⭐ Choose {characterName ? `${characterName}'s` : 'Your Hero\'s'} Special Traits ⭐
        </TypographyLayout>
        <TypographyLayout variant="body" className="text-gray-300 mb-4">
          Pick up to {MAX_TRAITS} amazing qualities that make your character unique and special
        </TypographyLayout>
        
        {/* Selection counter */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${
          selectedTraits.length === MAX_TRAITS 
            ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
            : selectedTraits.length > 0
            ? 'bg-purple-500/20 border-purple-400/50 text-purple-200'
            : 'bg-white/10 border-white/20 text-gray-300'
        }`}>
          <Star className="w-4 h-4" />
          <span className="font-medium">
            {selectedTraits.length}/{MAX_TRAITS} traits selected
          </span>
          {selectedTraits.length === MAX_TRAITS && (
            <span className="text-xs">(limit reached)</span>
          )}
        </div>
      </div>

      {/* Trait Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {APPROVED_TRAITS.map((trait) => {
          const isSelected = selectedTraits.includes(trait.name);
          const canSelect = selectedTraits.length < MAX_TRAITS || isSelected;
          
          return (
            <button
              key={trait.name}
              onClick={() => handleTraitToggle(trait.name)}
              disabled={disabled || (!canSelect && !isSelected)}
              className={getTraitButtonClass(trait.name)}
              title={trait.description}
            >
              {/* Selection indicator */}
              <div className={`
                absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 
                flex items-center justify-center transition-all duration-300
                ${isSelected 
                  ? 'bg-purple-500 border-purple-300 scale-100' 
                  : 'bg-transparent border-transparent scale-0'
                }
              `}>
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              
              {/* Trait content */}
              <div className="text-3xl">{trait.emoji}</div>
              <div className="flex-1 text-left">
                <div className={`font-semibold transition-colors ${
                  isSelected ? 'text-purple-200' : 'text-white'
                }`}>
                  {trait.name}
                </div>
                <div className={`text-sm transition-colors ${
                  isSelected ? 'text-purple-300' : 'text-gray-300'
                }`}>
                  {trait.description}
                </div>
              </div>
              
              {/* Hover effect */}
              {!isSelected && canSelect && !disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Validation message */}
      {getValidationMessage()}

      {/* Selected traits preview */}
      {selectedTraits.length > 0 && validationResult?.isValid && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-400/30 backdrop-blur-sm">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <TypographyLayout variant="body" className="font-semibold text-green-300">
                Perfect Traits Selected! ✨
              </TypographyLayout>
            </div>
            <TypographyLayout variant="body" className="text-purple-200">
              {characterName ? `${characterName} will be` : 'Your hero will be'}:
            </TypographyLayout>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedTraits.map((trait, index) => {
              const traitData = APPROVED_TRAITS.find(t => t.name === trait);
              return (
                <div key={trait} className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full backdrop-blur-sm">
                  <span className="text-lg">{traitData?.emoji}</span>
                  <span className="font-medium text-white">{trait}</span>
                  {index < selectedTraits.length - 1 && (
                    <span className="text-purple-300 ml-1">+</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safety notice */}
      <div className="text-center text-sm text-gray-400">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 max-w-md mx-auto">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-medium">Child-Safe Traits</span>
          </div>
          <div className="text-xs">
            All traits are carefully selected to promote positive values and character development in children's stories.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraitSelector;