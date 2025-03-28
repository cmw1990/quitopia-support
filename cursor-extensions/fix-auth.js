const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Test credentials matching LoginPage.tsx
const TEST_EMAIL = 'hertzofhopes@gmail.com';
const TEST_PASSWORD = 'J4913836j';

// Target URL
const TARGET_URL = 'http://localhost:5173';

// Helper function to wait for a specified time
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to verify and fix localStorage auth token
async function ensureCorrectAuthFormat(page) {
  console.log('Examining localStorage auth format...');
  
  const authToken = await page.evaluate(() => {
    return localStorage.getItem('supabase.auth.token');
  });
  
  if (!authToken) {
    console.log('No auth token found in localStorage');
    return false;
  }
  
  console.log('Auth token found in localStorage');
  
  try {
    const parsedToken = JSON.parse(authToken);
    console.log('Auth token format:', Object.keys(parsedToken));
    
    if (!parsedToken.currentSession) {
      console.log('ERROR: Missing currentSession in auth token');
      
      // If we have the raw data but not in the expected format, fix it
      if (parsedToken.access_token && parsedToken.refresh_token && parsedToken.user) {
        console.log('Attempting to fix auth token format...');
        
        const fixedToken = {
          currentSession: {
            access_token: parsedToken.access_token,
            refresh_token: parsedToken.refresh_token,
            expires_at: parsedToken.expires_at || Date.now() + 3600000,
            expires_in: parsedToken.expires_in || 3600,
            token_type: parsedToken.token_type || 'bearer',
            user: parsedToken.user
          }
        };
        
        await page.evaluate((fixedToken) => {
          localStorage.setItem('supabase.auth.token', JSON.stringify(fixedToken));
          console.log('Auth token format fixed in localStorage');
          
          // Force a storage event to trigger auth state changes
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'supabase.auth.token',
            newValue: JSON.stringify(fixedToken)
          }));
        }, fixedToken);
        
        return true;
      }
      
      return false;
    }
    
    return true;
  } catch (e) {
    console.log('Error parsing auth token:', e.message);
    return false;
  }
}

// Function to perform authentication and fix issues
async function fixAuthentication() {
  console.log('Starting authentication fix process...');
  
  // Launch browser
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Enable request/response monitoring for Supabase calls
  await page.setRequestInterception(true);
  
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('auth')) {
      console.log(`REQUEST: ${request.method()} ${request.url()}`);
      console.log(`REQUEST HEADERS:`, request.headers());
      try {
        const postData = request.postData();
        if (postData) {
          console.log(`REQUEST BODY: ${postData}`);
        }
      } catch (e) {}
    }
    request.continue();
  });
  
  page.on('response', async response => {
    if (response.url().includes('supabase') || response.url().includes('auth')) {
      console.log(`RESPONSE: ${response.status()} ${response.url()}`);
      
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          const clone = response.clone();
          const body = await clone.json().catch(() => ({}));
          console.log(`RESPONSE BODY:`, body);
          
          // If this is a successful auth response, capture it
          if (
            response.status() === 200 && 
            response.url().includes('auth/v1/token') && 
            body.access_token && 
            body.user
          ) {
            // Save the response for analysis
            try {
              await fs.writeFile(
                path.join(process.cwd(), 'auth-response.json'), 
                JSON.stringify(body, null, 2)
              );
              console.log('Saved auth response to auth-response.json');
            } catch (e) {
              console.error('Failed to save auth response:', e);
            }
          }
        }
      } catch (e) {
        console.error('Error processing response:', e);
      }
    }
  });
  
  try {
    // Go to login page
    console.log(`Navigating to ${TARGET_URL}/auth`);
    await page.goto(`${TARGET_URL}/auth`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Clear any existing auth data
    await page.evaluate(() => {
      localStorage.removeItem('supabase.auth.token');
      console.log('Cleared existing auth token');
    });
    
    // Wait for the login form to be available
    const emailInput = await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    
    // Fill in credentials
    await emailInput.type(TEST_EMAIL);
    await passwordInput.type(TEST_PASSWORD);
    
    // Find and click login button
    const loginButton = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
    
    // Setup navigation promise
    const navigationPromise = page.waitForNavigation({ timeout: 10000 }).catch(e => {
      console.log('Navigation timeout or error:', e.message);
    });
    
    // Click login
    await loginButton.click();
    console.log('Clicked login button...');
    
    // Wait for a bit to allow the auth API call to complete
    await wait(5000);
    
    // Check if we got redirected or if the auth was successful
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);
    
    // Verify localStorage format and fix if needed
    const isAuthFormatCorrect = await ensureCorrectAuthFormat(page);
    
    if (isAuthFormatCorrect) {
      console.log('Auth token format is correct');
      
      // Navigate to a protected route to verify authentication
      console.log('Navigating to protected route /app/dashboard');
      await page.goto(`${TARGET_URL}/app/dashboard`, { waitUntil: 'networkidle0', timeout: 10000 });
      
      const dashboardUrl = page.url();
      console.log(`URL after navigation to dashboard: ${dashboardUrl}`);
      
      if (dashboardUrl.includes('/app/dashboard')) {
        console.log('SUCCESS: Successfully accessed protected route!');
        await page.screenshot({ path: 'auth-success.png' });
      } else {
        console.log('FAILED: Could not access protected route');
        await page.screenshot({ path: 'auth-failed.png' });
      }
    } else {
      console.log('Authentication or token format issues detected');
      
      // Try to programmatically set the auth token from our saved response
      try {
        const savedResponse = await fs.readFile(path.join(process.cwd(), 'auth-response.json'), 'utf8')
          .catch(() => null);
        
        if (savedResponse) {
          const authData = JSON.parse(savedResponse);
          
          // Format correctly for localStorage
          const formattedToken = {
            currentSession: {
              access_token: authData.access_token,
              refresh_token: authData.refresh_token,
              expires_at: authData.expires_at || Date.now() + 3600000,
              expires_in: authData.expires_in || 3600,
              token_type: authData.token_type || 'bearer',
              user: authData.user
            }
          };
          
          await page.evaluate((tokenStr) => {
            localStorage.setItem('supabase.auth.token', tokenStr);
            console.log('Manually set auth token');
            
            // Force a storage event
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'supabase.auth.token',
              newValue: tokenStr
            }));
          }, JSON.stringify(formattedToken));
          
          console.log('Manually set auth token and triggered storage event');
          
          // Navigate to a protected route to verify our fix
          await page.goto(`${TARGET_URL}/app/dashboard`, { waitUntil: 'networkidle0', timeout: 10000 });
          
          const fixedUrl = page.url();
          console.log(`URL after manual fix: ${fixedUrl}`);
          
          if (fixedUrl.includes('/app/dashboard')) {
            console.log('MANUAL FIX SUCCESSFUL: Accessed protected route!');
            await page.screenshot({ path: 'auth-manual-fix-success.png' });
          } else {
            console.log('MANUAL FIX FAILED: Could not access protected route');
            await page.screenshot({ path: 'auth-manual-fix-failed.png' });
          }
        } else {
          console.log('No saved auth response found');
        }
      } catch (e) {
        console.error('Error applying manual fix:', e);
      }
    }
    
    console.log('Authentication test completed');
    console.log('Browser will remain open for inspection');
    console.log('Press Ctrl+C in terminal to close');
    
    // Keep browser open for inspection
    // await browser.close();
  } catch (error) {
    console.error(`Error during testing: ${error.message}`);
    console.error(error.stack);
    await browser.close();
  }
}

// Run the fix
fixAuthentication().catch(console.error); 