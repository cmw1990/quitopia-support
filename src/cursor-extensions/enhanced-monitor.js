const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_URL = 'http://localhost:5173';
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123',
};

// Define routes to check
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/app',
];

const PROTECTED_ROUTES = [
  '/app/dashboard',
  '/app/progress',
  '/app/consumption-logger',
  '/app/nrt-directory',
  '/app/alternative-products',
  '/app/guides',
  '/app/web-tools',
  '/app/enhanced-support',
  '/app/community',
  '/app/settings',
  '/app/task-manager',
  '/app/trigger-analysis',
  '/app/challenges',
  '/app/achievements',
  '/app/health/mood',
  '/app/health/energy',
  '/app/health/focus',
  '/app/health/holistic',
  '/app/health/cravings',
  '/app/health/sleep',
  '/app/analytics/dashboard',
  '/app/analytics/healthcare',
  '/app/analytics/advanced',
  '/app/analytics/social',
  '/app/community/messaging',
];

// Main monitoring function
async function monitor() {
  console.log('Mission Fresh Enhanced Monitor');
  console.log('=================================================');
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Testing ${PUBLIC_ROUTES.length + PROTECTED_ROUTES.length} routes`);
  console.log('');

  let browser;
  let page;
  
  try {
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Set viewport to simulate desktop
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    // Collect issues
    const issues = {
      consoleErrors: [],
      visualIssues: [],
      interactionIssues: [],
    };
    
    // Setup console error logging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        issues.consoleErrors.push({
          url: page.url(),
          message: msg.text(),
        });
      }
    });
    
    // Check public routes first
    console.log('\n[Testing as Visitor] Checking public routes...');
    for (const route of PUBLIC_ROUTES) {
      await testRoute(page, route, issues);
    }
    
    // Authenticate and check protected routes
    console.log('\n[Authenticating] Logging in with test account...');
    const isAuthenticated = await login(page, issues);
    
    if (isAuthenticated) {
      console.log('\n[Testing as Authenticated User] Checking protected routes...');
      for (const route of PROTECTED_ROUTES) {
        await testRoute(page, route, issues);
      }
    } else {
      console.log('Failed to log in - skipping authenticated route tests');
    }
    
    // Report issues
    const totalIssues = issues.consoleErrors.length + issues.visualIssues.length + issues.interactionIssues.length;
    console.log(`\nFound ${totalIssues} total issues:`);
    console.log(`- ${issues.consoleErrors.length} console errors`);
    console.log(`- ${issues.visualIssues.length} visual issues`);
    console.log(`- ${issues.interactionIssues.length} interaction issues`);
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'enhanced-monitor-errors.json');
    fs.writeFileSync(reportPath, JSON.stringify(issues, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Monitor failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Test a specific route
async function testRoute(page, route, issues) {
  console.log(`Testing: ${route}`);
  try {
    // Go to route
    await page.goto(`${TARGET_URL}${route}`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Check for page errors
    const pageErrors = await page.evaluate(() => {
      const errors = [];
      if (window.errors && window.errors.length) {
        errors.push(...window.errors);
      }
      return errors;
    });
    
    if (pageErrors.length > 0) {
      console.log(`PAGE ERROR: ${pageErrors[0]}`);
      issues.consoleErrors.push({
        url: page.url(),
        message: pageErrors[0],
      });
    }
    
    // Check for visual elements (missing important UI components)
    const visualIssues = await checkVisualElements(page, route);
    
    if (visualIssues.length === 0) {
      console.log('No visual issues detected');
    } else {
      console.log(`Found ${visualIssues.length} visual issues`);
      issues.visualIssues.push(...visualIssues);
    }
    
    // Report console errors for this route
    const routeConsoleErrors = issues.consoleErrors.filter(error => 
      error.url === page.url()
    );
    
    if (routeConsoleErrors.length === 0) {
      console.log('✓ No console errors found');
    } else {
      console.log(`✕ Found ${routeConsoleErrors.length} console errors`);
    }
  } catch (error) {
    console.log(`✕ Error navigating to page: ${error.message}`);
    issues.interactionIssues.push({
      url: `${TARGET_URL}${route}`,
      message: error.message,
    });
  }
}

// Authenticate with test credentials
async function login(page, issues) {
  try {
    // Go to the login page
    await page.goto(`${TARGET_URL}/auth`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'auth-page.png' });
    
    // Find email and password fields and login button
    const formElements = await page.evaluate(() => {
      // Various selectors for common input patterns
      const emailSelectors = [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email" i]',
        'input[placeholder*="username" i]',
        'input[id*="email" i]',
        'input[id*="username" i]',
        'input[class*="email" i]',
      ];

      const passwordSelectors = [
        'input[type="password"]',
        'input[name="password"]',
        'input[placeholder*="password" i]',
        'input[id*="password" i]',
        'input[class*="password" i]',
      ];

      const buttonSelectors = [
        'button[type="submit"]',
        'button:contains("Sign In")',
        'button:contains("Login")',
        'button:contains("Log In")',
        'input[type="submit"]',
        'a.login-button',
        'a.sign-in-button',
        'button.login-button',
        'button.sign-in-button',
        'button:contains("Entrar")',
      ];
      
      // Check for email field
      let emailField = null;
      for (const selector of emailSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          emailField = selector;
          break;
        }
      }
      
      // Check for password field
      let passwordField = null;
      for (const selector of passwordSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          passwordField = selector;
          break;
        }
      }
      
      // Check for login button
      let loginButton = null;
      for (const selector of buttonSelectors) {
        try {
          const el = document.querySelector(selector);
          if (el) {
            loginButton = selector;
            break;
          }
        } catch (e) {
          // Some selectors like :contains() may not be supported
        }
      }
      
      return {
        hasEmailField: !!emailField,
        hasPasswordField: !!passwordField,
        hasLoginButton: !!loginButton,
        emailSelector: emailField,
        passwordSelector: passwordField,
        buttonSelector: loginButton
      };
    });
    
    console.log('Email field' + (formElements.hasEmailField ? ' found' : ' not found, checking for other selectors...'));
    console.log('Password field' + (formElements.hasPasswordField ? ' found' : ' not found, checking for other selectors...'));
    console.log('Login button' + (formElements.hasLoginButton ? ' found' : ' not found, checking for other selectors...'));
    
    if (!formElements.hasEmailField || !formElements.hasPasswordField || !formElements.hasLoginButton) {
      console.log('Could not find login form elements');
      
      // Try a fallback approach - direct selectors
      await page.evaluate(() => {
        // Look for any input that might be username/email
        const inputs = Array.from(document.querySelectorAll('input'));
        const firstInput = inputs[0];
        const secondInput = inputs[1];
        const buttons = Array.from(document.querySelectorAll('button'));
        
        if (firstInput) {
          firstInput.value = 'test@example.com';
        }
        
        if (secondInput) {
          secondInput.value = 'password123';
        }
        
        if (buttons.length > 0) {
          // Click the first button that might be a submit
          setTimeout(() => {
            buttons[0].click();
          }, 500);
        }
      });
      
      // Wait for navigation or timeout after 5 seconds
      try {
        await Promise.race([
          page.waitForNavigation({ timeout: 5000 }),
          new Promise(r => setTimeout(r, 5000))
        ]);
      } catch (e) {
        // Ignore navigation timeout
      }
      
      // Check if we're redirected to a dashboard/home page
      const currentUrl = page.url();
      if (currentUrl.includes('/app/') || currentUrl.includes('/dashboard')) {
        console.log(`Login appears successful, redirected to: ${currentUrl}`);
        return true;
      }
      
      console.log('Could not find login form');
      return false;
    }
    
    // Fill in the credentials
    console.log('Filling in credentials...');
    
    if (formElements.emailSelector) {
      await page.type(formElements.emailSelector, TEST_CREDENTIALS.email);
    }
    
    if (formElements.passwordSelector) {
      await page.type(formElements.passwordSelector, TEST_CREDENTIALS.password);
    }
    
    // Click login button
    console.log('Clicking login button...');
    if (formElements.buttonSelector) {
      await Promise.all([
        page.click(formElements.buttonSelector),
        // Wait for either navigation or 5 seconds
        Promise.race([
          page.waitForNavigation({ timeout: 5000 }).catch(() => {}),
          new Promise(r => setTimeout(r, 5000))
        ])
      ]);
    }
    
    // Wait for app to load or timeout
    try {
      await page.waitForSelector('.app-container, #app, main, .dashboard', { 
        timeout: 5000 
      }).catch(() => {});
    } catch (e) {
      // Ignore timeout
    }
    
    // Check if login was successful (check URL or session storage)
    const isLoggedIn = await page.evaluate(() => {
      // Check for common auth tokens
      const hasAuthToken = !!(
        localStorage.getItem('token') || 
        localStorage.getItem('auth_token') || 
        localStorage.getItem('access_token') ||
        localStorage.getItem('sb-auth-token') ||
        sessionStorage.getItem('token') || 
        sessionStorage.getItem('auth_token') || 
        document.cookie.includes('token=') ||
        document.cookie.includes('auth_token=')
      );
      
      // Check URL for typical post-login paths
      const isProtectedUrl = window.location.pathname.includes('/app/') || 
                           window.location.pathname.includes('/dashboard') ||
                           window.location.pathname.includes('/account');
      
      return hasAuthToken || isProtectedUrl;
    });
    
    // Take a screenshot after login attempt
    await page.screenshot({ path: 'post-login.png' });
    
    if (isLoggedIn) {
      console.log('Login successful!');
      return true;
    } else {
      console.log('Login failed. Check credentials or login form detection.');
      return false;
    }
  } catch (error) {
    console.log(`Error during testing: ${error.message}`);
    issues.interactionIssues.push({
      url: `${TARGET_URL}/auth`,
      message: `Login error: ${error.message}`,
    });
    return false;
  }
}

// Check for visual elements based on the route
async function checkVisualElements(page, route) {
  const issues = [];
  
  try {
    // Define expected elements for different route types
    const expectations = {
      '/': ['header', 'main', 'footer', 'h1, h2'],
      '/auth': ['form', 'input', 'button'],
      '/app/dashboard': ['.dashboard', 'header', 'main'],
      '/app': ['nav', 'main'],
    };
    
    // Use the specific expectations or default to common UI elements
    const expectedElements = expectations[route] || ['main', 'header', 'nav'];
    
    // Check for the expected elements
    const missingElements = await page.evaluate((selectors) => {
      return selectors.filter(selector => {
        return document.querySelector(selector) === null;
      });
    }, expectedElements);
    
    if (missingElements.length > 0) {
      issues.push({
        url: page.url(),
        message: `Missing UI elements: ${missingElements.join(', ')}`,
      });
    }
    
    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => {
        return !img.complete || img.naturalWidth === 0;
      }).map(img => img.src || img.alt || 'unnamed image');
    });
    
    if (brokenImages.length > 0) {
      issues.push({
        url: page.url(),
        message: `Broken images: ${brokenImages.length} images failed to load`,
      });
    }
    
    // Check for empty containers
    const emptyContainers = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.container, .main, main, section'));
      return containers.filter(container => {
        return container.children.length === 0;
      }).length;
    });
    
    if (emptyContainers > 0) {
      issues.push({
        url: page.url(),
        message: `Found ${emptyContainers} empty containers`,
      });
    }
    
    // Check for visual issues specific to the app
    if (route.includes('/app/')) {
      // Check for missing navigation
      const hasNavigation = await page.evaluate(() => {
        return document.querySelector('nav') !== null;
      });
      
      if (!hasNavigation) {
        issues.push({
          url: page.url(),
          message: 'Missing navigation in app view',
        });
      }
      
      // Check for app header
      const hasAppHeader = await page.evaluate(() => {
        return document.querySelector('header') !== null;
      });
      
      if (!hasAppHeader) {
        issues.push({
          url: page.url(),
          message: 'Missing app header',
        });
      }
    }
    
  } catch (error) {
    console.error('Error checking visual elements:', error);
  }
  
  return issues;
}

// Run the monitor
monitor().catch(console.error); 