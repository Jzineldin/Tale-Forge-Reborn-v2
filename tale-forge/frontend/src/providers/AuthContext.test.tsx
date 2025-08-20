import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, isAdmin, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-name">
        {user ? user.name : 'No User'}
      </div>
      <div data-testid="admin-status">
        {isAdmin ? 'Admin' : 'Not Admin'}
      </div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>
        Logout
      </button>
      <button onClick={() => register('Test User', 'test@example.com', 'password')}>
        Register
      </button>
    </div>
  );
};

// Wrapper component with AuthProvider
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides initial state correctly', () => {
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
    expect(screen.getByTestId('admin-status')).toHaveTextContent('Not Admin');
  });

  test('login function works correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    await user.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
    });
  });

  test('logout function works correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    // First login
    await user.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Then logout
    await user.click(screen.getByText('Logout'));
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
  });

  test('register function works correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    await user.click(screen.getByText('Register'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
  });

  test('persists user data in localStorage', async () => {
    const user = userEvent.setup();
    
    const { unmount, rerender } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    // Login
    await user.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
    
    // Unmount and remount to test persistence
    unmount();
    
    rerender(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );
    
    // Should still be authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
  });
});