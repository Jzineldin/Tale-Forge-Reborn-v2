import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Story Creation/View Page Object Model
 */
export class StoryPage extends BasePage {
  // Story Creation Locators - Wizard based
  readonly characterNameInput: Locator;
  readonly customCreateButton: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly generateStoryButton: Locator;
  readonly storyContent: Locator;
  readonly choiceButtons: Locator;
  readonly storyImage: Locator;
  readonly loadingSpinner: Locator;
  
  // Form field selectors for wizard steps
  readonly themeSelect: Locator;
  readonly lessonSelect: Locator;
  readonly settingSelect: Locator;
  readonly ageGroupSelect: Locator;
  
  // Story List Locators
  readonly storyCards: Locator;
  readonly searchInput: Locator;
  readonly filterButtons: Locator;
  readonly sortDropdown: Locator;
  
  constructor(page: Page) {
    super(page);
    
    // Story Creation - Wizard
    this.characterNameInput = page.locator('input[name="childName"], input[placeholder*="name"], [data-testid="character-name-input"]').first();
    this.customCreateButton = page.locator('button:has-text("Custom Creation"), button:has-text("Create Custom"), [data-testid="custom-create-button"]').first();
    this.nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').first();
    this.previousButton = page.locator('button:has-text("Previous"), button:has-text("Back")').first();
    this.generateStoryButton = page.locator('button:has-text("Generate Story"), button:has-text("Create Story"), button:has-text("Start Generation")').first();
    this.storyContent = page.locator('[data-testid="story-content"], .story-content, article').first();
    this.choiceButtons = page.locator('[data-testid="choice-button"], button[class*="choice"]');
    this.storyImage = page.locator('[data-testid="story-image"], img[alt*="story"], .story-image').first();
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"], .loading, .spinner').first();
    
    // Form fields that may appear in wizard steps
    this.themeSelect = page.locator('select[name="theme"], [data-testid="theme-select"]').first();
    this.lessonSelect = page.locator('select[name="lesson"], [data-testid="lesson-select"]').first();
    this.settingSelect = page.locator('select[name="setting"], [data-testid="setting-select"]').first();
    this.ageGroupSelect = page.locator('select[name="ageGroup"], [data-testid="age-group-select"]').first();
    
    // Story List
    this.storyCards = page.locator('[data-testid="story-card"]');
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.filterButtons = page.locator('[data-testid="filter-button"]');
    this.sortDropdown = page.locator('select[name="sort"]');
  }
  
  /**
   * Navigate to story creation page
   */
  async gotoCreate() {
    await super.goto('/create');
  }
  
  /**
   * Navigate to stories list page
   */
  async gotoList() {
    await super.goto('/stories');
  }
  
  /**
   * Fill story creation form
   */
  async fillStoryForm(data: {
    characterName: string;
    theme?: string;
    lesson?: string;
    setting?: string;
    ageGroup?: string;
  }) {
    // For wizard-based form, we need to check if fields are visible or navigate through steps
    if (await this.characterNameInput.isVisible()) {
      await this.fillInput(this.characterNameInput, data.characterName);
    }
    
    // Handle button-based selections instead of select options
    if (data.ageGroup && await this.ageGroupSelect.isVisible()) {
      // Click on age group button that contains the specified text
      const ageGroupButton = this.page.locator(`[data-testid="age-group-select"] button:has-text("${data.ageGroup}")`);
      if (await ageGroupButton.isVisible()) {
        await ageGroupButton.click();
      }
    }
    
    if (data.theme && await this.themeSelect.isVisible()) {
      // Click on genre button - map common themes to genre names
      const themeMap: Record<string, string> = {
        'adventure': 'Adventure & Exploration',
        'fantasy': 'Fantasy & Magic',
        'bedtime': 'Bedtime Stories',
        'educational': 'Educational Stories'
      };
      const genreName = themeMap[data.theme] || data.theme;
      const themeButton = this.page.locator(`[data-testid="theme-select"] button:has-text("${genreName}")`);
      if (await themeButton.isVisible()) {
        await themeButton.click();
      }
    }
    
    if (data.setting && await this.settingSelect.isVisible()) {
      // Click on location button - map common settings to location names  
      const settingMap: Record<string, string> = {
        'forest': 'Enchanted Forest',
        'space': 'Space Station',
        'home': 'Cozy Home',
        'castle': 'Magical Castle'
      };
      const locationName = settingMap[data.setting] || data.setting;
      const settingButton = this.page.locator(`[data-testid="setting-select"] button:has-text("${locationName}")`);
      if (await settingButton.isVisible()) {
        await settingButton.click();
      }
    }
    
    if (data.lesson && await this.lessonSelect.isVisible()) {
      // Click on moral lesson button - map common lessons
      const lessonMap: Record<string, string> = {
        'courage': 'Being brave helps others',
        'friendship': 'Friendship is important',
        'kindness': 'Kindness makes the world better',
        'sharing': 'Working together achieves more'
      };
      const lessonName = lessonMap[data.lesson] || data.lesson;
      const lessonButton = this.page.locator(`[data-testid="lesson-select"] button:has-text("${lessonName}")`);
      if (await lessonButton.isVisible()) {
        await lessonButton.click();
      }
    }
  }
  
  /**
   * Generate a story
   */
  async generateStory() {
    await this.generateStoryButton.click();
    await this.waitForStoryGeneration();
  }
  
  /**
   * Wait for story generation to complete
   */
  async waitForStoryGeneration() {
    // Wait for loading to start
    await this.loadingSpinner.waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for loading to complete (max 60 seconds)
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 60000 });
    
    // Wait for story content to appear
    await this.storyContent.waitFor({ state: 'visible' });
  }
  
  /**
   * Make a story choice
   */
  async makeChoice(choiceIndex: number) {
    const choices = await this.choiceButtons.all();
    if (choices[choiceIndex]) {
      await choices[choiceIndex].click();
      await this.waitForStoryGeneration();
    }
  }
  
  /**
   * Get story content text
   */
  async getStoryContent(): Promise<string> {
    return await this.getTextContent(this.storyContent);
  }
  
  /**
   * Get available choices
   */
  async getChoices(): Promise<string[]> {
    return await this.getAllTextContent(this.choiceButtons);
  }
  
  /**
   * Search for stories
   */
  async searchStories(query: string) {
    await this.fillInput(this.searchInput, query);
    await this.page.waitForTimeout(500); // Debounce
  }
  
  /**
   * Get story card count
   */
  async getStoryCount(): Promise<number> {
    return await this.storyCards.count();
  }
  
  /**
   * Click on a story card
   */
  async clickStoryCard(index: number) {
    const cards = await this.storyCards.all();
    if (cards[index]) {
      await cards[index].click();
    }
  }
  
  /**
   * Apply filter
   */
  async applyFilter(filterName: string) {
    const filter = this.filterButtons.filter({ hasText: filterName });
    await filter.click();
  }
  
  /**
   * Sort stories
   */
  async sortBy(option: string) {
    await this.sortDropdown.selectOption(option);
  }
}