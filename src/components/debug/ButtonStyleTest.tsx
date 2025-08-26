import React from 'react';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const ButtonStyleTest: React.FC = () => {
  return (
    <div className="glass-enhanced backdrop-blur-lg bg-black/20 border border-white/20 rounded-2xl p-6 m-4">
      <h2 className="text-2xl font-bold text-white mb-6">🎨 Button Style Test</h2>
      
      {/* Button Component Variants */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Button Component Variants</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <Button variant="primary" size="small">Primary Small</Button>
          <Button variant="primary" size="medium">Primary Medium</Button>
          <Button variant="primary" size="large">Primary Large</Button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <Button variant="secondary" size="small">Secondary Small</Button>
          <Button variant="secondary" size="medium">Secondary Medium</Button>
          <Button variant="secondary" size="large">Secondary Large</Button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <Button variant="danger" size="small">Danger Small</Button>
          <Button variant="magical" size="medium">Magical Medium</Button>
          <Button variant="outline" size="large">Outline Large</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="medium" className="flex items-center space-x-2">
            <Icon name="plus" size={16} />
            <span>With Icon</span>
          </Button>
          <Button variant="secondary" size="medium" disabled>Disabled</Button>
        </div>
      </div>

      {/* CSS Class Buttons */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4">CSS Class Buttons</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <button className="fantasy-cta px-6 py-3 text-base rounded-lg">
            Fantasy CTA
          </button>
          <button className="refined-cta px-6 py-3 text-base rounded-lg">
            Refined CTA
          </button>
          <button className="btn-magical px-6 py-3 text-base">
            Magical Button
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="fantasy-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
            Fantasy Btn Blue
          </button>
          <button className="fantasy-btn bg-green-600 hover:bg-green-700 text-white px-4 py-2">
            Fantasy Btn Green
          </button>
          <button className="fantasy-btn bg-purple-600 hover:bg-purple-700 text-white px-4 py-2">
            Fantasy Btn Purple
          </button>
        </div>
      </div>

      {/* Glass Effects */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Glass Effect Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="glass-card text-white border-2 border-amber-400/50 hover:border-amber-400 font-semibold px-6 py-3 rounded-xl backdrop-blur-md hover:bg-amber-400/10 transition-all duration-300">
            Glass Card Button
          </button>
          <button className="glass-enhanced text-white border border-white/20 font-semibold px-6 py-3 rounded-xl backdrop-blur-lg hover:bg-white/10 transition-all duration-300">
            Glass Enhanced Button
          </button>
        </div>
      </div>

      {/* Navigation Style Buttons */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Navigation Style Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <button className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10">
            <Icon name="bell" size={18} />
          </button>
          <button className="glass-card text-white border-white/30 px-4 py-2 text-sm rounded-lg hover:bg-white/10 transition-all">
            Glass Card Nav
          </button>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-sm rounded-lg transition-all">
            Amber Primary Nav
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-black/20 border border-white/10 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2">Test Results:</h3>
        <ul className="space-y-1 text-white/80 text-sm">
          <li>• Button component variants should have consistent styling</li>
          <li>• fantasy-cta should have amber gradient background</li>
          <li>• fantasy-btn should provide base button styling</li>
          <li>• Glass effects should be subtle and readable</li>
          <li>• All buttons should have proper hover/focus states</li>
          <li>• Icons should align properly with text</li>
        </ul>
      </div>
    </div>
  );
};

export default ButtonStyleTest;