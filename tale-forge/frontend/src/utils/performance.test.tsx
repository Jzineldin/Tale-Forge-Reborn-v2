import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { fetchWithCache, Skeleton, LoadingState, ErrorState } from './performance';
import cache from './cache';

// Mock fetch globally
global.fetch = vi.fn();

describe('Performance Utilities', () => {
  beforeEach(() => {
    // Clear all mocks and cache before each test
    vi.clearAllMocks();
    cache.clear();
  });

  describe('fetchWithCache', () => {
    test('fetches data and caches it', async () => {
      // Mock fetch response
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      } as Response);

      // First call should fetch from API
      const result1 = await fetchWithCache('test-key', '/api/test');
      expect(result1).toEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should return cached data
      const result2 = await fetchWithCache('test-key', '/api/test');
      expect(result2).toEqual({ data: 'test' });
      // Should not have called fetch again
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('throws error when fetch fails', async () => {
      // Mock fetch to return an error
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      await expect(fetchWithCache('test-key', '/api/test'))
        .rejects
        .toThrow('HTTP error! status: 500');
    });
  });

  describe('Skeleton', () => {
    test('renders with default classes', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('bg-gray-200');
      expect(skeleton).toHaveClass('rounded');
    });

    test('renders with custom classes', () => {
      const { container } = render(<Skeleton className="h-10 w-20" />);
      const skeleton = container.firstChild;
      
      expect(skeleton).toHaveClass('h-10');
      expect(skeleton).toHaveClass('w-20');
    });
  });

  describe('LoadingState', () => {
    test('renders with default message', () => {
      render(<LoadingState />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    });

    test('renders with custom message', () => {
      render(<LoadingState message="Please wait..." />);
      
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });
  });

  describe('ErrorState', () => {
    test('renders with default message', () => {
      render(<ErrorState />);
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
      render(<ErrorState message="Custom error occurred" />);
      
      expect(screen.getByText('Custom error occurred')).toBeInTheDocument();
    });
  });
});