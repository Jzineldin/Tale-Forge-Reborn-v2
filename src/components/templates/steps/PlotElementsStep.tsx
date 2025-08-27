import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { CreateTemplateData } from '@/services/templateService';

interface PlotElementsStepProps {
  formData: CreateTemplateData;
  onUpdate: (data: Partial<CreateTemplateData>) => void;
}

const PlotElementsStep: React.FC<PlotElementsStepProps> = ({ formData, onUpdate }) => {
  const [newElement, setNewElement] = useState('');
  const [newTag, setNewTag] = useState('');

  const addKeyElement = () => {
    if (newElement) {
      const element = { element: newElement, description: newElement };
      onUpdate({
        plot_elements: [...formData.plot_elements, element]
      });
      setNewElement('');
    }
  };

  const removeKeyElement = (elementToRemove: string) => {
    onUpdate({
      plot_elements: formData.plot_elements.filter(el => el.element !== elementToRemove)
    });
  };

  const addTag = () => {
    if (newTag && !(formData.tags || []).includes(newTag)) {
      onUpdate({
        tags: [...(formData.tags || []), newTag]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onUpdate({
      tags: (formData.tags || []).filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-6">
      {/* Plot Elements Section */}
      <Card>
        <CardHeader>
          <CardTitle>🎭 Key Plot Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Define the core elements that will drive your story template
          </p>

          <div className="flex gap-2">
            <Input
              value={newElement}
              onChange={(e) => setNewElement(e.target.value)}
              placeholder="e.g., Ancient treasure, Magic spell, Hidden door..."
              onKeyPress={(e) => e.key === 'Enter' && addKeyElement()}
            />
            <Button onClick={addKeyElement} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.plot_elements.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Plot Elements:</label>
              <div className="flex flex-wrap gap-2">
                {formData.plot_elements.map((element, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {element.element}
                    <button
                      onClick={() => removeKeyElement(element.element)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card>
        <CardHeader>
          <CardTitle>🏷️ Template Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add tags to help users discover your template
          </p>

          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g., magic, adventure, friendship..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button onClick={addTag} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {(formData.tags || []).length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags:</label>
              <div className="flex flex-wrap gap-2">
                {(formData.tags || []).map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlotElementsStep;