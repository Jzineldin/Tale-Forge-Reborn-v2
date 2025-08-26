import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Home Page Object Model
 */
export class HomePage extends BasePage {
  // Locators
  readonly heroTitle: Locator;
  readonly createStoryButton: Locator;
  readonly viewStoriesButton: Locator;
  readonly storiesNavLink: Locator;
  readonly signInButton: Locator;
  readonly navBar: Locator;
  readonly footer: Locator;
  readonly featureCards: Locator;
  
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.heroTitle = page.locator('h1').first();
    this.createStoryButton = page.locator('button:has-text("Create New Story"), button:has-text("Start Creating Stories")').first();
    this.viewStoriesButton = page.locator('button:has-text("Go to Dashboard"), a:has-text("Learn More")').first();
    this.storiesNavLink = page.locator('a[href="/stories"], nav a:has-text("Stories")').first();
    this.signInButton = page.locator('button:has-text("Sign In"), a[href="/signin"], a[href="/signup"]').first();
    this.navBar = page.locator('nav').first();
    this.footer = page.locator('footer').first();
    this.featureCards = page.locator('.glass-card').filter({ hasText: /AI-Powered|Interactive|Educational/ });
  }
  
  /**
   * Navigate to home page
   */
  async goto() {
    await super.goto('/');
  }
  
  /**
   * Click create story button
   */
  async clickCreateStory() {
    await this.createStoryButton.click();
    await this.page.waitForURL('**/create');
  }
  
  /**
   * Click view stories button/link
   */
  async clickViewStories() {
    // Try to click the navigation Stories link first (when authenticated)
    const storiesLinkVisible = await this.storiesNavLink.isVisible({ timeout: 2000 });
    
    if (storiesLinkVisible) {
      await this.storiesNavLink.click();
      await this.page.waitForURL(/.*\/stories/);
    } else {
      // Fallback to dashboard button if stories link not available
      await this.viewStoriesButton.click();
      await this.page.waitForURL(/.*\/(dashboard|features)/);
    }
  }
  
  /**
   * Click sign in button
   */
  async clickSignIn() {
    await this.signInButton.click();
  }
  
  /**
   * Get hero title text
   */
  async getHeroTitle(): Promise<string> {
    return await this.getTextContent(this.heroTitle);
  }
  
  /**
   * Check if user is signed in
   */
  async isSignedIn(): Promise<boolean> {
    try {
      // Wait for page to fully load after auth
      await this.page.waitForLoadState('domcontentloaded');
      
      // Check for multiple authentication indicators
      const authChecks = await Promise.allSettled([
        // Check for Sign Out button (most reliable indicator)
        this.page.locator('button:has-text("Sign Out")').isVisible({ timeout: 3000 }),
        
        // Check for dashboard/authenticated navigation links
        this.page.locator('a[href="/dashboard"]').isVisible({ timeout: 1000 }),
        
        // Check for credits display (shown when logged in)
        this.page.locator('text=/999999.*credits/i, text=/\d+.*credits/i').isVisible({ timeout: 1000 }),
        
        // Check that Sign In button is NOT visible (inverse check)
        this.page.locator('button:has-text("Sign In")').isHidden({ timeout: 1000 }),
        
        // Check for authenticated navigation elements
        this.page.locator('nav').locator('text=/dashboard|profile|settings/i').isVisible({ timeout: 1000 })
      ]);
      
      // Return true if any authentication indicator is found
      const results = authChecks.map(check => 
        check.status === 'fulfilled' ? check.value : false
      );
      
      const isAuthenticated = results.some(result => result === true);
      
      // Debug logging for troubleshooting
      if (!isAuthenticated) {
        console.log('🔍 Authentication check failed - no indicators found');
        console.log('Auth check results:', results);
      } else {
        console.log('✅ Authentication detected successfully');
      }
      
      return isAuthenticated;
      
    } catch (error) {
      console.log('❌ Authentication check error:', error);
      return false;
    }
  }
  
  /**
   * Get all feature card titles
   */
  async getFeatureCardTitles(): Promise<string[]> {
    return await this.getAllTextContent(this.featureCards.locator('h3'));
  }
  
  /**
   * Verify page loaded correctly
   */
  async verifyPageLoaded() {
    await this.waitForElement('h1');
    await this.heroTitle.waitFor({ state: 'visible' });
  }
}