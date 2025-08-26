import React, { useState } from 'react';
import Icon from '@/components/atoms/Icon';
import { useUserCharacters, useSaveCharacter, useDeleteCharacter } from '@/utils/characterHooks';
import { UserCharacter } from '@shared/types';

interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
}

interface Step2CharacterCreationProps {
  storyData: any;
  handleInputChange: (field: string, value: string | number | Character[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Step2CharacterCreation: React.FC<Step2CharacterCreationProps> = ({
  storyData,
  handleInputChange,
  onNext,
  onPrevious
}) => {
  const [characters, setCharacters] = useState<Character[]>(storyData.characters || []);
  const [newCharacter, setNewCharacter] = useState<Character>({
    id: '',
    name: '',
    description: '',
    role: '',
    traits: []
  });
  const [traitInput, setTraitInput] = useState('');
  const [showSavedCharacters, setShowSavedCharacters] = useState(false);
  const [saveCharacterToLibrary, setSaveCharacterToLibrary] = useState(false);

  // Character hooks
  const { data: savedCharacters, isLoading: loadingSavedCharacters } = useUserCharacters();
  const saveCharacterMutation = useSaveCharacter();
  const deleteCharacterMutation = useDeleteCharacter();

  const addCharacter = async () => {
    if (newCharacter.name && newCharacter.role) {
      const characterToAdd = {
        ...newCharacter,
        id: Date.now().toString()
      };
      
      // Add to current story characters
      setCharacters([...characters, characterToAdd]);
      
      // Optionally save to user's character library
      if (saveCharacterToLibrary) {
        try {
          await saveCharacterMutation.mutateAsync({
            name: newCharacter.name,
            description: newCharacter.description,
            role: newCharacter.role,
            traits: newCharacter.traits
          });
          console.log('✅ Character saved to library!');
        } catch (error) {
          console.error('❌ Failed to save character to library:', error);
        }
      }
      
      // Reset form
      setNewCharacter({
        id: '',
        name: '',
        description: '',
        role: '',
        traits: []
      });
      setSaveCharacterToLibrary(false);
    }
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const addTrait = () => {
    if (traitInput.trim() && !newCharacter.traits.includes(traitInput.trim())) {
      setNewCharacter({
        ...newCharacter,
        traits: [...newCharacter.traits, traitInput.trim()]
      });
      setTraitInput('');
    }
  };

  const removeTrait = (trait: string) => {
    setNewCharacter({
      ...newCharacter,
      traits: newCharacter.traits.filter(t => t !== trait)
    });
  };

  const addSavedCharacterToStory = (savedCharacter: UserCharacter) => {
    const characterToAdd = {
      id: Date.now().toString(),
      name: savedCharacter.name,
      description: savedCharacter.description,
      role: savedCharacter.role,
      traits: savedCharacter.traits
    };
    setCharacters([...characters, characterToAdd]);
  };

  const deleteSavedCharacter = async (characterId: string) => {
    try {
      await deleteCharacterMutation.mutateAsync(characterId);
      console.log('✅ Character deleted from library!');
    } catch (error) {
      console.error('❌ Failed to delete character:', error);
    }
  };

  const handleSave = () => {
    handleInputChange('characters', characters);
    onNext();
  };

  // Predefined character roles with emojis
  const characterRoles = [
    { id: 'hero', label: 'Hero', emoji: '🦸‍♀️', description: 'The brave main character' },
    { id: 'sidekick', label: 'Best Friend', emoji: '👫', description: 'Loyal companion who helps' },
    { id: 'mentor', label: 'Wise Guide', emoji: '🧙‍♂️', description: 'Someone who gives advice' },
    { id: 'villain', label: 'Challenge', emoji: '🐉', description: 'Obstacle to overcome' },
    { id: 'helper', label: 'Magical Helper', emoji: '🧚‍♀️', description: 'Provides special abilities' },
    { id: 'comic-relief', label: 'Funny Character', emoji: '🤡', description: 'Brings humor to the story' },
  ];

  // Predefined traits
  const availableTraits = [
    'Brave', 'Kind', 'Curious', 'Clever', 'Funny', 'Loyal', 'Creative', 'Adventurous',
    'Helpful', 'Gentle', 'Strong', 'Wise', 'Playful', 'Caring', 'Determined', 'Cheerful'
  ];

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="title-section mb-3">
          👥 Create Characters
        </h2>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Bring your story to life with memorable characters who will go on this magical adventure
        </p>
      </div>
      
      {/* Character Creation Form */}
      <div className="glass-card">
        <h3 className="title-card text-center mb-6">
          ✨ Create a New Character
        </h3>
        
        {/* Character Name */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">
            🎭 Character Name
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="What's your character's name? (e.g., Brave Luna, Captain Sparkle)"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
              className="input-primary w-full pl-12"
            />
            <Icon name="user" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
          </div>
        </div>

        {/* Character Role Selection */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">
            ⭐ Character Role
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {characterRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`genre-card ${
                  newCharacter.role === role.label
                    ? 'selected'
                    : ''
                }`}
                onClick={() => setNewCharacter({...newCharacter, role: role.label})}
              >
                <div className="text-2xl mb-2">{role.emoji}</div>
                <div className={`font-semibold text-sm ${
                  newCharacter.role === role.label ? 'text-primary' : 'text-white'
                }`}>
                  {role.label}
                </div>
                <div className="text-xs text-muted mt-1">
                  {role.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Character Description */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">
            📝 Character Description (Optional)
          </label>
          <textarea
            placeholder="Describe what your character looks like and their personality..."
            value={newCharacter.description}
            onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
            rows={3}
            className="input-primary w-full resize-none"
          />
        </div>
        
        {/* Character Traits */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3">
            🌟 Character Traits
          </label>
          
          {/* Quick Select Traits */}
          <div className="mb-4">
            <p className="text-muted text-sm mb-3">Click to add traits:</p>
            <div className="flex flex-wrap gap-2">
              {availableTraits.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  className={`badge badge-sm ${
                    newCharacter.traits.includes(trait)
                      ? 'badge-primary'
                      : 'badge-ghost'
                  }`}
                  onClick={() => {
                    if (newCharacter.traits.includes(trait)) {
                      removeTrait(trait);
                    } else {
                      setNewCharacter({
                        ...newCharacter,
                        traits: [...newCharacter.traits, trait]
                      });
                    }
                  }}
                  disabled={newCharacter.traits.length >= 6 && !newCharacter.traits.includes(trait)}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Trait Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Add your own trait..."
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                className="input-primary w-full pl-10"
                onKeyPress={(e) => e.key === 'Enter' && addTrait()}
              />
              <Icon name="star" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={addTrait}
              disabled={!traitInput.trim()}
            >
              Add
            </button>
          </div>

          {/* Selected Traits */}
          {newCharacter.traits.length > 0 && (
            <div className="mt-4">
              <p className="text-muted text-sm mb-2">Selected traits:</p>
              <div className="flex flex-wrap gap-2">
                {newCharacter.traits.map((trait, index) => (
                  <span 
                    key={index} 
                    className="badge badge-primary"
                  >
                    {trait}
                    <button
                      type="button"
                      className="ml-2 hover:text-primary transition-colors"
                      onClick={() => removeTrait(trait)}
                      aria-label={`Remove trait ${trait}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Save to Library Option */}
        {(newCharacter.name && newCharacter.role) && (
          <div className="mb-4 text-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={saveCharacterToLibrary}
                onChange={(e) => setSaveCharacterToLibrary(e.target.checked)}
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                saveCharacterToLibrary ? 'bg-amber-500' : 'bg-white/30'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  saveCharacterToLibrary ? 'translate-x-5' : ''
                }`}></div>
              </div>
              <span className="ml-3 text-white text-sm">💾 Save to my character library for future stories</span>
            </label>
          </div>
        )}

        {/* Add Character Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={addCharacter}
            disabled={!newCharacter.name || !newCharacter.role}
            className={`btn ${
              (newCharacter.name && newCharacter.role)
                ? 'btn-success'
                : 'btn-ghost opacity-50 cursor-not-allowed'
            }`}
          >
            {(newCharacter.name && newCharacter.role) 
              ? '✨ Add Character to Story' 
              : 'Enter Name & Role to Add Character'
            }
          </button>
        </div>
      </div>

      {/* Saved Characters Library */}
      {savedCharacters && savedCharacters.length > 0 && (
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="title-card">
              📚 Your Character Library ({savedCharacters.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowSavedCharacters(!showSavedCharacters)}
              className="text-primary hover:text-amber-300 transition-colors"
            >
              {showSavedCharacters ? 'Hide' : 'Show'} Saved Characters
            </button>
          </div>
          
          {showSavedCharacters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedCharacters.map((savedChar) => (
                <div 
                  key={savedChar.id} 
                  className="glass-card hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        {savedChar.name}
                      </h4>
                      <div className="text-accent font-semibold text-sm">
                        {characterRoles.find(r => r.label === savedChar.role)?.emoji} {savedChar.role}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="btn-icon-sm text-success bg-green-500/20 hover:bg-green-500/30"
                        onClick={() => addSavedCharacterToStory(savedChar)}
                        title="Add to story"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn-icon-sm text-danger bg-red-500/20 hover:bg-red-500/30"
                        onClick={() => deleteSavedCharacter(savedChar.id)}
                        title="Delete from library"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  {savedChar.description && (
                    <div className="mb-3">
                      <p className="text-body text-sm">
                        {savedChar.description}
                      </p>
                    </div>
                  )}
                  
                  {savedChar.traits.length > 0 && (
                    <div>
                      <p className="text-muted text-xs mb-2">Traits:</p>
                      <div className="flex flex-wrap gap-1">
                        {savedChar.traits.map((trait: string, index: number) => (
                          <span 
                            key={index} 
                            className="badge badge-sm badge-accent"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {loadingSavedCharacters && (
            <div className="text-center py-4">
              <div className="text-muted">Loading your character library...</div>
            </div>
          )}
        </div>
      )}
      
      {/* Character List */}
      {characters.length > 0 && (
        <div>
          <h3 className="title-card text-center mb-6">
            🎭 Your Story Characters ({characters.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((character) => (
              <div 
                key={character.id} 
                className="glass-card backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">
                      {character.name}
                    </h4>
                    <div className="text-primary font-semibold text-sm">
                      {characterRoles.find(r => r.label === character.role)?.emoji} {character.role}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-red-400 hover:text-red-300 transition-colors bg-red-500/20 hover:bg-red-500/30 rounded-full w-8 h-8 flex items-center justify-center"
                    onClick={() => removeCharacter(character.id)}
                    aria-label={`Remove character ${character.name}`}
                  >
                    ×
                  </button>
                </div>
                
                {character.description && (
                  <div className="mb-4">
                    <p className="text-white/80 text-sm">
                      {character.description}
                    </p>
                  </div>
                )}
                
                {character.traits.length > 0 && (
                  <div>
                    <p className="text-white/70 text-xs mb-2">Traits:</p>
                    <div className="flex flex-wrap gap-2">
                      {character.traits.map((trait, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-400/30"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {characters.length === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="title-card mb-2">No Characters Yet</h3>
          <p className="text-muted">Create your first character above to bring your story to life!</p>
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex justify-between pt-8">
        <button 
          onClick={onPrevious}
          className="btn btn-secondary"
        >
          ← Back: Story Concept
        </button>
        <button 
          onClick={handleSave}
          className="btn btn-primary"
        >
          Next: Story Setting →
        </button>
      </div>

      {/* Progress Tip */}
      <div className="text-center mt-4">
        <p className="text-muted text-sm">
          💡 You can continue without adding characters - we'll create some for you!
        </p>
      </div>
    </div>
  );
};

export default Step2CharacterCreation;