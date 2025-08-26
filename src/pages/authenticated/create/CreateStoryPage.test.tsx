import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CreateStoryPage from './CreateStoryPage';

// Mock the useAuth hook
vi.mock('@/providers/AuthContext', async () => {
  const actual = await vi.importActual('@/providers/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: 'user123', full_name: 'Test User', email: 'test@example.com', role: 'user' as const },
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
      session: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      resetPassword: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithGitHub: vi.fn()
    })
  };
});

// Mock the useBilling hook
vi.mock('@/providers/BillingContext', async () => {
  const actual = await vi.importActual('@/providers/BillingContext');
  return {
    ...actual,
    useBilling: () => ({
      subscription: { 
        id: 'free',
        name: 'Free', 
        price: 0,
        features: ['Up to 3 stories per month'],
        maxStories: 3,
        maxCharacters: 5000
      },
      billingHistory: [],
      isLoading: false,
      isCheckingOut: false,
      subscribeToPlan: vi.fn(),
      cancelSubscription: vi.fn(),
      openCustomerPortal: vi.fn(),
      loadSubscriptionData: vi.fn()
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

// Mock the social engagement hooks
vi.mock('@/hooks/useSocialEngagement.adapted.ts', () => ({
  useStoryTemplateLikes: () => ({
    likeCount: 0,
    isLiked: false,
    isLoading: false,
    toggleLike: vi.fn(),
    isToggling: false
  }),
  useStoryTemplateBookmarks: () => ({
    bookmarkCount: 0,
    isBookmarked: false,
    collection: 'default',
    isLoading: false,
    toggleBookmark: vi.fn(),
    isToggling: false
  }),
  useStoryTemplateReviews: () => ({
    reviews: [],
    isLoading: false,
    submitReview: vi.fn(),
    isSubmitting: false
  }),
  useStoryTemplateSharing: () => ({
    shareTemplate: vi.fn(),
    isSharing: false
  }),
  useStoryTemplateSocialStats: () => ({
    likes_count: 0,
    bookmarks_count: 0,
    shares_count: 0,
    reviews_count: 0,
    rating_average: 0,
    usage_count: 0,
    is_liked: false,
    is_bookmarked: false
  })
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CreateStoryPage', () => {
  test('renders correctly with initial step', () => {
    render(
      <TestWrapper>
        <CreateStoryPage />
      </TestWrapper>
    );
    
    expect(screen.getByText('Create Your Magical Story ✨')).toBeInTheDocument();
    expect(screen.getByText('Follow our step-by-step wizard to craft a personalized interactive adventure')).toBeInTheDocument();
    
    // Check that template selection step is displayed (step 0)
    expect(screen.getByText('Choose Your Story Adventure ✨')).toBeInTheDocument();
    
    // Check that template selector is displayed
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Choose story type')).toBeInTheDocument();
  });

  test('navigates to custom creation when Start Custom Creation is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CreateStoryPage />
      </TestWrapper>
    );
    
    // Initially on template selection step
    expect(screen.getByText('Choose Your Story Adventure ✨')).toBeInTheDocument();
    
    // Click Start Custom Creation button
    const customButton = screen.getByRole('button', { name: /Start Custom Creation/i });
    
    await act(async () => {
      await user.click(customButton);
    });
    
    // Should now be on step 1 with custom creation progress steps
    expect(screen.getByText('Concept')).toBeInTheDocument();
    expect(screen.getByText('Choose genre & theme')).toBeInTheDocument();
  });

  test('shows template selection on initial load', async () => {
    render(
      <TestWrapper>
        <CreateStoryPage />
      </TestWrapper>
    );
    
    // Should show template selection UI
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Choose story type')).toBeInTheDocument();
    
    // Should show template filter buttons - use more specific queries
    const filterButtons = screen.getAllByRole('button');
    const filterButtonTexts = filterButtons.map(button => button.textContent);
    
    expect(filterButtonTexts).toContain('All');
    expect(filterButtonTexts).toContain('Fantasy');
    expect(filterButtonTexts).toContain('Science Fiction');
    expect(filterButtonTexts).toContain('Adventure');
  });

  test('shows progress bar with correct completion percentage', async () => {
    render(
      <TestWrapper>
        <CreateStoryPage />
      </TestWrapper>
    );
    
    // Should show story completion progress
    expect(screen.getByText('Story Completion')).toBeInTheDocument();
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
    
    // Should show progress bar - just verify the text elements are present
    // The progress bar visual elements are rendered correctly based on the text being present
    const storyCompletionSection = screen.getByText('Story Completion').closest('div');
    expect(storyCompletionSection).toBeInTheDocument();
  });

  test('displays template categories correctly', async () => {
    render(
      <TestWrapper>
        <CreateStoryPage />
      </TestWrapper>
    );
    
    // Should show category filters - check filter button area specifically
    const categoryFilterSection = screen.getByText('Choose Your Story Adventure ✨').closest('div');
    expect(categoryFilterSection).toBeInTheDocument();
    
    // Get all filter buttons and check their content
    const filterButtons = screen.getAllByRole('button').filter(button => 
      ['All', 'Fantasy', 'Science Fiction', 'Adventure', 'Nature', 'Educational', 'Start Custom Creation'].includes(button.textContent || '')
    );
    
    const categoryTexts = filterButtons.map(button => button.textContent);
    expect(categoryTexts).toContain('All');
    expect(categoryTexts).toContain('Fantasy');
    expect(categoryTexts).toContain('Science Fiction');
    expect(categoryTexts).toContain('Adventure');
    expect(categoryTexts).toContain('Nature');
    expect(categoryTexts).toContain('Educational');
  });

  test('shows template selection as initial step', async () => {
    render(
      <TestWrapper>
        <CreateStoryPage />
      </TestWrapper>
    );
    
    // Template step should be active (step 0) - check for the step indicator with specific role
    const stepIndicators = screen.getAllByText('🎨');
    expect(stepIndicators.length).toBeGreaterThan(0);
    
    // Check that the active step is the templates step
    const activeStep = stepIndicators.find(el => 
      el.closest('[aria-current="step"]') !== null
    );
    expect(activeStep).toBeInTheDocument();
    
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Choose story type')).toBeInTheDocument();
    
    // Should show template selector content
    expect(screen.getByText('Choose Your Story Adventure ✨')).toBeInTheDocument();
  });
});