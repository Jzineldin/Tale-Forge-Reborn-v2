import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Step1StoryConcept,
  Step2CharacterCreation,
  Step3StorySetting,
  Step4PlotElements,
  Step5ReviewGenerate
} from '@/components/organisms/story-creation-wizard';
import StoryTemplateSelector from '@/components/organisms/story-creation-wizard/StoryTemplateSelector';
import EasyModeFlow from '@/components/organisms/story-creation/EasyModeFlow';
import ModeSelector from '@/components/organisms/story-creation/ModeSelector';
import { useCreateStory } from '@/utils/storyHooks';
import { PageLayout, CardLayout, TypographyLayout } from '@/components/layout';
import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  calculateStoryProgress,
  isStoryReadyForGeneration,
  StoryValidationError
} from '@/utils/storyValidation';
import { type StoryTemplate } from '@/utils/storyTemplates';

interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
}

interface StoryData {
  childName: string;
  difficulty: number; // 1-10 difficulty level
  wordsPerChapter: number;
  genre: string;
  theme: string;
  characters: Character[];
  location: string;
  timePeriod: string;
  atmosphere: string;
  conflict: string;
  quest: string;
  moralLesson: string;
  additionalDetails: string;
  settingDescription: string;
}

const CreateStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // Start at 0 for mode selection
  // Removed duplicate isGenerating state - using isCreatingStory from hook instead
  const [validationErrors, setValidationErrors] = useState<StoryValidationError[]>([]);
  const [storyProgress, setStoryProgress] = useState(0);
  const [usingTemplate, setUsingTemplate] = useState(false);
  const [usingEasyMode, setUsingEasyMode] = useState(false);
  const [storyData, setStoryData] = useState<StoryData>({
    childName: '',
    difficulty: 5, // Default medium difficulty
    wordsPerChapter: 120,
    genre: '',
    theme: '',
    characters: [],
    location: '',
    timePeriod: '',
    atmosphere: '',
    conflict: '',
    quest: '',
    moralLesson: '',
    additionalDetails: '',
    settingDescription: ''
  });

  // Use the create story hook
  const { mutate: createStory, isLoading: isCreatingStory } = useCreateStory();

  // Update progress whenever story data changes
  useEffect(() => {
    const progress = calculateStoryProgress(storyData);
    setStoryProgress(progress);
  }, [storyData]);

  const handleInputChange = (field: string, value: string | number | Character[]) => {
    setStoryData({
      ...storyData,
      [field]: value
    });
  };

  // Helper to convert targetAge to difficulty level (1-10)
  const ageToDifficulty = (age: number): number => {
    // Convert age ranges to difficulty scale
    if (age <= 4) return 2; // Very easy
    if (age <= 6) return 4; // Easy
    if (age <= 8) return 6; // Medium
    if (age <= 10) return 8; // Hard
    return 9; // Very hard
  };

  // Handle template selection
  const handleTemplateSelect = (template: StoryTemplate) => {
    console.log('Selected template:', template.name);

    // Apply template settings to story data
    const templateData: StoryData = {
      childName: '', // User can still customize this
      difficulty: ageToDifficulty(template.settings.targetAge),
      wordsPerChapter: template.settings.wordsPerChapter,
      genre: template.settings.genre,
      theme: template.settings.theme,
      characters: template.settings.characters,
      location: template.settings.location,
      timePeriod: template.settings.timePeriod,
      atmosphere: template.settings.atmosphere,
      conflict: template.settings.conflict,
      quest: template.settings.quest,
      moralLesson: template.settings.moralLesson,
      additionalDetails: template.settings.additionalDetails,
      settingDescription: template.settings.settingDescription
    };

    setStoryData(templateData);
    setUsingTemplate(true);

    // Skip to final review step for template users
    setStep(6);
  };

  // Handle Easy Mode selection
  const handleEasyModeSelect = () => {
    setUsingEasyMode(true);
    setUsingTemplate(false);
    // Easy Mode handles its own navigation
  };

  // Handle template selection from mode selector
  const handleTemplateModeSelect = () => {
    setUsingEasyMode(false);
    setUsingTemplate(false); // Will be set to true when template is selected
    setStep(1); // Go to template selector
  };

  // Handle custom creation
  const handleCustomCreate = () => {
    setUsingEasyMode(false);
    setUsingTemplate(false);
    setStep(2); // Start with step 2 for custom creation (after mode selection)
  };

  const validateCurrentStep = (): boolean => {
    let errors: StoryValidationError[] = [];

    switch (step) {
      case 0:
      case 1:
        // Mode selection and template selection steps - always valid
        return true;
      case 2:
        errors = validateStep1(storyData);
        break;
      case 3:
        errors = validateStep2(storyData);
        break;
      case 4:
        errors = validateStep3(storyData);
        break;
      case 5:
        errors = validateStep4(storyData);
        break;
      case 6:
        errors = validateStep5(storyData);
        break;
    }

    setValidationErrors(errors);
    return errors.filter(e => e.type === 'required').length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep() && step < 6) {
      setStep(step + 1);
      setValidationErrors([]); // Clear errors when moving to next step
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
      setValidationErrors([]); // Clear errors when going back
    }
  };

  // Helper to convert difficulty to age format for AI understanding
  const difficultyToAgeFormat = (): string => {
    // Convert difficulty level (1-10) to age format that AI understands
    if (storyData.difficulty <= 2) return '3-4'; // Very easy
    if (storyData.difficulty <= 4) return '4-6'; // Easy
    if (storyData.difficulty <= 6) return '7-9'; // Medium
    if (storyData.difficulty <= 8) return '10-12'; // Hard
    return '13-15'; // Very hard
  };

  const handleSubmit = () => {
    // Final validation before submission
    if (!isStoryReadyForGeneration(storyData)) {
      const errors = validateStep5(storyData);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const ageFormatForAI = difficultyToAgeFormat();
    console.log(`🎯 Difficulty ${storyData.difficulty} → Age format: "${ageFormatForAI}" for AI understanding`);

    // Debug: Check all story data before submission
    console.log('📋 Full story data before submission:', storyData);

    // Prepare story data for submission - include ALL form data
    const storySubmissionData = {
      title: storyData.childName ? `${storyData.childName}'s Adventure` : 'My Magical Story',
      description: storyData.theme || 'A wonderful adventure awaits',
      genre: storyData.genre,
      age_group: ageFormatForAI,
      target_age: ageFormatForAI,
      theme: storyData.theme,
      setting: storyData.location,
      characters: storyData.characters,
      conflict: storyData.conflict,
      quest: storyData.quest,
      moral_lesson: storyData.moralLesson,
      additional_details: storyData.additionalDetails,
      setting_description: storyData.settingDescription,
      time_period: storyData.timePeriod,
      atmosphere: storyData.atmosphere,
      words_per_chapter: storyData.wordsPerChapter,
      child_name: storyData.childName
    };

    // Debug: Check what we're sending to the API
    console.log('🚀 Story submission data:', storySubmissionData);

    // Call the create story mutation
    createStory(
      storySubmissionData,
      {
        onSuccess: async (data: any) => {
          console.log('Story creation response:', data);
          const storyId = data.story?.id || data.id;

          console.log('✅ Story created - immediately navigating to story reader');

          // 🚀 IMMEDIATE NAVIGATION: Remove unnecessary delay and multiple loading states
          navigate(`/stories/${storyId}`);
        },
        onError: (error: any) => {
          console.error('Error creating story:', error);
          setValidationErrors([{
            field: 'submission',
            message: 'Failed to create story. Please try again.',
            type: 'format'
          }]);
        }
      }
    );
  };

  const renderStep = () => {
    // If using Easy Mode, render it instead of the step-by-step wizard
    if (usingEasyMode) {
      return <EasyModeFlow />;
    }

    switch (step) {
      case 0:
        return (
          <ModeSelector
            onEasyMode={handleEasyModeSelect}
            onTemplateMode={handleTemplateModeSelect}
            onCustomMode={handleCustomCreate}
          />
        );

      case 1:
        return (
          <StoryTemplateSelector
            onSelectTemplate={handleTemplateSelect}
            onCustomCreate={handleCustomCreate}
          />
        );

      case 2:
        return (
          <Step1StoryConcept
            storyData={storyData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );

      case 3:
        return (
          <Step2CharacterCreation
            storyData={storyData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );

      case 4:
        return (
          <Step3StorySetting
            storyData={storyData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );

      case 5:
        return (
          <Step4PlotElements
            storyData={storyData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );

      case 6:
        return (
          <Step5ReviewGenerate
            storyData={storyData}
            onSubmit={handleSubmit}
            onPrevious={usingTemplate ? () => setStep(1) : handlePrevious}
            isGenerating={isCreatingStory}
            usingTemplate={usingTemplate}
            onUpdateChildName={(name: string) => handleInputChange('childName', name)}
          />
        );

      default:
        return null;
    }
  };

  // Progress step labels with icons - different for template vs custom
  const getProgressSteps = () => {
    if (step === 0) {
      return [{ label: 'Templates', icon: '🎨', description: 'Choose story type' }];
    }

    if (usingTemplate) {
      return [
        { label: 'Template', icon: '🎨', description: 'Quick start' },
        { label: 'Generate', icon: '✨', description: 'Create your story' }
      ];
    }

    return [
      { label: 'Concept', icon: '💡', description: 'Choose genre & theme' },
      { label: 'Characters', icon: '👥', description: 'Create story heroes' },
      { label: 'Setting', icon: '🌍', description: 'Build story world' },
      { label: 'Plot', icon: '📖', description: 'Define adventure' },
      { label: 'Generate', icon: '✨', description: 'Create your story' }
    ];
  };

  const progressSteps = getProgressSteps();

  // Easy Mode renders its own complete UI
  if (usingEasyMode) {
    return renderStep();
  }

  return (
    <PageLayout maxWidth="lg" showFloatingElements>
      {/* Header */}
      <CardLayout variant="default" padding="xl" className="mb-8 text-center">
        <TypographyLayout variant="hero" as="h1" align="center" className="mb-4" id="create-story-heading">
          Create Your Magical Story ✨
        </TypographyLayout>
        <TypographyLayout variant="body" align="center" className="text-xl max-w-3xl mx-auto mb-6">
          {step === 0 ? 'Choose how you\'d like to create your story' : 'Follow our step-by-step wizard to craft a personalized interactive adventure'}
        </TypographyLayout>
      </CardLayout>

        {/* Progress Bar */}
        <CardLayout variant="default" padding="lg" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((stepInfo, index) => {
              let stepNumber, isActive, isCompleted, isAccessible;

              if (step === 0) {
                // Template selection step
                stepNumber = 0;
                isActive = true;
                isCompleted = false;
                isAccessible = true;
              } else if (usingTemplate) {
                // Template flow: step 0 (completed) -> step 5 (active)
                stepNumber = index === 0 ? 0 : 5;
                isActive = (index === 0 && step === 0) || (index === 1 && step === 5);
                isCompleted = index === 0 && step === 5;
                isAccessible = true;
              } else {
                // Custom flow: normal 1-5 progression
                stepNumber = index + 1;
                isActive = step === stepNumber;
                isCompleted = step > stepNumber;
                isAccessible = step >= stepNumber;
              }

              return (
                <div key={stepNumber} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${isCompleted
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                        : isActive
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 animate-pulse'
                          : isAccessible
                            ? 'bg-slate-600/50 text-amber-200 border border-amber-400/30'
                            : 'bg-slate-800/50 text-slate-400'
                        }`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isCompleted ? '✓' : stepInfo.icon}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-body-sm font-semibold ${isActive ? 'text-amber-400' : isCompleted ? 'text-amber-300' : 'text-slate-300'}`}>
                        {stepInfo.label}
                      </div>
                      <div className="text-body-xs text-white/50 max-w-20">{stepInfo.description}</div>
                    </div>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${isCompleted ? 'bg-amber-400 shadow-sm' : 'bg-slate-600/30'}`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress percentage */}
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <TypographyLayout variant="body" className="text-body-sm text-white/70">
                Story Completion
              </TypographyLayout>
              <TypographyLayout variant="body" className="text-body-sm text-white/70">
                {step === 0
                  ? '0'
                  : usingTemplate
                    ? step === 5 ? storyProgress : '100'
                    : storyProgress}% Complete
              </TypographyLayout>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${step === 0 ? 0 : usingTemplate ? (step === 5 ? storyProgress : 100) : storyProgress}%`
                }}
              ></div>
            </div>

            {/* Validation errors display */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-400">⚠️</span>
                  <TypographyLayout variant="body" className="text-red-200 font-medium text-sm">
                    Please fix the following issues:
                  </TypographyLayout>
                </div>
                <ul className="space-y-1">
                  {validationErrors.filter(e => e.type === 'required').map((error, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="text-red-400">•</span>
                      <TypographyLayout variant="body" className="text-red-200 text-sm">
                        {error.message}
                      </TypographyLayout>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success message */}
            {validationErrors.length === 0 && storyProgress === 100 && (
              <div className="mt-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <TypographyLayout variant="body" className="text-green-200 font-medium text-sm">
                    Your story is ready to generate!
                  </TypographyLayout>
                </div>
              </div>
            )}
          </div>
        </CardLayout>

        {/* Wizard Content */}
        <CardLayout variant="default" padding="xl" className="mb-8">
          {renderStep()}
        </CardLayout>

        {/* Help Section */}
        <CardLayout variant="default" padding="lg">
          <div className="flex items-center justify-center space-x-6 text-white/70">
            <div className="flex items-center space-x-2">
              <span className="text-amber-400">💡</span>
              <TypographyLayout variant="body" className="text-sm">Need help? Hover over any option for tips</TypographyLayout>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-400">🎯</span>
              <TypographyLayout variant="body" className="text-sm">All steps are optional - create as you go</TypographyLayout>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-400">⚡</span>
              <TypographyLayout variant="body" className="text-sm">Story generates in ~30 seconds</TypographyLayout>
            </div>
          </div>
        </CardLayout>
    </PageLayout>
  );
};

export default CreateStoryPage;