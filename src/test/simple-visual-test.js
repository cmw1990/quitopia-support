import { launch } from 'chrome-launcher';
import CDP from 'chrome-remote-interface';
import fetch from 'node-fetch';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  let chrome;
  let client;
  let serverPort;

  try {
    // Wait for dev server and get port
    serverPort = await waitForServer();
    
    console.log('Starting visual tests...');
    chrome = await launch({
      chromeFlags: [
        '--window-size=1280,800',
        '--disable-gpu',
        '--no-sandbox'
      ]
    });

    client = await CDP({ port: chrome.port });
    const { Page, Runtime, Network } = client;
    await Promise.all([Page.enable(), Runtime.enable(), Network.enable()]);

    // Create screenshots directory
    const screenshotsDir = path.join(process.cwd(), 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });

    // Collect console errors
    Runtime.consoleAPICalled(({ type, args }) => {
      if (type === 'error') {
        console.error('Console error:', args[0]);
      }
    });

    // Test Login Flow
    console.log('Testing login flow...');
    await Page.navigate({ url: `http://localhost:${serverPort}/auth/login` });
    await Page.loadEventFired();
    await wait(2000);

    // Take login page screenshot
    const loginScreenshot = await Page.captureScreenshot({ fullpage: true });
    await fs.writeFile(
      path.join(screenshotsDir, 'login-page.png'),
      Buffer.from(loginScreenshot.data, 'base64')
    );

    // Login
    await Runtime.evaluate({
      expression: `
        document.querySelector('input[type="email"]').value = 'hertzofhopes@gmail.com';
        document.querySelector('input[type="password"]').value = 'J4913836j';
        document.querySelector('button[type="submit"]').click();
      `
    });

    await wait(2000);

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
        await Page.navigate({ url: `http://localhost:${serverPort}${route}` });
        await Page.loadEventFired();
        await wait(2000);

        // Take screenshot
        const screenshot = await Page.captureScreenshot({ fullpage: true });
        await fs.writeFile(
          path.join(screenshotsDir, `${route.replace(/\//g, '-')}.png`),
          Buffer.from(screenshot.data, 'base64')
        );

        // Check for errors
        const errors = await Runtime.evaluate({
          expression: `
            [
              ...document.querySelectorAll('.error, .error-message, [role="alert"]')
            ].map(el => el.textContent)
          `
        });

        if (errors.result.value && errors.result.value.length > 0) {
          console.error(`UI Errors on ${route}:`, errors.result.value);
          await fs.writeFile(
            path.join(screenshotsDir, `${route.replace(/\//g, '-')}-ui-errors.json`),
            JSON.stringify(errors.result.value, null, 2)
          );
        } else {
          console.log(`Route ${route} loaded successfully`);
        }

      } catch (routeError) {
        console.error(`Error testing route ${route}:`, routeError);
      }
    }

    console.log('Visual testing completed');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    if (client) {
      await client.close();
    }
    if (chrome) {
      await chrome.kill();
    }
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

testApp().catch(err => {
  console.error('Failed to run tests:', err);
  process.exit(1);
});