import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { StoryPage } from '../pages/story.page';

/**
 * Custom test fixtures extending Playwright's base test
 */
type MyFixtures = {
  homePage: HomePage;
  storyPage: StoryPage;
};

export const test = base.extend<MyFixtures>({
  // Create page object instances
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  
  storyPage: async ({ page }, use) => {
    const storyPage = new StoryPage(page);
    await use(storyPage);
  },
});

export { expect };