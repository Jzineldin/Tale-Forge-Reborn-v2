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
    <div className="p-4 rounded-lg bg-gray-800/80 border border-gray-500">
      <p className="text-white text-sm">
        {characterName && <span className="text-white font-medium">{characterName}</span>}
        {characterName && characterTraits.length > 0 && ' is '}
        {characterTraits.length > 0 && (
          <span className="text-purple-300 font-medium">
            {characterTraits.join(', ').toLowerCase()}
          </span>
        )}
        {genre && (
          <>
            {' '}• <span className="text-blue-300 font-medium">{genre.toLowerCase()} story</span>
          </>
        )}
      </p>
    </div>
  );
};

export default CharacterPreview;