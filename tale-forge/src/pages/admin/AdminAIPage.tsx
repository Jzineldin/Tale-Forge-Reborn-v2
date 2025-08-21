import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import { useAuth } from '@/providers/AuthContext';
import { supabase } from '@/lib/supabase';

interface AIModel {
  id: string;
  name: string;
  provider: 'ovh' | 'openai' | 'anthropic';
  type: 'text' | 'image' | 'audio';
  costPerToken: number;
  isActive: boolean;
  description: string;
  maxTokens: number;
  contextWindow: number;
}

interface AIPrompt {
  id: string;
  name: string;
  type: 'story_generation' | 'chapter_creation' | 'ending_generation' | 'character_creation';
  prompt: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AIStats {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  costToday: number;
  costThisMonth: number;
  tokensUsedToday: number;
  tokensUsedMonth: number;
  mostUsedPrompt: string;
}

const AdminAIPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'models' | 'prompts' | 'stats' | 'settings'>('models');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // AI Models State
  const [aiModels, setAiModels] = useState<AIModel[]>([
    {
      id: 'llama-3.3-70b',
      name: 'Meta-Llama-3_3-70B-Instruct',
      provider: 'ovh',
      type: 'text',
      costPerToken: 0, // FREE for you!
      isActive: true,
      description: 'Premium 70B parameter model for superior story generation, character development, and complex narratives',
      maxTokens: 4096,
      contextWindow: 131072
    },
    {
      id: 'stable-diffusion-xl',
      name: 'Stable Diffusion XL',
      provider: 'ovh',
      type: 'image',
      costPerToken: 0, // FREE
      isActive: true,
      description: 'High-quality image generation for story illustrations',
      maxTokens: 1024,
      contextWindow: 77
    },
    {
      id: 'eleven-turbo-v2-5',
      name: 'ElevenLabs Turbo v2.5',
      provider: 'elevenlabs',
      type: 'audio',
      costPerToken: 0.0002, // $0.30 per 1K chars
      isActive: true,
      description: '🏆 Premium TTS with natural voices, emotion, and perfect pronunciation for storytelling',
      maxTokens: 5000,
      contextWindow: 5000
    },
    {
      id: 'nvr-tts-en-us',
      name: 'NVIDIA TTS English US',
      provider: 'ovh',
      type: 'audio',
      costPerToken: 0, // FREE
      isActive: false,
      description: 'Basic text-to-speech for story narration (backup option)',
      maxTokens: 5000,
      contextWindow: 5000
    }
  ]);

  // AI Prompts State
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([
    {
      id: 'story-generation-v1',
      name: 'Story Generation Master Prompt',
      type: 'story_generation',
      prompt: `You are a master storyteller creating personalized children's stories. 

Create an engaging story with these details:
- Child's name: {childName}
- Age group: {ageGroup}
- Genre: {genre}  
- Theme: {theme}
- Characters: {characters}
- Setting: {setting}
- Moral lesson: {moralLesson}

The story should be:
- Age-appropriate with simple vocabulary for younger children
- Interactive with meaningful choices
- Educational with positive values
- Engaging with vivid descriptions
- Safe and wholesome content

Generate the opening chapter (200-300 words) ending with 3 choices for what happens next.`,
      variables: ['childName', 'ageGroup', 'genre', 'theme', 'characters', 'setting', 'moralLesson'],
      isActive: true,
      createdAt: '2025-08-20T00:00:00Z',
      updatedAt: '2025-08-20T00:00:00Z'
    },
    {
      id: 'chapter-creation-v1',
      name: 'Chapter Continuation Prompt',
      type: 'chapter_creation',
      prompt: `Continue the ongoing story with this new chapter.

Previous story context:
{previousChapters}

User's choice: {selectedChoice}
Characters: {characters}
Setting: {setting}
Story tone: {atmosphere}

Create the next chapter (200-300 words) that:
- Builds naturally from the user's choice
- Maintains character consistency
- Advances the plot meaningfully
- Ends with 3 new interesting choices
- Keeps age-appropriate content for {ageGroup}`,
      variables: ['previousChapters', 'selectedChoice', 'characters', 'setting', 'atmosphere', 'ageGroup'],
      isActive: true,
      createdAt: '2025-08-20T00:00:00Z',
      updatedAt: '2025-08-20T00:00:00Z'
    }
  ]);

