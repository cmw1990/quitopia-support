#!/usr/bin/env node

/**
 * Cursor Extension: Safari Console Error Monitor
 * 
 * This script captures console errors from Safari using Playwright and sends them
 * to Cursor IDE for immediate debugging.
 * 
 * Usage: node cursor-extensions/playwright-safari-console.js [url]
 */

import { webkit } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure options
const TARGET_URL = process.argv[2] || 'http://localhost:5003/';
const ERROR_LOG_PATH = path.join(__dirname, 'safari-errors.json');
const CURSOR_PATH = '/Applications/Cursor.app/Contents/MacOS/Cursor';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Main function to monitor Safari console
 */
async function monitorSafariConsole() {
  console.log(`${colors.bright}${colors.blue}Cursor Extension: Safari Console Monitor${colors.reset}`);
  console.log(`${colors.blue}=======================================${colors.reset}`);
  console.log(`${colors.cyan}Target URL: ${TARGET_URL}${colors.reset}\n`);
  
  try {
    // Launch Safari browser with WebKit
    console.log(`${colors.yellow}Launching Safari (WebKit) browser...${colors.reset}`);
    const browser = await webkit.launch({
      headless: false
    });
    
    // Create browser context and page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Prepare to capture errors
    const errors = [];
    
    // Listen for console messages
    page.on('console', message => {
      const type = message.type();
      const text = message.text();
      const location = {
        url: page.url(),
        timestamp: new Date().toISOString()
      };
      
      if (type === 'error') {
        console.log(`${colors.red}ERROR: ${text}${colors.reset}`);
        
        errors.push({
          type: 'error',
          message: text,
          location,
          browser: 'safari'
        });
        
        // Write to file for Cursor to pick up
        writeErrorsToCursor(errors);
      } else if (type === 'warning') {
        console.log(`${colors.yellow}WARNING: ${text}${colors.reset}`);
        
        errors.push({
          type: 'warning',
          message: text,
          location,
          browser: 'safari'
        });
        
        // Write to file for Cursor to pick up
        writeErrorsToCursor(errors);
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`${colors.red}PAGE ERROR: ${error.message}${colors.reset}`);
      
      errors.push({
        type: 'pageerror',
        message: error.message,
        location: {
          url: page.url(),
          timestamp: new Date().toISOString()
        },
        browser: 'safari'
      });
      
      // Write to file for Cursor to pick up
      writeErrorsToCursor(errors);
    });
    
    // Navigate to the target URL
    console.log(`${colors.green}Navigating to ${TARGET_URL}...${colors.reset}`);
    await page.goto(TARGET_URL, { timeout: 60000 });
    
    console.log(`${colors.green}Page loaded. Monitoring console errors...${colors.reset}`);
    console.log(`${colors.yellow}Press Ctrl+C to stop monitoring${colors.reset}\n`);
    
    // Keep the script running
    await new Promise(() => {});
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Write errors to a file and open in Cursor
 */
function writeErrorsToCursor(errors) {
  // Format errors for display in Cursor
  const formattedErrors = errors.map(error => {
    const { type, message, location, browser } = error;
    
    // Create a line reference format that Cursor can jump to
    return {
      type,
      message,
      location: location.url,
      timestamp: location.timestamp,
      browser,
      // Add cursor-specific metadata
      cursorMetadata: {
        errorSource: 'safari-console-monitor',
        jumpToSource: location.url
      }
    };
  });
  
  // Write errors to file
  fs.writeFileSync(ERROR_LOG_PATH, JSON.stringify(formattedErrors, null, 2));
  
  // Try to send to Cursor if it's not already open with this file
  openInCursor(ERROR_LOG_PATH);
}

/**
 * Open the error log in Cursor
 */
function openInCursor(filePath) {
  // Check if this is the first time we're sending errors
  const isFirstRun = !fs.existsSync(`${filePath}.opened`);
  
  if (isFirstRun) {
    // Mark that we've opened it once
    fs.writeFileSync(`${filePath}.opened`, '1');
    
    // Launch Cursor with the error file
    const cursorProcess = spawn(CURSOR_PATH, [filePath], {
      detached: true,
      stdio: 'ignore'
    });
    
    cursorProcess.unref();
    console.log(`${colors.green}Opened error log in Cursor${colors.reset}`);
  }
}

// Handle exit
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down Safari console monitor...${colors.reset}`);
  process.exit(0);
});

// Run the monitor
monitorSafariConsole().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 