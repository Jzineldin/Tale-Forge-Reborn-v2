import React from 'react';

interface CharacterPreviewProps {
  characterName: string;
  characterTraits: string[];
  genre: string;
}

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  characterName,
  characterTraits,
  genre
}) => {
  if (!characterName && characterTraits.length === 0) return null;

  return (
    <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700">
      <p className="text-gray-300 text-sm">
        {characterName && <span className="text-white font-medium">{characterName}</span>}
        {characterName && characterTraits.length > 0 && ' is '}
        {characterTraits.length > 0 && (
          <span className="text-purple-400">
            {characterTraits.join(', ').toLowerCase()}
          </span>
        )}
        {genre && (
          <>
            {' '}• <span className="text-blue-400">{genre.toLowerCase()} story</span>
          </>
        )}
      </p>
    </div>
  );
};

export default CharacterPreview;