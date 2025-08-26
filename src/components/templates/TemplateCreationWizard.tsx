import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Globe, 
  Lock, 
  Plus, 
  X, 
  Info,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../providers/AuthContext';
import { templateService, CreateTemplateData } from '../../services/templateService';
import { toast } from 'react-hot-toast';

interface TemplateCreationWizardProps {
  onComplete?: (templateId: string) => void;
  onCancel?: () => void;
}

const genres = [
  'Adventure', 'Fantasy', 'Mystery', 'Science Fiction', 'Fairy Tale',
  'Friendship', 'Family', 'Educational', 'Comedy', 'Drama',
  'Historical', 'Animal Stories', 'Superhero', 'Space', 'Underwater'
];

const ageGroups = [
  { value: '3-5', label: '3-5 years (Preschool)' },
  { value: '6-8', label: '6-8 years (Early Elementary)' },
  { value: '9-12', label: '9-12 years (Middle Elementary)' },
  { value: '13+', label: '13+ years (Teen/Adult)' }
];

const subscriptionLimits = {
  free: { templates: 0, public: 0 },
  creator: { templates: 10, public: 3 },
  master: { templates: 50, public: 15 }
};

export const TemplateCreationWizard: React.FC<TemplateCreationWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const { user, userProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateTemplateData>({
    title: '',
    description: '',
    genre: '',
    age_group: '6-8',
    characters: [],
    settings: [],
    plot_elements: [],
    story_hooks: [],
    estimated_chapters: 3,
    estimated_word_count: 1500,
    tags: [],
    is_public: false
  });

  const [newTag, setNewTag] = useState('');
  const [newElement, setNewElement] = useState('');

  const userTier = userProfile?.subscription_tier || 'free';
  const limits = subscriptionLimits[userTier as keyof typeof subscriptionLimits];
  
  const canCreateTemplate = userTier !== 'free';
  const canMakePublic = formData.is_public ? 
    (userProfile?.templates_public_count || 0) < limits.public : 
    true;

  const addTag = () => {
    if (newTag && !(formData.tags || []).includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyElement = () => {
    if (newElement) {
      const element = { element: newElement, description: newElement };
      setFormData(prev => ({
        ...prev,
        plot_elements: [...prev.plot_elements, element]
      }));
      setNewElement('');
    }
  };

  const removeKeyElement = (elementToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      plot_elements: prev.plot_elements.filter(el => el.element !== elementToRemove)
    }));
  };

  const handleSubmit = async () => {
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

  if (!canCreateTemplate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Template Creation Locked
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                Template creation is available for Creator and Master subscribers only.
                Upgrade your subscription to create and share your own story templates!
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Template Creation Benefits:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create custom story templates</li>
              <li>• Share with the community</li>
              <li>• Earn credits when others use your templates</li>
              <li>• Get featured in weekly rotations</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button>Upgrade Subscription</Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create Story Template</h2>
          <Badge variant="outline">
            Step {step} of 4
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Characters & Settings'}
            {step === 3 && 'Plot Elements & Story Hooks'}
            {step === 4 && 'Settings & Publishing'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Template Title *
                </label>
                <Input
                  placeholder="e.g., 'Magical Forest Adventure'"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <Textarea
                  placeholder="Describe what kind of stories this template helps create..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Genre *
                  </label>
                  <Select value={formData.genre} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, genre: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Age Group *
                  </label>
                  <Select value={formData.age_group} onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, age_group: value as '3-5' | '6-8' | '9-12' | '13+' }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageGroups.map(group => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Characters & Settings */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Characters *
                </label>
                <div className="space-y-2">
                  {formData.characters.map((char, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 border rounded">
                      <div className="flex-1">
                        <strong>{char.name}</strong>: {char.description}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            characters: prev.characters.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const name = prompt('Character name:');
                      const description = prompt('Character description:');
                      if (name && description) {
                        setFormData(prev => ({
                          ...prev,
                          characters: [...prev.characters, { name, description }]
                        }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Character
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Settings *
                </label>
                <div className="space-y-2">
                  {formData.settings.map((setting, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 border rounded">
                      <div className="flex-1">
                        <strong>{setting.name}</strong>: {setting.description}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            settings: prev.settings.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const name = prompt('Setting name:');
                      const description = prompt('Setting description:');
                      if (name && description) {
                        setFormData(prev => ({
                          ...prev,
                          settings: [...prev.settings, { name, description }]
                        }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Setting
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Plot Elements & Story Hooks */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Plot Elements *
                </label>
                <div className="space-y-2">
                  {formData.plot_elements.map((element, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 border rounded">
                      <div className="flex-1">
                        <strong>{element.element}</strong>: {element.description}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            plot_elements: prev.plot_elements.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const element = prompt('Plot element:');
                      const description = prompt('Element description:');
                      if (element && description) {
                        setFormData(prev => ({
                          ...prev,
                          plot_elements: [...prev.plot_elements, { element, description }]
                        }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Plot Element
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Story Hooks (Optional)
                </label>
                <div className="space-y-2">
                  {formData.story_hooks.map((hook, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 border rounded">
                      <div className="flex-1">
                        <strong>{hook.hook}</strong>: {hook.description}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            story_hooks: prev.story_hooks.filter((_, i) => i !== index)
                          }));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const hook = prompt('Story hook:');
                      const description = prompt('Hook description:');
                      if (hook && description) {
                        setFormData(prev => ({
                          ...prev,
                          story_hooks: [...prev.story_hooks, { hook, description }]
                        }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Story Hook
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Estimated Chapters
                </label>
                <Select 
                  value={(formData.estimated_chapters || 3).toString()} 
                  onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, estimated_chapters: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} chapter{num !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Settings & Publishing */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quick Plot Elements (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add story element (e.g., 'magic wand', 'friendly dragon')"
                    value={newElement}
                    onChange={(e) => setNewElement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addKeyElement()}
                  />
                  <Button type="button" onClick={addKeyElement} disabled={!newElement}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.plot_elements.map(element => (
                    <Badge key={element.element} variant="secondary" className="flex items-center gap-1">
                      {element.element}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeKeyElement(element.element)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add tag (e.g., 'adventure', 'friendship')"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} disabled={!newTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map(tag => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public-template"
                      checked={formData.is_public}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                      disabled={!canMakePublic}
                    />
                    <label htmlFor="public-template" className="flex items-center gap-2 text-sm font-medium">
                      <Globe className="w-4 h-4" />
                      Make template public
                    </label>
                  </div>
                </div>
                
                {formData.is_public && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-800">
                        Public templates can be used by other users and may be featured in weekly rotations. 
                        You'll earn credits when others use your template!
                      </div>
                    </div>
                  </div>
                )}
                
                {!canMakePublic && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        You've reached your public template limit ({limits.public}). 
                        Upgrade to share more templates with the community.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Previous
            </Button>
          )}
          
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {step < 4 ? (
            <Button 
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid(step) || loading}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={loading || !isStepValid(step)}
            >
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};