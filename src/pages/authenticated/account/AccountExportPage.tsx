import React, { useState } from 'react';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

const AccountExportPage: React.FC = () => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportScope, setExportScope] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      alert(`Exported ${exportScope === 'all' ? 'all stories' : 'selected stories'} as ${exportFormat.toUpperCase()} successfully!`);
    }, 2000);
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <Text variant="h1" weight="bold" className="text-3xl mb-2">
          Export & Share
        </Text>
        <Text variant="p" color="secondary">
          Download your stories and share them with others
        </Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <Text variant="h2" weight="semibold" className="text-xl">
                Export Stories
              </Text>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Export Format
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { id: 'pdf', name: 'PDF', icon: '📄' },
                    { id: 'epub', name: 'EPUB', icon: '📚' },
                    { id: 'txt', name: 'Text', icon: '📝' },
                    { id: 'html', name: 'HTML', icon: '🌐' }
                  ].map((format) => (
                    <button
                      key={format.id}
                      className={`py-3 px-4 rounded-md border flex flex-col items-center ${
                        exportFormat === format.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setExportFormat(format.id)}
                    >
                      <span className="text-2xl mb-1">{format.icon}</span>
                      <span className="text-sm">{format.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Export Scope
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className={`py-3 px-4 rounded-md border ${
                      exportScope === 'all'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setExportScope('all')}
                  >
                    <Text variant="p" weight="semibold" className="mb-1">
                      All Stories
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      12 stories
                    </Text>
                  </button>
                  
                  <button
                    className={`py-3 px-4 rounded-md border ${
                      exportScope === 'published'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setExportScope('published')}
                  >
                    <Text variant="p" weight="semibold" className="mb-1">
                      Published Only
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      8 stories
                    </Text>
                  </button>
                  
                  <button
                    className={`py-3 px-4 rounded-md border ${
                      exportScope === 'selected'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setExportScope('selected')}
                  >
                    <Text variant="p" weight="semibold" className="mb-1">
                      Select Stories
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Choose individually
                    </Text>
                  </button>
                </div>
              </div>
              
              {exportScope === 'selected' && (
                <div className="mb-6 p-4 border border-gray-200 rounded-md">
                  <Text variant="h3" weight="semibold" className="mb-3">
                    Select Stories to Export
                  </Text>
                  <div className="space-y-2">
                    {[
                      'The Magic Forest Adventure',
                      'Space Explorer',
                      'The Lost Treasure',
                      'The Mystery of the Missing Cookies',
                      'The Dragon Who Lost His Fire'
                    ].map((story, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`story-${index}`}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`story-${index}`} className="ml-2 block text-sm text-gray-700">
                          {story}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                variant="primary" 
                className="w-full md:w-auto"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </span>
                ) : (
                  `Export as ${exportFormat.toUpperCase()}`
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <Text variant="h2" weight="semibold" className="text-xl">
                Share Stories
              </Text>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-3xl mb-3">🔗</div>
                  <Text variant="h3" weight="semibold" className="mb-2">
                    Share Link
                  </Text>
                  <Text variant="p" color="secondary" className="mb-3">
                    Generate a link to share your story with others
                  </Text>
                  <Button variant="secondary" size="small">
                    Create Link
                  </Button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-3xl mb-3">📧</div>
                  <Text variant="h3" weight="semibold" className="mb-2">
                    Email Story
                  </Text>
                  <Text variant="p" color="secondary" className="mb-3">
                    Send your story directly to friends and family
                  </Text>
                  <Button variant="secondary" size="small">
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <Text variant="h2" weight="semibold" className="text-xl">
                Export History
              </Text>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <Text variant="p" weight="semibold">
                      All Stories (PDF)
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Aug 15, 2025
                    </Text>
                  </div>
                  <Button variant="secondary" size="small">
                    Download
                  </Button>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <Text variant="p" weight="semibold">
                      Published Stories (EPUB)
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Aug 10, 2025
                    </Text>
                  </div>
                  <Button variant="secondary" size="small">
                    Download
                  </Button>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <Text variant="p" weight="semibold">
                      The Magic Forest (PDF)
                    </Text>
                    <Text variant="p" size="sm" color="secondary">
                      Aug 5, 2025
                    </Text>
                  </div>
                  <Button variant="secondary" size="small">
                    Download
                  </Button>
                </div>
              </div>
              
              <Button variant="secondary" className="w-full mt-4">
                View All Exports
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <Text variant="h2" weight="semibold" className="text-xl">
                Export Your Stories
              </Text>
            </div>
            
            <div className="p-6">
              <Text variant="p" color="secondary" className="mb-4">
                Export your stories to read offline or share with others. Choose from multiple formats to suit your needs.
              </Text>
              <Text variant="p" color="secondary">
                Note: Exported stories retain all interactive elements when possible.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountExportPage;