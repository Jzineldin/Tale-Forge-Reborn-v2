import React from 'react';
import { Star } from 'lucide-react';

interface TraitSelectorProps {
  characterName: string;
  characterTraits: string[];
  onTraitsChange: (traits: string[]) => void;
  disabled?: boolean;
}

const AVAILABLE_TRAITS = [
  { name: 'Brave', emoji: '🦁' },
  { name: 'Kind', emoji: '💖' },
  { name: 'Curious', emoji: '🔍' },
  { name: 'Smart', emoji: '🧠' },
  { name: 'Funny', emoji: '😄' },
  { name: 'Creative', emoji: '🎨' },
  { name: 'Adventurous', emoji: '🗺️' },
  { name: 'Gentle', emoji: '🌸' },
];

const TraitSelector: React.FC<TraitSelectorProps> = ({
  characterName,
  characterTraits,
  onTraitsChange,
  disabled = false
}) => {
  const toggleTrait = (trait: string) => {
    if (characterTraits.includes(trait)) {
      onTraitsChange(characterTraits.filter(t => t !== trait));
    } else if (characterTraits.length < 3) {
      onTraitsChange([...characterTraits, trait]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Character Traits (Choose up to 3)
      </label>
      <div className="grid grid-cols-4 gap-2">
        {AVAILABLE_TRAITS.map((trait) => (
          <button
            key={trait.name}
            onClick={() => toggleTrait(trait.name)}
            disabled={disabled || (!characterTraits.includes(trait.name) && characterTraits.length >= 3)}
            className={`
              p-2 rounded-lg border text-sm transition-all
              ${characterTraits.includes(trait.name)
                ? 'border-amber-400 bg-amber-500/30 text-white shadow-lg shadow-amber-500/20'
                : 'border-gray-500 hover:border-gray-400 text-white bg-gray-800/80 hover:bg-gray-700/80'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <span className="text-lg">{trait.emoji}</span>
            <div className="text-xs">{trait.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TraitSelector;