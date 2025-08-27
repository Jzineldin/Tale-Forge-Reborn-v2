import React, { useState } from 'react';
import Button from '@/components/atoms/Button';
import { TEMPLATE_CATEGORIES, getTemplatesByCategory, type StoryTemplate } from '@/utils/storyTemplates';
import { TypographyLayout } from '@/components/layout';
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
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat" 
      style={{
        backgroundImage: 'url(/images/backgrounds/magical-space-nebula-2.png)',
        backgroundColor: '#0f0f23', // Fallback color
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover'
      }}
    >
      {/* Floating magical elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({length: 15}).map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {['✨', '⭐', '🌟', '💫', '🔮'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Amazing Header for Template Mode */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <TypographyLayout variant="hero" as="h1" align="center" className="mb-4 text-5xl bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Template Mode Magic!
          </TypographyLayout>
          <TypographyLayout variant="body" align="center" className="text-xl text-white/90 max-w-3xl mx-auto">
            Choose from our curated collection of professional story templates! ⚡✨
          </TypographyLayout>
        </div>

        {/* Enhanced Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl shadow-blue-400/50'
                  : 'bg-white/10 backdrop-blur-sm border border-white/30 text-white/80 hover:bg-white/20 hover:border-white/50'
              }`}
            >
              {category === 'All' ? '🌟 All Templates' : category}
            </button>
          ))}
        </div>

        {/* Enhanced Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className={`relative transform transition-all duration-500 cursor-pointer group ${
                selectedTemplate === template.id 
                  ? 'scale-105 z-10' 
                  : 'hover:scale-105'
              }`}
            >
              <div
                className={`rounded-3xl p-8 backdrop-blur-xl border transition-all duration-500 shadow-2xl ${
                  selectedTemplate === template.id
                    ? 'border-blue-400/60 shadow-blue-400/30 bg-gradient-to-br from-blue-400/25 via-cyan-500/15 to-blue-600/20'
                    : 'border-white/20 hover:border-blue-400/40 bg-gradient-to-br from-white/15 via-white/10 to-white/5 hover:shadow-blue-400/20'
                }`}
              >
                {/* Enhanced Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                    {template.icon}
                  </div>
                  <div className="bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full">
                    <TypographyLayout variant="body" className="text-blue-300 text-xs font-bold">
                      {template.category}
                    </TypographyLayout>
                  </div>
                </div>

                {/* Enhanced Template Info */}
                <TypographyLayout variant="card" as="h3" className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  {template.name}
                </TypographyLayout>
                <TypographyLayout variant="body" className="text-white/80 text-lg leading-relaxed mb-6">
                  {template.description}
                </TypographyLayout>

                {/* Enhanced Meta */}
                <div className="flex justify-between items-center">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <TypographyLayout variant="body" className="text-sm font-bold">
                      Level {template.difficulty}
                    </TypographyLayout>
                  </div>
                  <div className="bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-full">
                    <TypographyLayout variant="body" className="text-green-300 text-sm font-bold">
                      💳 {template.baseCost} coins
                    </TypographyLayout>
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                    <span className="text-white font-bold text-lg">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Custom Creation Option */}
        <div 
          className="text-center rounded-3xl p-12 backdrop-blur-xl border border-orange-400/30 shadow-2xl shadow-orange-400/20"
          style={{
            background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.08) 100%)',
          }}
        >
          <div className="text-6xl mb-6 animate-bounce">🎨</div>
          <TypographyLayout variant="section" as="h3" className="text-3xl font-bold text-white mb-4">
            Create Custom Story
          </TypographyLayout>
          <TypographyLayout variant="body" className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
            Want complete creative control? Build your story from scratch with our advanced story builder!
          </TypographyLayout>
          <button
            onClick={onCustomCreate}
            data-testid="custom-create-button"
            className="px-16 py-5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-full shadow-2xl hover:shadow-orange-400/60 transition-all duration-300 flex items-center gap-4 font-bold text-xl mx-auto transform hover:scale-110"
          >
            <span className="text-2xl">🚀</span>
            Start Advanced Creation
            <span className="text-2xl">✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryTemplateSelector;