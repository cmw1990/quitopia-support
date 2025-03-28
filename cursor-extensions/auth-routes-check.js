#!/usr/bin/env node

/**
 * Cursor Extension: Protected Routes Console Monitor
 * 
 * This script logs in to the application and checks for console errors 
 * on protected routes that require authentication.
 */

const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_URL = process.argv[2] || 'http://localhost:5001';
const EMAIL = 'hertzofhopes@gmail.com';
const PASSWORD = 'J4913836j';
const CURSOR_PATH = '/Applications/Cursor.app/Contents/MacOS/Cursor';
const ERROR_LOG_PATH = path.join(__dirname, 'protected-routes-errors.json');

// Protected routes to check after login
const PROTECTED_ROUTES = [
  '/app/dashboard',
  '/app/progress',
  '/app/health-improvement',
  '/app/nrt-directory',
  '/app/alternative-products',
  '/app/guides',
  '/app/community',
  '/app/profile',
  '/app/settings',
  '/app/reports',
  '/app/notifications',
  '/app/web-tools'
];

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Main function to check protected routes
async function checkProtectedRoutes() {
  console.log(`${colors.bright}${colors.blue}Cursor Extension: Protected Routes Console Monitor${colors.reset}`);
  console.log(`${colors.blue}=================================================${colors.reset}`);
  console.log(`${colors.cyan}Target URL: ${TARGET_URL}${colors.reset}`);
  console.log(`${colors.cyan}Login Email: ${EMAIL}${colors.reset}`);
  console.log(`${colors.cyan}Protected Routes: ${PROTECTED_ROUTES.length}${colors.reset}\n`);
  
  const browser = await puppeteer.launch({
    headless: false, // Use visible browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1080']
  });
  
  // Helper function for delays
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  try {
    // Login first
    console.log(`${colors.yellow}Logging in to the application...${colors.reset}`);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1080 });
    
    // Enable verbose logging
    page.on('console', message => {
      const type = message.type();
      const text = message.text();
      
      if (type === 'error') {
        console.log(`${colors.red}ERROR: ${text}${colors.reset}`);
      } else if (type === 'warning') {
        console.log(`${colors.yellow}WARNING: ${text}${colors.reset}`);
      } else {
        console.log(`LOG: ${text}`);
      }
    });
    
    // Set up error collection
    const allErrors = [];
    page.on('pageerror', error => {
      console.log(`${colors.red}PAGE ERROR: ${error.message}${colors.reset}`);
      allErrors.push({
        type: 'page_error',
        message: error.message,
        location: {
          url: page.url(),
          timestamp: new Date().toISOString()
        }
      });
    });
    
    // Navigate to auth page
    console.log(`Navigating to ${TARGET_URL}/auth`);
    await page.goto(`${TARGET_URL}/auth`, { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Take screenshot of login page
    await page.screenshot({ path: `${__dirname}/login-page.png` });
    console.log(`Saved screenshot of login page to ${__dirname}/login-page.png`);
    
    // Debug: Check for form elements
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    console.log(`Found email input: ${!!emailInput}`);
    console.log(`Found password input: ${!!passwordInput}`);
    console.log(`Found submit button: ${!!submitButton}`);
    
    if (!emailInput || !passwordInput || !submitButton) {
      // Try alternative selectors
      console.log('Trying alternative selectors for login form...');
      
      const inputs = await page.$$('input');
      console.log(`Found ${inputs.length} input elements`);
      
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} button elements`);
      
      // Try to identify form elements by placeholders or other attributes
      const formInputs = [];
      for (const input of inputs) {
        const placeholder = await input.evaluate(el => el.placeholder);
        const type = await input.evaluate(el => el.type);
        const id = await input.evaluate(el => el.id);
        console.log(`Input: type=${type}, placeholder="${placeholder}", id="${id}"`);
        formInputs.push({ element: input, type, placeholder, id });
      }
      
      // Try to find email and password inputs
      const emailInputAlt = formInputs.find(input => 
        input.placeholder?.toLowerCase().includes('email') || 
        input.id?.toLowerCase().includes('email') ||
        input.type === 'email'
      );
      
      const passwordInputAlt = formInputs.find(input => 
        input.placeholder?.toLowerCase().includes('password') || 
        input.id?.toLowerCase().includes('password') ||
        input.type === 'password'
      );
      
      if (emailInputAlt) {
        await emailInputAlt.element.type(EMAIL);
        console.log('Typed email into alternative input');
      }
      
      if (passwordInputAlt) {
        await passwordInputAlt.element.type(PASSWORD);
        console.log('Typed password into alternative input');
      }
      
      // Find a button that looks like a submit button
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        const type = await button.evaluate(el => el.type);
        console.log(`Button: type=${type}, text="${text}"`);
        
        if (
          text?.toLowerCase().includes('login') || 
          text?.toLowerCase().includes('sign in') ||
          type === 'submit'
        ) {
          console.log(`Clicking button: ${text}`);
          await button.click();
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
            console.log(`Navigation after click failed: ${e.message}`);
          });
          break;
        }
      }
    } else {
      // Fill login form with standard selectors
      await emailInput.type(EMAIL);
      await passwordInput.type(PASSWORD);
      
      // Submit form
      console.log('Submitting login form...');
      await submitButton.click();
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
        console.log(`Navigation after submit failed: ${e.message}`);
      });
    }
    
    // Take screenshot after login attempt
    await page.screenshot({ path: `${__dirname}/after-login.png` });
    console.log(`Saved screenshot after login to ${__dirname}/after-login.png`);
    
    // Verify login was successful
    const currentUrl = page.url();
    console.log(`Current URL after login attempt: ${currentUrl}`);
    
    if (currentUrl.includes('/app') || currentUrl.includes('/dashboard')) {
      console.log(`${colors.green}✓ Login successful${colors.reset}`);
    } else {
      console.log(`${colors.red}✕ Login failed - current URL: ${currentUrl}${colors.reset}`);
      console.log('Attempting to navigate directly to protected routes anyway...');
    }
    
    // Now check each protected route
    for (const route of PROTECTED_ROUTES) {
      const routeUrl = `${TARGET_URL}${route}`;
      console.log(`\n${colors.yellow}Checking protected route: ${route}${colors.reset}`);
      
      try {
        // Navigate to the route
        await page.goto(routeUrl, { 
          waitUntil: 'networkidle2', 
          timeout: 30000 
        });
        
        // Wait a moment for any async errors
        await delay(2000);
        
        // Capture screenshot
        const screenshotPath = `${__dirname}/screenshot-${route.replace(/\//g, '-')}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`Saved screenshot to ${screenshotPath}`);
        
        // Check for error indicators in page content
        const pageContent = await page.content();
        const pageUrl = page.url();
        
        // Check if there was a redirect to auth page
        if (pageUrl.includes('/auth') && !routeUrl.includes('/auth')) {
          console.log(`${colors.red}✕ Route redirected to auth page${colors.reset}`);
          allErrors.push({
            type: 'auth_redirect',
            message: 'Route redirected to auth page',
            location: {
              url: routeUrl,
              redirectedTo: pageUrl,
              timestamp: new Date().toISOString()
            }
          });
          continue;
        }
        
        // Check for "not found" or "no routes matched" messages
        if (
          pageContent.includes('not found') || 
          pageContent.includes('404') ||
          pageContent.includes('No routes matched')
        ) {
          console.log(`${colors.red}✕ Route not found (404)${colors.reset}`);
          allErrors.push({
            type: 'not_found',
            message: 'Route not found (404)',
            location: {
              url: routeUrl,
              timestamp: new Date().toISOString()
            }
          });
          continue;
        }
        
        // Check for auth required messages
        if (
          pageContent.includes('not authorized') || 
          pageContent.includes('permission denied') ||
          pageContent.includes('login required') ||
          pageContent.includes('please sign in')
        ) {
          console.log(`${colors.red}✕ Route requires authentication${colors.reset}`);
          allErrors.push({
            type: 'auth_required',
            message: 'Route requires authentication',
            location: {
              url: routeUrl,
              timestamp: new Date().toISOString()
            }
          });
          continue;
        }
        
        // Check for any console errors captured during navigation
        const consoleErrors = await page.evaluate(() => {
          const errors = [];
          const originalConsoleError = console.error;
          
          console.error = (...args) => {
            errors.push(args.join(' '));
            originalConsoleError.apply(console, args);
          };
          
          return errors;
        });
        
        if (consoleErrors.length > 0) {
          console.log(`${colors.red}Found ${consoleErrors.length} console errors on this page${colors.reset}`);
          allErrors.push({
            type: 'console_errors',
            messages: consoleErrors,
            location: {
              url: routeUrl,
              timestamp: new Date().toISOString()
            }
          });
        }
        
        console.log(`${colors.green}✓ Route loaded successfully${colors.reset}`);
      } catch (error) {
        console.log(`${colors.red}✕ Error loading route: ${error.message}${colors.reset}`);
        
        allErrors.push({
          type: 'navigation',
          message: `Navigation error: ${error.message}`,
          location: {
            url: routeUrl,
            timestamp: new Date().toISOString()
          }
        });
      }
    }
    
    // Report results
    if (allErrors.length > 0) {
      console.log(`\n${colors.red}Found ${allErrors.length} errors across ${PROTECTED_ROUTES.length} protected routes${colors.reset}`);
      
      // Write errors to file
      fs.writeFileSync(ERROR_LOG_PATH, JSON.stringify({
        summary: {
          totalErrors: allErrors.length,
          timestamp: new Date().toISOString()
        },
        errors: allErrors
      }, null, 2));
      
      console.log(`Error log written to ${ERROR_LOG_PATH}`);
    } else {
      console.log(`\n${colors.green}No errors found across ${PROTECTED_ROUTES.length} protected routes${colors.reset}`);
    }
    
  } finally {
    // Keep browser open for a moment to view results
    await delay(5000);
    await browser.close();
  }
}

// Run the protected routes checker
checkProtectedRoutes().then(() => {
  console.log("\nProtected routes checking complete!");
}).catch(err => {
  console.error(`Error in main process: ${err.message}`);
  process.exit(1);
}); 