/**
 * Protected Routes Test Script
 * Tests access to protected routes after authentication
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Credentials to test (these have been verified to work with the Supabase API)
const EMAIL = 'hertzofhopes@gmail.com';
const PASSWORD = 'J4913836j';

// Routes to test
const PROTECTED_ROUTES = [
  '/app',
  '/app/dashboard',
  '/app/progress',
  '/app/consumption',
  '/app/nrt-directory',
  '/app/alternative-products',
  '/app/guides',
  '/app/web-tools',
  '/app/community',
  '/app/settings'
];

async function captureScreenshot(page, name) {
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  await page.screenshot({ 
    path: path.join(dir, `${name}_${Date.now()}.png`),
    fullPage: true 
  });
}

async function testProtectedRoutes() {
  console.log('Protected Routes Test');
  console.log('====================');
  
  // Launch browser with a visible window for better debugging
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // Log console messages and errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console] ${msg.text()}`);
      }
      if (msg.text().includes('Auth state')) {
        console.log(`[Browser Console] ${msg.text()}`);
      }
    });
    
    // Navigate directly to the app root
    console.log('\nNavigating to app root...');
    await page.goto('http://localhost:5003/', { waitUntil: 'networkidle0', timeout: 10000 });
    await captureScreenshot(page, 'initial_page');
    
    // Extract auth state information from localStorage
    const hasToken = await page.evaluate(() => {
      return !!localStorage.getItem('supabase.auth.token');
    });
    
    console.log(`Initial auth state: ${hasToken ? 'Already logged in' : 'Not logged in'}`);
    
    // If not logged in, perform login
    if (!hasToken) {
      console.log('\nNot logged in, navigating to auth page...');
      await page.goto('http://localhost:5003/auth', { waitUntil: 'networkidle0', timeout: 10000 });
      await captureScreenshot(page, 'auth_page');
      
      console.log('Filling login form...');
      
      // Fill and submit login form
      await page.type('input[type="email"]', EMAIL);
      await page.type('input[type="password"]', PASSWORD);
      
      // Find login button - might be different selectors
      const loginButtonSelector = 'button.w-full';
      const hasLoginButton = await page.$(loginButtonSelector);
      
      if (!hasLoginButton) {
        console.error('Login button not found!');
        return;
      }
      
      console.log('Submitting login form...');
      await Promise.all([
        page.click(loginButtonSelector),
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }).catch(e => {
          console.warn(`Navigation after login timed out: ${e.message}`);
        })
      ]);
      
      await captureScreenshot(page, 'after_login');
      
      // Check if login was successful
      const currentUrl = page.url();
      const loggedIn = currentUrl.includes('/app');
      console.log(`Login result: ${loggedIn ? 'Success' : 'Failed'} - Current URL: ${currentUrl}`);
      
      if (!loggedIn) {
        console.error('Failed to log in - cannot proceed with route testing');
        return;
      }
    }
    
    // Test all protected routes
    console.log('\nTesting protected routes...');
    const results = {
      success: 0,
      failed: 0,
      details: {}
    };
    
    for (const route of PROTECTED_ROUTES) {
      console.log(`\nNavigating to: ${route}`);
      const url = `http://localhost:5003${route}`;
      
      try {
        // Navigate to route
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => {
          console.warn(`Navigation warning for ${route}: ${e.message}`);
        });
        
        await captureScreenshot(page, `route_${route.replace(/\//g, '_')}`);
        
        // Check current URL
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);
        
        // Expected path (note that /app will typically redirect to /app/dashboard)
        const expectedPath = route === '/app' ? '/app/dashboard' : route;
        const isCorrectRoute = currentUrl.includes(expectedPath);
        
        // Check for error indicators in the DOM
        const hasErrors = await page.evaluate(() => {
          // Look for error messages, alerts, or visual error indicators
          const errorElements = document.querySelectorAll('.error-message, .error, [role="alert"]');
          
          return Array.from(errorElements)
            .filter(el => el.offsetParent !== null) // Only visible elements
            .map(el => el.textContent.trim());
        });
        
        // Check for main content to ensure page loaded properly
        const hasContent = await page.evaluate(() => {
          return document.querySelector('main') !== null;
        });
        
        if (isCorrectRoute && hasContent && hasErrors.length === 0) {
          console.log(`✅ Route ${route} loaded successfully`);
          results.success++;
          results.details[route] = 'success';
        } else {
          let reason = [];
          if (!isCorrectRoute) reason.push('incorrect URL');
          if (!hasContent) reason.push('no main content');
          if (hasErrors.length > 0) reason.push(`errors found: ${hasErrors.join(', ')}`);
          
          console.error(`❌ Route ${route} failed - ${reason.join(', ')}`);
          results.failed++;
          results.details[route] = `failed - ${reason.join(', ')}`;
        }
      } catch (error) {
        console.error(`❌ Error testing route ${route}:`, error.message);
        results.failed++;
        results.details[route] = `error - ${error.message}`;
      }
      
      // Short pause between routes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Print summary
    console.log('\n=== Route Test Summary ===');
    console.log(`Total routes tested: ${PROTECTED_ROUTES.length}`);
    console.log(`Successful: ${results.success}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\nFailed routes:');
      for (const [route, status] of Object.entries(results.details)) {
        if (!status.startsWith('success')) {
          console.log(`- ${route}: ${status}`);
        }
      }
    }
    
    console.log('\nTest completed. Browser will close in 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testProtectedRoutes(); 