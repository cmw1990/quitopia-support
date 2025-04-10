import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:6001/easier-focus';

const routes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/app/dashboard',
  '/app/focus',
  '/app/energy',
  '/app/sleep',
  '/app/mental-health',
  '/app/tools',
  '/app/settings',
  '/app/profile',
  '/app/focus-timer',
  '/app/focus-journal',
  '/app/focus-stats',
  '/app/focus-strategies',
  '/app/focus-sessions',
  '/app/achievements',
  '/app/tasks',
  '/app/mood-energy',
  '/app/analytics',
  '/web-tools',
  '/mobile-app',
  '/why-us'
];

async function runTest() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Collect console logs
  page.on('console', (msg) => {
    const type = msg.type();
    let prefix = type === 'error' ? '[Page Console Error]' : `[Page Console ${type}]`;
    console.log(`${prefix} ${msg.text()}`);
  });

  // Navigate to login page
  console.log('Navigating to the login page...');
  await page.goto('http://localhost:6001/easier-focus/auth/login');

  // Wait for the page to load completely
  await page.waitForSelector('body');

  // Check for manifest file
  try {
    const manifestResponse = await page.goto('http://localhost:6001/easier-focus/manifest.json');
    const status = manifestResponse.status();
    console.log(`Manifest status: ${status}`);
    if (status === 200) {
      const manifestContent = await manifestResponse.text();
      console.log(`Manifest content: ${manifestContent.substring(0, 100)}...`);
      
      try {
        JSON.parse(manifestContent);
        console.log('Manifest JSON is valid');
      } catch (error) {
        console.log(`Manifest JSON parsing error: ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`Error checking manifest: ${error.message}`);
  }

  // Back to login page
  await page.goto('http://localhost:6001/easier-focus/auth/login');
  
  // Look for the login form
  console.log('Looking for login form...');
  const emailInput = await page.$('input[type="email"]');
  const passwordInput = await page.$('input[type="password"]');
  
  if (emailInput && passwordInput) {
    console.log('Found login form elements, filling them in...');
    
    // Fill in login credentials
    await emailInput.type('hertzofhopes@gmail.com');
    await passwordInput.type('DesignerK9@');
    
    // Log the email we're using for login
    await page.evaluate(() => {
      console.log(`Attempting login with: hertzofhopes@gmail.com`);
    });
    
    // Wait a bit after typing
    await page.waitForTimeout(1000);
    
    // Find and click the login button
    const loginButton = await page.$('button[type="submit"]');
    
    if (loginButton) {
      // Wait for navigation after clicking the login button
      console.log('Waiting for navigation after login...');
      
      const navigationPromise = page.waitForNavigation();
      await loginButton.click();
      await navigationPromise;
      
      // Check if login was successful by evaluating something on the page
      const isLoggedIn = await page.evaluate(() => {
        // This is a simple check - adjust based on your app's behavior after login
        console.log('Login successful:', window.localStorage);
        return window.localStorage.getItem('supabase.auth.token') !== null;
      });
      
      if (isLoggedIn) {
        console.log('Login successful!');
        
        // Define routes to check
        const routes = [
          '/',
          '/auth/login',
          '/auth/signup',
          '/app/dashboard',
          '/app/focus',
          '/app/energy',
          '/app/sleep',
          '/app/mental-health',
          '/app/tools',
          '/app/settings',
          '/app/profile',
          '/app/focus-timer',
          '/app/focus-journal',
          '/app/focus-stats',
          '/app/focus-strategies',
          '/app/focus-sessions',
          '/app/achievements',
          '/app/tasks',
          '/app/mood-energy',
          '/app/analytics',
          '/web-tools',
          '/mobile-app',
          '/why-us'
        ];
        
        // Check each route
        for (const route of routes) {
          console.log(`Checking route: ${route}`);
          await page.goto(`http://localhost:6001/easier-focus${route}`);
          
          // Wait for the page to load
          await page.waitForSelector('body', { timeout: 10000 }).catch(err => {
            console.log(`Timeout waiting for body on ${route}`);
          });
          
          // Count clickable elements (links and buttons)
          const clickableCount = await page.evaluate(() => {
            const links = document.querySelectorAll('a');
            const buttons = document.querySelectorAll('button');
            return links.length + buttons.length;
          });
          
          // Count forms
          const formCount = await page.evaluate(() => {
            return document.querySelectorAll('form').length;
          });
          
          // Count data containers (e.g., tables, lists)
          const dataContainerCount = await page.evaluate(() => {
            return document.querySelectorAll('table, ul.data-list, ol.data-list, div.data-container').length;
          });
          
          console.log(`Found ${clickableCount} clickable elements on ${route}`);
          console.log(`Found ${formCount} forms on ${route}`);
          console.log(`Found ${dataContainerCount} data containers on ${route}`);
        }
      } else {
        console.log('Login failed!');
      }
    } else {
      console.log('Login button not found');
    }
  } else {
    console.log('Login form elements not found');
  }
  
  // Close the browser
  await browser.close();
  console.log('Done!');
}

runTest().catch(console.error); 