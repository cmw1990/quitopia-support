const puppeteer = require('puppeteer');

// Test credentials
const TEST_EMAIL = 'hertzofhopes@gmail.com';
const TEST_PASSWORD = 'J4913836j';

// Target URL
const TARGET_URL = 'http://localhost:5173';

async function testAuthentication() {
  console.log('Starting authentication test...');
  
  // Launch browser (non-headless to see what's happening)
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to auth page
    console.log(`Navigating to ${TARGET_URL}/auth`);
    await page.goto(`${TARGET_URL}/auth`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Waiting for page to fully load
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Take a screenshot
    await page.screenshot({ path: 'auth-page.png' });
    console.log('Screenshot saved as auth-page.png');
    
    // Log page content for debugging
    const pageContent = await page.content();
    console.log(`Page length: ${pageContent.length} characters`);
    
    // Check for login form elements using evaluateHandle
    const formElements = await page.evaluate(() => {
      const emailField = document.querySelector('input[type="email"]');
      const passwordField = document.querySelector('input[type="password"]');
      const loginButton = document.querySelector('button[type="submit"]');
      
      return {
        hasEmailField: !!emailField,
        hasPasswordField: !!passwordField,
        hasLoginButton: !!loginButton
      };
    });
    
    console.log('Form elements detected:');
    console.log(formElements);
    
    if (formElements.hasEmailField && formElements.hasPasswordField && formElements.hasLoginButton) {
      // Fill in credentials
      console.log('Filling in credentials...');
      
      await page.evaluate((email, password) => {
        const emailField = document.querySelector('input[type="email"]');
        const passwordField = document.querySelector('input[type="password"]');
        
        if (emailField) emailField.value = email;
        if (passwordField) passwordField.value = password;
      }, TEST_EMAIL, TEST_PASSWORD);
      
      // Wait to see what's entered
      await new Promise(r => setTimeout(r, 1000));
      
      // Click login button
      console.log('Clicking login button...');
      await page.evaluate(() => {
        const loginButton = document.querySelector('button[type="submit"]');
        if (loginButton) loginButton.click();
      });
      
      // Wait for navigation or timeout
      try {
        await page.waitForNavigation({ timeout: 10000 });
      } catch (e) {
        console.log('No navigation detected, might be an AJAX login');
      }
      
      // Wait for any redirects
      await new Promise(r => setTimeout(r, 5000));
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // Check for authenticated elements
      const authElements = await page.evaluate(() => {
        const userAvatar = document.querySelector('.user-avatar, .avatar, .profile-icon');
        const appHeader = document.querySelector('#app-header, .app-header, .dashboard-header');
        const userName = document.querySelector('.user-name, .username, .user-display-name');
        
        return {
          hasUserAvatar: !!userAvatar,
          hasAppHeader: !!appHeader,
          hasUserName: !!userName,
          pageTitle: document.title
        };
      });
      
      console.log('Auth elements detected:');
      console.log(authElements);
      
      // Take a screenshot after login attempt
      await page.screenshot({ path: 'after-login.png' });
      console.log('Screenshot saved as after-login.png');
      
      // Check if logged in
      const isLoggedIn = currentUrl.includes('/app') || 
                         currentUrl.includes('/dashboard') || 
                         authElements.hasUserAvatar || 
                         authElements.hasAppHeader;
      
      console.log(`Login successful: ${isLoggedIn}`);
      
      // If login is successful, test a protected route
      if (isLoggedIn) {
        console.log('Testing protected route access...');
        await page.goto(`${TARGET_URL}/app/dashboard`, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Take a screenshot of the dashboard
        await page.screenshot({ path: 'dashboard.png' });
        console.log('Screenshot saved as dashboard.png');
      }
    } else {
      console.log('Could not find all login form elements');
    }
    
  } catch (error) {
    console.error(`Error during testing: ${error.message}`);
  } finally {
    await new Promise(r => setTimeout(r, 3000)); // Wait to see final state
    
    // Close the browser
    await browser.close();
    console.log('Test completed');
  }
}

// Run the test
testAuthentication(); 