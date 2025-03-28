/**
 * Authentication Check Script
 * Tests protected routes, handling the case where a user is already logged in
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// List of protected routes to test
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
  console.log(`Screenshot saved: ${name}`);
}

async function checkAuthAndRoutes() {
  console.log('Mission Fresh Authentication & Routes Check');
  console.log('=========================================');
  
  const browser = await puppeteer.launch({
    headless: 'new', // Use headless mode for automated testing
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[Browser Console ERROR] ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.warn(`[Browser Console WARN] ${msg.text()}`);
      } else if (msg.text().includes('Auth state')) {
        console.log(`[Browser Console AUTH] ${msg.text()}`);
      }
    });
    
    // Handle page errors
    page.on('pageerror', error => {
      console.error('[Browser JS Error]', error.message);
    });
    
    // Handle network failures
    page.on('requestfailed', request => {
      if (!request.url().includes('favicon.ico')) {
        console.error(`[Network Failure] ${request.method()} ${request.url()} - ${request.failure().errorText}`);
      }
    });
    
    // Handle network responses
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      
      // Only log important request failures (not analytics, etc.)
      if (status >= 400 && 
          !url.includes('favicon.ico') && 
          !url.includes('analytics') && 
          !url.includes('vite') &&
          !url.includes('sentry') &&
          !url.includes('telemetry')) {
        console.error(`[Network Error] ${response.request().method()} ${url} - Status ${status}`);
      }
    });
    
    // Navigate to root page
    console.log('\nNavigating to app root...');
    await page.goto('http://localhost:5003', { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => {
      console.warn(`Navigation warning: ${e.message}`);
    });
    
    // Check if already logged in
    console.log('\nChecking authentication status...');
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    let isLoggedIn = false;
    
    if (currentUrl.includes('/app') || currentUrl.includes('/dashboard')) {
      console.log('✅ Already logged in - detected app/dashboard in URL');
      isLoggedIn = true;
    } else {
      // Check localStorage for auth token
      const hasAuthToken = await page.evaluate(() => {
        return !!localStorage.getItem('supabase.auth.token');
      });
      
      if (hasAuthToken) {
        console.log('✅ Authentication token found in localStorage');
        isLoggedIn = true;
      } else {
        console.log('❌ Not logged in - no auth token found');
      }
    }
    
    // If not logged in, try to log in
    if (!isLoggedIn) {
      console.log('\nNot logged in, redirecting to login page...');
      await page.goto('http://localhost:5003/auth', { waitUntil: 'networkidle0', timeout: 10000 });
      
      // Wait for login form or auto-login to complete
      await page.waitForSelector('input[type="email"], .dashboard-container', { timeout: 5000 }).catch(() => {
        console.log('Neither login form nor dashboard detected after navigation');
      });
      
      // Check if we're now on the dashboard (auto-login may have happened)
      const newUrl = page.url();
      if (newUrl.includes('/app') || newUrl.includes('/dashboard')) {
        console.log('✅ Auto-login detected - now on dashboard');
        isLoggedIn = true;
      } else {
        // Try manual login
        console.log('Attempting manual login...');
        
        // Look for form elements
        const emailInput = await page.$('input[type="email"]');
        const passwordInput = await page.$('input[type="password"]');
        
        if (emailInput && passwordInput) {
          await emailInput.type('hertzofhopes@gmail.com');
          await passwordInput.type('J4913836j');
          
          // Find and click login button
          const loginButton = await page.$('button.w-full');
          if (loginButton) {
            await Promise.all([
              loginButton.click(),
              page.waitForNavigation({ timeout: 10000 }).catch(e => {
                console.warn(`Login navigation warning: ${e.message}`);
              })
            ]);
            
            // Check if login was successful
            const afterLoginUrl = page.url();
            isLoggedIn = afterLoginUrl.includes('/app') || afterLoginUrl.includes('/dashboard');
            
            if (isLoggedIn) {
              console.log('✅ Manual login successful');
            } else {
              console.error('❌ Manual login failed - not redirected to app');
            }
          } else {
            console.error('❌ Login button not found');
          }
        } else {
          console.error('❌ Login form elements not found');
        }
      }
    }
    
    // If we're logged in, test protected routes
    if (isLoggedIn) {
      console.log('\nTesting protected routes...');
      const results = {
        success: 0,
        failed: 0,
        routes: {}
      };
      
      for (const route of PROTECTED_ROUTES) {
        console.log(`\nChecking route: ${route}`);
        const url = `http://localhost:5003${route}`;
        
        try {
          // Navigate to the route
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 }).catch(e => {
            console.warn(`Navigation warning for ${route}: ${e.message}`);
          });
          
          // Capture screenshot
          await captureScreenshot(page, `route_${route.replace(/\//g, '_')}`);
          
          // Check if navigation was successful (URL matches)
          const routeUrl = page.url();
          const expectedPath = route === '/app' ? '/app/dashboard' : route; // /app redirects to /app/dashboard
          const isCorrectRoute = routeUrl.includes(expectedPath);
          
          if (isCorrectRoute) {
            console.log(`✅ Successfully loaded ${route}`);
            results.success++;
            results.routes[route] = 'success';
          } else {
            console.error(`❌ Failed to load ${route} - wrong URL: ${routeUrl}`);
            results.failed++;
            results.routes[route] = `failed - wrong URL: ${routeUrl}`;
          }
          
          // Check for visible error messages
          const errorElements = await page.$$eval(
            '.error, .error-message, [role="alert"]', 
            elements => elements
              .filter(el => el.offsetParent !== null) // Check if visible
              .map(el => el.textContent.trim())
          );
          
          if (errorElements.length > 0) {
            console.log('⚠️ Page contains visible error messages:');
            errorElements.forEach(err => console.log(`   - ${err}`));
          }
          
        } catch (error) {
          console.error(`❌ Error checking route ${route}:`, error.message);
          results.failed++;
          results.routes[route] = `error: ${error.message}`;
        }
      }
      
      // Print summary
      console.log('\n=== Route Test Summary ===');
      console.log(`Total routes tested: ${PROTECTED_ROUTES.length}`);
      console.log(`Successful: ${results.success}`);
      console.log(`Failed: ${results.failed}`);
      
      if (results.failed > 0) {
        console.log('\nFailed routes:');
        for (const [route, status] of Object.entries(results.routes)) {
          if (status.startsWith('failed') || status.startsWith('error')) {
            console.log(`- ${route}: ${status}`);
          }
        }
      }
    } else {
      console.error('\n❌ Not logged in - cannot test protected routes');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed');
  }
}

// Run the test
checkAuthAndRoutes(); 