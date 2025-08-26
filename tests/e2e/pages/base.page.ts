import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model
 * Contains common functionality for all pages
 */
export class BasePage {
  readonly page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  /**
   * Navigate to a specific path
   */
  async goto(path: string = '') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
  
  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = 30000) {
    await this.page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    });
  }
  
  /**
   * Click element with retry logic
   */
  async clickWithRetry(locator: Locator, retries: number = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await locator.click({ timeout: 5000 });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }
  
  /**
   * Fill input with clear
   */
  async fillInput(locator: Locator, value: string) {
    await locator.click();
    await locator.fill('');
    await locator.fill(value);
  }
  
  /**
   * Take screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }
  
  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    return await this.page.locator(selector).count() > 0;
  }
  
  /**
   * Get text content
   */
  async getTextContent(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }
  
  /**
   * Wait for API response
   */
  async waitForResponse(urlPattern: string | RegExp) {
    return await this.page.waitForResponse(urlPattern);
  }
  
  /**
   * Execute JavaScript in page context
   */
  async executeScript<T>(script: string): Promise<T> {
    return await this.page.evaluate(script);
  }
  
  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }
  
  /**
   * Get all text content from multiple elements
   */
  async getAllTextContent(locator: Locator): Promise<string[]> {
    return await locator.allTextContents();
  }
}