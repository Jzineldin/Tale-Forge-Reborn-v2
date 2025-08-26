import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

/**
 * Authentication helper for Playwright tests
 */
export class AuthHelper {
  /**
   * Login with email and password
   */
  static async login(page: Page, email: string, password: string) {
    console.log('🔐 Logging in as:', email);
    
    // Navigate to signin page
    await page.goto('/signin');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Give page time to render
    
    // Check if there's an email sign-in option button first
    const emailOption = page.locator('button:has-text("Continue with email"), button:has-text("Or continue with email")').first();
    const emailOptionExists = await emailOption.isVisible().catch(() => false);
    
    if (emailOptionExists) {
      console.log('📧 Found email sign-in option, clicking it...');
      await emailOption.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for any input fields - the page shows textboxes for email and password
    const allInputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], input').all();
    console.log(`🔍 Found ${allInputs.length} input fields`);
    
    if (allInputs.length >= 2) {
      console.log('📝 Found input fields, filling form');
      
      // Find the email and password inputs by their position or attributes
      let emailInput = null;
      let passwordInput = null;
      
      for (const input of allInputs) {
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        const name = await input.getAttribute('name');
        
        console.log(`Input: type=${type}, placeholder=${placeholder}, name=${name}`);
        
        if (!emailInput && (type === 'email' || type === 'text' || placeholder?.toLowerCase().includes('email') || name?.toLowerCase().includes('email'))) {
          emailInput = input;
        } else if (!passwordInput && (type === 'password' || placeholder?.toLowerCase().includes('password') || name?.toLowerCase().includes('password'))) {
          passwordInput = input;
        }
      }
      
      // Fallback to position-based selection if attributes don't help
      if (!emailInput) emailInput = allInputs[0];
      if (!passwordInput) passwordInput = allInputs[1];
      
      // Clear and type email slowly to avoid validation issues
      await emailInput.click();
      await emailInput.clear();
      await emailInput.type(email, { delay: 50 });
      console.log('✉️ Typed email field');
      
      // Clear and type password
      await passwordInput.click();
      await passwordInput.clear();
      await passwordInput.type(password, { delay: 50 });
      console.log('🔑 Typed password field');
      
      // Find and click the submit button (not the nav button)
      const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first();
      
      console.log('🚀 Clicking Sign In button...');
      await submitButton.click();
      
      // Wait a moment for any error messages or navigation
      await page.waitForTimeout(2000);
      
      // Check for login-specific error messages (not dashboard data errors)
      const errorMessage = page.locator('text=/invalid.*password|incorrect.*credentials|authentication.*failed|invalid.*email/i').first();
      const hasLoginError = await errorMessage.isVisible().catch(() => false);
      
      if (hasLoginError) {
        const errorText = await errorMessage.textContent();
        console.log('❌ Login error:', errorText);
        throw new Error(`Login failed with error: ${errorText}`);
      }
      
      // Check if we successfully navigated away from signin
      const currentUrl = page.url();
      if (!currentUrl.includes('/signin') && !currentUrl.includes('/login')) {
        console.log('✅ Successfully navigated to:', currentUrl);
      } else {
        // We're still on signin page - maybe credentials are wrong or there's another issue
        console.log('⚠️ Still on signin page after clicking submit');
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'test-results/signin-failed.png' });
        console.log('📸 Screenshot saved to test-results/signin-failed.png');
        
        throw new Error('Login failed - still on signin page after submit');
      }
    } else {
      console.log('⚠️ Email/password form not found');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/signin-page-debug.png' });
      console.log('📸 Screenshot saved to test-results/signin-page-debug.png');
      
      // Log what we can see on the page
      const buttons = await page.locator('button').allTextContents();
      console.log('🔍 Buttons found on page:', buttons);
      
      throw new Error('Could not find email/password login form');
    }
    
    console.log('✅ Login successful, navigated to:', page.url());
    
    // Save authentication state
    await page.context().storageState({ path: AUTH_FILE });
    console.log('💾 Auth state saved to:', AUTH_FILE);
  }
  
  /**
   * Check if user is logged in
   */
  static async isLoggedIn(page: Page): Promise<boolean> {
    // Check for common indicators of being logged in
    const indicators = [
      page.locator('[data-testid="user-menu"]'),
      page.locator('[data-testid="user-avatar"]'),
      page.locator('button:has-text("Sign Out")'),
      page.locator('button:has-text("Logout")'),
      page.locator('a[href="/dashboard"]'),
      page.locator('a[href="/profile"]')
    ];
    
    for (const indicator of indicators) {
      const count = await indicator.count();
      if (count > 0) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Logout
   */
  static async logout(page: Page) {
    console.log('🔓 Logging out...');
    
    // Try different logout button selectors
    const logoutButton = page.locator(
      'button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("Log Out"), [data-testid="logout-button"]'
    ).first();
    
    const buttonExists = await logoutButton.count() > 0;
    
    if (buttonExists) {
      await logoutButton.click();
      await page.waitForURL('**/signin', { timeout: 10000 });
      console.log('✅ Logged out successfully');
    } else {
      console.log('⚠️ Logout button not found, clearing storage instead');
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }
  }
  
  /**
   * Load saved authentication state
   */
  static async loadAuthState(): Promise<any | null> {
    try {
      if (fs.existsSync(AUTH_FILE)) {
        const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
        console.log('🔑 Loaded auth state from file');
        return authData;
      }
    } catch (error) {
      console.error('❌ Failed to load auth state:', error);
    }
    return null;
  }
  
  /**
   * Clear saved authentication
   */
  static async clearAuthState() {
    try {
      if (fs.existsSync(AUTH_FILE)) {
        fs.unlinkSync(AUTH_FILE);
        console.log('🗑️ Cleared saved auth state');
      }
    } catch (error) {
      console.error('❌ Failed to clear auth state:', error);
    }
  }
  
  /**
   * Create authenticated context
   */
  static async createAuthenticatedContext(browser: any): Promise<BrowserContext> {
    const authState = await AuthHelper.loadAuthState();
    
    if (authState) {
      console.log('📱 Creating context with saved auth state');
      return await browser.newContext({ storageState: authState });
    } else {
      console.log('📱 Creating fresh context (no saved auth)');
      return await browser.newContext();
    }
  }
  
  /**
   * Ensure user is logged in before test
   */
  static async ensureLoggedIn(page: Page, email: string, password: string) {
    const isLoggedIn = await AuthHelper.isLoggedIn(page);
    
    if (!isLoggedIn) {
      console.log('🔄 User not logged in, attempting login...');
      await AuthHelper.login(page, email, password);
    } else {
      console.log('✅ User already logged in');
    }
  }
}