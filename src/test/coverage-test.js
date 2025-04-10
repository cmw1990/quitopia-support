const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  let browser;
  try {
    console.log('Starting browser...');
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();

    // Enable error and console logging
    const errors = [];
    const consoleMessages = [];

    page.on('error', err => {
      console.error('Page error:', err);
      errors.push(err.message);
    });

    page.on('pageerror', err => {
      console.error('Page error:', err);
      errors.push(err.message);
    });

    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`Console ${type}:`, text);
      consoleMessages.push({ type, text });
    });

    // Start coverage
    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage()
    ]);

    // Create results directory
    const resultsDir = path.join(process.cwd(), 'test-results');
    await fs.mkdir(resultsDir, { recursive: true });

    // Test login
    console.log('Testing login...');
    await page.goto('http://localhost:6001/auth/login', {
      waitUntil: 'networkidle0'
    });
    await wait(2000);

    await page.screenshot({
      path: path.join(resultsDir, 'login-before.png'),
      fullPage: true
    });

    await page.type('input[type="email"]', 'hertzofhopes@gmail.com');
    await page.type('input[type="password"]', 'J4913836j');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    await wait(2000);
    await page.screenshot({
      path: path.join(resultsDir, 'after-login.png'),
      fullPage: true
    });

    // Test protected routes
    const routes = [
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
      '/easier-focus/app/settings',
      '/easier-focus/app/profile'
    ];

    for (const route of routes) {
      console.log(`Testing route: ${route}`);
      await page.goto(`http://localhost:6001${route}`, {
        waitUntil: 'networkidle0'
      });
      await wait(2000);

      // Take screenshot
      await page.screenshot({
        path: path.join(resultsDir, `${route.replace(/\//g, '-')}.png`),
        fullPage: true
      });

      // Check for visual errors
      const errorElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('.error, .error-message, [role="alert"]');
        return Array.from(elements, el => ({
          text: el.textContent,
          className: el.className,
          id: el.id
        }));
      });

      if (errorElements.length > 0) {
        console.error(`UI Errors on ${route}:`, errorElements);
        await fs.writeFile(
          path.join(resultsDir, `${route.replace(/\//g, '-')}-errors.json`),
          JSON.stringify(errorElements, null, 2)
        );
      }
    }

    // Stop coverage
    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage()
    ]);

    // Process coverage data
    let totalBytes = 0;
    let usedBytes = 0;

    const coverage = [...jsCoverage, ...cssCoverage];
    for (const entry of coverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges) {
        usedBytes += range.end - range.start - 1;
      }
    }

    // Save test results
    const testResults = {
      timestamp: new Date().toISOString(),
      coverage: {
        total: totalBytes,
        used: usedBytes,
        percentage: (usedBytes / totalBytes) * 100
      },
      errors,
      consoleMessages: consoleMessages.filter(m => m.type === 'error'),
      routesTested: routes
    };

    await fs.writeFile(
      path.join(resultsDir, 'test-results.json'),
      JSON.stringify(testResults, null, 2)
    );

    console.log('Testing completed successfully');
    console.log(`Coverage: ${(usedBytes / totalBytes * 100).toFixed(2)}%`);
    
    if (errors.length > 0) {
      console.error('Errors found:', errors.length);
      throw new Error('Test failed - errors found');
    }

  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});