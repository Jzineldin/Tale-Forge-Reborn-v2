// Authentication security utilities for enhanced user experience and security

export interface PasswordStrengthResult {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isStrong: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ip?: string;
}

export class AuthSecurityManager {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly STORAGE_KEY = 'taleforge_login_attempts';

  // Password strength checker
  static checkPasswordStrength(password: string): PasswordStrengthResult {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    let score = 0;
    const feedback: string[] = [];

    // Base score from requirements
    score = metRequirements;

    // Additional scoring factors
    if (password.length >= 12) score += 0.5;
    if (password.length >= 16) score += 0.5;
    if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
    if (/^[a-zA-Z]+$/.test(password)) score -= 1; // Only letters
    if (/^\d+$/.test(password)) score -= 2; // Only numbers

    // Cap score
    score = Math.max(0, Math.min(4, score));

    // Generate feedback
    if (!requirements.minLength) {
      feedback.push('Use at least 8 characters');
    }
    if (!requirements.hasUppercase) {
      feedback.push('Include uppercase letters');
    }
    if (!requirements.hasLowercase) {
      feedback.push('Include lowercase letters');
    }
    if (!requirements.hasNumbers) {
      feedback.push('Include numbers');
    }
    if (!requirements.hasSpecialChars) {
      feedback.push('Include special characters (!@#$%^&*)');
    }
    if (password.length < 12) {
      feedback.push('Consider using 12+ characters for better security');
    }

    return {
      score,
      feedback,
      isStrong: score >= 3 && requirements.minLength,
      requirements
    };
  }

  // Rate limiting for login attempts
  static isLoginBlocked(email: string): { blocked: boolean; timeRemaining?: number } {
    try {
      const attemptsData = localStorage.getItem(this.STORAGE_KEY);
      if (!attemptsData) return { blocked: false };

      const attempts: LoginAttempt[] = JSON.parse(attemptsData);
      const userAttempts = attempts.filter(a => 
        a.email === email && 
        !a.success && 
        Date.now() - a.timestamp < this.LOCKOUT_DURATION
      );

      if (userAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
        const oldestAttempt = Math.min(...userAttempts.map(a => a.timestamp));
        const timeRemaining = this.LOCKOUT_DURATION - (Date.now() - oldestAttempt);
        
        if (timeRemaining > 0) {
          return { blocked: true, timeRemaining };
        }
      }

      return { blocked: false };
    } catch (error) {
      console.error('Error checking login attempts:', error);
      return { blocked: false };
    }
  }

  static recordLoginAttempt(email: string, success: boolean): void {
    try {
      const attemptsData = localStorage.getItem(this.STORAGE_KEY);
      const attempts: LoginAttempt[] = attemptsData ? JSON.parse(attemptsData) : [];

      // Add new attempt
      attempts.push({
        email,
        timestamp: Date.now(),
        success,
        ip: 'local' // In production, get from server
      });

      // Clean old attempts (older than lockout duration)
      const cleanedAttempts = attempts.filter(a => 
        Date.now() - a.timestamp < this.LOCKOUT_DURATION
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanedAttempts));
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  // Enhanced error messages for better UX
  static getErrorMessage(error: any): string {
    const errorMessage = error?.message || error || 'Unknown error';

    // Map common Supabase errors to user-friendly messages
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'The email or password you entered is incorrect. Please try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'User not found': 'No account found with this email address. Would you like to create an account?',
      'Too many requests': 'Too many login attempts. Please wait a few minutes before trying again.',
      'Network request failed': 'Connection problem. Please check your internet connection and try again.',
      'Signup disabled': 'New account registration is currently disabled.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'User already registered': 'An account with this email already exists. Try signing in instead.',
      'Invalid email': 'Please enter a valid email address.',
      'Weak password': 'Password is too weak. Please choose a stronger password.',
      'Token has expired or is invalid': 'Your session has expired. Please sign in again.'
    };

    // Check for partial matches
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Return original message if no mapping found
    return errorMessage;
  }

  // Session security utilities
  static getSessionTimeRemaining(): number | null {
    try {
      const session = localStorage.getItem('supabase.auth.token');
      if (!session) return null;

      const sessionData = JSON.parse(session);
      const expiresAt = sessionData?.expires_at;
      
      if (!expiresAt) return null;

      const timeRemaining = expiresAt * 1000 - Date.now();
      return timeRemaining > 0 ? timeRemaining : 0;
    } catch (error) {
      return null;
    }
  }

  static shouldWarnSessionExpiry(): boolean {
    const timeRemaining = this.getSessionTimeRemaining();
    if (!timeRemaining) return false;

    // Warn when less than 5 minutes remaining
    return timeRemaining < 5 * 60 * 1000;
  }

  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  // Security recommendations
  static getSecurityRecommendations(user: any): string[] {
    const recommendations: string[] = [];

    if (!user) return recommendations;

    // Check for OAuth vs email auth
    if (user.signup_method === 'email' && !user.email_verified) {
      recommendations.push('Verify your email address for better account security');
    }

    // Check password age (if available)
    if (user.password_updated_at) {
      const daysSinceUpdate = (Date.now() - new Date(user.password_updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 90) {
        recommendations.push('Consider updating your password - it has been over 3 months');
      }
    }

    // Check for 2FA (placeholder for future implementation)
    if (!user.mfa_enabled) {
      recommendations.push('Enable two-factor authentication for enhanced security');
    }

    return recommendations;
  }

  // Generate secure password suggestion
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}

export default AuthSecurityManager;