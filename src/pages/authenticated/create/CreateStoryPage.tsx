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

  // Handle body background for this page
  useEffect(() => {
    // Set the nebula background on body when component mounts
    const body = document.body;
    const originalBackground = body.style.background;
    const originalBackgroundImage = body.style.backgroundImage;
    const originalBackgroundAttachment = body.style.backgroundAttachment;
    const originalBackgroundSize = body.style.backgroundSize;
    
    body.style.background = 'none';
    body.style.backgroundImage = 'url(/images/backgrounds/magical-space-nebula-2.png)';
    body.style.backgroundAttachment = 'fixed';
    body.style.backgroundSize = 'cover';
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundPosition = 'center';
    
    // Cleanup function to restore original background
    return () => {
      body.style.background = originalBackground;
      body.style.backgroundImage = originalBackgroundImage;
      body.style.backgroundAttachment = originalBackgroundAttachment;
      body.style.backgroundSize = originalBackgroundSize;
    };
  }, []);

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
    console.log('📋 [TEMPLATE MODE] Template Selected:', {
      templateName: template.name,
      difficulty: ageToDifficulty(template.settings.targetAge),
      targetAge: template.settings.targetAge,
      wordCount: template.settings.wordsPerChapter,
      genre: template.settings.genre,
      theme: template.settings.theme,
      characters: template.settings.characters?.length || 0,
      location: template.settings.location,
      timePeriod: template.settings.timePeriod,
      atmosphere: template.settings.atmosphere
    });

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

    console.log('🔄 [TEMPLATE MODE] Applied Template Data:', templateData);

    setStoryData(templateData);
    setUsingTemplate(true);

    // Skip to final review step for template users
    setStep(6);
  };

  // Handle Easy Mode selection
  const handleEasyModeSelect = () => {
    console.log('🎯 [MODE SELECTION] Easy Mode selected');
    setUsingEasyMode(true);
    setUsingTemplate(false);
    // Easy Mode handles its own navigation
  };

  // Handle template selection from mode selector
  const handleTemplateModeSelect = () => {
    console.log('🎯 [MODE SELECTION] Template Mode selected');
    setUsingEasyMode(false);
    setUsingTemplate(false); // Will be set to true when template is selected
    setStep(1); // Go to template selector
  };

  // Handle custom creation
  const handleCustomCreate = () => {
    console.log('🎯 [MODE SELECTION] Advanced Mode selected');
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
    const storyMode = usingTemplate ? 'Template Mode' : 'Advanced Mode';
    
    console.log(`🎯 [${storyMode.toUpperCase()}] Final Story Creation - Complete User Selections:`, {
      mode: storyMode,
      difficulty: storyData.difficulty,
      ageFormat: ageFormatForAI,
      wordCount: storyData.wordsPerChapter,
      genre: storyData.genre,
      theme: storyData.theme,
      childName: storyData.childName,
      characters: storyData.characters.map(char => ({ name: char.name, role: char.role })),
      location: storyData.location,
      timePeriod: storyData.timePeriod,
      atmosphere: storyData.atmosphere,
      conflict: storyData.conflict,
      quest: storyData.quest,
      moralLesson: storyData.moralLesson,
      additionalDetails: storyData.additionalDetails,
      settingDescription: storyData.settingDescription
    });

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
      child_name: storyData.childName,
      story_type: storyData.difficulty <= 2 ? 'short' : storyData.difficulty <= 6 ? 'medium' : 'long',
      template_level: usingTemplate ? storyData.difficulty : undefined,
      difficulty_level: !usingTemplate ? storyData.difficulty : undefined
    };

    console.log('🚀 [AI PROMPT DATA] Final Backend Submission:', storySubmissionData);
    console.log('🔮 [AI GENERATION] This data will be used to generate:', {
      storySegments: 'AI will use this data to create story content',
      wordConstraints: `${storyData.wordsPerChapter} words per segment`,
      complexityLevel: `Difficulty level ${storyData.difficulty}/10`,
      personalization: `Personalized for ${storyData.childName}`,
      aiModel: 'GPT-4o will process this data',
      expectedOutput: 'Story segments, choices, and image prompts'
    });

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
      return <EasyModeFlow onBack={() => {
        setUsingEasyMode(false);
        setStep(0);
      }} />;
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
    <div className="min-h-screen">
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
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Amazing Header for Kids */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-4 animate-bounce">📚</div>
          <TypographyLayout variant="hero" as="h1" align="center" className="mb-6 text-6xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
            Create Your Amazing Story!
          </TypographyLayout>
        </div>

        {/* Main Content Area */}
        {step === 0 ? (
          // Mode Selection - Let it shine without extra containers!
          renderStep()
        ) : (
          // For wizard steps, add minimal progress and lighter container
          <div className="space-y-8">
            {/* Simple, fun progress indicator */}
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-between items-center mb-3">
                <TypographyLayout variant="body" className="text-white/90 font-bold text-lg">
                  Step {step} of {usingTemplate ? '2' : '5'} 🎯
                </TypographyLayout>
                <TypographyLayout variant="body" className="text-amber-400 font-bold text-lg">
                  {storyProgress}% Complete ⭐
                </TypographyLayout>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 shadow-inner overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 via-orange-500 to-amber-500 h-4 rounded-full transition-all duration-1000 shadow-lg animate-pulse"
                  style={{ width: `${storyProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Wizard Content with brighter, more colorful container */}
            <div 
              className="max-w-4xl mx-auto rounded-3xl p-8 shadow-2xl border backdrop-blur-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                borderColor: 'rgba(255,255,255,0.3)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)'
              }}
            >
              {renderStep()}
            </div>

            {/* Fun error messages */}
            {validationErrors.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <div 
                  className="rounded-3xl p-6 border backdrop-blur-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.08) 100%)',
                    borderColor: 'rgba(239,68,68,0.3)'
                  }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-4xl animate-bounce">🤔</span>
                    <TypographyLayout variant="body" className="text-red-200 font-bold text-lg">
                      Hmm, let's fix these things:
                    </TypographyLayout>
                  </div>
                  <ul className="space-y-2">
                    {validationErrors.filter(e => e.type === 'required').map((error, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <span className="text-red-300 text-2xl">→</span>
                        <TypographyLayout variant="body" className="text-red-100 text-lg">
                          {error.message}
                        </TypographyLayout>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Celebration message */}
            {validationErrors.length === 0 && storyProgress === 100 && (
              <div className="max-w-2xl mx-auto text-center">
                <div 
                  className="rounded-3xl p-6 border backdrop-blur-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 100%)',
                    borderColor: 'rgba(34,197,94,0.3)'
                  }}
                >
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <TypographyLayout variant="body" className="text-green-200 font-bold text-2xl">
                    Awesome! Your story is ready to create! ✨
                  </TypographyLayout>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStoryPage;