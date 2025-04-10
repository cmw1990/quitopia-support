import { test } from 'vitest';
import puppeteer, { Page } from 'puppeteer';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:6001/easier-focus';

const routes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/app/dashboard',
  '/app/focus',
  '/app/energy',
  '/app/sleep',
  '/app/mental-health',
  '/app/tools',
  '/app/settings',
  '/app/profile',
  '/app/focus-timer',
  '/app/focus-journal',
  '/app/focus-stats',
  '/app/focus-strategies',
  '/app/focus-sessions',
  '/app/achievements',
  '/app/tasks',
  '/app/mood-energy',
  '/app/analytics',
  '/web-tools',
  '/mobile-app',
  '/why-us',
  '/app/body-doubling',
  '/app/context-switching',
  '/app/executive-function',
  '/app/anti-googlitis',
  '/app/digital-minimalism',
  '/app/notification-manager',
  '/app/energy-scheduler',
  '/app/distraction-blocker',
  '/app/enhanced-focus',
  '/app/anti-fatigue',
  '/app/nicotine-and-focus',
  '/app/energy-support',
  '/app/expert-consultancy',
  '/app/pregnancy',
  '/app/bathing',
  '/app/sleep-track',
  '/app/food',
  '/app/energy-plans',
  '/app/mental-health',
  '/app/nicotine',
  '/app/directory',
  '/app/recipes',
  '/app/tools',
  '/app/development-tools',
  '/app/edit-energy-plan',
  '/app/sobriety',
  '/app/cbt',
  '/app/shop',
  '/app/smoke-free',
  '/app/caffeine',
  '/app/motivation',
  '/app/pregnancy-log',
  '/app/supplements',
  '/app/support',
  '/app/quit-plan',
  '/app/recovery'
];

async function waitForServer(url: string, maxRetries = 30, retryInterval = 1000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('Development server is ready!');
        return;
      }
    } catch (error) {
      console.log(`Waiting for server to be ready... (${i + 1}/${maxRetries})`);
    }
    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }
  throw new Error('Server did not become ready in time');
}

test('Check all routes for errors', async () => {
  // Wait for the development server to be ready
  await waitForServer(BASE_URL);

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Enable detailed console logging
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type}] ${text}`);
  });

  // Enable request logging
  page.on('request', (request) => {
    console.log(`Request: ${request.method()} ${request.url()}`);
  });

  // Enable response logging
  page.on('response', (response) => {
    console.log(`Response: ${response.status()} ${response.url()}`);
  });

  // Login first
  console.log('Attempting to log in...');
  await page.goto(`${BASE_URL}/auth/login`);
  
  // Wait for the login form to be visible
  await page.waitForSelector('form', { timeout: 5000 });
  
  // Find the email and password inputs
  const emailInput = await page.$('input[type="email"]');
  const passwordInput = await page.$('input[type="password"]');
  const submitButton = await page.$('button[type="submit"]');

  if (!emailInput || !passwordInput || !submitButton) {
    throw new Error('Could not find login form elements');
  }

  // Fill in the login form
  await emailInput.type('hertzofhopes@gmail.com');
  await passwordInput.type('J4913836j');
  await submitButton.click();

  // Wait for navigation after login
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  const consoleErrors: { [key: string]: string[] } = {};
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const currentUrl = page.url();
      const route = currentUrl.replace(BASE_URL, '');
      if (!consoleErrors[route]) {
        consoleErrors[route] = [];
      }
      consoleErrors[route].push(msg.text());
    }
  });

  for (const route of routes) {
    console.log(`Checking route: ${route}`);
    try {
      await page.goto(`${BASE_URL}${route}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for any potential errors
      
      // Check for clickable elements
      const clickableElements = await page.$$('a, button');
      console.log(`Found ${clickableElements.length} clickable elements on ${route}`);
      
      // Check for forms
      const forms = await page.$$('form');
      console.log(`Found ${forms.length} forms on ${route}`);
      
      // Check for data fetching (look for loading states or data containers)
      const dataContainers = await page.$$('[data-loading], [data-loaded], .data-container');
      console.log(`Found ${dataContainers.length} data containers on ${route}`);
      
      // Check for error messages or error states
      const errorElements = await page.$$('.error, .error-message, [data-error]');
      if (errorElements.length > 0) {
        console.error(`Found ${errorElements.length} error elements on ${route}`);
        for (const errorElement of errorElements) {
          const text = await page.evaluate(el => el.textContent, errorElement);
          console.error(`Error element text: ${text}`);
        }
      }
      
    } catch (error: unknown) {
      console.error(`Error on route ${route}:`, error);
      if (!consoleErrors[route]) {
        consoleErrors[route] = [];
      }
      consoleErrors[route].push(error instanceof Error ? error.message : String(error));
    }
  }

  console.log('\nConsole Errors Summary:');
  for (const [route, errors] of Object.entries(consoleErrors)) {
    if (errors.length > 0) {
      console.log(`\nRoute: ${route}`);
      errors.forEach((error) => console.log(`- ${error}`));
    }
  }

  await browser.close();
}, { timeout: 300000 }); // 5 minutes timeout 