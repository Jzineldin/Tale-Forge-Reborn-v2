// Debug Create Page - See what's available
import { chromium } from 'playwright';

async function debugCreatePage() {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  
  try {
    // Login
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.locator('button:has-text("Sign In")').first().click();
    await page.fill('input[type="email"]', 'jzineldin@gmail.com');
    await page.fill('input[type="password"]', 'Rashzin1996!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    
    // Go to create page
    await page.locator('a[href="/create"]').first().click();
    await page.waitForTimeout(2000);
    
    // Debug: Log all buttons and their text
    const buttons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.map(btn => ({
        text: btn.textContent?.trim(),
        className: btn.className,
        disabled: btn.disabled
      }));
    });
    
    console.log('🔍 Available buttons on create page:');
    buttons.forEach((btn, i) => {
      console.log(`${i + 1}. "${btn.text}" (${btn.disabled ? 'DISABLED' : 'enabled'}) - ${btn.className}`);
    });
    
    // Debug: Log all divs with text content
    const divs = await page.evaluate(() => {
      const divElements = Array.from(document.querySelectorAll('div'));
      return divElements
        .filter(div => div.textContent?.includes('Magical') || div.textContent?.includes('Adventure'))
        .map(div => div.textContent?.trim());
    });
    
    console.log('\n🧙 Divs containing "Magical" or "Adventure":');
    divs.forEach((text, i) => {
      console.log(`${i + 1}. "${text}"`);
    });
    
    // Try clicking on Magical Adventure template first
    console.log('\n🎯 Attempting to select Magical Adventure template...');
    
    // Look for template cards
    const templateCards = await page.locator('div').filter({ hasText: 'Magical Adventure' }).all();
    console.log(`Found ${templateCards.length} elements with "Magical Adventure"`);
    
    if (templateCards.length > 0) {
      await templateCards[0].click();
      await page.waitForTimeout(1000);
      
      // Check buttons again after template selection
      const buttonsAfterSelection = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.map(btn => ({
          text: btn.textContent?.trim(),
          className: btn.className,
          disabled: btn.disabled
        }));
      });
      
      console.log('\n🔍 Buttons after template selection:');
      buttonsAfterSelection.forEach((btn, i) => {
        console.log(`${i + 1}. "${btn.text}" (${btn.disabled ? 'DISABLED' : 'enabled'}) - ${btn.className}`);
      });
    }
    
    console.log('\n🔍 Keeping browser open for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugCreatePage().catch(console.error);