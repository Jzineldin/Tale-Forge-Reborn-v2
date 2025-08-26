import React, { useState, useEffect } from 'react';
import { templateCreditsService, TemplateTier, StoryTemplate, SubscriptionLimits } from '@/services';
import { useAuth } from '@/providers/AuthContext';

interface TemplateGalleryProps {
  onTemplateSelect: (template: StoryTemplate, tier: TemplateTier) => void;
  onCreateCustomTemplate: () => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onTemplateSelect,
  onCreateCustomTemplate
}) => {
  const { user } = useAuth();
  const [presetTemplates, setPresetTemplates] = useState<StoryTemplate[]>([]);
  const [customTemplates, setCustomTemplates] = useState<StoryTemplate[]>([]);
  const [subscriptionLimits, setSubscriptionLimits] = useState<SubscriptionLimits | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tiers = templateCreditsService.getTemplateTiers();

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const presets = await templateCreditsService.getPresetTemplates();
      setPresetTemplates(presets);

      if (user) {
        const [customs, limits] = await Promise.all([
          templateCreditsService.getUserCustomTemplates(user.id),
          templateCreditsService.getSubscriptionLimits(user.id)
        ]);
        setCustomTemplates(customs);
        setSubscriptionLimits(limits);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: StoryTemplate) => {
    setSelectedTemplate(template);
  };

  const handleTierSelect = (tier: TemplateTier) => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate, tier);
    }
  };

  const getTierBadgeColor = (tierId: string) => {
    const colors = {
      tier1: 'bg-green-100 text-green-800 border-green-200',
      tier2: 'bg-blue-100 text-blue-800 border-blue-200', 
      tier3: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[tierId as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getGenreEmoji = (genre: string) => {
    const emojis = {
      'Adventure': '🗺️',
      'Fantasy': '🦄',
      'Mystery': '🔍',
      'Friendship': '👫',
      'Family': '👨‍👩‍👧‍👦',
      'Educational': '📚',
      'Bedtime': '🌙',
      'Holiday': '🎄'
    };
    return emojis[genre as keyof typeof emojis] || '📖';
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading template gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="fantasy-heading-cinzel text-4xl font-bold mb-4">
          Story Template Gallery
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          Choose a template and select your preferred story length. Every story includes beautiful AI-generated images!
        </p>
      </div>

      {/* Pricing Tiers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {tiers.map((tier) => (
          <div key={tier.id} className="glass-card border border-white/20 rounded-lg p-4">
            <div className="text-center">
              <h3 className="font-semibold text-white mb-2">{tier.name}</h3>
              <p className="text-2xl font-bold text-amber-400 mb-1">{tier.totalCost} Credits</p>
              <p className="text-sm text-white/60 mb-2">{tier.chapters} chapters + images</p>
              <p className="text-xs text-white/50">{tier.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Template Selection */}
      {!selectedTemplate ? (
        <div>
          {/* Custom Templates Section */}
          {user && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">Your Custom Templates</h2>
                <div className="flex items-center space-x-4">
                  {subscriptionLimits && (
                    <span className="text-sm text-white/60">
                      {subscriptionLimits.custom_templates_created}/{subscriptionLimits.template_creation_limit} created
                    </span>
                  )}
                  <button
                    onClick={onCreateCustomTemplate}
                    disabled={!subscriptionLimits?.can_create_templates}
                    className="fantasy-cta px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Custom Template
                  </button>
                </div>
              </div>

              {customTemplates.length === 0 ? (
                <div className="glass-card border border-white/10 rounded-lg p-6 text-center">
                  <p className="text-white/60 mb-4">
                    {subscriptionLimits?.can_create_templates 
                      ? "You haven't created any custom templates yet."
                      : "Upgrade your subscription to create custom templates."}
                  </p>
                  {!subscriptionLimits?.can_create_templates && (
                    <button className="text-amber-400 hover:text-amber-300 transition-colors">
                      View Subscription Plans →
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onClick={handleTemplateClick}
                      isCustom={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preset Templates Section */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Preset Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presetTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={handleTemplateClick}
                  isCustom={false}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Tier Selection */
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Choose Story Length for "{selectedTemplate.name}"
            </h2>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ← Back to templates
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="glass-card hover:glass-enhanced border border-white/20 hover:border-amber-400/50 rounded-lg p-6 cursor-pointer transition-all duration-300 transform hover:scale-105"
                onClick={() => handleTierSelect(tier)}
              >
                <div className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getTierBadgeColor(tier.id)}`}>
                    {tier.name}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{tier.chapters} Chapters</h3>
                  <p className="text-3xl font-bold text-amber-400 mb-2">{tier.totalCost} Credits</p>
                  <p className="text-white/60 text-sm mb-4">{tier.description}</p>
                  <div className="text-xs text-white/50">
                    <p>✓ {tier.chapters} AI-generated images</p>
                    <p>✓ Engaging storyline</p>
                    <p>✓ Child-safe content</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="glass-card bg-red-900/30 border border-red-500/50 p-4 rounded-lg mt-6">
          <p className="text-red-200 text-center">{error}</p>
        </div>
      )}
    </div>
  );
};

const TemplateCard: React.FC<{
  template: StoryTemplate;
  onClick: (template: StoryTemplate) => void;
  isCustom: boolean;
}> = ({ template, onClick, isCustom }) => {
  const getGenreEmoji = (genre: string) => {
    const emojis = {
      'Adventure': '🗺️',
      'Fantasy': '🦄',
      'Mystery': '🔍',
      'Friendship': '👫',
      'Family': '👨‍👩‍👧‍👦',
      'Educational': '📚',
      'Bedtime': '🌙',
      'Holiday': '🎄'
    };
    return emojis[genre as keyof typeof emojis] || '📖';
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  return (
    <div
      onClick={() => onClick(template)}
      className="glass-card hover:glass-enhanced border border-white/20 hover:border-amber-400/50 rounded-lg p-6 cursor-pointer transition-all duration-300 transform hover:scale-105"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getGenreEmoji(template.genre)}</span>
          <div>
            <h3 className="font-semibold text-white text-lg">{template.name}</h3>
            {isCustom && (
              <span className="text-xs text-amber-400 font-medium">Custom Template</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/60 mb-1">Ages {template.age_group}</div>
          <div className="text-xs text-white/60">{getDifficultyStars(template.difficulty)}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/80 text-sm mb-4 line-clamp-2">{template.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
          {template.genre}
        </span>
        {template.characters.length > 0 && (
          <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
            {template.characters.length} Characters
          </span>
        )}
        {template.plot_elements.length > 0 && (
          <span className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded">
            {template.plot_elements.length} Plot Elements
          </span>
        )}
      </div>

      {/* Call to Action */}
      <div className="text-center pt-4 border-t border-white/10">
        <p className="text-amber-400 font-medium text-sm">
          Click to choose story length →
        </p>
      </div>
    </div>
  );
};

export default TemplateGallery;