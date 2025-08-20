// Story Creation Validation Utilities
export interface StoryValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length';
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  traits: string[];
}

export interface StoryData {
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

// Step validation functions
export const validateStep1 = (storyData: StoryData): StoryValidationError[] => {
  const errors: StoryValidationError[] = [];

  if (!storyData.ageGroup) {
    errors.push({
      field: 'ageGroup',
      message: 'Please select an age group for your story',
      type: 'required'
    });
  }

  if (!storyData.genre) {
    errors.push({
      field: 'genre',
      message: 'Please choose a story genre',
      type: 'required'
    });
  }

  // Optional: Child name length validation
  if (storyData.childName && storyData.childName.length > 50) {
    errors.push({
      field: 'childName',
      message: 'Child name should be shorter than 50 characters',
      type: 'length'
    });
  }

  // Optional: Theme validation
  if (storyData.theme && storyData.theme.length > 200) {
    errors.push({
      field: 'theme',
      message: 'Story theme should be shorter than 200 characters',
      type: 'length'
    });
  }

  return errors;
};

export const validateStep2 = (storyData: StoryData): StoryValidationError[] => {
  const errors: StoryValidationError[] = [];

  // Characters are optional, but validate if provided
  storyData.characters.forEach((character, index) => {
    if (!character.name) {
      errors.push({
        field: `character_${index}_name`,
        message: `Character ${index + 1} needs a name`,
        type: 'required'
      });
    }

    if (!character.role) {
      errors.push({
        field: `character_${index}_role`,
        message: `Character ${index + 1} needs a role`,
        type: 'required'
      });
    }

    if (character.name && character.name.length > 50) {
      errors.push({
        field: `character_${index}_name`,
        message: `Character name should be shorter than 50 characters`,
        type: 'length'
      });
    }

    if (character.description && character.description.length > 500) {
      errors.push({
        field: `character_${index}_description`,
        message: `Character description should be shorter than 500 characters`,
        type: 'length'
      });
    }

    if (character.traits.length > 10) {
      errors.push({
        field: `character_${index}_traits`,
        message: `Character should have no more than 10 traits`,
        type: 'length'
      });
    }
  });

  return errors;
};

export const validateStep3 = (storyData: StoryData): StoryValidationError[] => {
  const errors: StoryValidationError[] = [];

  if (!storyData.location) {
    errors.push({
      field: 'location',
      message: 'Please select or enter a story location',
      type: 'required'
    });
  }

  if (!storyData.timePeriod) {
    errors.push({
      field: 'timePeriod',
      message: 'Please select a time period for your story',
      type: 'required'
    });
  }

  if (!storyData.atmosphere) {
    errors.push({
      field: 'atmosphere',
      message: 'Please select the story atmosphere',
      type: 'required'
    });
  }

  return errors;
};

export const validateStep4 = (storyData: StoryData): StoryValidationError[] => {
  const errors: StoryValidationError[] = [];

  if (!storyData.conflict) {
    errors.push({
      field: 'conflict',
      message: 'Please select a conflict type for your story',
      type: 'required'
    });
  }

  if (!storyData.quest) {
    errors.push({
      field: 'quest',
      message: 'Please select a quest or goal for your story',
      type: 'required'
    });
  }

  return errors;
};

export const validateStep5 = (storyData: StoryData): StoryValidationError[] => {
  const errors: StoryValidationError[] = [];
  
  // Final validation - ensure all required steps are complete
  const step1Errors = validateStep1(storyData);
  const step3Errors = validateStep3(storyData);
  const step4Errors = validateStep4(storyData);

  return [...step1Errors, ...step3Errors, ...step4Errors];
};

// Complete story validation
export const validateCompleteStory = (storyData: StoryData): StoryValidationError[] => {
  const errors: StoryValidationError[] = [];

  // Combine all step validations
  errors.push(...validateStep1(storyData));
  errors.push(...validateStep2(storyData));
  errors.push(...validateStep3(storyData));
  errors.push(...validateStep4(storyData));

  return errors;
};

// Helper functions
export const hasValidationErrors = (errors: StoryValidationError[]): boolean => {
  return errors.length > 0;
};

export const getErrorsForField = (errors: StoryValidationError[], field: string): StoryValidationError[] => {
  return errors.filter(error => error.field === field);
};

export const getStepValidationMessage = (stepNumber: number, errors: StoryValidationError[]): string => {
  if (!hasValidationErrors(errors)) {
    return '✅ Step completed successfully!';
  }

  const requiredErrors = errors.filter(e => e.type === 'required').length;
  const formatErrors = errors.filter(e => e.type === 'format').length;
  const lengthErrors = errors.filter(e => e.type === 'length').length;

  let message = '⚠️ Please fix the following issues:';
  if (requiredErrors > 0) {
    message += ` ${requiredErrors} required field${requiredErrors > 1 ? 's' : ''}`;
  }
  if (formatErrors > 0) {
    message += requiredErrors > 0 ? ', ' : ' ';
    message += `${formatErrors} format error${formatErrors > 1 ? 's' : ''}`;
  }
  if (lengthErrors > 0) {
    message += (requiredErrors > 0 || formatErrors > 0) ? ', ' : ' ';
    message += `${lengthErrors} length issue${lengthErrors > 1 ? 's' : ''}`;
  }

  return message;
};

// Progress calculation
export const calculateStoryProgress = (storyData: StoryData): number => {
  let completedFields = 0;
  const totalRequiredFields = 6; // ageGroup, genre, location, timePeriod, atmosphere, conflict, quest

  if (storyData.ageGroup) completedFields++;
  if (storyData.genre) completedFields++;
  if (storyData.location) completedFields++;
  if (storyData.timePeriod) completedFields++;
  if (storyData.atmosphere) completedFields++;
  if (storyData.conflict) completedFields++;
  if (storyData.quest) completedFields++;

  return Math.round((completedFields / totalRequiredFields) * 100);
};

// Story readiness check
export const isStoryReadyForGeneration = (storyData: StoryData): boolean => {
  const errors = validateCompleteStory(storyData);
  const requiredErrors = errors.filter(e => e.type === 'required');
  return requiredErrors.length === 0;
};