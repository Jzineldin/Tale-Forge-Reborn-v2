import React from 'react';
import { X, Type } from 'lucide-react';

interface StorySettingsPanelProps {
  fontSize: string;
  onFontSizeChange: (size: string) => void;
  onClose: () => void;
}

const StorySettingsPanel: React.FC<StorySettingsPanelProps> = ({
  fontSize,
  onFontSizeChange,
  onClose
}) => {
  const fontSizes = [
    { value: 'small', label: 'Small', class: 'text-lg' },
    { value: 'medium', label: 'Medium', class: 'text-xl' },
    { value: 'large', label: 'Large', class: 'text-2xl' },
    { value: 'xl', label: 'Extra Large', class: 'text-3xl' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-purple-400" />
            <h3 className="text-white text-lg font-semibold">Reading Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-white font-medium mb-3">Font Size</h4>
            <div className="grid grid-cols-2 gap-2">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => onFontSizeChange(size.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    fontSize === size.value
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <div className={`${size.class} font-medium`}>Aa</div>
                  <div className="text-xs mt-1">{size.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorySettingsPanel;