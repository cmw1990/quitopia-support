import puppeteer from 'puppeteer';
import fs from 'fs'; // Use fs directly forexistsSync and mkdirSync
import path from 'path';

const BASE_URL = 'http://localhost:6001'; // Correct port
const SCREENSHOTS_DIR = 'screenshots';

// Define routes based on src/routes/index.tsx
const publicRoutes = [
  '/',
  '/web-tools',
  '/pricing',
  '/privacy',
  '/terms',
  '/about',
  '/contact',
  '/blog',
  '/resources',
  '/teams',
  '/tools/energy-focus',
  '/tools/white-noise'
];

const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password'
];

const protectedRoutes = [
  '/easier-focus/app/dashboard',
  '/easier-focus/app/pomodoro',
  '/easier-focus/app/tasks',
  '/easier-focus/app/analytics',
  '/easier-focus/app/context-switching',
  '/easier-focus/app/blocker',
  '/easier-focus/app/strategies',
  '/easier-focus/app/community',
  '/easier-focus/app/achievements',
  '/easier-focus/app/mood',
  '/easier-focus/app/sessions',
  '/easier-focus/app/games',
  '/easier-focus/app/games/pattern-match',
  '/easier-focus/app/games/memory-cards',
  '/easier-focus/app/games/zen-drift',
  '/easier-focus/app/settings',
  '/easier-focus/app/profile'
];

const allRoutes = [...publicRoutes, ...authRoutes, ...protectedRoutes];

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
  console.log(`Created directory: ${SCREENSHOTS_DIR}`);
}

// Improved login function
async function login(page) {
  console.log(`Attempting login at ${BASE_URL}/auth/login`);
  try {
    await page.goto(`${BASE_URL}/auth/login`, {
      waitUntil: 'networkidle0', // Wait for network to be idle
      timeout: 60000
    });

    console.log('Login page loaded. Waiting for form...');

    // Wait for login form fields specifically
    await page.waitForSelector('input[type="email"]', { visible: true, timeout: 15000 });
    await page.waitForSelector('input[type="password"]', { visible: true, timeout: 15000 });
    await page.waitForSelector('button[type="submit"]', { visible: true, timeout: 15000 });

    console.log('Form located. Filling credentials...');
    // Fill login form
    await page.type('input[type="email"]', 'hertzofhopes@gmail.com');
    await page.type('input[type="password"]', 'J4913836j');

    // Click submit and wait for navigation or a dashboard element
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      console.log('Clicking login button...');

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }).catch(e => console.log('waitForNavigation timed out or failed, checking for dashboard element instead.', e.message)), // Wait for navigation first
        loginButton.click()
      ]);

      // Increased wait to allow for redirects and rendering
      await wait(4000);

      // Verify login by checking for a dashboard-specific element
      // Try finding an h1 containing "Dashboard" case-insensitive
      const dashboardElement = await page.waitForSelector('xpath/.//h1[contains(translate(text(), "DASHBOARD", "dashboard"), "dashboard")]', { visible: true, timeout: 15000 }).catch(() => null);

      const currentUrl = page.url();
      console.log(`Current URL after login attempt: ${currentUrl}`);

      if (currentUrl.includes('/easier-focus/app') && dashboardElement) {
        console.log('Login successful! Dashboard element found.');
        return true;
      } else if (currentUrl.includes('/easier-focus/app')) {
        console.log('Login likely successful (URL changed), but dashboard element not found within timeout.');
        return true; // Assume success based on URL if element check fails
      } else {
        console.log('Login failed - URL did not change to app section or dashboard element not found.');
        const bodyHTML = await page.content();
        if (bodyHTML.includes('Invalid login credentials')) {
            console.error("Login failed explicitly: Invalid credentials message found.");
        }
        return false;
      }
    } else {
      console.error('Login button could not be found after waiting.');
      return false;
    }
  } catch (error) {
    console.error('Error during login process:', error.message);
    // Take screenshot on login error
     try {
        const errorPath = path.join(SCREENSHOTS_DIR, 'login-error.png');
        await page.screenshot({ path: errorPath });
        console.log(`Screenshot saved to ${errorPath}`);
    } catch (screenshotError) {
        console.error('Could not take screenshot on login error:', screenshotError.message);
    }
    return false;
  }
}

// Function to check basic interactions
async function checkInteractions(page, route, results) {
    results.clickableButtons = [];
    results.fillableForms = [];

    // Check Buttons
    try {
        const buttons = await page.$$('button:not([disabled]), a[role="button"]');
        results.buttonCount = buttons.length;
        console.log(` Found ${buttons.length} potentially clickable buttons/links.`);
        for (let i = 0; i < buttons.length && i < 10; i++) { // Limit checks for performance
            const button = buttons[i];
            const isVisible = await button.isIntersectingViewport();
            const text = await page.evaluate(el => el.innerText || el.getAttribute('aria-label') || '', button);
            results.clickableButtons.push({ text: text.substring(0, 50), visible: isVisible });
            // We don't actually click them here to avoid navigating away unexpectedly during the check
        }
    } catch(e) { console.error(`Error checking buttons on ${route}: ${e.message}`); }

    // Check Forms
    try {
        const forms = await page.$$('form');
        results.formCount = forms.length;
        console.log(` Found ${forms.length} forms.`);
        for (let i = 0; i < forms.length && i < 5; i++) { // Limit checks
            const form = forms[i];
            const inputs = await form.$$('input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])');
            results.fillableForms.push({ inputCount: inputs.length });
            // Try filling the first few inputs with dummy data
            for (let j = 0; j < inputs.length && j < 3; j++) {
                const input = inputs[j];
                try {
                    const inputType = await page.evaluate(el => el.type, input);
                    if (inputType === 'text' || inputType === 'email' || inputType === 'password' || inputType === 'search') {
                        await input.type('test', { delay: 10 });
                    } else if (inputType === 'textarea') {
                         await input.type('test content', { delay: 10 });
                    } else if (inputType === 'checkbox' || inputType === 'radio') {
                        // await input.click(); // Avoid clicking for now
                    } else if (inputType === 'select-one') {
                        // await input.select(''); // Requires knowing options
                    }
                } catch (e) {
                    console.warn(` Could not fill input ${j} in form ${i} on ${route}: ${e.message}`);
                }
            }
        }
    } catch(e) { console.error(`Error checking forms on ${route}: ${e.message}`); }
}

