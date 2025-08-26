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
        <h2 className="title-hero mb-4">
          Choose Your Story Adventure ✨
        </h2>
        <p className="text-body text-xl max-w-3xl mx-auto">
          Select a pre-made template for instant story creation, or start from scratch with custom settings
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {TEMPLATE_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`badge badge-lg ${
              selectedCategory === category
                ? 'badge-primary'
                : 'badge-ghost'
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
            className={`template-card ${
              selectedTemplate === template.id ? 'selected' : ''
            }`}
          >
            {/* Template Icon & Category */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">{template.icon}</div>
              <div className="badge badge-sm badge-ghost">
                {template.category}
              </div>
            </div>

            {/* Template Info */}
            <h3 className="title-card mb-2">{template.name}</h3>
            <p className="text-body text-sm mb-4 leading-relaxed">
              {template.description}
            </p>

            {/* Template Details */}
            <div className="space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <span className="text-primary">{template.difficulty}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Chapters:</span>
                <span className="text-primary">{template.chapterCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Read Time:</span>
                <span className="text-primary">{template.estimatedReadTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Cost:</span>
                <span className="text-success">💳 {template.baseCost} credits</span>
              </div>
              <div className="text-xs text-muted mt-1">
                Includes story text + illustrations
              </div>
            </div>

            {/* Premium Audio Option */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-accent flex items-center">
                  🎭 Premium Narration: <span className="ml-1 text-warning">👑</span>
                </span>
                <span className="text-accent">+{template.audioCost} credits</span>
              </div>
              <div className="text-xs text-muted mt-1">
                High-quality ElevenLabs voices (subscribers only)
              </div>
            </div>

            {/* Character Preview */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-muted mb-2">Main Characters:</div>
              <div className="flex flex-wrap gap-1">
                {template.settings.characters.slice(0, 2).map((character, index) => (
                  <span
                    key={index}
                    className="badge badge-sm badge-ghost"
                  >
                    {character.name}
                  </span>
                ))}
                {template.settings.characters.length > 2 && (
                  <span className="badge badge-sm badge-ghost opacity-70">
                    +{template.settings.characters.length - 2} more
                  </span>
                )}
              </div>
            </div>


            {/* Quick Start Indicator */}
            {selectedTemplate === template.id && (
              <div className="mt-4 text-center">
                <div className="badge badge-primary">
                  <span className="animate-spin mr-2">⚡</span>
                  Creating Story...
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Creation Option */}
      <div className="glass-card text-center">
        <div className="text-4xl mb-4">🎨</div>
        <h3 className="title-section mb-4">Create Custom Story</h3>
        <p className="text-body mb-6 max-w-2xl mx-auto">
          Want complete control? Use our step-by-step wizard to customize every detail of your story adventure.
        </p>
        <Button
          onClick={onCustomCreate}
          data-testid="custom-create-button"
          variant="primary"
          size="large"
        >
          Custom Creation
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-muted text-sm">
          💡 Templates provide instant story creation with pre-filled characters and settings
        </p>
      </div>
    </div>
  );
};

export default StoryTemplateSelector;