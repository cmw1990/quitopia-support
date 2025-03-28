#!/usr/bin/env node

/**
 * Automated Route Testing Script for Mission Fresh App
 * 
 * This script navigates through all routes in the Mission Fresh application,
 * logs in with test credentials, and captures any console errors.
 * It uses Puppeteer for browser automation.
 * 
 * Usage: npm run test:routes
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5001';
const TEST_EMAIL = 'hertzofhopes@gmail.com';
const TEST_PASSWORD = 'J4913836j';

// Define all public and protected routes to test
const ROUTES = [
  // Public routes
  { path: '/', name: 'Landing Page' },
  { path: '/auth', name: 'Authentication Page' },
  
  // Protected routes (require login)
  { path: '/app', name: 'App Dashboard' },
  { path: '/app/dashboard', name: 'Dashboard' },
  { path: '/app/progress', name: 'Progress Tracker' },
  { path: '/app/consumption-logger', name: 'Consumption Logger' },
  { path: '/app/nrt-directory', name: 'NRT Directory' },
  { path: '/app/alternative-products', name: 'Alternative Products' },
  { path: '/app/guides', name: 'Guides Hub' },
  { path: '/app/web-tools', name: 'Web Tools' },
  { path: '/app/community', name: 'Community' },
  { path: '/app/settings', name: 'Settings' },
  { path: '/app/task-manager', name: 'Task Manager' },
  { path: '/app/trigger-analysis', name: 'Trigger Analysis' },
  { path: '/app/challenges', name: 'Challenges' },
  { path: '/app/achievements', name: 'Achievements' },
  { path: '/app/journal', name: 'Journal' },
  { path: '/app/analytics', name: 'Analytics Dashboard' },
  
  // Health routes
  { path: '/app/health/dashboard', name: 'Health Dashboard' },
  { path: '/app/health/mood', name: 'Mood Tracker' },
  { path: '/app/health/energy', name: 'Energy Tracker' },
  { path: '/app/health/focus', name: 'Focus Tracker' },
];

// Collect errors by route
const errorsByRoute = {};
let totalErrors = 0;
let totalWarnings = 0;

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Main function to test all routes
 */
async function testAllRoutes() {
  console.log(`${colors.bright}${colors.blue}Mission Fresh Route Testing${colors.reset}`);
  console.log(`${colors.blue}================================${colors.reset}\n`);
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for production, false for debugging
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Setup console logging
    page.on('console', (msg) => {
      const currentUrl = page.url().replace(BASE_URL, '') || '/';
      const routePath = ROUTES.find(r => currentUrl.startsWith(r.path))?.path || currentUrl;
      
      if (!errorsByRoute[routePath]) {
        errorsByRoute[routePath] = { errors: [], warnings: [] };
      }
      
      const logType = msg.type();
      const logText = msg.text();
      
      if (logType === 'error') {
        errorsByRoute[routePath].errors.push(logText);
        totalErrors++;
      } else if (logType === 'warning') {
        errorsByRoute[routePath].warnings.push(logText);
        totalWarnings++;
      }
    });
    
    // Log any uncaught exceptions
    page.on('pageerror', (error) => {
      const currentUrl = page.url().replace(BASE_URL, '') || '/';
      const routePath = ROUTES.find(r => currentUrl.startsWith(r.path))?.path || currentUrl;
      
      if (!errorsByRoute[routePath]) {
        errorsByRoute[routePath] = { errors: [], warnings: [] };
      }
      
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
    
  } catch (error) {
    console.error(`${colors.red}Error running tests: ${error.message}${colors.reset}`);
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
 * Login to the application with test credentials
 */
async function login(page) {
  console.log(`${colors.yellow}Logging in with test credentials...${colors.reset}`);
  
  try {
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Fill in email and password fields
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', TEST_EMAIL);
    await page.type('input[type="password"]', TEST_PASSWORD);
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete (should redirect to dashboard)
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
    
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
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait a bit to collect any console errors
    await page.waitForTimeout(2000);
    
    // Scroll the page to trigger lazy-loaded content
    await autoScroll(page);
    
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
 * Auto-scroll the page to load lazy content
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * Generate a report of all errors and warnings
 */
function generateReport() {
  console.log(`\n${colors.blue}${colors.bright}Error Report:${colors.reset}`);
  console.log(`${colors.blue}==============${colors.reset}`);
  
  const reportData = {
    timestamp: new Date().toISOString(),
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
  
  const reportPath = path.join(reportDir, `route-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
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