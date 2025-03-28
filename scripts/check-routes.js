#!/usr/bin/env node

/**
 * Route Checker for Mission Fresh
 * 
 * This script checks all routes in the Mission Fresh application,
 * logs in with test credentials, and verifies essential functionality.
 * 
 * Usage: node scripts/check-routes.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5003';
const TEST_USER = {
  email: 'hertzofhopes@gmail.com',
  password: 'J4913836j'
};

// Routes to check
const ROUTES = [
  // Public routes
  { path: '/', name: 'Home/Landing Page' },
  { path: '/auth', name: 'Authentication Page' },
  
  // Protected routes
  { path: '/app', name: 'App Index', requiresAuth: true },
  { path: '/app/dashboard', name: 'Main Dashboard', requiresAuth: true },
  { path: '/app/progress', name: 'Progress Tracking', requiresAuth: true },
  { path: '/app/consumption-logger', name: 'Consumption Logger', requiresAuth: true },
  { path: '/app/nrt-directory', name: 'NRT Directory', requiresAuth: true },
  { path: '/app/alternative-products', name: 'Alternative Products', requiresAuth: true },
  { path: '/app/guides', name: 'Guides Hub', requiresAuth: true },
  { path: '/app/journal', name: 'Journal', requiresAuth: true },
  { path: '/app/web-tools', name: 'Web Tools', requiresAuth: true },
  { path: '/app/community', name: 'Community', requiresAuth: true },
  { path: '/app/settings', name: 'Settings', requiresAuth: true },
  { path: '/app/task-manager', name: 'Task Manager', requiresAuth: true },
  { path: '/app/trigger-analysis', name: 'Trigger Analysis', requiresAuth: true },
  { path: '/app/challenges', name: 'Community Challenges', requiresAuth: true },
  { path: '/app/achievements', name: 'Achievements', requiresAuth: true },
  { path: '/app/health/mood', name: 'Mood Tracker', requiresAuth: true },
  { path: '/app/health/energy', name: 'Energy Tracker', requiresAuth: true },
  { path: '/app/health/focus', name: 'Focus Tracker', requiresAuth: true },
  { path: '/app/health/holistic', name: 'Holistic Dashboard', requiresAuth: true },
  { path: '/app/health/cravings', name: 'Craving Tracker', requiresAuth: true },
  { path: '/app/health/sleep', name: 'Sleep Quality', requiresAuth: true },
  { path: '/app/analytics', name: 'Analytics Dashboard', requiresAuth: true },
  { path: '/app/interventions', name: 'Interventions', requiresAuth: true },
  { path: '/app/private-messaging', name: 'Private Messaging', requiresAuth: true },
  { path: '/app/healthcare-reports', name: 'Healthcare Reports', requiresAuth: true },
  { path: '/app/advanced-analytics', name: 'Advanced Analytics', requiresAuth: true },
  { path: '/app/enhanced-support', name: 'Enhanced Support', requiresAuth: true }
];

// Elements to check on each page
const ELEMENT_CHECKS = [
  { selector: 'button', description: 'Buttons' },
  { selector: 'a[href]', description: 'Links' },
  { selector: 'input', description: 'Form inputs' },
  { selector: 'form', description: 'Forms' },
  { selector: '.error, .alert, .notification', description: 'Error/alert elements' },
  { selector: '[role="alert"]', description: 'Accessibility alerts' },
  { selector: '[aria-invalid="true"]', description: 'Invalid form fields' },
  { selector: '.placeholder, .skeleton', description: 'Placeholder/skeleton elements' },
  { selector: 'img[alt=""]', description: 'Images without alt text' }
];

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

// Results storage
const results = {
  passedRoutes: 0,
  failedRoutes: 0,
  issues: [],
  checkTime: new Date().toISOString()
};

/**
 * Main function to check all routes
 */
