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
    <div className="wizard-container">
      {/* Header */}
      <div className="wizard-header">
        <h2 className="title-hero mb-4">
          Choose Your Story Adventure
        </h2>
        <p className="text-body text-lg max-w-2xl mx-auto">
          Select a pre-made template for instant story creation, or start from scratch
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
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
      <div className="template-grid mb-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className={`template-card ${
              selectedTemplate === template.id ? 'selected' : ''
            }`}
          >
            {/* Simplified Header */}
            <div className="template-header">
              <div className="template-icon">{template.icon}</div>
              <div className="template-badge">
                {template.category}
              </div>
            </div>

            {/* Template Info */}
            <h3 className="template-title">{template.name}</h3>
            <p className="template-description">
              {template.description}
            </p>

            {/* Simplified Meta */}
            <div className="template-meta">
              <span className="template-difficulty">
                Level {template.difficulty}
              </span>
              <span className="template-cost">
                💳 {template.baseCost}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Creation Option */}
      <div className="glass-card text-center mt-6 py-6">
        <div className="text-3xl mb-3">🎨</div>
        <h3 className="title-card mb-2">Create Custom Story</h3>
        <p className="text-body text-sm mb-4 max-w-md mx-auto">
          Build your story from scratch with full control
        </p>
        <Button
          onClick={onCustomCreate}
          data-testid="custom-create-button"
          variant="primary"
          size="large"
        >
          Start Custom Creation
        </Button>
      </div>
    </div>
  );
};

export default StoryTemplateSelector;