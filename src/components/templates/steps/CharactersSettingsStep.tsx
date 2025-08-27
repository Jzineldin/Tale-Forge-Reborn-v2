import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { CreateTemplateData } from '@/services/templateService';

interface CharactersSettingsStepProps {
  formData: CreateTemplateData;
  onUpdate: (data: Partial<CreateTemplateData>) => void;
}

const CharactersSettingsStep: React.FC<CharactersSettingsStepProps> = ({ formData, onUpdate }) => {
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '' });
  const [newSetting, setNewSetting] = useState({ name: '', description: '' });

  const addCharacter = () => {
    if (newCharacter.name && newCharacter.description) {
      onUpdate({
        characters: [...formData.characters, newCharacter]
      });
      setNewCharacter({ name: '', description: '' });
    }
  };

  const removeCharacter = (index: number) => {
    onUpdate({
      characters: formData.characters.filter((_, i) => i !== index)
    });
  };

  const addSetting = () => {
    if (newSetting.name && newSetting.description) {
      onUpdate({
        settings: [...formData.settings, newSetting]
      });
      setNewSetting({ name: '', description: '' });
    }
  };

  const removeSetting = (index: number) => {
    onUpdate({
      settings: formData.settings.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Characters Section */}
      <Card>
        <CardHeader>
          <CardTitle>👥 Characters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Character Name</label>
              <Input
                value={newCharacter.name}
                onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Brave Knight"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Character Description</label>
              <Input
                value={newCharacter.description}
                onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., A courageous warrior with a golden heart"
              />
            </div>
          </div>
          <Button onClick={addCharacter} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Character
          </Button>

          {formData.characters.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Added Characters:</label>
              <div className="space-y-2">
                {formData.characters.map((character, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div>
                      <div className="font-medium">{character.name}</div>
                      <div className="text-sm text-muted-foreground">{character.description}</div>
                    </div>
                    <Button
                      onClick={() => removeCharacter(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>🏞️ Settings & Locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Setting Name</label>
              <Input
                value={newSetting.name}
                onChange={(e) => setNewSetting(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Enchanted Forest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Setting Description</label>
              <Input
                value={newSetting.description}
                onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., A mystical woodland filled with talking animals"
              />
            </div>
          </div>
          <Button onClick={addSetting} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Setting
          </Button>

          {formData.settings.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Added Settings:</label>
              <div className="space-y-2">
                {formData.settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div>
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <Button
                      onClick={() => removeSetting(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CharactersSettingsStep;