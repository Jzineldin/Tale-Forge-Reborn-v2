import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTemplateData } from '@/services/templateService';

interface BasicInfoStepProps {
  formData: CreateTemplateData;
  onUpdate: (data: Partial<CreateTemplateData>) => void;
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

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 Basic Template Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., Magical Forest Adventure"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Genre *</label>
            <Select value={formData.genre} onValueChange={(value) => onUpdate({ genre: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description *</label>
          <Textarea
            value={formData.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe what kind of stories this template will create..."
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Age Group *</label>
          <Select value={formData.age_group} onValueChange={(value) => onUpdate({ age_group: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select target age group" />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoStep;