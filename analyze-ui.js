const { chromium } = require('playwright');

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Discover', path: '/discover' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Help', path: '/help' },
  { name: 'Testimonials', path: '/testimonials' },
  { name: 'Sign In', path: '/auth/signin' },
  { name: 'Sign Up', path: '/auth/signup' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Terms', path: '/terms' }
];

async function analyzeUI() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const results = [];
  
  for (const page of pages) {
    console.log(`Analyzing ${page.name} page...`);
    const browserPage = await context.newPage();
    
    try {
      await browserPage.goto(`http://localhost:5173${page.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait a bit for any animations
      await browserPage.waitForTimeout(1000);
      
      // Take screenshot
      await browserPage.screenshot({ 
        path: `screenshots/${page.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });
      
      // Analyze page structure
      const analysis = await browserPage.evaluate(() => {
        const container = document.querySelector('.container, .max-w-7xl, .max-w-4xl, .max-w-6xl');
        const navbar = document.querySelector('nav, .navbar, header');
        const footer = document.querySelector('footer');
        const hero = document.querySelector('.hero, .hero-section, [class*="hero"]');
        
        // Check for consistent spacing
        const sections = document.querySelectorAll('section, .section, [class*="section"]');
        const paddings = [];
        sections.forEach(section => {
          const styles = window.getComputedStyle(section);
          paddings.push({
            top: styles.paddingTop,
            bottom: styles.paddingBottom,
            left: styles.paddingLeft,
            right: styles.paddingRight
          });
        });
        
        // Check text styles
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingStyles = [];
        headings.forEach(h => {
          const styles = window.getComputedStyle(h);
          headingStyles.push({
            tag: h.tagName,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            color: styles.color,
            margin: styles.margin,
            text: h.textContent.substring(0, 50)
          });
        });
        
        // Check buttons
        const buttons = document.querySelectorAll('button, .btn, [class*="button"]');
        const buttonStyles = [];
        buttons.forEach(btn => {
          const styles = window.getComputedStyle(btn);
          buttonStyles.push({
            padding: styles.padding,
            fontSize: styles.fontSize,
            borderRadius: styles.borderRadius,
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            text: btn.textContent.trim()
          });
        });
        
        // Check cards/boxes
        const cards = document.querySelectorAll('.card, [class*="card"], .box, [class*="box"]');
        const cardStyles = [];
        cards.forEach(card => {
          const styles = window.getComputedStyle(card);
          cardStyles.push({
            padding: styles.padding,
            borderRadius: styles.borderRadius,
            boxShadow: styles.boxShadow,
            backgroundColor: styles.backgroundColor
          });
        });
        
        return {
          hasContainer: !!container,
          containerClass: container?.className,
          hasNavbar: !!navbar,
          hasFooter: !!footer,
          hasHero: !!hero,
          sectionCount: sections.length,
          paddings,
          headingStyles,
          buttonStyles,
          cardStyles,
          bodyClasses: document.body.className,
          mainClasses: document.querySelector('main')?.className
        };
      });
      
      results.push({
        page: page.name,
        path: page.path,
        analysis,
        errors: []
      });
      
    } catch (error) {
      results.push({
        page: page.name,
        path: page.path,
        analysis: null,
        errors: [error.message]
      });
    }
    
    await browserPage.close();
  }
  
  await browser.close();
  
  // Analyze consistency
  console.log('\n=== UI CONSISTENCY ANALYSIS ===\n');
  
  // Check container consistency
  const containers = results.map(r => r.analysis?.containerClass).filter(Boolean);
  const uniqueContainers = [...new Set(containers)];
  if (uniqueContainers.length > 1) {
    console.log('⚠️  INCONSISTENT CONTAINERS DETECTED:');
    uniqueContainers.forEach(c => {
      const pages = results.filter(r => r.analysis?.containerClass === c).map(r => r.page);
      console.log(`   - "${c}" used in: ${pages.join(', ')}`);
    });
  }
  
  // Check padding consistency
  console.log('\n📏 SECTION PADDING ANALYSIS:');
  results.forEach(r => {
    if (r.analysis?.paddings?.length > 0) {
      const uniquePaddings = [...new Set(r.analysis.paddings.map(p => `${p.top} ${p.bottom}`))];
      console.log(`   ${r.page}: ${uniquePaddings.length} unique padding patterns`);
      if (uniquePaddings.length > 2) {
        console.log(`      ⚠️  Too many variations - should be standardized`);
      }
    }
  });
  
  // Check heading consistency
  console.log('\n📝 HEADING STYLES:');
  const allH1s = results.flatMap(r => r.analysis?.headingStyles?.filter(h => h.tag === 'H1') || []);
  const uniqueH1Sizes = [...new Set(allH1s.map(h => h.fontSize))];
  if (uniqueH1Sizes.length > 1) {
    console.log(`   ⚠️  H1 sizes vary: ${uniqueH1Sizes.join(', ')}`);
  }
  
  // Check button consistency
  console.log('\n🔘 BUTTON STYLES:');
  const allButtons = results.flatMap(r => r.analysis?.buttonStyles || []);
  const uniqueButtonPaddings = [...new Set(allButtons.map(b => b.padding))];
  if (uniqueButtonPaddings.length > 3) {
    console.log(`   ⚠️  Too many button padding variations: ${uniqueButtonPaddings.length} unique patterns`);
  }
  
  // Page-specific issues
  console.log('\n📄 PAGE-SPECIFIC ISSUES:');
  results.forEach(r => {
    if (r.errors.length > 0) {
      console.log(`   ❌ ${r.page}: ${r.errors.join(', ')}`);
    } else if (!r.analysis?.hasContainer) {
      console.log(`   ⚠️  ${r.page}: Missing container wrapper`);
    } else if (r.analysis?.sectionCount === 0) {
      console.log(`   ⚠️  ${r.page}: No sections detected`);
    }
  });
  
  // Save detailed report
  const fs = require('fs');
  fs.writeFileSync('ui-analysis-report.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Detailed report saved to ui-analysis-report.json');
  console.log('📸 Screenshots saved to screenshots/ directory');
  
  return results;
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

analyzeUI().catch(console.error);