  // AI Stats State
  const [aiStats, setAiStats] = useState<AIStats>({
    totalRequests: 1247,
    successRate: 98.7,
    avgResponseTime: 2.3,
    costToday: 0.00,
    costThisMonth: 0.00,
    tokensUsedToday: 125000,
    tokensUsedMonth: 2450000,
    mostUsedPrompt: 'Story Generation Master Prompt'
  });

  // AI Settings State
  const [aiSettings, setAiSettings] = useState({
    maxTokensPerRequest: 4096,
    temperature: 0.7,
    topP: 0.9,
    presencePenalty: 0.1,
    frequencyPenalty: 0.1,
    rateLimitPerUser: 10,
    rateLimitWindow: 60, // minutes
    enableFallbackModel: true,
    logAllRequests: true,
    autoRetryOnError: true,
    maxRetries: 3
  });

  useEffect(() => {
    // Load AI configuration from database
    loadAIConfiguration();
  }, []);

  const loadAIConfiguration = async () => {
    try {
      setLoading(true);
      // In real implementation, load from Supabase
      // const { data: models } = await supabase.from('ai_models').select('*');
      // const { data: prompts } = await supabase.from('ai_prompts').select('*');
      // setAiModels(models || []);
      // setAiPrompts(prompts || []);
      
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Error loading AI configuration:', error);
      setLoading(false);
    }
  };

