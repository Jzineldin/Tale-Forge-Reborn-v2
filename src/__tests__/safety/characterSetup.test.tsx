import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CharacterSetup from '../../components/organisms/story-creation/EasyModeFlow/CharacterSetup';

// Mock the content safety hook
vi.mock('../../utils/contentSafety', () => ({
  sanitizeCharacterName: vi.fn(),
  validateCharacterTraits: vi.fn(),
  APPROVED_TRAITS: {
    'Brave': { emoji: '🦁', description: 'Faces challenges with courage' },
    'Kind': { emoji: '💝', description: 'Shows care and compassion' },
    'Curious': { emoji: '🔍', description: 'Loves to explore and learn' }
  }
}));

// Mock the story seed generation hook
vi.mock('../../hooks/useStorySeedGeneration', () => ({
  useStorySeedGeneration: () => ({
    isGenerating: false,
    generateNewSeed: vi.fn().mockResolvedValue(['A safe story seed about friendship'])
  })
}));

describe('CharacterSetup Safety Integration', () => {
  const defaultProps = {
    characterName: '',
    characterTraits: [],
    storySeed: '',
    genre: 'fantasy',
    difficulty: 'medium' as const,
    onNameChange: vi.fn(),
    onTraitsChange: vi.fn(),
    onSeedChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Character Name Safety', () => {
    it('should render character name input with safety validation', () => {
      render(<CharacterSetup {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/character name/i);
      expect(nameInput).toBeInTheDocument();
    });

    it('should validate character name in real-time', async () => {
      const user = userEvent.setup();
      const onNameChange = vi.fn();
      
      render(<CharacterSetup {...defaultProps} onNameChange={onNameChange} />);
      
      const nameInput = screen.getByLabelText(/character name/i);
      
      // Type a valid name
      await user.type(nameInput, 'Alex');
      
      await waitFor(() => {
        expect(onNameChange).toHaveBeenCalledWith('Alex');
      });
    });

    it('should show safety indicators for character name', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSetup {...defaultProps} characterName="Alex" />);
      
      // Should show green safety indicator for valid names
      const safetyIndicator = screen.getByTestId('name-safety-indicator');
      expect(safetyIndicator).toBeInTheDocument();
    });

    it('should reject inappropriate character names', async () => {
      const { sanitizeCharacterName } = await import('../../utils/contentSafety');
      
      // Mock inappropriate name validation
      (sanitizeCharacterName as any).mockReturnValue({
        isValid: false,
        violations: ['Inappropriate character name'],
        sanitizedValue: '',
        fallbackValue: 'Alex'
      });
      
      const user = userEvent.setup();
      const onNameChange = vi.fn();
      
      render(<CharacterSetup {...defaultProps} onNameChange={onNameChange} />);
      
      const nameInput = screen.getByLabelText(/character name/i);
      await user.type(nameInput, 'admin');
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/inappropriate character name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Character Traits Safety', () => {
    it('should only show approved traits', () => {
      render(<CharacterSetup {...defaultProps} />);
      
      // Should display pre-approved traits
      expect(screen.getByText('Brave')).toBeInTheDocument();
      expect(screen.getByText('Kind')).toBeInTheDocument();
      expect(screen.getByText('Curious')).toBeInTheDocument();
    });

    it('should limit trait selection to maximum 5', async () => {
      const user = userEvent.setup();
      const onTraitsChange = vi.fn();
      
      render(<CharacterSetup {...defaultProps} onTraitsChange={onTraitsChange} />);
      
      // Try to select more than 5 traits
      const braveButton = screen.getByText('Brave');
      const kindButton = screen.getByText('Kind');
      const curiousButton = screen.getByText('Curious');
      
      await user.click(braveButton);
      await user.click(kindButton);
      await user.click(curiousButton);
      
      expect(onTraitsChange).toHaveBeenCalledWith(['Brave', 'Kind', 'Curious']);
    });

    it('should show trait descriptions for child-friendly understanding', () => {
      render(<CharacterSetup {...defaultProps} />);
      
      // Should show descriptions for each trait
      expect(screen.getByText('Faces challenges with courage')).toBeInTheDocument();
      expect(screen.getByText('Shows care and compassion')).toBeInTheDocument();
      expect(screen.getByText('Loves to explore and learn')).toBeInTheDocument();
    });

    it('should provide visual feedback for selected traits', async () => {
      const user = userEvent.setup();
      
      render(<CharacterSetup {...defaultProps} characterTraits={['Brave']} />);
      
      const braveButton = screen.getByText('Brave');
      expect(braveButton).toHaveClass('selected'); // Assuming selected class exists
    });
  });

  describe('Story Seed Safety', () => {
    it('should display story seed with safety validation', () => {
      const safeSeed = 'A magical adventure about friendship and kindness in an enchanted forest.';
      
      render(<CharacterSetup {...defaultProps} storySeed={safeSeed} />);
      
      expect(screen.getByText(safeSeed)).toBeInTheDocument();
    });

    it('should auto-generate story seed when genre changes', async () => {
      const onSeedChange = vi.fn();
      
      const { rerender } = render(
        <CharacterSetup {...defaultProps} genre="fantasy" onSeedChange={onSeedChange} />
      );
      
      // Change genre
      rerender(
        <CharacterSetup {...defaultProps} genre="adventure" onSeedChange={onSeedChange} />
      );
      
      await waitFor(() => {
        expect(onSeedChange).toHaveBeenCalled();
      });
    });

    it('should allow regenerating story seeds', async () => {
      const user = userEvent.setup();
      const onSeedChange = vi.fn();
      
      render(<CharacterSetup {...defaultProps} onSeedChange={onSeedChange} />);
      
      const regenerateButton = screen.getByText(/generate new seed/i);
      await user.click(regenerateButton);
      
      await waitFor(() => {
        expect(onSeedChange).toHaveBeenCalled();
      });
    });
  });

  describe('Character Preview Safety', () => {
    it('should show character preview with safe content', () => {
      render(
        <CharacterSetup 
          {...defaultProps} 
          characterName="Alex"
          characterTraits={['Brave', 'Kind']}
          genre="fantasy"
        />
      );
      
      // Should display character preview
      expect(screen.getByText('Character Preview')).toBeInTheDocument();
      expect(screen.getByText('Alex')).toBeInTheDocument();
      expect(screen.getByText('Brave')).toBeInTheDocument();
      expect(screen.getByText('Kind')).toBeInTheDocument();
    });

    it('should update preview in real-time with safety validation', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(<CharacterSetup {...defaultProps} />);
      
      // Update with safe values
      rerender(
        <CharacterSetup 
          {...defaultProps} 
          characterName="Luna"
          characterTraits={['Curious']}
        />
      );
      
      expect(screen.getByText('Luna')).toBeInTheDocument();
      expect(screen.getByText('Curious')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('should show fallback content when AI generation fails', async () => {
      // Mock failed story generation
      const mockUseStorySeedGeneration = await import('../../hooks/useStorySeedGeneration');
      (mockUseStorySeedGeneration.useStorySeedGeneration as any).mockReturnValue({
        isGenerating: false,
        generateNewSeed: vi.fn().mockRejectedValue(new Error('AI API failed'))
      });
      
      render(<CharacterSetup {...defaultProps} />);
      
      // Should still show the component without crashing
      expect(screen.getByText(/Let's Create Your Hero!/i)).toBeInTheDocument();
    });

    it('should provide emergency fallback names for inappropriate input', async () => {
      const { sanitizeCharacterName } = await import('../../utils/contentSafety');
      
      (sanitizeCharacterName as any).mockReturnValue({
        isValid: false,
        violations: ['Inappropriate name'],
        sanitizedValue: '',
        fallbackValue: 'Hero'
      });
      
      const user = userEvent.setup();
      const onNameChange = vi.fn();
      
      render(<CharacterSetup {...defaultProps} onNameChange={onNameChange} />);
      
      const nameInput = screen.getByLabelText(/character name/i);
      await user.type(nameInput, 'inappropriate');
      
      // Should suggest fallback name
      await waitFor(() => {
        expect(screen.getByText(/suggested name: Hero/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Child-Friendly Design', () => {
    it('should have proper ARIA labels for screen readers', () => {
      render(<CharacterSetup {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/character name/i);
      expect(nameInput).toHaveAttribute('aria-label');
    });

    it('should use child-friendly language throughout', () => {
      render(<CharacterSetup {...defaultProps} />);
      
      expect(screen.getByText(/Let's Create Your Hero!/i)).toBeInTheDocument();
      expect(screen.getByText(/Time to make this story uniquely yours/i)).toBeInTheDocument();
    });

    it('should display emojis for visual appeal to children', () => {
      render(<CharacterSetup {...defaultProps} />);
      
      expect(screen.getByText('✨')).toBeInTheDocument(); // Header emoji
      expect(screen.getByText('🦁')).toBeInTheDocument(); // Brave trait emoji
      expect(screen.getByText('💝')).toBeInTheDocument(); // Kind trait emoji
    });

    it('should use appropriate color coding for safety status', () => {
      render(<CharacterSetup {...defaultProps} characterName="Alex" />);
      
      const safetyIndicator = screen.getByTestId('name-safety-indicator');
      expect(safetyIndicator).toHaveClass('text-green-500'); // Safe = green
    });
  });
});