import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/providers/AuthContext';
import { AuthSecurityManager, type PasswordStrengthResult } from '@/utils/authSecurity';

export interface AuthState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isBlocked: boolean;
  blockTimeRemaining: number;
}

export interface EnhancedAuthReturn {
  // State
  authState: AuthState;
  passwordStrength: PasswordStrengthResult | null;
  
  // Actions
  enhancedLogin: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  enhancedRegister: (name: string, email: string, password: string) => Promise<boolean>;
  enhancedResetPassword: (email: string) => Promise<boolean>;
  
  // Utilities
  checkPasswordStrength: (password: string) => PasswordStrengthResult;
  validateEmail: (email: string) => boolean;
  clearMessages: () => void;
  generateSecurePassword: () => string;
  
  // Security info
  getSecurityRecommendations: () => string[];
  sessionTimeRemaining: number | null;
  shouldWarnSessionExpiry: boolean;
}

export const useEnhancedAuth = (): EnhancedAuthReturn => {
  const auth = useAuth();
  
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    error: null,
    success: null,
    isBlocked: false,
    blockTimeRemaining: 0
  });
  
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  const [shouldWarnSessionExpiry, setShouldWarnSessionExpiry] = useState(false);

  // Update session time tracking
  useEffect(() => {
    const updateSessionInfo = () => {
      const timeRemaining = AuthSecurityManager.getSessionTimeRemaining();
      setSessionTimeRemaining(timeRemaining);
      setShouldWarnSessionExpiry(AuthSecurityManager.shouldWarnSessionExpiry());
    };

    // Update immediately and then every 30 seconds
    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 30000);

    return () => clearInterval(interval);
  }, [auth.session]);

  // Check if user is blocked
  const checkUserBlocked = useCallback((email: string) => {
    const blockInfo = AuthSecurityManager.isLoginBlocked(email);
    setAuthState(prev => ({
      ...prev,
      isBlocked: blockInfo.blocked,
      blockTimeRemaining: blockInfo.timeRemaining || 0
    }));
    return blockInfo.blocked;
  }, []);

  // Enhanced login with security checks
  const enhancedLogin = useCallback(async (
    email: string, 
    password: string, 
    rememberMe: boolean = false
  ): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      // Validate email format
      if (!AuthSecurityManager.isValidEmail(email)) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Please enter a valid email address'
        }));
        return false;
      }

      // Check if user is blocked
      if (checkUserBlocked(email)) {
        const blockInfo = AuthSecurityManager.isLoginBlocked(email);
        const minutes = Math.ceil((blockInfo.timeRemaining || 0) / (60 * 1000));
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: `Too many failed attempts. Please try again in ${minutes} minutes.`,
          isBlocked: true,
          blockTimeRemaining: blockInfo.timeRemaining || 0
        }));
        return false;
      }

      // Attempt login
      const result = await auth.login(email, password);

      if (result.error) {
        // Record failed attempt
        AuthSecurityManager.recordLoginAttempt(email, false);
        
        const errorMessage = AuthSecurityManager.getErrorMessage(result.error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
        
        // Check if now blocked after this failed attempt
        checkUserBlocked(email);
        return false;
      }

      // Record successful attempt
      AuthSecurityManager.recordLoginAttempt(email, true);
      
      // Handle remember me (extend session)
      if (rememberMe) {
        // In a real app, you'd set session persistence here
        localStorage.setItem('taleforge_remember_me', 'true');
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        success: 'Login successful! Welcome back.',
        isBlocked: false,
        blockTimeRemaining: 0
      }));

      return true;
    } catch (error) {
      AuthSecurityManager.recordLoginAttempt(email, false);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: AuthSecurityManager.getErrorMessage(error)
      }));
      return false;
    }
  }, [auth.login, checkUserBlocked]);

  // Enhanced registration with password strength validation
  const enhancedRegister = useCallback(async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      // Validate inputs
      if (!name.trim()) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Please enter your name'
        }));
        return false;
      }

      if (!AuthSecurityManager.isValidEmail(email)) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Please enter a valid email address'
        }));
        return false;
      }

      // Check password strength
      const strengthResult = AuthSecurityManager.checkPasswordStrength(password);
      if (!strengthResult.isStrong) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: `Password is too weak. Please: ${strengthResult.feedback.join(', ')}`
        }));
        return false;
      }

      // Attempt registration
      const result = await auth.register(name, email, password);

      if (result.error) {
        const errorMessage = AuthSecurityManager.getErrorMessage(result.error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
        return false;
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        success: 'Account created successfully! Please check your email for verification.'
      }));

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: AuthSecurityManager.getErrorMessage(error)
      }));
      return false;
    }
  }, [auth.register]);

  // Enhanced password reset
  const enhancedResetPassword = useCallback(async (email: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null, success: null }));

    try {
      if (!AuthSecurityManager.isValidEmail(email)) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Please enter a valid email address'
        }));
        return false;
      }

      const result = await auth.resetPassword(email);

      if (result.error) {
        const errorMessage = AuthSecurityManager.getErrorMessage(result.error);
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
        return false;
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        success: 'Password reset email sent! Check your inbox and follow the instructions.'
      }));

      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: AuthSecurityManager.getErrorMessage(error)
      }));
      return false;
    }
  }, [auth.resetPassword]);

  // Utility functions
  const checkPasswordStrength = useCallback((password: string): PasswordStrengthResult => {
    const result = AuthSecurityManager.checkPasswordStrength(password);
    setPasswordStrength(result);
    return result;
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    return AuthSecurityManager.isValidEmail(email);
  }, []);

  const clearMessages = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      error: null,
      success: null
    }));
  }, []);

  const generateSecurePassword = useCallback((): string => {
    return AuthSecurityManager.generateSecurePassword();
  }, []);

  const getSecurityRecommendations = useCallback((): string[] => {
    return AuthSecurityManager.getSecurityRecommendations(auth.user);
  }, [auth.user]);

  return {
    authState,
    passwordStrength,
    enhancedLogin,
    enhancedRegister,
    enhancedResetPassword,
    checkPasswordStrength,
    validateEmail,
    clearMessages,
    generateSecurePassword,
    getSecurityRecommendations,
    sessionTimeRemaining,
    shouldWarnSessionExpiry
  };
};