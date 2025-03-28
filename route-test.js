// Route testing script using Puppeteer
import puppeteer from 'puppeteer';

// Test configuration
const BASE_URL = 'http://localhost:5005';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Routes to test - all protected routes should be under /app
const ROUTES = [
  { path: '/', name: 'Home (Landing)' },
  { path: '/auth', name: 'Authentication' },
  { path: '/app', name: 'Dashboard' },
  { path: '/app/progress', name: 'Progress' },
  { path: '/app/consumption-logger', name: 'Consumption Logger' },
  { path: '/app/nrt-directory', name: 'NRT Directory' },
  { path: '/app/alternative-products', name: 'Alternatives' },
  { path: '/app/guides', name: 'Guides' },
  { path: '/app/web-tools', name: 'Tools' },
  { path: '/app/community', name: 'Community' },
  { path: '/app/settings', name: 'Settings' }
];

const testRoutes = async () => {
  console.log('Starting route tests with Puppeteer...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    console.log(`Browser launched successfully`);
    
    // Configure console logging from the page
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));
    page.on('pageerror', error => console.log(`PAGE ERROR: ${error.message}`));
    
    // Enable request logging for API calls
    page.on('request', request => {
      const url = request.url();
      if (url.includes('supabase') || url.includes('api')) {
        console.log(`REQUEST: ${request.method()} ${url}`);
      }
    });
    
    // Enable response logging for API calls
    page.on('response', response => {
      const url = response.url();
      if (url.includes('supabase') || url.includes('api')) {
        console.log(`RESPONSE: ${response.status()} ${url}`);
      }
    });
    
    // Test login first
    console.log(`\n--- Testing Login Page ---`);
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle0' });
    console.log(`Navigated to auth page`);
    
    // Check if we need to log in
    const isLoginPage = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null;
    });
    
    if (isLoginPage) {
      console.log(`Found login form, attempting to log in...`);
      await page.type('input[type="email"]', TEST_EMAIL);
      await page.type('input[type="password"]', TEST_PASSWORD);
      
      // Click the login button and wait for navigation
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]).catch(e => {
        console.log('Navigation after login may have failed, continuing anyway');
      });
      
      console.log(`Login form submitted`);
    } else {
      console.log(`Already logged in or login form not found`);
    }
    
    // Test each route
    for (const route of ROUTES) {
      console.log(`\n--- Testing Route: ${route.name} (${route.path}) ---`);
      try {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0' });
        console.log(`✅ Successfully loaded ${route.name} page`);
        
        // Take screenshot for verification
        await page.screenshot({ path: `${route.name.toLowerCase().replace(/\s+/g, '-')}-screenshot.png` });
        
        // Check for common error indicators
        const hasErrors = await page.evaluate(() => {
          const errorTexts = ['error', 'not found', '404', 'undefined', 'null is not an object'];
          const pageText = document.body.innerText.toLowerCase();
          
          for (const errorText of errorTexts) {
            if (pageText.includes(errorText)) {
              return true;
            }
          }
          
          return false;
        });
        
        if (hasErrors) {
          console.log(`⚠️ Potential errors detected on ${route.name} page`);
        } else {
          console.log(`No obvious errors detected on ${route.name} page`);
        }
      } catch (error) {
        console.error(`❌ Failed to load ${route.name} page:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
    console.log('\nBrowser closed. Route testing complete.');
  }
};

testRoutes(); 