#!/usr/bin/env node

/**
 * Console Error Check with Playwright
 * 
 * This script uses Playwright to capture console errors from multiple browsers,
 * including WebKit (Safari). It navigates to specified routes and records any
 * console errors it encounters.
 * 
 * Usage: node scripts/playwright-console-check.js
 */

import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5003'; // Use the correct port from the Vite output
const TEST_EMAIL = 'hertzofhopes@gmail.com';
const TEST_PASSWORD = 'J4913836j';

// Browser to use (change to 'webkit' for Safari, 'firefox' for Firefox)
const BROWSER_TYPE = process.argv[2] || 'chromium';

// Define all routes to test
const ROUTES = [
  // Public routes
  { path: '/', name: 'Landing Page' },
  { path: '/auth', name: 'Authentication Page' },
  
  // Protected routes
  { path: '/app', name: 'App Dashboard' },
  { path: '/app/dashboard', name: 'Dashboard' },
  { path: '/app/progress', name: 'Progress Tracker' },
  // Add more routes as needed
];

// Collect errors by route
const errorsByRoute = {};
let totalErrors = 0;
let totalWarnings = 0;

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Helper function to delay execution
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to test all routes
 */
async function testAllRoutes() {
  console.log(`${colors.bright}${colors.blue}Console Error Check with Playwright (${BROWSER_TYPE})${colors.reset}`);
  console.log(`${colors.blue}================================${colors.reset}\n`);
  
  // Select browser based on type
  let browser;
  try {
    switch (BROWSER_TYPE) {
      case 'webkit':
        console.log(`${colors.yellow}Launching WebKit (Safari)...${colors.reset}`);
        browser = await webkit.launch({ headless: false });
        break;
      case 'firefox':
        console.log(`${colors.yellow}Launching Firefox...${colors.reset}`);
        browser = await firefox.launch({ headless: false });
        break;
      case 'chromium':
      default:
        console.log(`${colors.yellow}Launching Chromium...${colors.reset}`);
        browser = await chromium.launch({ headless: false });
        break;
    }
  } catch (error) {
    console.error(`${colors.red}Failed to launch browser: ${error.message}${colors.reset}`);
    console.error(`${colors.yellow}Try installing browsers with: npx playwright install${colors.reset}`);
    process.exit(1);
  }
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    
    const page = await context.newPage();
    
    // Setup console logging
    page.on('console', (msg) => {
      const currentUrl = page.url().replace(BASE_URL, '') || '/';
      const routePath = ROUTES.find(r => currentUrl.includes(r.path))?.path || currentUrl;
      
      if (!errorsByRoute[routePath]) {
        errorsByRoute[routePath] = { errors: [], warnings: [] };
      }
      
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        console.log(`${colors.red}ERROR: ${text}${colors.reset}`);
        errorsByRoute[routePath].errors.push(text);
        totalErrors++;
      } else if (type === 'warning') {
        console.log(`${colors.yellow}WARNING: ${text}${colors.reset}`);
        errorsByRoute[routePath].warnings.push(text);
        totalWarnings++;
      }
    });
    
    // Log any uncaught exceptions
    page.on('pageerror', (error) => {
      const currentUrl = page.url().replace(BASE_URL, '') || '/';
      const routePath = ROUTES.find(r => currentUrl.includes(r.path))?.path || currentUrl;
      
      if (!errorsByRoute[routePath]) {
        errorsByRoute[routePath] = { errors: [], warnings: [] };
      }
      
      console.log(`${colors.red}PAGE ERROR: ${error.message}${colors.reset}`);
      errorsByRoute[routePath].errors.push(error.message);
      totalErrors++;
    });
    
    // First, attempt to login
    await login(page);
    
    // Then test each route
    for (const route of ROUTES) {
      await testRoute(page, route);
    }
    
    // Generate report
    generateReport();
    
  } finally {
    await browser.close();
    console.log(`\n${colors.blue}================================${colors.reset}`);
    console.log(`${colors.yellow}Total errors: ${totalErrors}${colors.reset}`);
    console.log(`${colors.yellow}Total warnings: ${totalWarnings}${colors.reset}`);
    
    if (totalErrors > 0) {
      console.log(`${colors.red}${colors.bright}❌ Some routes have errors!${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`${colors.green}${colors.bright}✅ All routes passed!${colors.reset}`);
      process.exit(0);
    }
  }
}

/**
 * Login to the application
 */
async function login(page) {
  console.log(`${colors.yellow}Logging in with test credentials...${colors.reset}`);
  
  try {
    await page.goto(`${BASE_URL}/auth`, { timeout: 30000 });
    
    // Try to find login form
    const hasLoginForm = await page.evaluate(() => {
      return !!document.querySelector('input[type="email"]');
    });
    
    if (!hasLoginForm) {
      console.log(`${colors.yellow}No login form found, might already be logged in${colors.reset}`);
      return true;
    }
    
    // Fill in email and password fields
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForNavigation({ timeout: 30000 });
    
    // Check if we're logged in
    const currentUrl = page.url();
    if (currentUrl.includes('/app')) {
      console.log(`${colors.green}✓ Login successful${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✕ Login failed${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}Error during login: ${error.message}${colors.reset}`);
    return false;
  }
}

/**
 * Test a specific route
 */
async function testRoute(page, route) {
  const { path, name } = route;
  console.log(`${colors.yellow}Testing route: ${colors.bright}${name} (${path})${colors.reset}`);
  
  try {
    // Navigate to the route
    await page.goto(`${BASE_URL}${path}`, { timeout: 30000 });
    
    // Wait a bit to collect console errors
    await delay(2000);
    
    // Scroll the page to trigger lazy-loaded content
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait a bit more
    await delay(1000);
    
    // Check for errors
    const routeErrors = errorsByRoute[path]?.errors || [];
    const routeWarnings = errorsByRoute[path]?.warnings || [];
    
    if (routeErrors.length > 0) {
      console.log(`${colors.red}✕ Found ${routeErrors.length} errors${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ No errors found${colors.reset}`);
    }
    
    if (routeWarnings.length > 0) {
      console.log(`${colors.yellow}! Found ${routeWarnings.length} warnings${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error testing route ${path}: ${error.message}${colors.reset}`);
    
    if (!errorsByRoute[path]) {
      errorsByRoute[path] = { errors: [], warnings: [] };
    }
    
    errorsByRoute[path].errors.push(`Navigation error: ${error.message}`);
    totalErrors++;
  }
}

/**
 * Generate a report of all errors and warnings
 */
function generateReport() {
  console.log(`\n${colors.blue}${colors.bright}Error Report:${colors.reset}`);
  console.log(`${colors.blue}==============${colors.reset}`);
  
  const reportData = {
    timestamp: new Date().toISOString(),
    browser: BROWSER_TYPE,
    summary: {
      totalErrors,
      totalWarnings,
      routes: Object.keys(errorsByRoute).length,
    },
    routeDetails: errorsByRoute,
  };
  
  // Save JSON report
  const reportDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(
    reportDir, 
    `${BROWSER_TYPE}-console-report-${new Date().toISOString().replace(/:/g, '-')}.json`
  );
  
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`${colors.yellow}Report saved to: ${reportPath}${colors.reset}`);
  
  // Print summary to console
  for (const [route, logs] of Object.entries(errorsByRoute)) {
    if (logs.errors.length > 0 || logs.warnings.length > 0) {
      console.log(`\n${colors.cyan}Route: ${route}${colors.reset}`);
      
      if (logs.errors.length > 0) {
        console.log(`${colors.red}  Errors (${logs.errors.length}):${colors.reset}`);
        logs.errors.forEach((error, i) => {
          console.log(`${colors.red}    ${i + 1}. ${error.substring(0, 150)}${error.length > 150 ? '...' : ''}${colors.reset}`);
        });
      }
      
      if (logs.warnings.length > 0) {
        console.log(`${colors.yellow}  Warnings (${logs.warnings.length}):${colors.reset}`);
        logs.warnings.forEach((warning, i) => {
          console.log(`${colors.yellow}    ${i + 1}. ${warning.substring(0, 150)}${warning.length > 150 ? '...' : ''}${colors.reset}`);
        });
      }
    }
  }
}

// Run the tests
testAllRoutes().catch(error => {
  console.error(`${colors.red}Script failed: ${error.message}${colors.reset}`);
  process.exit(1);
}); 