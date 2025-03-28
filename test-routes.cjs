const puppeteer = require('puppeteer');

// Login credentials
const TEST_EMAIL = 'tester5001@missionfresh.com';
const TEST_PASSWORD = 'TestPassword5001';

// Base URL
const BASE_URL = 'http://localhost:3000';

// Define all routes to test
const ROUTES = [
  '/',
  '/auth',
  '/app',
  '/app/dashboard',
  '/app/progress',
  '/app/consumption-logger',
  '/app/nrt-directory',
  '/app/alternative-products',
  '/app/guides',
  '/app/journal',
  '/app/web-tools',
  '/app/enhanced-support',
  '/app/community',
  '/app/settings',
  '/app/task-manager',
  '/app/trigger-analysis',
  '/app/health/mood',
  '/app/health/energy',
  '/app/health/focus',
  '/app/health/holistic',
  '/app/health/cravings',
  '/app/health/sleep',
  '/app/sleep-quality',
  '/app/private-messaging',
  '/app/advanced-analytics'
];

// Track errors
const errors = [];

async function testRoutes() {
  console.log('Starting route testing...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create a new page
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 800 });
  
  // Capture console logs
  page.on('console', message => {
    const type = message.type();
    const text = message.text();
    
    if (type === 'error' || text.includes('Error') || text.includes('error')) {
      errors.push({
        route: page.url(),
        error: text
      });
      console.log(`ERROR on ${page.url()}: ${text}`);
    }
  });
  
  // Capture network errors
  page.on('requestfailed', request => {
    errors.push({
      route: page.url(),
      error: `Failed to load resource: ${request.url()}, reason: ${request.failure().errorText}`
    });
    console.log(`Failed to load resource: ${request.url()}, reason: ${request.failure().errorText}`);
  });
  
  try {
    // First log in
    console.log('Logging in...');
    await page.goto(`${BASE_URL}/auth`);
    
    // Wait for login form to be ready
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    
    // Enter credentials
    await page.type('input[type="email"]', TEST_EMAIL);
    await page.type('input[type="password"]', TEST_PASSWORD);
    
    // Submit form and wait for navigation
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 })
    ]).catch(e => {
      console.log('Login navigation error (may be normal if redirected):', e.message);
    });
    
    // Check if login was successful (look for elements that only appear when logged in)
    const isLoggedIn = await page.evaluate(() => {
      return document.body.innerText.includes('Dashboard') || 
             document.querySelector('a[href="/app/settings"]') !== null;
    });
    
    if (!isLoggedIn) {
      throw new Error('Login failed. Unable to proceed with route testing.');
    }
    
    console.log('Login successful. Testing routes...');
    
    // Test each route
    for (const route of ROUTES) {
      console.log(`Testing route: ${route}`);
      
      try {
        // Navigate to route
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0', timeout: 10000 });
        
        // Check for error messages in UI
        const hasVisibleErrors = await page.evaluate(() => {
          const errorElements = Array.from(document.querySelectorAll('.error, .error-message, [class*="error"]'));
          return errorElements.some(el => el.offsetParent !== null); // Check if visible
        });
        
        if (hasVisibleErrors) {
          console.log(`Found visible error elements on ${route}`);
          errors.push({
            route,
            error: 'Visible error elements found on page'
          });
        }
        
        // Take screenshot of each page for visual verification
        await page.screenshot({ path: `${route.replace(/\//g, '_')}.png` });
        
        console.log(`Completed testing route: ${route}`);
      } catch (error) {
        console.error(`Error navigating to ${route}:`, error.message);
        errors.push({
          route,
          error: error.message
        });
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
    errors.push({
      route: 'General',
      error: error.message
    });
  } finally {
    // Generate report
    console.log('\n--- TEST REPORT ---');
    
    if (errors.length === 0) {
      console.log('No errors found during route testing!');
    } else {
      console.log(`Found ${errors.length} errors:`);
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. Route: ${error.route}\n   Error: ${error.error}`);
      });
    }
    
    // Close browser
    await browser.close();
  }
}

// Run the test
testRoutes().catch(console.error);
