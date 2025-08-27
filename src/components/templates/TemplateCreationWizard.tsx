import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { useTemplateCreation } from '@/hooks/useTemplateCreation';
import BasicInfoStep from './steps/BasicInfoStep';
import CharactersSettingsStep from './steps/CharactersSettingsStep';
import PlotElementsStep from './steps/PlotElementsStep';
import StyleSettingsStep from './steps/StyleSettingsStep';
import SubscriptionUpgradeCard from './SubscriptionUpgradeCard';

interface TemplateCreationWizardProps {
  onComplete?: (templateId: string) => void;
  onCancel?: () => void;
}

export const TemplateCreationWizard: React.FC<TemplateCreationWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const {
    formData,
    setFormData,
    step,
    setStep,
    loading,
    canCreateTemplate,
    canMakePublic,
    userTier,
    submitTemplate,
    isStepValid,
    progress
  } = useTemplateCreation({ onComplete });

  // Show upgrade card if user can't create templates
  if (!canCreateTemplate) {
    return <SubscriptionUpgradeCard onCancel={onCancel} />;
  }

  const handleUpdate = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      submitTemplate();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <BasicInfoStep formData={formData} onUpdate={handleUpdate} />;
      case 2:
        return <CharactersSettingsStep formData={formData} onUpdate={handleUpdate} />;
      case 3:
        return <PlotElementsStep formData={formData} onUpdate={handleUpdate} />;
      case 4:
        return (
          <StyleSettingsStep
            formData={formData}
            onUpdate={handleUpdate}
            canMakePublic={canMakePublic}
            userTier={userTier}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Characters & Settings';
      case 3: return 'Plot Elements & Tags';
      case 4: return 'Style & Sharing';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          Create Story Template
        </h2>
        <p className="text-gray-600">
          Step {step} of 4: {getStepTitle()}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Characters</span>
          <span>Plot Elements</span>
          <span>Style & Sharing</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex gap-2">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={loading}
            >
              Previous
            </Button>
          )}
          {onCancel && (
            <Button 
              variant="ghost" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {step < 4 && !isStepValid(step) && (
            <span className="text-amber-600">
              Please complete all required fields to continue
            </span>
          )}
        </div>

        <Button
          onClick={handleNext}
          disabled={loading || !isStepValid(step)}
          className="flex items-center gap-2"
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {step === 4 ? 'Create Template' : 'Next'}
        </Button>
      </div>
    </div>
  );
};