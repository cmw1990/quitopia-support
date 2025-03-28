#!/usr/bin/env node

/**
 * System Browser Console Check
 * 
 * This script launches system browsers and provides instructions for capturing console errors.
 * It works with both Chrome and Safari without requiring Playwright browser installations.
 * 
 * Usage: node scripts/system-browser-check.js [chrome|safari]
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5003'; // Use the correct port from the Vite output
const BROWSER_TYPE = process.argv[2]?.toLowerCase() || 'chrome';

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

// Define routes to test
const ROUTES = [
  { path: '/', name: 'Landing Page' },
  { path: '/auth', name: 'Authentication Page' },
  { path: '/app', name: 'App Dashboard' },
  { path: '/app/dashboard', name: 'Dashboard' },
  { path: '/app/progress', name: 'Progress Tracker' },
];

/**
 * Main function to launch a browser
 */
async function launchBrowser() {
  console.log(`${colors.bright}${colors.blue}System Browser Console Check (${BROWSER_TYPE})${colors.reset}`);
  console.log(`${colors.blue}================================${colors.reset}\n`);
  
  if (BROWSER_TYPE === 'safari') {
    await launchSafari();
  } else {
    await launchChrome();
  }
}

/**
 * Launch Chrome with developer tools open
 */
async function launchChrome() {
  console.log(`${colors.yellow}Launching Chrome with Developer Tools open...${colors.reset}`);
  
  const chromeCommand = `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --auto-open-devtools-for-tabs ${BASE_URL}`;
  
  console.log(`${colors.cyan}Running command: ${chromeCommand}${colors.reset}\n`);
  
  console.log(`${colors.green}Instructions:${colors.reset}`);
  console.log(`${colors.white}1. When Chrome opens, the Developer Tools will be visible${colors.reset}`);
  console.log(`${colors.white}2. Click on the "Console" tab in Developer Tools${colors.reset}`);
  console.log(`${colors.white}3. Navigate to these routes and watch for errors:${colors.reset}`);
  
  ROUTES.forEach(route => {
    console.log(`   ${colors.cyan}• ${route.name} (${BASE_URL}${route.path})${colors.reset}`);
  });
  
  console.log(`\n${colors.white}4. Check for red error messages in the console${colors.reset}`);
  console.log(`${colors.white}5. When done, close the browser and return to this terminal${colors.reset}\n`);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question(`${colors.yellow}Press Enter to launch Chrome, or Ctrl+C to cancel...${colors.reset}`, () => {
    exec(chromeCommand, (error) => {
      if (error) {
        console.error(`${colors.red}Failed to launch Chrome: ${error.message}${colors.reset}`);
      }
      rl.close();
      
      collectManualResults();
    });
  });
}

/**
 * Launch Safari with developer tools
 */
async function launchSafari() {
  console.log(`${colors.yellow}Preparing to launch Safari with Developer Tools...${colors.reset}\n`);
  
  // First, make sure Safari's developer menu is enabled
  const enableDevMenuCmd = 'defaults write com.apple.Safari IncludeDevelopMenu 1';
  
  console.log(`${colors.cyan}Enabling Safari Developer Menu: ${enableDevMenuCmd}${colors.reset}`);
  
  try {
    exec(enableDevMenuCmd);
    
    console.log(`${colors.green}Instructions:${colors.reset}`);
    console.log(`${colors.white}1. Safari will open to ${BASE_URL}${colors.reset}`);
    console.log(`${colors.white}2. Click on "Develop" in the top menu${colors.reset}`);
    console.log(`${colors.white}3. Click on "Show JavaScript Console" (or press Option+Cmd+C)${colors.reset}`);
    console.log(`${colors.white}4. Navigate to these routes and watch for errors:${colors.reset}`);
    
    ROUTES.forEach(route => {
      console.log(`   ${colors.cyan}• ${route.name} (${BASE_URL}${route.path})${colors.reset}`);
    });
    
    console.log(`\n${colors.white}5. Check for red error messages in the console${colors.reset}`);
    console.log(`${colors.white}6. When done, close Safari and return to this terminal${colors.reset}\n`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${colors.yellow}Press Enter to launch Safari, or Ctrl+C to cancel...${colors.reset}`, () => {
      const safariCommand = `open -a Safari "${BASE_URL}"`;
      
      exec(safariCommand, (error) => {
        if (error) {
          console.error(`${colors.red}Failed to launch Safari: ${error.message}${colors.reset}`);
        }
        rl.close();
        
        collectManualResults();
      });
    });
    
  } catch (error) {
    console.error(`${colors.red}Error setting up Safari: ${error.message}${colors.reset}`);
  }
}

/**
 * Collect manual test results from user
 */
function collectManualResults() {
  console.log(`\n${colors.blue}${colors.bright}Manual Error Collection${colors.reset}`);
  console.log(`${colors.blue}=======================${colors.reset}\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    browser: BROWSER_TYPE,
    routes: {}
  };
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  let currentRouteIndex = 0;
  
  function askForRouteErrors() {
    if (currentRouteIndex >= ROUTES.length) {
      saveResults(results);
      rl.close();
      return;
    }
    
    const route = ROUTES[currentRouteIndex];
    console.log(`\n${colors.cyan}For route: ${route.name} (${route.path})${colors.reset}`);
    
    rl.question(`${colors.yellow}Were there any errors? (y/n): ${colors.reset}`, (answer) => {
      if (answer.toLowerCase() === 'y') {
        results.routes[route.path] = { hasErrors: true };
        
        rl.question(`${colors.yellow}Please paste or describe the errors (press Enter when done):\n${colors.reset}`, (errors) => {
          results.routes[route.path].errorDetails = errors;
          currentRouteIndex++;
          askForRouteErrors();
        });
      } else {
        results.routes[route.path] = { hasErrors: false };
        currentRouteIndex++;
        askForRouteErrors();
      }
    });
  }
  
  // Start the questioning process
  console.log(`${colors.yellow}Now I'll collect information about any errors you observed.${colors.reset}`);
  askForRouteErrors();
}

/**
 * Save the test results
 */
function saveResults(results) {
  // Create reports directory if it doesn't exist
  const reportDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Save results to a JSON file
  const fileName = `${BROWSER_TYPE}-manual-report-${new Date().toISOString().replace(/:/g, '-')}.json`;
  const filePath = path.join(reportDir, fileName);
  
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`\n${colors.green}Results saved to: ${filePath}${colors.reset}`);
  
  // Print a summary
  console.log(`\n${colors.blue}${colors.bright}Summary:${colors.reset}`);
  let totalRoutesWithErrors = 0;
  
  for (const [route, data] of Object.entries(results.routes)) {
    if (data.hasErrors) {
      console.log(`${colors.red}✕ ${route} has errors${colors.reset}`);
      totalRoutesWithErrors++;
    } else {
      console.log(`${colors.green}✓ ${route} is error-free${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.blue}${colors.bright}Result: ${totalRoutesWithErrors === 0 ? 
    colors.green + '✅ All routes passed!' : 
    colors.red + '❌ Some routes have errors!'}${colors.reset}`);
}

// Run the main function
launchBrowser().catch(error => {
  console.error(`${colors.red}Script failed: ${error.message}${colors.reset}`);
  process.exit(1);
}); 