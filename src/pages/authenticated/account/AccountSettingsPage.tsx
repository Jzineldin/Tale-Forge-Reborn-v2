import React, { useState } from 'react';
import { useSettings } from '@/providers/SettingsContext';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

const AccountSettingsPage: React.FC = () => {
  const { preferences, updatePreferences } = useSettings();
  const [formData, setFormData] = useState(preferences);

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [field]: value
      }
    });
  };

  const handleSave = () => {
    updatePreferences(formData);
    alert('Settings saved successfully!');
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <Text variant="h1" weight="bold" className="text-3xl mb-2">
          Account Settings
        </Text>
        <Text variant="p" color="secondary">
          Customize your experience and preferences
        </Text>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button className="px-6 py-4 font-medium text-sm text-indigo-600 border-b-2 border-indigo-600">
              Preferences
            </button>
            <button className="px-6 py-4 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Notifications
            </button>
            <button className="px-6 py-4 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Privacy
            </button>
            <button className="px-6 py-4 font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Accessibility
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          <div className="mb-8">
            <Text variant="h2" weight="semibold" className="text-xl mb-4">
              Reading Preferences
            </Text>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={formData.theme}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <select
                  value={formData.fontSize}
                  onChange={(e) => handleInputChange('fontSize', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reading Speed
                </label>
                <select
                  value={formData.readingSpeed}
                  onChange={(e) => handleInputChange('readingSpeed', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="slow">Slow</option>
                  <option value="medium">Medium</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="textToSpeech"
                  checked={formData.textToSpeech}
                  onChange={(e) => handleInputChange('textToSpeech', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="textToSpeech" className="ml-2 block text-sm text-gray-700">
                  Enable Text-to-Speech
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <Text variant="h2" weight="semibold" className="text-xl mb-4">
              Notification Preferences
            </Text>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="p" weight="semibold">
                    Email Notifications
                  </Text>
                  <Text variant="p" size="sm" color="secondary">
                    Receive updates via email
                  </Text>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.email}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="p" weight="semibold">
                    Push Notifications
                  </Text>
                  <Text variant="p" size="sm" color="secondary">
                    Receive notifications on your device
                  </Text>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.push}
                  onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="p" weight="semibold">
                    In-App Notifications
                  </Text>
                  <Text variant="p" size="sm" color="secondary">
                    Show notifications within the app
                  </Text>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.inApp}
                  onChange={(e) => handleNotificationChange('inApp', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;