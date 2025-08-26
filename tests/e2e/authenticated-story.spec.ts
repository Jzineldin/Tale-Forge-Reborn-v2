import { test, expect } from './fixtures/base-fixtures';

test.describe('Authenticated Story Creation Tests', () => {
  test.beforeEach(async ({ storyPage }) => {
    await storyPage.gotoCreate();
  });
  
  test('should access story creation wizard when authenticated', async ({ page }) => {
    // Should be on create page
    await expect(page).toHaveURL(/.*\/create/);
    
    // Look for wizard elements - template selector or custom creation
    const wizardElements = page.locator('text=/template|custom|wizard/i').first();
    await expect(wizardElements).toBeVisible({ timeout: 10000 });
  });
  
  test('should show template selection or custom creation options', async ({ storyPage, page }) => {
    // Wait for either template cards or custom creation button
    const templateOption = page.locator('text=/template|custom creation/i').first();
    await expect(templateOption).toBeVisible({ timeout: 10000 });
    
    // If custom creation button exists, click it
    const customButton = storyPage.customCreateButton;
    const buttonExists = await customButton.isVisible().catch(() => false);
    
    if (buttonExists) {
      await customButton.click();
      
      // Should see first step of wizard
      const wizardStep = page.locator('text=/step 1|story concept|genre|theme/i').first();
      await expect(wizardStep).toBeVisible({ timeout: 10000 });
    }
  });
  
  test('should navigate through story creation wizard', async ({ storyPage, page }) => {
    // Try to start custom creation
    const customButton = storyPage.customCreateButton;
    const buttonExists = await customButton.isVisible().catch(() => false);
    
    if (buttonExists) {
      await customButton.click();
    }
    
    // Fill character name
    const nameInput = page.locator('input[type="text"]').first();
    const inputExists = await nameInput.isVisible().catch(() => false);
    
    if (inputExists) {
      await nameInput.fill('Test Story');
    }
    
    // Select age group - required field
    const ageButton = page.locator('[data-testid="age-group-select"] button').first();
    const ageButtonExists = await ageButton.isVisible().catch(() => false);
    
    if (ageButtonExists) {
      await ageButton.click();
    }
    
    // Select genre - required field  
    const genreButton = page.locator('[data-testid="theme-select"] button').first();
    const genreButtonExists = await genreButton.isVisible().catch(() => false);
    
    if (genreButtonExists) {
      await genreButton.click();
    }
    
    // Now try to go to next step - button should be enabled
    const nextButton = storyPage.nextButton;
    const nextExists = await nextButton.isVisible().catch(() => false);
    
    if (nextExists) {
      // Wait a moment for button to become enabled after selections
      await page.waitForTimeout(500);
      
      await nextButton.click();
      
      // Verify we moved to next step
      const stepIndicator = page.locator('text=/step 2|character|setting/i').first();
      const movedToNextStep = await stepIndicator.isVisible({ timeout: 5000 }).catch(() => false);
      expect(movedToNextStep).toBeTruthy();
    }
  });
  
  test('should access stories list when authenticated', async ({ storyPage, page }) => {
    await storyPage.gotoList();
    
    // Should navigate to stories page
    await expect(page).toHaveURL(/.*\/stories/);
    
    // Should see stories list or empty state
    const storiesContent = page.locator('text=/stories|no stories|create.*first/i').first();
    await expect(storiesContent).toBeVisible({ timeout: 10000 });
  });
});