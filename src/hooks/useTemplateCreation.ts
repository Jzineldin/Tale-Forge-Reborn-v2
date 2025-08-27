import { useState } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { templateService, CreateTemplateData } from '@/services/templateService';
import { toast } from 'react-hot-toast';

export interface UseTemplateCreationOptions {
  onComplete?: (templateId: string) => void;
}

export interface UseTemplateCreationReturn {
  formData: CreateTemplateData;
  setFormData: (data: CreateTemplateData | ((prev: CreateTemplateData) => CreateTemplateData)) => void;
  step: number;
  setStep: (step: number) => void;
  loading: boolean;
  canCreateTemplate: boolean;
  canMakePublic: boolean;
  userTier: string;
  submitTemplate: () => Promise<void>;
  isStepValid: (stepNumber: number) => boolean;
  progress: number;
}

const subscriptionLimits = {
  free: { templates: 0, public: 0 },
  creator: { templates: 10, public: 3 },
  master: { templates: 50, public: 15 }
};

export const useTemplateCreation = ({ onComplete }: UseTemplateCreationOptions): UseTemplateCreationReturn => {
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateTemplateData>({
    title: '',
    description: '',
    genre: '',
    age_group: '',
    characters: [],
    settings: [],
    plot_elements: [],
    tags: [],
    style_preferences: {
      narrative_style: 'third_person',
      tone: 'adventurous',
      pacing: 'medium'
    },
    is_public: false
  });

  const userTier = userProfile?.subscription_tier || 'free';
  const limits = subscriptionLimits[userTier as keyof typeof subscriptionLimits];

  const canCreateTemplate = userTier !== 'free';
  const canMakePublic = formData.is_public ? 
    (userProfile?.public_templates_count || 0) < limits.public : 
    true;

  const submitTemplate = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to create templates');
      return;
    }

    if (!canCreateTemplate) {
      toast.error('Upgrade your subscription to create templates');
      return;
    }

    setLoading(true);
    try {
      const template = await templateService.createTemplate(user.id, formData);
      toast.success('Template created successfully!');
      onComplete?.(template.id);
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.title && formData.description && formData.genre && formData.age_group);
      case 2:
        return formData.characters.length > 0 && formData.settings.length > 0;
      case 3:
        return formData.plot_elements.length > 0;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const progress = (step / 4) * 100;

  return {
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
  };
};