async function checkAllRoutes() {
  console.log(`${colors.bright}${colors.blue}Mission Fresh Route Checker${colors.reset}`);
  console.log(`${colors.blue}==========================${colors.reset}`);
  console.log(`${colors.cyan}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.cyan}Routes to check: ${ROUTES.length}${colors.reset}\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--window-size=1280,800'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  // Login once and reuse cookies
  let authCookies = null;
  try {
    console.log(`${colors.yellow}Logging in with test account...${colors.reset}`);
    authCookies = await login(browser);
    
    if (!authCookies) {
      throw new Error('Failed to login. Cannot check protected routes.');
    }
    
    console.log(`${colors.green}Successfully logged in!${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Login failed: ${error.message}${colors.reset}`);
    await browser.close();
    return;
  }
  
  // Check each route
  for (const route of ROUTES) {
    const fullUrl = `${BASE_URL}${route.path}`;
    
    console.log(`\n${colors.bright}${colors.magenta}Testing: ${route.name} (${route.path})${colors.reset}`);
    
    try {
      // Skip protected routes if login failed
      if (route.requiresAuth && !authCookies) {
        console.log(`${colors.yellow}Skipping protected route (no auth)${colors.reset}`);
        continue;
      }
      
      const result = await checkRoute(browser, fullUrl, route, authCookies);
      
      if (result.success) {
        results.passedRoutes++;
        console.log(`${colors.green}✓ Route check passed${colors.reset}`);
      } else {
        results.failedRoutes++;
        console.log(`${colors.red}✗ Route check failed: ${result.error}${colors.reset}`);
        
        results.issues.push({
          route: route.path,
          name: route.name,
          error: result.error,
          consoleErrors: result.consoleErrors || [],
          visualIssues: result.visualIssues || []
        });
      }
    } catch (error) {
      results.failedRoutes++;
      console.error(`${colors.red}Error checking route: ${error.message}${colors.reset}`);
      
      results.issues.push({
        route: route.path,
        name: route.name,
        error: error.message
      });
    }
  }
  
  // Print summary and save results
  printSummary();
  saveResults();
  
  // Close browser
  await browser.close();
}

/**
 * Login to the application
 */
async function login(browser) {
  const page = await browser.newPage();
  
  // Set up console error collection
  const consoleMessages = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      consoleMessages.push({
        type: message.type(),
        text: message.text()
      });
    }
  });
  
  try {
    // Navigate to login page
    await page.goto(`${BASE_URL}/auth`, { waitUntil: 'networkidle0' });
    
    // Wait for login form elements
    await page.waitForSelector('input[type="email"]');
    await page.waitForSelector('input[type="password"]');
    
    // Fill in credentials
    await page.type('input[type="email"]', TEST_USER.email);
    await page.type('input[type="password"]', TEST_USER.password);
    
    // Click login button
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    // Check if login was successful
    const url = page.url();
    if (url.includes('/app') || url.includes('/dashboard')) {
      // Get cookies
      const cookies = await page.cookies();
      await page.close();
      return cookies;
    } else {
      console.log(`${colors.red}Login failed. Current URL: ${url}${colors.reset}`);
      
      if (consoleMessages.length > 0) {
        console.log(`${colors.red}Console errors during login:${colors.reset}`);
        consoleMessages.forEach(msg => {
          console.log(`  ${colors.red}${msg.text}${colors.reset}`);
        });
      }
      
      await page.close();
      return null;
    }
  } catch (error) {
    await page.close();
    throw error;
  }
}

/**
 * Check a specific route
 */
async function checkRoute(browser, url, route, cookies = null) {
  const page = await browser.newPage();
  
  // Set cookies if this is a protected route
  if (route.requiresAuth && cookies) {
    await page.setCookie(...cookies);
  }
  
  // Collect console errors
  const consoleErrors = [];
  page.on('console', message => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  
  // Collect page errors
  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
  });
  
  try {
    // Navigate to the route
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for redirect if necessary
    if (route.requiresAuth && !page.url().includes(route.path)) {
      // Wait to see if we get redirected to the auth page
      await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    }
    
    // Check if navigation was successful
    const currentUrl = page.url();
    if (route.requiresAuth && currentUrl.includes('/auth')) {
      throw new Error('Authentication failed - redirected to login page');
    }
    
    // Check for basic elements
    const visualIssues = await checkVisualElements(page);
    
    // Check for "coming soon", "page not found" or placeholder content
    const pageContent = await page.content();
    const placeholderTexts = [
      'coming soon',
      'page not found', 
      'page doesn\'t exist',
      'under construction',
      'placeholder',
      '404'
    ];
    
    for (const text of placeholderTexts) {
      if (pageContent.toLowerCase().includes(text)) {
        visualIssues.push(`Page contains placeholder text: "${text}"`);
      }
    }
    
    // Screenshot the page for reference
    const screenshotPath = path.join(__dirname, '../logs/screenshots');
    if (!fs.existsSync(screenshotPath)) {
      fs.mkdirSync(screenshotPath, { recursive: true });
    }
    
    const screenshotFile = path.join(
      screenshotPath, 
      `${route.path.replace(/\//g, '_')}_${Date.now()}.png`
    );
    
    await page.screenshot({ path: screenshotFile, fullPage: true });
    
    // Report results
    const success = consoleErrors.length === 0 && visualIssues.length === 0;
    
    // Log detailed information
    if (consoleErrors.length > 0) {
      console.log(`${colors.red}Console errors (${consoleErrors.length}):${colors.reset}`);
      consoleErrors.slice(0, 5).forEach(err => {
        console.log(`  ${colors.red}${err.substring(0, 100)}${err.length > 100 ? '...' : ''}${colors.reset}`);
      });
      
      if (consoleErrors.length > 5) {
        console.log(`  ${colors.red}... and ${consoleErrors.length - 5} more errors${colors.reset}`);
      }
    }
    
    if (visualIssues.length > 0) {
      console.log(`${colors.yellow}Visual issues (${visualIssues.length}):${colors.reset}`);
      visualIssues.forEach(issue => {
        console.log(`  ${colors.yellow}${issue}${colors.reset}`);
      });
    }
    
    if (success) {
      console.log(`${colors.green}✓ No issues detected${colors.reset}`);
    }
    
    await page.close();
    
    return {
      success,
      error: success ? null : 'Found issues on page',
      consoleErrors,
      visualIssues,
      screenshotFile
    };
  } catch (error) {
    await page.close();
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check visual elements on a page
 */
async function checkVisualElements(page) {
  const issues = [];
  
  for (const check of ELEMENT_CHECKS) {
    try {
      const elements = await page.$$(check.selector);
      
      if (check.selector.includes('error') || check.selector.includes('alert') || 
          check.selector.includes('invalid') || check.selector.includes('placeholder')) {
        // For error/alert selectors, their presence is an issue
        if (elements.length > 0) {
          issues.push(`Found ${elements.length} ${check.description}`);
        }
      }
    } catch (error) {
      issues.push(`Error checking ${check.description}: ${error.message}`);
    }
  }
  
  // Check for non-clickable buttons
  try {
    const nonClickableButtons = await page.$$eval('button', buttons => {
      return buttons
        .filter(btn => {
          const style = window.getComputedStyle(btn);
          return (
            btn.disabled || 
            style.display === 'none' || 
            style.visibility === 'hidden' || 
            btn.classList.contains('disabled')
          );
        })
        .map(btn => btn.innerText.trim() || btn.id || 'Unnamed button');
    });
    
    if (nonClickableButtons.length > 0) {
      issues.push(`Found ${nonClickableButtons.length} non-clickable buttons: ${nonClickableButtons.join(', ')}`);
    }
  } catch (error) {
    issues.push(`Error checking clickable buttons: ${error.message}`);
  }
  
  // Check for overlapping elements
  try {
    const overlappingElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, input, .card, .dialog, .modal'));
      const results = [];
      
      elements.forEach(el => {
        const rect1 = el.getBoundingClientRect();
        if (rect1.width === 0 || rect1.height === 0) return;
        
        elements.forEach(other => {
          if (el === other) return;
          
          const rect2 = other.getBoundingClientRect();
          if (rect2.width === 0 || rect2.height === 0) return;
          
          // Check for significant overlap (more than 50% in both dimensions)
          const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
          const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
          
          const area1 = rect1.width * rect1.height;
          const area2 = rect2.width * rect2.height;
          const overlapArea = overlapX * overlapY;
          const smallerArea = Math.min(area1, area2);
          
          if (overlapArea > 0.5 * smallerArea) {
            const elDesc = el.tagName + (el.id ? ` #${el.id}` : '') + (el.className ? ` .${el.className.replace(/\s+/g, '.')}` : '');
            const otherDesc = other.tagName + (other.id ? ` #${other.id}` : '') + (other.className ? ` .${other.className.replace(/\s+/g, '.')}` : '');
            
            results.push(`${elDesc} overlaps with ${otherDesc}`);
          }
        });
      });
      
      // Return unique results
      return [...new Set(results)].slice(0, 10); // Limit to 10 results
    });
    
    if (overlappingElements.length > 0) {
      issues.push(`Found overlapping elements: ${overlappingElements.length} instances`);
    }
  } catch (error) {
    issues.push(`Error checking overlapping elements: ${error.message}`);
  }
  
  return issues;
}

/**
 * Print summary of results
 */
function printSummary() {
  console.log(`\n${colors.bright}${colors.blue}Test Summary${colors.reset}`);
  console.log(`${colors.blue}=====================${colors.reset}`);
  console.log(`${colors.cyan}Total routes checked: ${ROUTES.length}${colors.reset}`);
  console.log(`${colors.green}Passed routes: ${results.passedRoutes}${colors.reset}`);
  console.log(`${colors.red}Failed routes: ${results.failedRoutes}${colors.reset}`);
  
  if (results.issues.length > 0) {
    console.log(`\n${colors.bright}${colors.red}Issues Found:${colors.reset}`);
    
    results.issues.forEach((issue, index) => {
      console.log(`${colors.red}${index + 1}. ${issue.name} (${issue.route}): ${issue.error}${colors.reset}`);
      
      if (issue.consoleErrors && issue.consoleErrors.length > 0) {
        console.log(`   ${colors.dim}Console errors: ${issue.consoleErrors.length}${colors.reset}`);
      }
      
      if (issue.visualIssues && issue.visualIssues.length > 0) {
        console.log(`   ${colors.dim}Visual issues: ${issue.visualIssues.length}${colors.reset}`);
      }
    });
  }
}

/**
 * Save results to a file
 */
function saveResults() {
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(logsDir, `route-check-${timestamp}.json`);
  
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n${colors.green}Results saved to: ${resultsFile}${colors.reset}`);
}

// Run the route checker
checkAllRoutes().catch(error => {
  console.error(`${colors.red}Fatal error: ${error}${colors.reset}`);
  process.exit(1);
}); 