// Main test function
async function runComprehensiveTest() {
  let browser;
  try {
     browser = await puppeteer.launch({
        headless: true, // Run headless for automation
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'] // Added start-maximized
     });
  } catch (launchError) {
      console.error("FATAL: Failed to launch Puppeteer browser:", launchError.message);
      process.exit(1);
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 }); // Set a large viewport

  // Store test results
  const testResults = {
    startTime: new Date().toISOString(),
    routesTested: [],
    loginStatus: 'Not Attempted',
    consoleErrors: {},
    failedRequests: {},
    functionalTests: {},
    interactionTests: {},
    screenshots: [],
    endTime: null,
    errorsEncountered: []
  };

  // Collect console logs
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();
    const url = page.url();
    const route = url.replace(BASE_URL, '') || '/'; // Handle base URL properly

    // Ignore common benign messages if needed
    if (text.includes('Download the React DevTools') || text.includes('[vite] connected.')) {
      return;
    }

    if (type === 'error' || type === 'warn') { // Capture warnings too
      const errorKey = route;
      if (!testResults.consoleErrors[errorKey]) {
        testResults.consoleErrors[errorKey] = [];
      }
      const errorEntry = `[${type.toUpperCase()}] ${text} (at ${location.url}:${location.lineNumber}:${location.columnNumber})`;
      testResults.consoleErrors[errorKey].push(errorEntry);
      console.log(`CONSOLE ${errorEntry}`); // Log clearly to console
    }
  });

  // Track failed requests
  page.on('requestfailed', (request) => {
    const url = page.url();
    const route = url.replace(BASE_URL, '') || '/';
    const failedUrl = request.url();
    const errorText = request.failure()?.errorText || 'Unknown error';
    const resourceType = request.resourceType();

    const errorKey = route;
    if (!testResults.failedRequests[errorKey]) {
      testResults.failedRequests[errorKey] = [];
    }
    const errorEntry = `[${resourceType}] Failed to load: ${failedUrl} - ${errorText}`;
    testResults.failedRequests[errorKey].push(errorEntry);
    console.log(`REQUEST_FAILED ${errorEntry}`);
  });

  // Test public and auth routes first (no login required)
  const nonProtectedRoutes = [...publicRoutes, ...authRoutes];
  console.log('--- Testing Public and Auth Routes ---');
  for (const route of nonProtectedRoutes) {
    const fullUrl = `${BASE_URL}${route}`;
    console.log(`Testing route: ${fullUrl}`);
    testResults.routesTested.push(route);
    const screenshotFilename = `${route.replace(/[^a-zA-Z0-9]/g, '-') || 'home'}.png`;
    const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotFilename);

    try {
      await page.goto(fullUrl, {
        timeout: 45000, // Increased timeout
        waitUntil: 'networkidle0' // Wait for network activity to cease
      });

      // Wait a bit longer for async operations/rendering
      await wait(1500);

      // Basic functional tests
      testResults.functionalTests[route] = { pageLoaded: true, title: await page.title() };

      // Interaction Checks
      testResults.interactionTests[route] = {};
      await checkInteractions(page, route, testResults.interactionTests[route]);

      // Take screenshot
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testResults.screenshots.push(screenshotPath);
      console.log(` Screenshot saved to ${screenshotPath}`);

    } catch (error) {
      console.error(`Error testing ${fullUrl}:`, error.message);
      testResults.functionalTests[route] = { pageLoaded: false, error: error.message };
      testResults.errorsEncountered.push({ route: route, error: error.message });
      // Attempt screenshot on error
      try {
        await page.screenshot({ path: screenshotPath.replace('.png', '-error.png'), fullPage: true });
         testResults.screenshots.push(screenshotPath.replace('.png', '-error.png'));
      } catch (se) { /* Ignore screenshot error */ }
    }
  }

  // Attempt login
  console.log('--- Attempting Login ---');
  const loggedIn = await login(page);
  testResults.loginStatus = loggedIn ? 'Successful' : 'Failed';

  if (loggedIn) {
    console.log('--- Testing Protected Routes ---');
    for (const route of protectedRoutes) {
      const fullUrl = `${BASE_URL}${route}`;
      console.log(`Testing route: ${fullUrl}`);
      testResults.routesTested.push(route);
      const screenshotFilename = `${route.replace(/[^a-zA-Z0-9]/g, '-')}-auth.png`;
      const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotFilename);

      try {
        await page.goto(fullUrl, {
          timeout: 45000,
          waitUntil: 'networkidle0'
        });
        await wait(1500); // Wait for potential async loads

        testResults.functionalTests[route] = { pageLoaded: true, title: await page.title() };

        // Interaction Checks
        testResults.interactionTests[route] = {};
        await checkInteractions(page, route, testResults.interactionTests[route]);

        await page.screenshot({ path: screenshotPath, fullPage: true });
        testResults.screenshots.push(screenshotPath);
        console.log(` Screenshot saved to ${screenshotPath}`);

      } catch (error) {
        console.error(`Error testing ${fullUrl}:`, error.message);
        testResults.functionalTests[route] = { pageLoaded: false, error: error.message };
        testResults.errorsEncountered.push({ route: route, error: error.message });
        try {
           await page.screenshot({ path: screenshotPath.replace('.png', '-error.png'), fullPage: true });
           testResults.screenshots.push(screenshotPath.replace('.png', '-error.png'));
        } catch (se) { /* Ignore screenshot error */ }
      }
    }
  } else {
    console.log('Login failed, skipping protected routes testing.');
     testResults.errorsEncountered.push({ route: 'N/A', error: 'Login Failed' });
  }

  console.log('--- Test Run Finished ---');
  await browser.close();

  testResults.endTime = new Date().toISOString();

  // Output summary
  const summary = {
    startTime: testResults.startTime,
    endTime: testResults.endTime,
    routesTestedCount: testResults.routesTested.length,
    loginStatus: testResults.loginStatus,
    routesWithConsoleErrors: Object.keys(testResults.consoleErrors),
    routesWithFailedRequests: Object.keys(testResults.failedRequests),
    routesWithLoadFailures: Object.entries(testResults.functionalTests)
                              .filter(([_, data]) => !data.pageLoaded)
                              .map(([route, data]) => ({ route, error: data.error })),
    totalConsoleErrors: Object.values(testResults.consoleErrors).reduce((acc, val) => acc + val.length, 0),
    totalFailedRequests: Object.values(testResults.failedRequests).reduce((acc, val) => acc + val.length, 0),
    screenshotsTaken: testResults.screenshots.length
  };

  console.log('\n--- Test Summary ---');
  console.log(JSON.stringify(summary, null, 2));

  // Write detailed results to a JSON file
  const resultsFilename = `test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(resultsFilename, JSON.stringify(testResults, null, 2));
  console.log(`\nDetailed results saved to ${resultsFilename}`);

  // Exit with error code if major issues were found
  if (summary.loginStatus === 'Failed' || summary.routesWithLoadFailures.length > 0 || summary.totalConsoleErrors > 0) {
      console.error('Test run completed with critical errors.');
      process.exit(1);
  } else {
      console.log('Test run completed successfully.');
      process.exit(0);
  }
}

runComprehensiveTest().catch((error) => {
  console.error('Unhandled error during test execution:', error);
  process.exit(1);
}); 