import React, { useState } from 'react';
import Button from '@/components/atoms/Button';
import { TEMPLATE_CATEGORIES, getTemplatesByCategory, type StoryTemplate } from '@/utils/storyTemplates';
// Removed unused imports: useSocialStats, useTemplateLikes, useTemplateBookmarks, useTemplateSharing

interface StoryTemplateSelectorProps {
  onSelectTemplate: (template: StoryTemplate) => void;
  onCustomCreate: () => void;
}

const StoryTemplateSelector: React.FC<StoryTemplateSelectorProps> = ({
  onSelectTemplate,
  onCustomCreate
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  const handleTemplateClick = (template: StoryTemplate) => {
    setSelectedTemplate(template.id);
    setTimeout(() => {
      onSelectTemplate(template);
    }, 300); // Small delay for visual feedback
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
          Choose Your Story Adventure ✨
        </h2>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">
          Select a pre-made template for instant story creation, or start from scratch with custom settings
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {TEMPLATE_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className={`glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:transform hover:scale-105 hover:border-amber-400/50 hover:shadow-2xl ${
              selectedTemplate === template.id ? 'border-amber-400 bg-amber-500/10' : ''
            }`}
          >
            {/* Template Icon & Category */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{template.icon}</div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/70">
                {template.category}
              </div>
            </div>

            {/* Template Info */}
            <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
            <p className="text-white/80 text-sm mb-4 leading-relaxed">
              {template.description}
            </p>

            {/* Template Details */}
            <div className="space-y-2 text-xs text-white/60">
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span className="text-amber-400">{template.difficulty}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Chapters:</span>
                <span className="text-amber-400">{template.chapterCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Read Time:</span>
                <span className="text-amber-400">{template.estimatedReadTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Cost:</span>
                <span className="text-green-400">💳 {template.baseCost} credits</span>
              </div>
              <div className="text-xs text-white/50 mt-1">
                Includes story text + illustrations
              </div>
            </div>

            {/* Premium Audio Option */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-purple-400 flex items-center">
                  🎭 Premium Narration: <span className="ml-1 text-yellow-400">👑</span>
                </span>
                <span className="text-purple-400">+{template.audioCost} credits</span>
              </div>
              <div className="text-xs text-white/50 mt-1">
                High-quality ElevenLabs voices (subscribers only)
              </div>
            </div>

            {/* Character Preview */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/60 mb-2">Main Characters:</div>
              <div className="flex flex-wrap gap-1">
                {template.settings.characters.slice(0, 2).map((character, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 rounded text-xs text-white/80"
                  >
                    {character.name}
                  </span>
                ))}
                {template.settings.characters.length > 2 && (
                  <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                    +{template.settings.characters.length - 2} more
                  </span>
                )}
              </div>
            </div>


            {/* Quick Start Indicator */}
            {selectedTemplate === template.id && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
                  <span className="animate-spin mr-2">⚡</span>
                  Creating Story...
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Creation Option */}
      <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">🎨</div>
        <h3 className="text-2xl font-bold text-white mb-4">Create Custom Story</h3>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          Want complete control? Use our step-by-step wizard to customize every detail of your story adventure.
        </p>
        <Button
          onClick={onCustomCreate}
          data-testid="custom-create-button"
          className="fantasy-cta px-8 py-3 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          Custom Creation
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-white/60 text-sm">
          💡 Templates provide instant story creation with pre-filled characters and settings
        </p>
      </div>
    </div>
  );
};

export default StoryTemplateSelector;