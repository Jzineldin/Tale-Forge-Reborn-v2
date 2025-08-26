import React from 'react';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CreateStoryPage from '@/pages/authenticated/create/CreateStoryPage';

// Mock authentication for integration tests
vi.mock('@/providers/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Story Creation Integration', () => {
  test('completes full story creation workflow', async () => {
    const user = userEvent.setup();
    
    render(<CreateStoryPage />);
    
    // Step 1: Story Concept
    expect(screen.getByText('Step 1: Story Concept')).toBeInTheDocument();
    
    // Fill in child name
    await user.type(screen.getByLabelText('Child\'s Name (optional)'), 'Emma');
    
    // Select age group
    await user.click(screen.getByText('7-9 years (Adventures)'));
    
    // Select genre
    await user.click(screen.getByText('Fantasy & Magic 🧙‍♂️'));
    
    // Fill in theme
    await user.type(screen.getByLabelText('Story Theme/Idea (optional)'), 'Magic Adventure');
    
    // Click Next
    await user.click(screen.getByText('Next: Character Creation'));
    
    // Step 2: Main Character
    expect(screen.getByText('Step 2: Main Character Creation')).toBeInTheDocument();
    
    // Fill in character details
    await user.type(screen.getByLabelText('Character Name'), 'Brave Knight');
    await user.type(screen.getByLabelText('Character Role'), 'Hero');
    await user.type(screen.getByLabelText('Character Description'), 'A brave knight who loves adventure');
    
    // Add trait
    await user.type(screen.getByPlaceholderText('Add a trait (e.g., brave, curious, mischievous)'), 'brave');
    await user.click(screen.getByText('Add'));
    
    // Add character
    await user.click(screen.getByText('Add Character'));
    
    // Click Next
    await user.click(screen.getByText('Next: Story Setting'));
    
    // Step 3: Story Setting
    expect(screen.getByText('Step 3: Story Setting')).toBeInTheDocument();
    
    // Select time period
    await user.click(screen.getByText('Fantasy Era'));
    
    // Select atmosphere
    await user.click(screen.getByText('Adventurous'));
    
    // Fill in location
    await user.type(screen.getByLabelText('Story Location'), 'Enchanted Castle');
    
    // Fill in setting description
    await user.type(screen.getByLabelText('Setting Description (optional)'), 'A magical castle in the clouds');
    
    // Click Next
    await user.click(screen.getByText('Next: Plot Elements'));
    
    // Step 4: Plot Elements
    expect(screen.getByText('Step 4: Plot Elements')).toBeInTheDocument();
    
    // Fill in conflict
    await user.type(screen.getByLabelText('Central Conflict'), 'Defeat the evil dragon');
    
    // Fill in quest
    await user.type(screen.getByLabelText('Quest/Goal'), 'Find the magical sword');
    
    // Fill in moral lesson
    await user.type(screen.getByLabelText('Moral Lesson (optional)'), 'Courage and kindness are important');
    
    // Fill in additional details
    await user.type(screen.getByLabelText('Additional Story Details (optional)'), 'Magic spells and enchanted creatures');
    
    // Click Next
    await user.click(screen.getByText('Next: Review & Generate'));
    
    // Step 5: Review & Generate
    expect(screen.getByText('Step 5: Review & Generate')).toBeInTheDocument();
    
    // Verify all information is displayed
    expect(screen.getByText('Emma')).toBeInTheDocument();
    expect(screen.getByText('7-9 years (80-120 words)')).toBeInTheDocument();
    expect(screen.getByText('🧙‍♂️ Fantasy & Magic')).toBeInTheDocument();
    expect(screen.getByText('Magic Adventure')).toBeInTheDocument();
    expect(screen.getByText('Brave Knight')).toBeInTheDocument();
    expect(screen.getByText('Enchanted Castle')).toBeInTheDocument();
    expect(screen.getByText('Fantasy Era')).toBeInTheDocument();
    expect(screen.getByText('Adventurous')).toBeInTheDocument();
    expect(screen.getByText('Defeat the evil dragon')).toBeInTheDocument();
    expect(screen.getByText('Find the magical sword')).toBeInTheDocument();
    
    // Click Create My Story
    await user.click(screen.getByText('Create My Story'));
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Creating Your Story')).toBeInTheDocument();
    });
  }, 10000); // Increase timeout for integration test
});