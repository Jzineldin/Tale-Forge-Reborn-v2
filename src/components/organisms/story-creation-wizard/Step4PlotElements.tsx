import React from 'react';
import Icon from '@/components/atoms/Icon';

interface Step4PlotElementsProps {
  storyData: any;
  handleInputChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Step4PlotElements: React.FC<Step4PlotElementsProps> = ({
  storyData,
  handleInputChange,
  onNext,
  onPrevious
}) => {
  // Conflict presets for children's stories
  const conflictPresets = [
    { 
      id: 'lost-treasure', 
      name: 'Lost Treasure Hunt', 
      emoji: '🗺️', 
      description: 'Finding something precious that went missing',
      color: 'bg-amber-500'
    },
    { 
      id: 'rescue-mission', 
      name: 'Rescue Adventure', 
      emoji: '🦸', 
      description: 'Helping someone in trouble or danger',
      color: 'bg-red-500'
    },
    { 
      id: 'overcoming-fear', 
      name: 'Overcoming Fears', 
      emoji: '💪', 
      description: 'Being brave and facing what scares you',
      color: 'bg-purple-500'
    },
    { 
      id: 'making-friends', 
      name: 'Making New Friends', 
      emoji: '🤝', 
      description: 'Building friendships and learning to get along',
      color: 'bg-pink-500'
    },
    { 
      id: 'solving-mystery', 
      name: 'Mystery to Solve', 
      emoji: '🔍', 
      description: 'Uncovering clues and solving puzzles',
      color: 'bg-indigo-500'
    },
    { 
      id: 'learning-lesson', 
      name: 'Important Life Lesson', 
      emoji: '📚', 
      description: 'Discovering something important about life',
      color: 'bg-green-500'
    },
    { 
      id: 'magical-challenge', 
      name: 'Magical Challenge', 
      emoji: '✨', 
      description: 'Using magic to overcome obstacles',
      color: 'bg-violet-500'
    },
    { 
      id: 'environmental', 
      name: 'Protecting Nature', 
      emoji: '🌱', 
      description: 'Helping animals and caring for the environment',
      color: 'bg-emerald-500'
    }
  ];

  // Quest/Goal presets
  const questPresets = [
    { 
      id: 'find-home', 
      name: 'Finding Home', 
      emoji: '🏠', 
      description: 'Getting back to where you belong'
    },
    { 
      id: 'save-world', 
      name: 'Save the Day', 
      emoji: '🌍', 
      description: 'Preventing something bad from happening'
    },
    { 
      id: 'learn-skill', 
      name: 'Master a Skill', 
      emoji: '🎯', 
      description: 'Learning something new and important'
    },
    { 
      id: 'help-others', 
      name: 'Help Others', 
      emoji: '💖', 
      description: 'Making life better for friends or family'
    },
    { 
      id: 'discover-truth', 
      name: 'Discover Truth', 
      emoji: '🔮', 
      description: 'Finding out what really happened'
    },
    { 
      id: 'complete-quest', 
      name: 'Complete a Quest', 
      emoji: '⚔️', 
      description: 'Finishing an important mission or journey'
    },
    { 
      id: 'make-peace', 
      name: 'Make Peace', 
      emoji: '🕊️', 
      description: 'Helping enemies become friends'
    },
    { 
      id: 'find-courage', 
      name: 'Find Inner Courage', 
      emoji: '🦁', 
      description: 'Discovering bravery you didn\'t know you had'
    }
  ];

  // Moral lesson presets
  const moralLessons = [
    { id: 'friendship', name: 'Friendship is important', emoji: '👫' },
    { id: 'honesty', name: 'Honesty is the best policy', emoji: '💎' },
    { id: 'perseverance', name: 'Never give up on your dreams', emoji: '🌟' },
    { id: 'kindness', name: 'Kindness makes the world better', emoji: '💝' },
    { id: 'courage', name: 'Being brave helps others', emoji: '🦸' },
    { id: 'teamwork', name: 'Working together achieves more', emoji: '🤝' },
    { id: 'acceptance', name: 'Everyone is special in their own way', emoji: '🌈' },
    { id: 'responsibility', name: 'Taking care of others matters', emoji: '🛡️' }
  ];

  const isValid = storyData.conflict && storyData.quest;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <h2 className="title-section mb-3">
          ⚔️ Plot Elements
        </h2>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Choose the exciting challenges and goals that will drive your story forward
        </p>
      </div>

      {/* Central Conflict Selection */}
      <div className="glass-card">
        <h3 className="title-card text-center mb-6">
          ⚡ Choose Main Conflict
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {conflictPresets.map((conflict) => (
            <button
              key={conflict.id}
              type="button"
              className={`genre-card ${
                storyData.conflict === conflict.name
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleInputChange('conflict', conflict.name)}
            >
              <div className={`${conflict.color} w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-3`}>
                {conflict.emoji}
              </div>
              <h4 className={`font-semibold text-sm mb-2 ${
                storyData.conflict === conflict.name ? 'text-primary' : 'text-white'
              }`}>
                {conflict.name}
              </h4>
              <p className="text-xs text-muted">
                {conflict.description}
              </p>
            </button>
          ))}
        </div>

        {/* Custom Conflict Input */}
        <div className="border-t border-white/20 pt-6">
          <label className="block text-white font-semibold mb-3">
            🎨 Or Describe Your Own Conflict
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Describe the main challenge or problem in your story"
              value={storyData.conflict && !conflictPresets.find(c => c.name === storyData.conflict) ? storyData.conflict : ''}
              onChange={(e) => handleInputChange('conflict', e.target.value)}
              className="input-primary w-full pl-12"
            />
            <Icon name="search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
          </div>
        </div>
      </div>

      {/* Quest/Goal Selection */}
      <div className="glass-card">
        <h3 className="title-card text-center mb-6">
          🎯 Choose Quest/Goal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {questPresets.map((quest) => (
            <button
              key={quest.id}
              type="button"
              className={`genre-card ${
                storyData.quest === quest.name
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleInputChange('quest', quest.name)}
            >
              <div className="text-3xl mb-2">{quest.emoji}</div>
              <h4 className={`font-semibold text-sm mb-2 ${
                storyData.quest === quest.name ? 'text-primary' : 'text-white'
              }`}>
                {quest.name}
              </h4>
              <p className="text-xs text-muted">
                {quest.description}
              </p>
            </button>
          ))}
        </div>

        {/* Custom Quest Input */}
        <div className="border-t border-white/20 pt-6">
          <label className="block text-white font-semibold mb-3">
            🎨 Or Describe Your Own Quest
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Describe the main goal or objective of your story"
              value={storyData.quest && !questPresets.find(q => q.name === storyData.quest) ? storyData.quest : ''}
              onChange={(e) => handleInputChange('quest', e.target.value)}
              className="input-primary w-full pl-12"
            />
            <Icon name="search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
          </div>
        </div>
      </div>

      {/* Moral Lesson Selection */}
      <div className="glass-card" data-testid="lesson-select">
        <h3 className="title-card text-center mb-6">
          💡 Moral Lesson (Optional)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {moralLessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className={`genre-card ${
                storyData.moralLesson === lesson.name
                  ? 'selected'
                  : ''
              }`}
              onClick={() => handleInputChange('moralLesson', lesson.name)}
            >
              <div className="text-2xl mb-2">{lesson.emoji}</div>
              <h4 className={`font-semibold text-xs ${
                storyData.moralLesson === lesson.name ? 'text-primary' : 'text-white'
              }`}>
                {lesson.name}
              </h4>
            </button>
          ))}
        </div>

        {/* Custom Moral Lesson Input */}
        <div className="border-t border-white/20 pt-6">
          <label className="block text-white font-semibold mb-3">
            📝 Custom Moral Lesson
          </label>
          <textarea
            placeholder="What important lesson should readers learn? (e.g., helping others makes you happy)"
            value={storyData.moralLesson && !moralLessons.find(l => l.name === storyData.moralLesson) ? storyData.moralLesson : ''}
            onChange={(e) => handleInputChange('moralLesson', e.target.value)}
            rows={3}
            className="input-primary w-full resize-none"
          />
        </div>
      </div>

      {/* Additional Story Elements */}
      <div className="glass-card">
        <label className="block text-white font-semibold mb-3">
          ✨ Additional Story Elements (Optional)
        </label>
        <textarea
          placeholder="Add magical objects, special powers, unique creatures, or other creative elements that make your story special"
          value={storyData.additionalDetails}
          onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
          rows={4}
          className="glass-input w-full p-4 text-lg rounded-xl resize-none"
        />
        <p className="text-sm text-muted mt-2">
          These extra details help create a more unique and engaging story world
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button 
          onClick={onPrevious}
          className="btn btn-secondary"
        >
          ← Back: Story Setting
        </button>
        <button 
          onClick={onNext}
          disabled={!isValid}
          className={`btn ${
            isValid
              ? 'btn-primary'
              : 'btn-ghost opacity-50 cursor-not-allowed'
          }`}
        >
          Next: Review & Generate →
        </button>
      </div>

      {/* Validation Helper */}
      {(!storyData.conflict || !storyData.quest) && (
        <div className="text-center">
          <p className="text-primary text-sm">
            Please choose a conflict and quest to continue ⚔️
          </p>
        </div>
      )}
    </div>
  );
};

export default Step4PlotElements;