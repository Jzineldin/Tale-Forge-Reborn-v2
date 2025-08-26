import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templateCreditsService, TemplateTier, StoryTemplate } from '@/services';
import { useAuth } from '@/providers/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import TemplateGallery from '@/components/organisms/TemplateGallery';
import { UnifiedCard, FloatingElements } from '@/components/design-system';

interface CreateStoryFormData {
  title: string;
  childName: string;
  difficultyAdjustment: number;
}

const CreateStoryPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { credits, refreshCredits } = useCredits();
  
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  const [selectedTier, setSelectedTier] = useState<TemplateTier | null>(null);
  const [formData, setFormData] = useState<CreateStoryFormData>({
    title: '',
    childName: '',
    difficultyAdjustment: 0
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTemplateSelect = (template: StoryTemplate, tier: TemplateTier) => {
    setSelectedTemplate(template);
    setSelectedTier(tier);
    // Auto-generate title based on template and tier
    setFormData({
      ...formData,
      title: `${template.name} - ${tier.name}`,
    });
  };

  const handleCreateCustomTemplate = () => {
    // Navigate to custom template creation (to be implemented)
    navigate('/create/custom-template');
  };

  const handleBackToGallery = () => {
    setSelectedTemplate(null);
    setSelectedTier(null);
    setFormData({ title: '', childName: '', difficultyAdjustment: 0 });
    setError(null);
  };

  const handleCreateStory = async () => {
    if (!selectedTemplate || !selectedTier || !user) {
      setError('Please select a template and fill in all required fields');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a story title');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const result = await templateCreditsService.createStoryFromTemplate(
        selectedTemplate.id,
        selectedTier.id,
        false, // No audio at creation time
        {
          title: formData.title.trim(),
          child_name: formData.childName.trim() || null,
          difficulty_adjustment: formData.difficultyAdjustment
        }
      );

      if (result.success && result.story_id) {
        await refreshCredits();
        navigate(`/stories/${result.story_id}/read`);
      } else {
        setError('Failed to create story. Please check your credit balance and try again.');
      }
    } catch (err) {
      console.error('Error creating story:', err);
      setError(err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setIsCreating(false);
    }
  };

  const currentBalance = credits?.currentBalance || 0;
  const canAffordStory = selectedTier ? currentBalance >= selectedTier.totalCost : true;

  if (!selectedTemplate || !selectedTier) {
    return (
      <div className="min-h-screen py-6 relative overflow-hidden">
        <FloatingElements />
        <div className="relative z-10">
          <TemplateGallery
            onTemplateSelect={handleTemplateSelect}
            onCreateCustomTemplate={handleCreateCustomTemplate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 relative overflow-hidden">
      <FloatingElements />
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <UnifiedCard variant="enhanced" className="text-center">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToGallery}
                  className="text-white/60 hover:text-white transition-colors flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to Templates</span>
                </button>
                <div className="text-right">
                  <p className="text-white/60 text-sm">Your Credits</p>
                  <p className="text-amber-400 text-lg font-bold">{currentBalance}</p>
                </div>
              </div>
              
              <h1 className="fantasy-heading-cinzel text-4xl font-bold mb-4">
                Create Your Story
              </h1>
              <p className="text-white/80 text-lg">
                Customize "{selectedTemplate.name}" as a {selectedTier.name.toLowerCase()}
              </p>
            </UnifiedCard>
          </div>

          {/* Selected Template & Tier Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-semibold text-white mb-4">Selected Template</h3>
              <div className="flex items-start space-x-4">
                <div className="text-3xl">
                  {selectedTemplate.genre === 'Adventure' ? '🗺️' : 
                   selectedTemplate.genre === 'Fantasy' ? '🦄' : 
                   selectedTemplate.genre === 'Mystery' ? '🔍' : '📖'}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">{selectedTemplate.name}</h4>
                  <p className="text-white/70 text-sm mb-2">{selectedTemplate.description}</p>
                  <div className="flex items-center space-x-3 text-xs text-white/50">
                    <span>{selectedTemplate.genre}</span>
                    <span>•</span>
                    <span>Ages {selectedTemplate.age_group}</span>
                    <span>•</span>
                    <span>{'⭐'.repeat(selectedTemplate.difficulty)}</span>
                  </div>
                </div>
              </div>
            </UnifiedCard>

            <UnifiedCard variant="enhanced">
              <h3 className="text-xl font-semibold text-white mb-4">Story Length</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">{selectedTier.chapters}</div>
                <div className="text-white/80 mb-2">{selectedTier.name}</div>
                <div className="text-2xl font-bold text-amber-400 mb-2">{selectedTier.totalCost} Credits</div>
                <div className="text-white/60 text-sm">{selectedTier.description}</div>
                <div className="mt-3 text-xs text-white/50">
                  <p>✓ {selectedTier.chapters} chapters</p>
                  <p>✓ {selectedTier.chapters} AI-generated images</p>
                  <p>✓ Interactive story choices</p>
                </div>
              </div>
            </UnifiedCard>
          </div>

          {/* Story Customization Form */}
          <UnifiedCard variant="enhanced" className="mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Customize Your Story</h3>
            
            <div className="space-y-6">
              {/* Story Title */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Story Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your story title"
                  className="w-full glass-card bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-amber-400 focus:outline-none transition-colors"
                  maxLength={100}
                />
                <p className="text-white/50 text-xs mt-1">
                  This will be the title of your personalized story
                </p>
              </div>

              {/* Child Name (Optional) */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Child's Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  placeholder="Enter child's name to personalize the story"
                  className="w-full glass-card bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:border-amber-400 focus:outline-none transition-colors"
                  maxLength={50}
                />
                <p className="text-white/50 text-xs mt-1">
                  Add a child's name to make the story more personal
                </p>
              </div>

              {/* Difficulty Adjustment */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Difficulty Adjustment
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-white/60 text-sm">Easier</span>
                  <input
                    type="range"
                    min="-2"
                    max="2"
                    value={formData.difficultyAdjustment}
                    onChange={(e) => setFormData({ ...formData, difficultyAdjustment: parseInt(e.target.value) })}
                    className="flex-1 accent-amber-400"
                  />
                  <span className="text-white/60 text-sm">Harder</span>
                </div>
                <p className="text-white/50 text-xs mt-1">
                  Adjust the reading level from the template default (
                  {formData.difficultyAdjustment === 0 ? 'Default' :
                   formData.difficultyAdjustment > 0 ? `+${formData.difficultyAdjustment} Harder` :
                   `${formData.difficultyAdjustment} Easier`})
                </p>
              </div>
            </div>
          </UnifiedCard>

          {/* Error Message */}
          {error && (
            <UnifiedCard variant="glass" className="mb-6">
              <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg">
                <p className="text-red-200 text-center">{error}</p>
              </div>
            </UnifiedCard>
          )}

          {/* Create Story Button */}
          <UnifiedCard variant="enhanced" className="text-center">
            <div className="mb-4">
              <div className="text-white/70 text-sm mb-2">
                Story Cost: <span className="text-amber-400 font-bold">{selectedTier.totalCost} credits</span>
              </div>
              <div className="text-white/60 text-sm">
                Your balance after creation: <span className={canAffordStory ? 'text-green-400' : 'text-red-400'}>
                  {currentBalance - selectedTier.totalCost} credits
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateStory}
              disabled={isCreating || !canAffordStory || !formData.title.trim()}
              className="fantasy-cta px-8 py-4 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
            >
              {isCreating ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Creating Your Story...</span>
                </div>
              ) : !canAffordStory ? (
                'Insufficient Credits'
              ) : (
                '✨ Create Story'
              )}
            </button>

            {!canAffordStory && (
              <p className="text-red-400 text-sm mt-3">
                You need {selectedTier.totalCost - currentBalance} more credits to create this story
              </p>
            )}
          </UnifiedCard>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryPageNew;