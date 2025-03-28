/**
 * Authentication Test Script
 * Tests all protected routes with proper authentication
 */

const puppeteer = require('puppeteer');

const EMAIL = 'hertzofhopes@gmail.com';
const PASSWORD = 'J4913836j';

// List of protected routes to test after login
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

// Get Supabase details
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';
const STORAGE_KEY = 'supabase.auth.token';

async function loginDirectlyToApi() {
  console.log('Logging in directly to Supabase API...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Create a properly formatted session object
    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
      expires_in: data.expires_in,
      token_type: data.token_type || 'bearer',
      user: data.user,
    };
    
    console.log('✅ Direct API login successful');
    return {
      session,
      storedSession: JSON.stringify({
        currentSession: session
      })
    };
  } catch (error) {
    console.error('❌ Direct API login failed:', error.message);
    throw error;
  }
}

async function testProtectedRoutes() {
  console.log('Mission Fresh Protected Routes Test');
  console.log('==================================');
  console.log(`Testing with account: ${EMAIL}`);
  
  let authData;
  try {
    // Get the auth token directly from the API first
    authData = await loginDirectlyToApi();
  } catch (error) {
    console.error('Failed to authenticate. Aborting test.');
    return;
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture console errors globally
    let consoleErrors = [];
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error') {
        consoleErrors.push(msg.text());
        console.error(`Console Error: ${msg.text()}`);
      } else if (type === 'warning') {
        console.warn(`Console Warning: ${msg.text()}`);
      }
    });
    
    // First navigate to the application to ensure we can access localStorage
    console.log('Navigating to app first...');
    await page.goto('http://localhost:5003/auth', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Now set localStorage
    console.log('Setting auth token in localStorage...');
    await page.evaluate((key, value) => {
      localStorage.setItem(key, value);
      // Also dispatch a storage event to notify listeners
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: value
      }));
      return true;
    }, STORAGE_KEY, authData.storedSession);
    
    // Now navigate directly to the dashboard
    console.log('\nNavigating directly to dashboard...');
    
    // Clear previous errors
    consoleErrors = [];
    
    await page.goto('http://localhost:5003/app/dashboard', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Check if we're on the dashboard
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/app')) {
      console.log('✅ Navigation to protected route successful!');
    } else if (currentUrl.includes('/auth')) {
      console.error('❌ Navigation failed - redirected to login page');
      
      // Take a screenshot
      await page.screenshot({ path: 'redirect-failure.png' });
      console.log('Screenshot saved to redirect-failure.png');
      return;
    } else {
      console.error(`❌ Navigation ended at unexpected URL: ${currentUrl}`);
      return;
    }
    
    // Test all protected routes
    console.log('\nTesting protected routes:');
    for (const route of PROTECTED_ROUTES) {
      console.log(`\nChecking route: ${route}`);
      const url = `http://localhost:5003${route}`;
      
      // Clear previous errors
      consoleErrors = [];
      
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        
        // Check if we're still on a protected route
        const currentUrl = page.url();
        if (!currentUrl.includes('/app')) {
          console.error(`❌ Lost authentication on route ${route} - redirected to ${currentUrl}`);
          continue;
        }
        
        // Check for visible error messages on page
        const errorElements = await page.$$eval('.error, .error-message, [role="alert"]', 
          elements => elements.map(el => ({ text: el.textContent, visible: el.offsetParent !== null }))
            .filter(e => e.visible)
            .map(e => e.text)
        );
        
        if (errorElements.length > 0) {
          console.log('❌ Page contains visible error messages:');
          errorElements.forEach(err => console.log(`   - ${err}`));
        }
        
        // Check console errors
        if (consoleErrors.length > 0) {
          console.log('❌ Console errors detected:');
          const uniqueErrors = [...new Set(consoleErrors)];
          uniqueErrors.slice(0, 5).forEach(err => console.log(`   - ${err}`));
          if (uniqueErrors.length > 5) {
            console.log(`   - ...and ${uniqueErrors.length - 5} more`);
          }
        } else {
          console.log('✅ No console errors');
        }
        
      } catch (error) {
        console.error(`❌ Error navigating to ${route}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed');
  }
}

// Run the test
testProtectedRoutes(); 