import React from 'react';
import { User } from 'lucide-react';

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
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Hero's Name
      </label>
      <div className="relative">
        <input
          type="text"
          value={characterName}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter character name..."
          className="w-full px-4 py-3 pl-10 rounded-lg text-white bg-gray-800/80 border border-gray-500 
                     focus:border-amber-400 focus:outline-none transition-colors focus:bg-gray-800
                     placeholder:text-gray-300 disabled:opacity-50"
          maxLength={50}
        />
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
      </div>
    </div>
  );
};

export default CharacterNameInput;