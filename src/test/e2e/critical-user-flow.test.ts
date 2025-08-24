import { test, expect } from '@playwright/test';

test.describe('Critical User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/functions/v1/**', async route => {
      const url = route.request().url();
      
      if (url.includes('generate-story-segment')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            segment: {
              id: 'segment1',
              content: 'Once upon a time, there was a brave knight named Sir Emma who lived in a magical castle.',
              position: 1,
              choices: [
                { id: 'choice1', text: 'Explore the enchanted forest' },
                { id: 'choice2', text: 'Visit the dragon\'s cave' },
                { id: 'choice3', text: 'Go to the wizard\'s tower' }
              ]
            }
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('user can create account, login, and create a story', async ({ page }) => {
    // Go to homepage
    await page.goto('/');
    
    // Click signup button
    await page.getByRole('link', { name: 'Sign Up' }).click();
    
    // Fill in signup form
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    
    // Navigate to create story page
    await page.getByRole('link', { name: 'Create' }).click();
    await expect(page).toHaveURL('/create');
    
    // Fill in step 1
    await page.getByLabel('Child\'s Name (optional)').fill('Emma');
    await page.getByText('7-9 years (Adventures)').click();
    await page.getByText('Fantasy & Magic 🧙‍♂️').click();
    await page.getByLabel('Story Theme/Idea (optional)').fill('Magic Adventure');
    await page.getByRole('button', { name: 'Next: Character Creation' }).click();
    
    // Fill in step 2
    await page.getByLabel('Character Name').fill('Brave Knight');
    await page.getByLabel('Character Role').fill('Hero');
    await page.getByLabel('Character Description').fill('A brave knight who loves adventure');
    await page.getByPlaceholder('Add a trait (e.g., brave, curious, mischievous)').fill('brave');
    await page.getByText('Add').click();
    await page.getByText('Add Character').click();
    await page.getByRole('button', { name: 'Next: Story Setting' }).click();
    
    // Fill in step 3
    await page.getByText('Fantasy Era').click();
    await page.getByText('Adventurous').click();
    await page.getByLabel('Story Location').fill('Enchanted Castle');
    await page.getByLabel('Setting Description (optional)').fill('A magical castle in the clouds');
    await page.getByRole('button', { name: 'Next: Plot Elements' }).click();
    
    // Fill in step 4
    await page.getByLabel('Central Conflict').fill('Defeat the evil dragon');
    await page.getByLabel('Quest/Goal').fill('Find the magical sword');
    await page.getByLabel('Moral Lesson (optional)').fill('Courage and kindness are important');
    await page.getByLabel('Additional Story Details (optional)').fill('Magic spells and enchanted creatures');
    await page.getByRole('button', { name: 'Next: Review & Generate' }).click();
    
    // Review and create story
    await expect(page.getByText('Emma')).toBeVisible();
    await expect(page.getByText('7-9 years (80-120 words)')).toBeVisible();
    await expect(page.getByText('🧙‍♂️ Fantasy & Magic')).toBeVisible();
    await page.getByRole('button', { name: 'Create My Story' }).click();
    
    // Should show loading state
    await expect(page.getByText('Creating Your Story')).toBeVisible();
    
    // After loading, should redirect to story editor
    // Note: This would require mocking the actual story generation
    // For now, we'll just check that the loading state appears
  });

  test('user can browse and read stories', async ({ page }) => {
    // Login
    await page.goto('/signin');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Go to stories page
    await page.getByRole('link', { name: 'Stories' }).click();
    await expect(page).toHaveURL('/stories');
    
    // Should see stories hub
    await expect(page.getByText('My Story Library')).toBeVisible();
    await expect(page.getByText('Discover Stories')).toBeVisible();
  });

  test('user can manage subscription', async ({ page }) => {
    // Login
    await page.goto('/signin');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Go to account page
    await page.getByRole('link', { name: 'Account' }).click();
    await expect(page).toHaveURL('/account');
    
    // Go to billing page
    await page.getByRole('link', { name: 'Billing' }).click();
    await expect(page).toHaveURL('/account/billing');
    
    // Should see subscription options
    await expect(page.getByText('Free Plan')).toBeVisible();
    await expect(page.getByText('Premium Plan')).toBeVisible();
    await expect(page.getByText('Pro Plan')).toBeVisible();
  });
});