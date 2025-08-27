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
  if (!characterName) return null;

  return (
    <div className="glass-panel p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/20 relative overflow-hidden">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-4 animate-ping">✨</div>
        <div className="absolute top-6 right-8 animate-pulse">⭐</div>
        <div className="absolute bottom-4 left-8 animate-bounce">🌟</div>
        <div className="absolute bottom-2 right-4 animate-ping delay-300">✨</div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl animate-bounce">🎭</span>
          <h4 className="text-xl font-bold text-white">Character Preview</h4>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-gray-200 leading-relaxed text-lg">
              Meet <strong className="text-amber-400 animate-pulse">{characterName}</strong>
              {characterTraits.length > 0 && (
                <>
                  , a{' '}
                  <strong className="text-blue-400">
                    {characterTraits.join(', ').toLowerCase()}
                  </strong>{' '}
                </>
              )}
              {characterTraits.length > 0 ? 'child' : ''} who is about to embark on an amazing{' '}
              <strong className="text-purple-400">{genre.toLowerCase()}</strong> adventure!
            </p>
          </div>
          
          {characterTraits.length === 3 && (
            <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30">
              <span className="text-amber-400 text-lg animate-spin">⚡</span>
              <span className="text-amber-300 font-medium">Character fully powered up!</span>
              <span className="text-amber-400 text-lg animate-spin">⚡</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterPreview;