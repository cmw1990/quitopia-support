const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const fetch = require('node-fetch');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findServerPort() {
  const ports = [6001, 6003];
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok) {
        console.log(`Server found on port ${port}`);
        return port;
      }
    } catch (e) {
      continue;
    }
  }
  throw new Error('Could not find server on ports 6001 or 6003');
}

async function waitForServer(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const port = await findServerPort();
      console.log('Server is ready');
      return port;
    } catch (e) {
      console.log('Waiting for server...');
    }
    await wait(2000);
  }
  throw new Error('Server failed to respond');
}

async function testApp() {
  let browser;
  let serverPort;

  try {
    // Wait for dev server and get port
    serverPort = await waitForServer();
    
    console.log('Starting visual tests...');
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 800 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,800'
      ],
      ignoreHTTPSErrors: true
    });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Create screenshots directory
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });

    // Enable console error collection
    const consoleErrors = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error' || type === 'warning') {
        console.log(`Console ${type}:`, text);
        if (type === 'error') {
          consoleErrors.push(text);
        }
      }
    });

    // Log all uncaught errors
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
      consoleErrors.push(error.message);
    });

    // Test Login Flow
    console.log('Testing login flow...');
    await page.goto(`http://localhost:${serverPort}/auth/login`, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });
    
    await wait(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'login-page.png'),
      fullPage: true 
    });

    console.log('Waiting for email input...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'hertzofhopes@gmail.com');
    await page.type('input[type="password"]', 'J4913836j');
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'login-before-submit.png'),
      fullPage: true 
    });
    
    console.log('Submitting login...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]')
    ]);
    
    console.log('Login successful');
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'after-login.png'),
      fullPage: true 
    });

    // Test Protected Routes
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
      try {
        console.log(`Testing route: ${route}`);
        
        await page.goto(`http://localhost:${serverPort}${route}`, { 
          waitUntil: ['networkidle0', 'domcontentloaded'],
          timeout: 30000
        });
        
        await wait(2000);

        // Take screenshot
        const screenshotPath = path.join(screenshotsDir, `${route.replace(/\//g, '-')}.png`);
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });

        if (consoleErrors.length > 0) {
          console.error(`Errors on ${route}:`, consoleErrors);
          await fs.writeFile(
            path.join(screenshotsDir, `${route.replace(/\//g, '-')}-errors.json`),
            JSON.stringify(consoleErrors, null, 2)
          );
          consoleErrors.length = 0;
        } else {
          console.log(`Route ${route} loaded successfully`);
        }

        // Check for any error texts in the page
        const errorTexts = await page.evaluate(() => {
          const errorElements = document.querySelectorAll('.error, .error-message, [role="alert"]');
          return Array.from(errorElements, el => el.textContent);
        });

        if (errorTexts.length > 0) {
          console.error(`UI Errors on ${route}:`, errorTexts);
          await fs.writeFile(
            path.join(screenshotsDir, `${route.replace(/\//g, '-')}-ui-errors.json`),
            JSON.stringify(errorTexts, null, 2)
          );
        }

      } catch (routeError) {
        console.error(`Error testing route ${route}:`, routeError);
        // Take error screenshot
        const errorScreenshotPath = path.join(screenshotsDir, `${route.replace(/\//g, '-')}-error.png`);
        await page.screenshot({ 
          path: errorScreenshotPath,
          fullPage: true 
        });
      }
    }

    console.log('Visual testing completed');

  } catch (error) {
    console.error('Test error:', error);
    if (browser) {
      const pages = await browser.pages();
      for (const page of pages) {
        await page.screenshot({ 
          path: `screenshots/error-state-${Date.now()}.png`,
          fullPage: true 
        });
      }
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start testing
testApp().catch(err => {
  console.error('Failed to run tests:', err);
  process.exit(1);
});