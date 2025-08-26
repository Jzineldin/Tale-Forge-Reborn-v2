import { test, expect } from './fixtures/base-fixtures';

test.describe('Story Creation Tests', () => {
  test.beforeEach(async ({ storyPage }) => {
    await storyPage.gotoCreate();
  });
  
  test('should display story creation form', async ({ storyPage }) => {
    // Wait for page to load
    await storyPage.page.waitForLoadState('domcontentloaded');
    
    // Check if we see either the character name input or the custom create button (for wizard)
    const hasCustomButton = await storyPage.customCreateButton.count() > 0;
    const hasNameInput = await storyPage.characterNameInput.count() > 0;
    
    // At least one of these should be present
    expect(hasCustomButton || hasNameInput).toBeTruthy();
  });
  
  test('should fill and submit story form', async ({ storyPage, page }) => {
    // Check if custom creation button exists (wizard mode)
    if (await storyPage.customCreateButton.isVisible()) {
      await storyPage.customCreateButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Fill the form if fields are visible
    await storyPage.fillStoryForm({
      characterName: 'Luna',
      theme: 'adventure',
      lesson: 'courage',
      setting: 'forest',
      ageGroup: '4-6'
    });
    
    // Verify we can proceed (either form filled or wizard step completed)
    const canProceed = await storyPage.nextButton.isVisible() || await storyPage.generateStoryButton.isVisible();
    expect(canProceed).toBeTruthy();
  });
  
  test.skip('should validate required fields', async ({ storyPage }) => {
    // Skip for now - wizard has different validation flow
    // Try to generate without filling required fields
    if (await storyPage.generateStoryButton.isVisible()) {
      await storyPage.generateStoryButton.click();
      
      // Check for validation messages
      const validationMessage = await storyPage.characterNameInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );
      expect(validationMessage).toBeTruthy();
    }
  });
  
  test.skip('should generate a story (requires API)', async ({ storyPage }) => {
    // Skip this test if API is not available
    await storyPage.fillStoryForm({
      characterName: 'Max',
      theme: 'friendship',
      lesson: 'sharing',
      setting: 'school',
      ageGroup: '7-9'
    });
    
    await storyPage.generateStory();
    
    // Verify story content appears
    const storyText = await storyPage.getStoryContent();
    expect(storyText).toBeTruthy();
    expect(storyText.length).toBeGreaterThan(100);
    
    // Verify choices appear
    const choices = await storyPage.getChoices();
    expect(choices.length).toBeGreaterThan(0);
  });
  
  test.skip('should handle API errors gracefully', async ({ storyPage, page }) => {
    // Skip - API endpoints not implemented yet
    // Mock API failure
    await page.route('**/api/generate-story', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await storyPage.fillStoryForm({
      characterName: 'Test'
    });
    
    if (await storyPage.generateStoryButton.isVisible()) {
      await storyPage.generateStoryButton.click();
      
      // Check for error message
      const errorMessage = page.locator('text=/error|failed/i');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    }
  });
});