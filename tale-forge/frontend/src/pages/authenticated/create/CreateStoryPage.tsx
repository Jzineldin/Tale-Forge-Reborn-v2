import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import {
  Step1StoryConcept,
  Step2CharacterCreation,
  Step3StorySetting,
  Step4PlotElements,
  Step5ReviewGenerate
} from '@/components/organisms/story-creation-wizard';
import { useCreateStory } from '@/utils/storyHooks';
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

interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
}

interface StoryData {
  childName: string;
  ageGroup: string;
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
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyId, setStoryId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<StoryValidationError[]>([]);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyData, setStoryData] = useState<StoryData>({
    childName: '',
    ageGroup: '',
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

  const handleInputChange = (field: string, value: string | Character[]) => {
    setStoryData({
      ...storyData,
      [field]: value
    });
  };

  const validateCurrentStep = (): boolean => {
    let errors: StoryValidationError[] = [];
    
    switch (step) {
      case 1:
        errors = validateStep1(storyData);
        break;
      case 2:
        errors = validateStep2(storyData);
        break;
      case 3:
        errors = validateStep3(storyData);
        break;
      case 4:
        errors = validateStep4(storyData);
        break;
      case 5:
        errors = validateStep5(storyData);
        break;
    }
    
    setValidationErrors(errors);
    return errors.filter(e => e.type === 'required').length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep() && step < 5) {
      setStep(step + 1);
      setValidationErrors([]); // Clear errors when moving to next step
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      setValidationErrors([]); // Clear errors when going back
    }
  };

  const handleSubmit = () => {
    // Final validation before submission
    if (!isStoryReadyForGeneration(storyData)) {
      const errors = validateStep5(storyData);
      setValidationErrors(errors);
      return;
    }

    setIsGenerating(true);
    setValidationErrors([]);
    
    // Prepare story data for submission
    const storySubmissionData = {
      title: storyData.childName ? `${storyData.childName}'s Adventure` : 'My Magical Story',
      description: storyData.theme || 'A wonderful adventure awaits',
      genre: storyData.genre,
      age_group: storyData.ageGroup,
      theme: storyData.theme,
      setting: storyData.location,
      characters: storyData.characters,
      conflict: storyData.conflict,
      quest: storyData.quest,
      moral_lesson: storyData.moralLesson,
      additional_details: storyData.additionalDetails,
      setting_description: storyData.settingDescription,
      time_period: storyData.timePeriod,
      atmosphere: storyData.atmosphere
    };
    
    // Call the create story mutation
    createStory(
      storySubmissionData,
      {
        onSuccess: (data: any) => {
          setStoryId(data.id);
          // Navigate to the story reader page
          setTimeout(() => {
            navigate(`/stories/${data.id}`);
          }, 2000);
        },
        onError: (error: any) => {
          console.error('Error creating story:', error);
          setValidationErrors([{
            field: 'submission',
            message: 'Failed to create story. Please try again.',
            type: 'format'
          }]);
          setIsGenerating(false);
        }
      }
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1StoryConcept
            storyData={storyData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      
      case 2:
        return (
          <Step2CharacterCreation
            storyData={storyData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      
      case 3:
        return (
          <Step3StorySetting
            storyData={storyData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      
      case 4:
        return (
          <Step4PlotElements
            storyData={storyData}
            handleInputChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      
      case 5:
        return (
          <Step5ReviewGenerate
            storyData={storyData}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
            isGenerating={isGenerating || isCreatingStory}
          />
        );
      
      default:
        return null;
    }
  };

  // Progress step labels with icons
  const progressSteps = [
    { label: 'Concept', icon: '💡', description: 'Choose genre & theme' },
    { label: 'Characters', icon: '👥', description: 'Create story heroes' },
    { label: 'Setting', icon: '🌍', description: 'Build story world' },
    { label: 'Plot', icon: '📖', description: 'Define adventure' },
    { label: 'Generate', icon: '✨', description: 'Create your story' }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-8 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" 
              style={{ fontFamily: 'Cinzel, serif' }}
              id="create-story-heading">
            Create Your Magical Story ✨
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Follow our step-by-step wizard to craft a personalized interactive adventure
          </p>
        </div>

        {/* Progress Bar */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((stepInfo, index) => {
              const stepNumber = index + 1;
              const isActive = step === stepNumber;
              const isCompleted = step > stepNumber;
              const isAccessible = step >= stepNumber;
              
              return (
                <div key={stepNumber} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                          : isActive
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 animate-pulse'
                          : isAccessible
                          ? 'bg-white/20 text-white/80 border border-white/30'
                          : 'bg-white/10 text-white/40'
                      }`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      {isCompleted ? '✓' : stepInfo.icon}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-semibold ${
                        isActive ? 'text-amber-400' : isCompleted ? 'text-green-400' : 'text-white/70'
                      }`}>
                        {stepInfo.label}
                      </div>
                      <div className="text-xs text-white/50 max-w-20">
                        {stepInfo.description}
                      </div>
                    </div>
                  </div>
                  {stepNumber < 5 && (
                    <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                      step > stepNumber ? 'bg-green-400 shadow-sm' : 'bg-white/20'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Progress percentage */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Story Completion</span>
              <span>{storyProgress}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${storyProgress}%` }}
              ></div>
            </div>
            
            {/* Validation errors display */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-red-200 font-medium text-sm">Please fix the following issues:</span>
                </div>
                <ul className="space-y-1">
                  {validationErrors.filter(e => e.type === 'required').map((error, index) => (
                    <li key={index} className="text-red-200 text-sm flex items-center space-x-2">
                      <span className="text-red-400">•</span>
                      <span>{error.message}</span>
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
                  <span className="text-green-200 font-medium text-sm">Your story is ready to generate!</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Wizard Content */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-8">
            {renderStep()}
          </div>
        </div>

        {/* Help Section */}
        <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 mt-8">
          <div className="flex items-center justify-center space-x-6 text-white/70">
            <div className="flex items-center space-x-2">
              <span className="text-amber-400">💡</span>
              <span className="text-sm">Need help? Hover over any option for tips</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-400">🎯</span>
              <span className="text-sm">All steps are optional - create as you go</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-400">⚡</span>
              <span className="text-sm">Story generates in ~30 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryPage;