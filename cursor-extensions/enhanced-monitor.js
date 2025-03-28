const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test credentials
const TEST_EMAIL = 'hertzofhopes@gmail.com';
const TEST_PASSWORD = 'J4913836j';

// Configure options
const TARGET_URL = 'http://localhost:5003';
const ERROR_LOG_PATH = path.join(__dirname, 'enhanced-monitor-errors.json');

// Routes to test - both public and protected
const ROUTES_TO_CHECK = [
  '/',
  '/auth',
  '/app',
  '/app/dashboard',
  '/app/progress',
  '/app/sleep-quality',
  '/app/private-messaging',
  '/app/healthcare-reports',
  '/app/advanced-analytics',
  '/app/consumption-logger',
  '/app/nrt-directory',
  '/app/alternative-products',
  '/app/guides-hub',
  '/app/web-tools',
  '/app/community',
  '/app/settings',
  '/app/task-manager',
  '/app/trigger-analysis',
  '/app/community-challenges',
  '/app/achievements',
  '/app/social-share-analytics',
  '/app/mood-tracker',
  '/app/energy-tracker',
  '/app/focus-tracker',
  '/app/holistic-dashboard',
  '/app/craving-tracker',
  '/app/journal',
  '/app/enhanced-support'
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

/**
 * Main function to perform comprehensive testing
 */
async function runComprehensiveTests() {
  console.log(`${colors.bright}${colors.blue}Mission Fresh Enhanced Monitor${colors.reset}`);
  console.log(`${colors.blue}=================================================${colors.reset}`);
  console.log(`${colors.cyan}Target URL: ${TARGET_URL}${colors.reset}`);
  console.log(`${colors.cyan}Testing ${ROUTES_TO_CHECK.length} routes${colors.reset}\n`);
  
  try {
    // Launch headless browser
    console.log(`${colors.yellow}Launching headless browser...${colors.reset}`);
    const browser = await puppeteer.launch({
      headless: false, // Set to false to see what's happening
      defaultViewport: null, // Use full viewport
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    
    // Store all errors
    const allErrors = {
      consoleErrors: [],
      visualIssues: [],
      interactionIssues: []
    };
    
    // First check unauthenticated routes
    console.log(`\n${colors.magenta}[Testing as Visitor] Checking public routes...${colors.reset}`);
    for (const route of ROUTES_TO_CHECK.slice(0, 3)) { // Just check a few public routes first
      console.log(`${colors.yellow}Testing: ${route}${colors.reset}`);
      const errors = await testRoute(browser, route, false);
      
      // Add errors to our collection
      allErrors.consoleErrors.push(...errors.consoleErrors);
      allErrors.visualIssues.push(...errors.visualIssues);
      allErrors.interactionIssues.push(...errors.interactionIssues);
    }
    
    // Now login and test authenticated routes
    console.log(`\n${colors.magenta}[Authenticating] Logging in with test account...${colors.reset}`);
    const isLoggedIn = await login(browser, TEST_EMAIL, TEST_PASSWORD);
    
    if (isLoggedIn) {
      console.log(`${colors.green}Successfully logged in${colors.reset}`);
      
      // Test all routes with authentication
      console.log(`\n${colors.magenta}[Testing as Authenticated User] Checking all routes...${colors.reset}`);
      for (const route of ROUTES_TO_CHECK) {
        console.log(`${colors.yellow}Testing: ${route}${colors.reset}`);
        const errors = await testRoute(browser, route, true);
        
        // Add errors to our collection
        allErrors.consoleErrors.push(...errors.consoleErrors);
        allErrors.visualIssues.push(...errors.visualIssues);
        allErrors.interactionIssues.push(...errors.interactionIssues);
      }
    } else {
      console.log(`${colors.red}Failed to log in - skipping authenticated route tests${colors.reset}`);
    }
    
    // Write errors to file
    fs.writeFileSync(ERROR_LOG_PATH, JSON.stringify(allErrors, null, 2));
    
    // Log error summary
    const totalErrors = allErrors.consoleErrors.length + 
                        allErrors.visualIssues.length + 
                        allErrors.interactionIssues.length;
    
    if (totalErrors > 0) {
      console.log(`\n${colors.red}Found ${totalErrors} total issues:${colors.reset}`);
      console.log(`- ${allErrors.consoleErrors.length} console errors`);
      console.log(`- ${allErrors.visualIssues.length} visual issues`);
      console.log(`- ${allErrors.interactionIssues.length} interaction issues`);
      console.log(`\nDetailed report saved to: ${ERROR_LOG_PATH}`);
    } else {
      console.log(`\n${colors.green}No issues found across all tested routes!${colors.reset}`);
    }
    
    // Close browser
    await browser.close();
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Login to the application
 */
async function login(browser, email, password) {
  try {
    const page = await browser.newPage();
    await page.goto(`${TARGET_URL}/auth`, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for login form
    await page.waitForSelector('input[type="email"]', { timeout: 5000 })
      .catch(() => console.log(`${colors.yellow}Email field not found, checking for other selectors...${colors.reset}`));
    
    // Try different possible selectors for email/password fields
    const emailSelectors = ['input[type="email"]', 'input[placeholder*="Email"]', 'input[name="email"]'];
    const passwordSelectors = ['input[type="password"]', 'input[name="password"]'];
    
    // Try to find and fill email field
    for (const selector of emailSelectors) {
      const emailField = await page.$(selector);
      if (emailField) {
        await emailField.click({ clickCount: 3 }); // Select all text
        await emailField.type(email);
        console.log(`${colors.green}Found and filled email field with selector: ${selector}${colors.reset}`);
        break;
      }
    }
    
    // Try to find and fill password field
    for (const selector of passwordSelectors) {
      const passwordField = await page.$(selector);
      if (passwordField) {
        await passwordField.click({ clickCount: 3 }); // Select all text
        await passwordField.type(password);
        console.log(`${colors.green}Found and filled password field with selector: ${selector}${colors.reset}`);
        break;
      }
    }
    
    // Try to find and click login button
    const buttonSelectors = [
      'button[type="submit"]', 
      'button:contains("Log in")', 
      'button:contains("Sign in")',
      'button:contains("Login")'
    ];
    
    let clickedButton = false;
    for (const selector of buttonSelectors) {
      try {
        if (selector.includes(':contains')) {
          // Handle contains selector since puppeteer doesn't support it directly
          const buttonText = selector.match(/:contains\("(.+)"\)/)[1];
          const buttons = await page.$$('button');
          for (const button of buttons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text.includes(buttonText)) {
              await button.click();
              clickedButton = true;
              console.log(`${colors.green}Clicked login button with text: ${buttonText}${colors.reset}`);
              break;
            }
          }
        } else {
          const loginButton = await page.$(selector);
          if (loginButton) {
            await loginButton.click();
            clickedButton = true;
            console.log(`${colors.green}Clicked login button with selector: ${selector}${colors.reset}`);
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!clickedButton) {
      console.log(`${colors.red}Could not find login button${colors.reset}`);
      await page.close();
      return false;
    }
    
    // Wait for navigation after login
    try {
      await page.waitForNavigation({ timeout: 10000 });
    } catch (e) {
      console.log(`${colors.yellow}No navigation occurred after clicking login${colors.reset}`);
    }
    
    // Check if login was successful (look for user-specific elements or URLs)
    await page.waitForFunction(() => true, { timeout: 3000 }); // Wait a bit for potential redirects
    
    const currentUrl = page.url();
    const isLoggedIn = currentUrl.includes('/app') || 
                       currentUrl.includes('/dashboard') || 
                       await page.$('.user-avatar, .avatar, .profile-icon') !== null;
    
    await page.close();
    return isLoggedIn;
  } catch (error) {
    console.error(`${colors.red}Login error: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test a specific route for errors and issues
 */
async function testRoute(browser, route, isAuthenticated) {
  const page = await browser.newPage();
  
  const errors = {
    consoleErrors: [],
    visualIssues: [],
    interactionIssues: []
  };
  
  // Collect console errors
  page.on('console', message => {
    const type = message.type();
    const text = message.text();
    
    if (type === 'error') {
      console.log(`${colors.red}ERROR: ${text}${colors.reset}`);
      
      errors.consoleErrors.push({
        type: 'error',
        message: text,
        location: {
          url: route,
          timestamp: new Date().toISOString()
        }
      });
    } else if (type === 'warning') {
      console.log(`${colors.yellow}WARNING: ${text}${colors.reset}`);
    }
  });
  
  // Collect uncaught exceptions
  page.on('pageerror', error => {
    console.log(`${colors.red}PAGE ERROR: ${error.message}${colors.reset}`);
    
    errors.consoleErrors.push({
      type: 'pageerror',
      message: error.message,
      location: {
        url: route,
        timestamp: new Date().toISOString(),
        stack: error.stack
      }
    });
  });
  
  try {
    // Navigate to the URL
    await page.goto(`${TARGET_URL}${route}`, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Check for visual issues
    await checkForVisualIssues(page, errors);
    
    // Test interactions if authenticated
    if (isAuthenticated) {
      await testInteractions(page, route, errors);
    }
    
    // Success message if no errors
    if (errors.consoleErrors.length === 0) {
      console.log(`${colors.green}✓ No console errors found${colors.reset}`);
    } else {
      console.log(`${colors.red}✕ Found ${errors.consoleErrors.length} console errors${colors.reset}`);
    }
    
  } catch (error) {
    console.log(`${colors.red}✕ Error navigating to page: ${error.message}${colors.reset}`);
    
    errors.consoleErrors.push({
      type: 'navigation',
      message: `Navigation error: ${error.message}`,
      location: {
        url: route,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  await page.close();
  return errors;
}

/**
 * Check for visual layout issues
 */
async function checkForVisualIssues(page, errors) {
  try {
    // Take a screenshot for visual inspection
    const screenshotPath = path.join(__dirname, `screenshot-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Check for common visual issues
    const visualIssues = await page.evaluate(() => {
      const issues = [];
      
      // Check for overlapping elements
      const elements = Array.from(document.querySelectorAll('button, a, input, .card, [class*="container"]'));
      
      elements.forEach(el => {
        // Skip hidden elements
        if (el.offsetParent === null) return;
        
        const rect1 = el.getBoundingClientRect();
        
        // Skip elements with zero size
        if (rect1.width === 0 || rect1.height === 0) return;
        
        elements.forEach(el2 => {
          if (el === el2 || el2.offsetParent === null) return;
          
          const rect2 = el2.getBoundingClientRect();
          
          // Skip elements with zero size
          if (rect2.width === 0 || rect2.height === 0) return;
          
          // Check for significant overlap (>50%)
          const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
          const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
          
          const overlapArea = overlapX * overlapY;
          const area1 = rect1.width * rect1.height;
          const area2 = rect2.width * rect2.height;
          
          const smallerArea = Math.min(area1, area2);
          
          if (overlapArea > 0 && overlapArea / smallerArea > 0.5) {
            // Only report if elements aren't parent/child
            if (!el.contains(el2) && !el2.contains(el)) {
              issues.push({
                type: 'element-overlap',
                elements: [
                  {
                    tag: el.tagName,
                    id: el.id,
                    className: el.className,
                    text: el.textContent.substring(0, 50)
                  },
                  {
                    tag: el2.tagName,
                    id: el2.id,
                    className: el2.className,
                    text: el2.textContent.substring(0, 50)
                  }
                ]
              });
            }
          }
        });
      });
      
      // Check for elements that extend beyond viewport
      elements.forEach(el => {
        if (el.offsetParent === null) return;
        
        const rect = el.getBoundingClientRect();
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        };
        
        if (rect.right > viewport.width + 5 || rect.bottom > viewport.height + 200) {
          issues.push({
            type: 'element-outside-viewport',
            element: {
              tag: el.tagName,
              id: el.id,
              className: el.className,
              text: el.textContent.substring(0, 50),
              position: {
                right: rect.right,
                bottom: rect.bottom,
                viewportWidth: viewport.width,
                viewportHeight: viewport.height
              }
            }
          });
        }
      });
      
      return issues;
    });
    
    errors.visualIssues.push(...visualIssues.map(issue => ({
      ...issue,
      url: page.url(),
      timestamp: new Date().toISOString()
    })));
    
    if (visualIssues.length > 0) {
      console.log(`${colors.yellow}Found ${visualIssues.length} visual issues${colors.reset}`);
    } else {
      console.log(`${colors.green}No visual issues detected${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error checking visual issues: ${error.message}${colors.reset}`);
  }
}

/**
 * Test interactive elements on a page
 */
async function testInteractions(page, route, errors) {
  try {
    // Check for and test buttons
    const buttonCount = await page.$$eval('button:not([disabled])', buttons => buttons.length);
    
    if (buttonCount > 0) {
      console.log(`${colors.cyan}Found ${buttonCount} enabled buttons${colors.reset}`);
      
      // Test a sample of buttons if there are many
      const buttonsToTest = await page.$$eval('button:not([disabled]):not([type="submit"])', buttons => {
        return buttons.slice(0, 3).map(b => ({
          text: b.textContent.trim(),
          index: Array.from(document.querySelectorAll('button')).indexOf(b)
        }));
      });
      
      for (const buttonInfo of buttonsToTest) {
        try {
          const buttons = await page.$$('button');
          if (buttonInfo.index < buttons.length) {
            console.log(`${colors.cyan}Testing button: "${buttonInfo.text}"${colors.reset}`);
            
            // Scroll button into view first
            await buttons[buttonInfo.index].evaluate(b => b.scrollIntoView({ behavior: 'smooth', block: 'center' }));
            await page.waitForTimeout(500);
            
            // Try clicking the button
            await buttons[buttonInfo.index].click().catch(() => {
              errors.interactionIssues.push({
                type: 'button-not-clickable',
                buttonText: buttonInfo.text,
                url: page.url(),
                timestamp: new Date().toISOString()
              });
            });
            
            // Wait a moment to see effects
            await page.waitForTimeout(1000);
          }
        } catch (e) {
          console.log(`${colors.yellow}Error testing button: ${e.message}${colors.reset}`);
        }
      }
    }
    
    // Check for and test forms
    const formCount = await page.$$eval('form', forms => forms.length);
    
    if (formCount > 0) {
      console.log(`${colors.cyan}Found ${formCount} forms${colors.reset}`);
      
      // We don't actually submit forms to avoid modifying data
      // But we can check if they're properly constructed
      const formIssues = await page.evaluate(() => {
        const issues = [];
        const forms = Array.from(document.querySelectorAll('form'));
        
        forms.forEach((form, i) => {
          const inputs = form.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
          const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
          
          if (inputs.length === 0) {
            issues.push({
              type: 'form-no-inputs',
              formIndex: i
            });
          }
          
          if (!submitButton) {
            issues.push({
              type: 'form-no-submit',
              formIndex: i
            });
          }
        });
        
        return issues;
      });
      
      errors.interactionIssues.push(...formIssues.map(issue => ({
        ...issue,
        url: page.url(),
        timestamp: new Date().toISOString()
      })));
    }
    
    // Check for data loading elements
    const dataElementCount = await page.$$eval('[data-loading], .loading-skeleton, .data-table, .chart, [aria-busy="true"]', elements => elements.length);
    
    if (dataElementCount > 0) {
      console.log(`${colors.cyan}Found ${dataElementCount} potential data loading elements${colors.reset}`);
      
      // Wait for data loading to complete
      await page.waitForTimeout(2000);
      
      // Check for "Loading..." text or skeletons that remain visible
      const persistentLoaders = await page.$$eval('[data-loading], .loading-skeleton, [aria-busy="true"]', 
        elements => elements.filter(el => el.offsetParent !== null).length);
      
      if (persistentLoaders > 0) {
        console.log(`${colors.yellow}Found ${persistentLoaders} persistent loading indicators${colors.reset}`);
        
        errors.interactionIssues.push({
          type: 'data-loading-incomplete',
          count: persistentLoaders,
          url: page.url(),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Check for "Coming Soon" or placeholder text
    const placeholders = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const text = el.textContent.toLowerCase();
        return text.includes('coming soon') || 
               text.includes('not found') || 
               text.includes('page not found') || 
               text.includes('under construction') ||
               text.includes('placeholder') ||
               text.includes('lorem ipsum');
      }).map(el => ({
        text: el.textContent.trim().substring(0, 50),
        tag: el.tagName
      }));
    });
    
    if (placeholders.length > 0) {
      console.log(`${colors.yellow}Found ${placeholders.length} placeholder/coming soon elements${colors.reset}`);
      
      errors.interactionIssues.push({
        type: 'placeholder-content',
        elements: placeholders,
        url: page.url(),
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error(`${colors.red}Error testing interactions: ${error.message}${colors.reset}`);
  }
}

// Run the tests
runComprehensiveTests(); 