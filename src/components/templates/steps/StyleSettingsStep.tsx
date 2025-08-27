import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Lock, Info } from 'lucide-react';
import { CreateTemplateData } from '@/services/templateService';

interface StyleSettingsStepProps {
  formData: CreateTemplateData;
  onUpdate: (data: Partial<CreateTemplateData>) => void;
  canMakePublic: boolean;
  userTier: string;
}

const StyleSettingsStep: React.FC<StyleSettingsStepProps> = ({
  formData,
  onUpdate,
  canMakePublic,
  userTier
}) => {
  return (
    <div className="space-y-6">
      {/* Style Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Style & Tone Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Narrative Style</label>
              <Select
                value={formData.style_preferences?.narrative_style || 'third_person'}
                onValueChange={(value) => onUpdate({
                  style_preferences: {
                    ...formData.style_preferences,
                    narrative_style: value as 'first_person' | 'third_person'
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_person">First Person ("I went...")</SelectItem>
                  <SelectItem value="third_person">Third Person ("They went...")</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Story Tone</label>
              <Select
                value={formData.style_preferences?.tone || 'adventurous'}
                onValueChange={(value) => onUpdate({
                  style_preferences: {
                    ...formData.style_preferences,
                    tone: value as 'adventurous' | 'whimsical' | 'mysterious' | 'educational' | 'heartwarming'
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adventurous">Adventurous</SelectItem>
                  <SelectItem value="whimsical">Whimsical</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="heartwarming">Heartwarming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Story Pacing</label>
              <Select
                value={formData.style_preferences?.pacing || 'medium'}
                onValueChange={(value) => onUpdate({
                  style_preferences: {
                    ...formData.style_preferences,
                    pacing: value as 'slow' | 'medium' | 'fast'
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow & Detailed</SelectItem>
                  <SelectItem value="medium">Medium Pace</SelectItem>
                  <SelectItem value="fast">Fast & Action-Packed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle>🌍 Visibility & Sharing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div>
                <div className="flex items-center gap-2">
                  {formData.is_public ? (
                    <Globe className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-600" />
                  )}
                  <label className="text-sm font-medium">
                    Make Template Public
                  </label>
                  {userTier !== 'free' && (
                    <Badge variant="secondary" className="text-xs">
                      {userTier.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.is_public 
                    ? 'Other users can discover and use your template'
                    : 'Template will be private to your account only'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => onUpdate({ is_public: checked && canMakePublic })}
              disabled={!canMakePublic}
            />
          </div>

          {!canMakePublic && formData.is_public && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  You've reached your public template limit. 
                  Upgrade your subscription to make more templates public.
                </div>
              </div>
            </div>
          )}

          {userTier === 'free' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium mb-1">Public templates require a subscription</div>
                  <div>
                    Upgrade to Creator or Master to share your templates with the community and 
                    help other storytellers create amazing adventures!
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StyleSettingsStep;