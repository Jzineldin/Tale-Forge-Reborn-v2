// Comprehensive Authentication Flow Testing
// Tests route protection, redirects, and authentication states

import { chromium } from 'playwright';

async function testAuthenticationFlows() {
  console.log('🔐 Testing Authentication Flows & Route Protection...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    publicRoutes: [],
    protectedRoutes: [],
    adminRoutes: [],
    redirectTests: [],
    authStateTests: [],
    errors: []
  };

  try {
    // Test 1: Public routes should be accessible without authentication
    console.log('📖 Testing public routes accessibility...');
    const publicRoutes = [
      { url: 'http://localhost:3003/', name: 'Homepage' },
      { url: 'http://localhost:3003/features', name: 'Features' },
      { url: 'http://localhost:3003/pricing', name: 'Pricing' },
      { url: 'http://localhost:3003/auth/signin', name: 'Sign In' },
      { url: 'http://localhost:3003/auth/signup', name: 'Sign Up' }
    ];

    for (const route of publicRoutes) {
      try {
        console.log(`  Testing ${route.name}...`);
        await page.goto(route.url, { waitUntil: 'networkidle' });
        
        // Check if page loaded properly (not redirected to signin)
        const currentUrl = page.url();
        const isAccessible = currentUrl === route.url;
        
        // Check for auth-related content
        const hasSignInButton = await page.locator('text=Sign In').count() > 0;
        const hasProtectedContent = await page.locator('text=Dashboard').count() > 0;
        
        results.publicRoutes.push({
          name: route.name,
          url: route.url,
          accessible: isAccessible,
          hasSignIn: hasSignInButton,
          hasProtectedContent: hasProtectedContent,
          actualUrl: currentUrl
        });
        
        console.log(`    ✅ ${route.name}: ${isAccessible ? 'Accessible' : 'Redirected'}`);
      } catch (error) {
        results.errors.push({
          route: route.name,
          test: 'Public Route Access',
          error: error.message
        });
        console.log(`    ❌ ${route.name}: ${error.message}`);
      }
    }

    // Test 2: Protected routes should redirect to signin when not authenticated
    console.log('\n🔒 Testing protected route redirects...');
    const protectedRoutes = [
      { url: 'http://localhost:3003/dashboard', name: 'Dashboard' },
      { url: 'http://localhost:3003/stories/create', name: 'Create Story' },
      { url: 'http://localhost:3003/account', name: 'Account' },
      { url: 'http://localhost:3003/stories/hub', name: 'Stories Hub' }
    ];

    for (const route of protectedRoutes) {
      try {
        console.log(`  Testing ${route.name} redirect...`);
        await page.goto(route.url, { waitUntil: 'networkidle', timeout: 10000 });
        
        const currentUrl = page.url();
        const redirectedToSignIn = currentUrl.includes('/signin') || currentUrl.includes('/auth/signin');
        
        // Check for sign in form elements
        const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
        const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
        const hasSignInButton = await page.locator('button:has-text("Sign In")').count() > 0;
        
        results.protectedRoutes.push({
          name: route.name,
          originalUrl: route.url,
          redirected: redirectedToSignIn,
          finalUrl: currentUrl,
          hasLoginForm: hasEmailInput && hasPasswordInput && hasSignInButton
        });
        
        console.log(`    ${redirectedToSignIn ? '✅' : '❌'} ${route.name}: ${redirectedToSignIn ? 'Properly redirected to signin' : 'Not redirected'}`);
      } catch (error) {
        results.errors.push({
          route: route.name,
          test: 'Protected Route Redirect',
          error: error.message
        });
        console.log(`    ❌ ${route.name}: ${error.message}`);
      }
    }

    // Test 3: Admin routes should redirect to signin (and then to dashboard if not admin)
    console.log('\n👑 Testing admin route protection...');
    const adminRoutes = [
      { url: 'http://localhost:3003/admin', name: 'Admin Dashboard' },
      { url: 'http://localhost:3003/admin/users', name: 'Admin Users' },
      { url: 'http://localhost:3003/admin/content', name: 'Admin Content' }
    ];

    for (const route of adminRoutes) {
      try {
        console.log(`  Testing ${route.name} redirect...`);
        await page.goto(route.url, { waitUntil: 'networkidle', timeout: 10000 });
        
        const currentUrl = page.url();
        const redirectedToSignIn = currentUrl.includes('/signin') || currentUrl.includes('/auth/signin');
        
        results.adminRoutes.push({
          name: route.name,
          originalUrl: route.url,
          redirected: redirectedToSignIn,
          finalUrl: currentUrl
        });
        
        console.log(`    ${redirectedToSignIn ? '✅' : '❌'} ${route.name}: ${redirectedToSignIn ? 'Properly redirected to signin' : 'Not redirected'}`);
      } catch (error) {
        results.errors.push({
          route: route.name,
          test: 'Admin Route Redirect',
          error: error.message
        });
        console.log(`    ❌ ${route.name}: ${error.message}`);
      }
    }

    // Test 4: Authentication state management
    console.log('\n🔄 Testing authentication state transitions...');
    
    // Go to signin page
    await page.goto('http://localhost:3003/auth/signin', { waitUntil: 'networkidle' });
    
    // Check if signin form is present and functional
    const emailInput = await page.locator('input[type="email"]');
    const passwordInput = await page.locator('input[type="password"]');
    const signInButton = await page.locator('button:has-text("Sign In"), input[type="submit"]').first();
    
    const hasCompleteForm = await emailInput.count() > 0 && await passwordInput.count() > 0 && await signInButton.count() > 0;
    
    // Test form interaction
    let formInteractive = false;
    if (hasCompleteForm) {
      try {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('testpassword123');
        
        // Check if form accepts input
        const emailValue = await emailInput.inputValue();
        const passwordValue = await passwordInput.inputValue();
        
        formInteractive = emailValue === 'test@example.com' && passwordValue === 'testpassword123';
        
        // Clear form
        await emailInput.clear();
        await passwordInput.clear();
      } catch (error) {
        console.log(`    Form interaction error: ${error.message}`);
      }
    }

    results.authStateTests.push({
      signinFormPresent: hasCompleteForm,
      formInteractive: formInteractive,
      pageUrl: page.url()
    });

    console.log(`    ${hasCompleteForm ? '✅' : '❌'} Sign in form: ${hasCompleteForm ? 'Complete and functional' : 'Missing elements'}`);
    console.log(`    ${formInteractive ? '✅' : '❌'} Form interaction: ${formInteractive ? 'Working' : 'Not working'}`);

    // Test 5: OAuth providers (if available)
    console.log('\n🔗 Checking OAuth integration...');
    
    const googleSignIn = await page.locator('button:has-text("Google"), button:has-text("Continue with Google")').count();
    const githubSignIn = await page.locator('button:has-text("GitHub"), button:has-text("Continue with GitHub")').count();
    
    results.authStateTests.push({
      oauthProviders: {
        google: googleSignIn > 0,
        github: githubSignIn > 0
      }
    });

    console.log(`    ${googleSignIn > 0 ? '✅' : '❌'} Google OAuth: ${googleSignIn > 0 ? 'Available' : 'Not found'}`);
    console.log(`    ${githubSignIn > 0 ? '✅' : '❌'} GitHub OAuth: ${githubSignIn > 0 ? 'Available' : 'Not found'}`);

    // Summary Report
    console.log('\n📊 AUTHENTICATION FLOW TEST SUMMARY:');
    console.log(`  ✅ Public routes accessible: ${results.publicRoutes.filter(r => r.accessible).length}/${results.publicRoutes.length}`);
    console.log(`  🔒 Protected routes redirected: ${results.protectedRoutes.filter(r => r.redirected).length}/${results.protectedRoutes.length}`);
    console.log(`  👑 Admin routes redirected: ${results.adminRoutes.filter(r => r.redirected).length}/${results.adminRoutes.length}`);
    console.log(`  🔄 Authentication forms working: ${results.authStateTests.filter(t => t.signinFormPresent && t.formInteractive).length}/1`);
    console.log(`  ❌ Total errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach(error => {
        console.log(`  - ${error.route} (${error.test}): ${error.error}`);
      });
    }

    return results;

  } catch (error) {
    console.error('💥 Authentication testing failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testAuthenticationFlows()
  .then(results => {
    console.log('\n🎉 Authentication Flow Testing Complete!');
    
    // Calculate overall auth health score
    const publicRoutesScore = (results.publicRoutes.filter(r => r.accessible).length / results.publicRoutes.length) * 100;
    const protectedRoutesScore = (results.protectedRoutes.filter(r => r.redirected).length / results.protectedRoutes.length) * 100;
    const adminRoutesScore = (results.adminRoutes.filter(r => r.redirected).length / results.adminRoutes.length) * 100;
    const authStateScore = (results.authStateTests.filter(t => t.signinFormPresent && t.formInteractive).length / 1) * 100;
    
    const overallScore = (publicRoutesScore + protectedRoutesScore + adminRoutesScore + authStateScore) / 4;
    
    console.log(`\n🏆 Overall Authentication Health: ${overallScore.toFixed(1)}%`);
    console.log(`  - Public Route Access: ${publicRoutesScore.toFixed(1)}%`);
    console.log(`  - Protected Route Security: ${protectedRoutesScore.toFixed(1)}%`);
    console.log(`  - Admin Route Security: ${adminRoutesScore.toFixed(1)}%`);
    console.log(`  - Authentication Forms: ${authStateScore.toFixed(1)}%`);
    
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Testing failed:', error);
    process.exit(1);
  });