  const handleToggleModel = async (modelId: string) => {
    try {
      setSaving(true);
      setAiModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, isActive: !model.isActive }
          : model
      ));
      
      // Save to database
      // await supabase.from('ai_models').update({ isActive: !isActive }).eq('id', modelId);
      
      console.log(`✅ Model ${modelId} status updated`);
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Error updating model:', error);
      setSaving(false);
    }
  };

  const handleSavePrompt = async (prompt: AIPrompt) => {
    try {
      setSaving(true);
      
      // Update local state
      setAiPrompts(prev => prev.map(p => p.id === prompt.id ? { ...prompt, updatedAt: new Date().toISOString() } : p));
      
      // Save to database
      // await supabase.from('ai_prompts').upsert(prompt);
      
      console.log(`✅ Prompt ${prompt.name} saved successfully`);
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Error saving prompt:', error);
      setSaving(false);
    }
  };

  const handleTestPrompt = async (prompt: AIPrompt) => {
    try {
      console.log(`🧪 Testing prompt: ${prompt.name}`);
      
      // Mock test data
      const testData = {
        childName: 'Emma',
        ageGroup: '5-7 years',
        genre: 'Adventure',
        theme: 'Friendship',
        characters: 'Emma the brave explorer, Max the talking dog',
        setting: 'Enchanted forest',
        moralLesson: 'The importance of helping others'
      };

      // In real implementation, call AI API
      alert(`Testing prompt with sample data:\n${JSON.stringify(testData, null, 2)}`);
    } catch (error) {
      console.error('Error testing prompt:', error);
    }
  };

  const renderModelsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiModels.map((model) => (
          <div key={model.id} className="glass-enhanced p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Icon 
                  name={model.type === 'text' ? 'document-text' : model.type === 'image' ? 'photo' : 'microphone'} 
                  size={24} 
                  className={`${model.isActive ? 'text-green-400' : 'text-gray-400'}`}
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                  <p className="text-sm text-white/60">{model.provider.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleModel(model.id)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  model.isActive ? 'bg-green-500' : 'bg-gray-600'
                }`}
                disabled={saving}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  model.isActive ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            
            <p className="text-white/80 text-sm mb-4">{model.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Type:</span>
                <span className="text-white font-medium">{model.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Cost/Token:</span>
                <span className="text-white font-medium">
                  {model.costPerToken === 0 ? 'FREE' : `€${model.costPerToken.toFixed(8)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Max Tokens:</span>
                <span className="text-white font-medium">{model.maxTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Context:</span>
                <span className="text-white font-medium">{model.contextWindow.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPromptsTab = () => (
    <div className="space-y-6">
      {aiPrompts.map((prompt) => (
        <div key={prompt.id} className="glass-enhanced p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{prompt.name}</h3>
              <p className="text-sm text-white/60">{prompt.type.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleTestPrompt(prompt)}
                variant="secondary"
                size="sm"
                className="text-sm"
              >
                🧪 Test
              </Button>
              <button
                onClick={() => handleToggleModel(prompt.id)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  prompt.isActive ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  prompt.isActive ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="text-white/80 text-sm font-medium mb-2 block">Prompt Template:</label>
            <textarea
              value={prompt.prompt}
              onChange={(e) => {
                const updatedPrompt = { ...prompt, prompt: e.target.value };
                setAiPrompts(prev => prev.map(p => p.id === prompt.id ? updatedPrompt : p));
              }}
              className="w-full h-32 bg-black/30 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 text-sm font-mono"
              placeholder="Enter your prompt template..."
            />
          </div>
          
          <div className="mb-4">
            <label className="text-white/80 text-sm font-medium mb-2 block">Variables:</label>
            <div className="flex flex-wrap gap-2">
              {prompt.variables.map((variable) => (
                <span
                  key={variable}
                  className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              onClick={() => handleSavePrompt(prompt)}
              variant="primary"
              size="sm"
              disabled={saving}
              className="text-sm"
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStatsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-enhanced p-6 rounded-xl text-center">
        <Icon name="chart-bar" size={32} className="text-blue-400 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-white">{aiStats.totalRequests.toLocaleString()}</h3>
        <p className="text-white/60">Total Requests</p>
      </div>
      
      <div className="glass-enhanced p-6 rounded-xl text-center">
        <Icon name="check-circle" size={32} className="text-green-400 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-white">{aiStats.successRate}%</h3>
        <p className="text-white/60">Success Rate</p>
      </div>
      
      <div className="glass-enhanced p-6 rounded-xl text-center">
        <Icon name="clock" size={32} className="text-yellow-400 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-white">{aiStats.avgResponseTime}s</h3>
        <p className="text-white/60">Avg Response Time</p>
      </div>
      
      <div className="glass-enhanced p-6 rounded-xl text-center">
        <Icon name="currency-euro" size={32} className="text-purple-400 mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-white">€{aiStats.costThisMonth.toFixed(2)}</h3>
        <p className="text-white/60">Cost This Month</p>
      </div>
      
      <div className="glass-enhanced p-6 rounded-xl md:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Token Usage</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Today:</span>
            <span className="text-white font-medium">{aiStats.tokensUsedToday.toLocaleString()} tokens</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">This Month:</span>
            <span className="text-white font-medium">{aiStats.tokensUsedMonth.toLocaleString()} tokens</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-amber-400 h-2 rounded-full" style={{ width: '67%' }}></div>
          </div>
          <p className="text-white/60 text-sm">67% of monthly quota used</p>
        </div>
      </div>
      
      <div className="glass-enhanced p-6 rounded-xl md:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4">Most Used Prompt</h3>
        <p className="text-amber-400 font-medium">{aiStats.mostUsedPrompt}</p>
        <p className="text-white/60 text-sm mt-2">847 requests this month</p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="glass-enhanced p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Model Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">Temperature</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={aiSettings.temperature}
              onChange={(e) => setAiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>0 (Deterministic)</span>
              <span>{aiSettings.temperature}</span>
              <span>1 (Creative)</span>
            </div>
          </div>
          
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">Max Tokens</label>
            <input
              type="number"
              value={aiSettings.maxTokensPerRequest}
              onChange={(e) => setAiSettings(prev => ({ ...prev, maxTokensPerRequest: parseInt(e.target.value) }))}
              className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white"
            />
          </div>
        </div>
      </div>
      
      <div className="glass-enhanced p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Rate Limiting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">Requests per User</label>
            <input
              type="number"
              value={aiSettings.rateLimitPerUser}
              onChange={(e) => setAiSettings(prev => ({ ...prev, rateLimitPerUser: parseInt(e.target.value) }))}
              className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white"
            />
          </div>
          
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">Time Window (minutes)</label>
            <input
              type="number"
              value={aiSettings.rateLimitWindow}
              onChange={(e) => setAiSettings(prev => ({ ...prev, rateLimitWindow: parseInt(e.target.value) }))}
              className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSaving(true);
            console.log('💾 Saving AI settings...', aiSettings);
            setTimeout(() => setSaving(false), 1000);
          }}
          variant="primary"
          disabled={saving}
        >
          {saving ? '💾 Saving...' : '💾 Save Settings'}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading AI Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Management</h1>
          <p className="text-white/70">Manage AI models, prompts, and settings for Tale Forge</p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-enhanced border-b border-white/20 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'models', label: 'Models', icon: 'cog' },
              { id: 'prompts', label: 'Prompts', icon: 'document-text' },
              { id: 'stats', label: 'Statistics', icon: 'chart-bar' },
              { id: 'settings', label: 'Settings', icon: 'adjustments' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                }`}
              >
                <Icon name={tab.icon} size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'models' && renderModelsTab()}
          {activeTab === 'prompts' && renderPromptsTab()}
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminAIPage;