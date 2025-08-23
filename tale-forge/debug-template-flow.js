// Debug Template Selection Flow
import { chromium } from 'playwright';

async function debugTemplateFlow() {
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
    console.log('✅ On create page');
    
    // Click Magical Adventure template
    console.log('🧙 Clicking Magical Adventure template...');
    await page.locator('.glass-enhanced:has-text("Magical Adventure")').first().click();
    await page.waitForTimeout(3000);
    
    console.log('📍 Current URL:', page.url());
    
    // Check all buttons after template selection
    const buttons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.map(btn => ({
        text: btn.textContent?.trim(),
        className: btn.className,
        disabled: btn.disabled,
        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
      })).filter(btn => btn.visible);
    });
    
    console.log('\n🔍 Available buttons after template selection:');
    buttons.forEach((btn, i) => {
      console.log(`${i + 1}. "${btn.text}" (${btn.disabled ? 'DISABLED' : 'enabled'})`);
    });
    
    // Look specifically for "Create My Story!" button
    const createButton = await page.locator('button:has-text("Create My Story")').count();
    console.log(`\n🚀 "Create My Story" buttons found: ${createButton}`);
    
    if (createButton > 0) {
      console.log('✅ Found Create My Story button, clicking...');
      await page.locator('button:has-text("Create My Story")').first().click();
      await page.waitForTimeout(3000);
      console.log('📍 URL after clicking:', page.url());
    }
    
    console.log('\n🔍 Keeping browser open for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugTemplateFlow().catch(console.error);