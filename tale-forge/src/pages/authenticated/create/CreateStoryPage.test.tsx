import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CreateStoryPage from './CreateStoryPage';

// Mock the useAuth hook
vi.mock('@/providers/AuthContext', async () => {
  const actual = await vi.importActual('@/providers/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'user123', name: 'Test User', email: 'test@example.com', role: 'user' as const }
    })
  };
});

// Mock the useBilling hook
vi.mock('@/providers/BillingContext', async () => {
  const actual = await vi.importActual('@/providers/BillingContext');
  return {
    ...actual,
    useBilling: () => ({
      subscription: { name: 'Free', tier: 'free' }
    })
  };
});

// Mock the useCreateStory hook
vi.mock('@/utils/performance', async () => {
  const actual = await vi.importActual('@/utils/performance');
  return {
    ...actual,
    useCreateStory: () => ({
      mutate: vi.fn(),
      isLoading: false,
      isError: false
    })
  };
});

describe('CreateStoryPage', () => {
  test('renders correctly with initial step', () => {
    render(
      <BrowserRouter>
        <CreateStoryPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Create New Story')).toBeInTheDocument();
    expect(screen.getByText('Follow the steps to create your personalized interactive story')).toBeInTheDocument();
    
    // Check that step 1 is displayed
    expect(screen.getByText('Step 1: Story Concept')).toBeInTheDocument();
    
    // Check that progress bar is displayed
    expect(screen.getByText('Audience')).toBeInTheDocument();
    expect(screen.getByText('Elements')).toBeInTheDocument();
    expect(screen.getByText('Customize')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  test('navigates to next step when Next button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <CreateStoryPage />
      </BrowserRouter>
    );
    
    // Initially on step 1
    expect(screen.getByText('Step 1: Story Concept')).toBeInTheDocument();
    
    // Click Next button
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    // Should now be on step 2
    expect(screen.getByText('Step 2: Main Character')).toBeInTheDocument();
  });

  test('navigates to previous step when Back button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <CreateStoryPage />
      </BrowserRouter>
    );
    
    // Click Next button to go to step 2
    await user.click(screen.getByText('Next'));
    expect(screen.getByText('Step 2: Main Character')).toBeInTheDocument();
    
    // Click Back button
    const backButton = screen.getByText('Back');
    await user.click(backButton);
    
    // Should now be back on step 1
    expect(screen.getByText('Step 1: Story Concept')).toBeInTheDocument();
  });

  test('shows Create Story button on step 4', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <CreateStoryPage />
      </BrowserRouter>
    );
    
    // Navigate to step 4
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    
    expect(screen.getByText('Step 4: Plot Elements')).toBeInTheDocument();
    expect(screen.getByText('Create Story')).toBeInTheDocument();
  });

  test('shows loading state on step 5', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <CreateStoryPage />
      </BrowserRouter>
    );
    
    // Navigate to step 4 and click Create Story
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Next'));
    await user.click(screen.getByText('Create Story'));
    
    expect(screen.getByText('Creating Your Story')).toBeInTheDocument();
    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  test('progress bar updates correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <CreateStoryPage />
      </BrowserRouter>
    );
    
    // Initially step 1 should be active
    expect(screen.getByText('1')).toHaveClass('bg-indigo-600');
    
    // Navigate to step 2
    await user.click(screen.getByText('Next'));
    
    // Step 1 and 2 should be active
    expect(screen.getByText('1')).toHaveClass('bg-indigo-600');
    expect(screen.getByText('2')).toHaveClass('bg-indigo-600');
  });
});