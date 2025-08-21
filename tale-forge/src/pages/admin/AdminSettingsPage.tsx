import React, { useState } from 'react';
import Text from '@/components/atoms/Text';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  // Mock settings data
  const [settings, setSettings] = useState({
    siteName: 'Tale Forge',
    siteDescription: 'AI-powered interactive storytelling for children',
    supportEmail: 'support@taleforge.io',
    fromEmail: 'noreply@taleforge.io',
    maxStoriesPerUser: 50,
    maxStoryLength: 10000,
    defaultLanguage: 'en',
    enablePublicStories: true,
    enableCommunityFeatures: true,
    enableStorySharing: true,
    enableStoryExport: true,
    enableStoryImport: true,
    enableStoryCollaboration: false,
    enableStoryAnalytics: true,
    enableStoryComments: true,
    enableStoryRatings: true,
    enableStoryBookmarks: true
  });

  const handleSaveSettings = () => {
    console.log('Saving settings...', settings);
    // In a real app, this would make an API call
    alert('Settings saved successfully!');
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <Text variant="h1" weight="bold" className="text-3xl mb-2">
          Platform Settings
        </Text>
        <Text variant="p" color="secondary">
          Configure global platform behavior and features
        </Text>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === 'general'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === 'features'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === 'limits'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('limits')}
            >
              Limits
            </button>
            <button
              className={`px-6 py-4 font-medium text-sm ${
                activeTab === 'email'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('email')}
            >
              Email
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'general' && (
            <div>
              <Text variant="h2" weight="semibold" className="text-xl mb-6">
                General Settings
              </Text>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Input
                  label="Site Name"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                />
                <Input
                  label="Support Email"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Language
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={settings.defaultLanguage}
                  onChange={(e) => handleInputChange('defaultLanguage', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                </select>
              </div>
            </div>
          )}
          
          {activeTab === 'features' && (
            <div>
              <Text variant="h2" weight="semibold" className="text-xl mb-6">
                Feature Toggles
              </Text>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="p" weight="semibold">
                      Public Stories
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Allow users to publish stories publicly
                    </Text>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enablePublicStories}
                    onChange={(e) => handleInputChange('enablePublicStories', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="p" weight="semibold">
                      Community Features
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Enable community interactions and discussions
                    </Text>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableCommunityFeatures}
                    onChange={(e) => handleInputChange('enableCommunityFeatures', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="p" weight="semibold">
                      Story Sharing
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Allow users to share stories with others
                    </Text>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableStorySharing}
                    onChange={(e) => handleInputChange('enableStorySharing', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="p" weight="semibold">
                      Story Export
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Allow users to export their stories in various formats
                    </Text>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableStoryExport}
                    onChange={(e) => handleInputChange('enableStoryExport', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="p" weight="semibold">
                      Story Import
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Allow users to import stories from other formats
                    </Text>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableStoryImport}
                    onChange={(e) => handleInputChange('enableStoryImport', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="p" weight="semibold">
                      Story Collaboration
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Allow multiple users to collaborate on stories
                    </Text>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableStoryCollaboration}
                    onChange={(e) => handleInputChange('enableStoryCollaboration', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="p" weight="semibold">
                      Story Analytics
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Provide detailed analytics for story creators
                    </Text>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableStoryAnalytics}
                    onChange={(e) => handleInputChange('enableStoryAnalytics', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'limits' && (
            <div>
              <Text variant="h2" weight="semibold" className="text-xl mb-6">
                System Limits
              </Text>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Max Stories Per User"
                  type="number"
                  value={settings.maxStoriesPerUser}
                  onChange={(e) => handleInputChange('maxStoriesPerUser', parseInt(e.target.value))}
                />
                <Input
                  label="Max Story Length (characters)"
                  type="number"
                  value={settings.maxStoryLength}
                  onChange={(e) => handleInputChange('maxStoryLength', parseInt(e.target.value))}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'email' && (
            <div>
              <Text variant="h2" weight="semibold" className="text-xl mb-6">
                Email Configuration
              </Text>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="From Email Address"
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                />
                <Input
                  label="Support Email Address"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                />
              </div>
              
              <div className="mt-6">
                <Button variant="secondary" className="mr-2">
                  Test Email Configuration
                </Button>
                <Button variant="secondary">
                  Send Test Email
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Button variant="primary" onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;