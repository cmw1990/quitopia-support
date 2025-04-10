const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBasicCheck() {
  const resultsDir = path.join(process.cwd(), 'basic-results');
  await fs.mkdir(resultsDir, { recursive: true });

  try {
    const browser = await puppeteer.launch({
      headless: false, // Use visible browser for debugging
      args: ['--no-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();
    
    // Basic error logging
    page.on('error', err => console.error('Page error:', err));
    page.on('pageerror', err => console.error('Client error:', err));

    // Test login
    console.log('Testing login page...');
    await page.goto('http://localhost:6001/auth/login', { waitUntil: 'load' });
    await wait(2000);

    // Take screenshot
    await page.screenshot({
      path: path.join(resultsDir, 'login-page.png'),
      fullPage: true
    });

    // Login
    console.log('Attempting login...');
    await page.$eval('input[type="email"]', (el, value) => el.value = value, 'hertzofhopes@gmail.com');
    await page.$eval('input[type="password"]', (el, value) => el.value = value, 'J4913836j');
    await wait(1000);

    await page.screenshot({
      path: path.join(resultsDir, 'before-submit.png'),
      fullPage: true
    });

    // Click login
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'load' })
    ]);

    await wait(3000);

    // Verify login
    const currentUrl = await page.url();
    console.log('Current URL:', currentUrl);

    await page.screenshot({
      path: path.join(resultsDir, 'after-login.png'),
      fullPage: true
    });

    // Test dashboard
    console.log('Checking dashboard...');
    await page.goto('http://localhost:6001/easier-focus/app/dashboard', { waitUntil: 'load' });
    await wait(2000);

    await page.screenshot({
      path: path.join(resultsDir, 'dashboard.png'),
      fullPage: true
    });

    const content = await page.evaluate(() => document.body.textContent);
    console.log('Page content length:', content.length);

    // Close browser
    await browser.close();
    console.log('Basic check completed');

  } catch (error) {
    console.error('Check failed:', error);
    process.exit(1);
  }
}

runBasicCheck();