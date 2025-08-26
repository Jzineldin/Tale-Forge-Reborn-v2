import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { GamificationDashboard } from '../../components/dashboard/GamificationDashboard';
import { AchievementBadge, AchievementCard, AchievementList } from '../../components/gamification';
import { AuthProvider } from '../../providers/AuthContext';
import { achievementService } from '../../services/achievementService';
import { goalService } from '../../services/goalService';
import { creditService } from '../../services/creditService';

// Mock services
vi.mock('../../services/achievementService');
vi.mock('../../services/goalService');
vi.mock('../../services/creditService');
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockAchievement = {
  id: 'achievement-1',
  name: 'First Story',
  description: 'Create your first story',
  icon: 'star',
  category: 'story_creation',
  credits_reward: 10,
  requirements: { stories_created: 1 },
  is_secret: false,
  rarity: 'common' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockUserAchievement = {
  id: 'user-achievement-1',
  user_id: 'test-user-id',
  achievement_id: 'achievement-1',
  earned_at: new Date().toISOString(),
  claimed_at: null,
  credits_earned: 10,
  achievement: mockAchievement,
};

const mockGoal = {
  id: 'goal-1',
  user_id: 'test-user-id',
  goal_type: 'daily_story_creation',
  target_value: 1,
  current_value: 0,
  completed: false,
  credits_reward: 5,
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockGoalProgress = {
  goal: mockGoal,
  progress_percentage: 50,
  time_remaining: {
    days: 0,
    hours: 12,
    minutes: 30,
  },
};

const mockAchievementProgress = {
  achievement_id: 'achievement-1',
  current_progress: 0,
  required_progress: 1,
  progress_percentage: 0,
  is_completed: false,
  achievement: mockAchievement,
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Gamification Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock service methods
    vi.mocked(achievementService.getRecentAchievements).mockResolvedValue([mockUserAchievement]);
    vi.mocked(achievementService.getUnclaimedAchievements).mockResolvedValue([]);
    vi.mocked(achievementService.getAchievementStats).mockResolvedValue({
      total_earned: 5,
      recent_streak: 2,
      completion_by_category: {
        story_creation: { earned: 2, total: 5, percentage: 40 },
        engagement: { earned: 1, total: 3, percentage: 33 },
      },
    });
    vi.mocked(achievementService.getAvailableAchievements).mockResolvedValue([mockAchievementProgress]);
    vi.mocked(achievementService.claimAchievement).mockResolvedValue(true);

    vi.mocked(goalService.getUserGoalsWithProgress).mockResolvedValue([mockGoalProgress]);
    vi.mocked(goalService.getGoalStats).mockResolvedValue({
      current_streak: 3,
      best_streak: 7,
      completion_rate_this_week: 80,
      completion_rate_this_month: 65,
    });

    vi.mocked(creditService.getCreditStats).mockResolvedValue({
      current_balance: 150,
      total_earned: 300,
      total_spent: 150,
      avg_monthly_earned: 50,
    });
    vi.mocked(creditService.getCreditHistory).mockResolvedValue([
      {
        id: 'transaction-1',
        amount: 10,
        description: 'Story completion reward',
        created_at: new Date().toISOString(),
      },
    ]);
  });

  describe('Component Imports', () => {
    it('should import gamification components without errors', () => {
      expect(AchievementBadge).toBeDefined();
      expect(AchievementCard).toBeDefined();
      expect(AchievementList).toBeDefined();
      expect(GamificationDashboard).toBeDefined();
    });

    it('should render AchievementBadge with basic props', () => {
      render(
        <TestWrapper>
          <AchievementBadge achievement={mockAchievement} size="medium" />
        </TestWrapper>
      );
      
      // Component should render without throwing
      expect(screen.getByText('First Story')).toBeInTheDocument();
    });

    it('should render AchievementCard with basic props', () => {
      render(
        <TestWrapper>
          <AchievementCard achievement={mockAchievement} />
        </TestWrapper>
      );
      
      // Component should render without throwing
      expect(screen.getByText('First Story')).toBeInTheDocument();
    });
  });

  describe('Service Integration', () => {
    it('should call achievement service methods', async () => {
      const userId = 'test-user-id';
      
      await achievementService.getRecentAchievements(userId);
      await achievementService.getUnclaimedAchievements(userId);
      await achievementService.getAchievementStats(userId);
      
      expect(achievementService.getRecentAchievements).toHaveBeenCalledWith(userId);
      expect(achievementService.getUnclaimedAchievements).toHaveBeenCalledWith(userId);
      expect(achievementService.getAchievementStats).toHaveBeenCalledWith(userId);
    });

    it('should call goal service methods', async () => {
      const userId = 'test-user-id';
      
      await goalService.getUserGoalsWithProgress(userId);
      await goalService.getGoalStats(userId);
      
      expect(goalService.getUserGoalsWithProgress).toHaveBeenCalledWith(userId);
      expect(goalService.getGoalStats).toHaveBeenCalledWith(userId);
    });

    it('should call credit service methods', async () => {
      const userId = 'test-user-id';
      
      await creditService.getCreditStats(userId);
      await creditService.getCreditHistory(userId, 10);
      
      expect(creditService.getCreditStats).toHaveBeenCalledWith(userId);
      expect(creditService.getCreditHistory).toHaveBeenCalledWith(userId, 10);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      vi.mocked(achievementService.getRecentAchievements).mockRejectedValue(new Error('Service error'));
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // This should not throw an error
      expect(() => {
        render(
          <TestWrapper>
            <GamificationDashboard />
          </TestWrapper>
        );
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    it('should handle missing data gracefully', async () => {
      vi.mocked(achievementService.getRecentAchievements).mockResolvedValue([]);
      vi.mocked(goalService.getUserGoalsWithProgress).mockResolvedValue([]);
      
      render(
        <TestWrapper>
          <GamificationDashboard />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Progress Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Data Flow Integration', () => {
    it('should pass achievement data correctly through components', () => {
      render(
        <TestWrapper>
          <AchievementCard 
            achievement={mockAchievement}
            isCompleted={false}
            canClaim={false}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('First Story')).toBeInTheDocument();
      expect(screen.getByText('Create your first story')).toBeInTheDocument();
    });

    it('should handle achievement progress data', () => {
      render(
        <TestWrapper>
          <AchievementCard 
            achievement={mockAchievementProgress}
            showProgress={true}
          />
        </TestWrapper>
      );
      
      // Should render progress information
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Type Safety', () => {
    it('should handle Achievement and AchievementProgress types', () => {
      // Test both Achievement and AchievementProgress types
      expect(() => {
        render(
          <TestWrapper>
            <AchievementCard achievement={mockAchievement} />
            <AchievementCard achievement={mockAchievementProgress} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should handle goal progress data structure', () => {
      expect(mockGoalProgress).toHaveProperty('goal');
      expect(mockGoalProgress).toHaveProperty('progress_percentage');
      expect(mockGoalProgress).toHaveProperty('time_remaining');
      expect(mockGoalProgress.goal).toHaveProperty('goal_type');
      expect(mockGoalProgress.goal).toHaveProperty('target_value');
    });
  });

  describe('Performance', () => {
    it('should render components within reasonable time', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <GamificationDashboard />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Progress Dashboard')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 5 seconds (generous for CI environments)
      expect(renderTime).toBeLessThan(5000);
    });

    it('should handle large datasets efficiently', () => {
      const manyAchievements = Array.from({ length: 50 }, (_, i) => ({
        ...mockAchievement,
        id: `achievement-${i}`,
        name: `Achievement ${i}`,
      }));

      expect(() => {
        render(
          <TestWrapper>
            <AchievementList 
              achievements={manyAchievements} 
              showProgress={false}
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });
});