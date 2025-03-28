#!/usr/bin/env node

/**
 * Cursor Extension: Chrome Console Error Monitor
 * 
 * This script captures console errors from Chrome using Playwright and sends them
 * to Cursor IDE for immediate debugging.
 * 
 * Usage: node cursor-extensions/playwright-chrome-console.js [url]
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure options
const TARGET_URL = process.argv[2] || 'http://localhost:5003/';
const ERROR_LOG_PATH = path.join(__dirname, 'chrome-errors.json');
const CURSOR_PATH = '/Applications/Cursor.app/Contents/MacOS/Cursor';
const SOURCE_MAP_DIR = path.join(os.tmpdir(), 'chrome-sourcemaps');

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
 * Main function to monitor Chrome console
 */
async function monitorChromeConsole() {
  console.log(`${colors.bright}${colors.blue}Cursor Extension: Chrome Console Monitor${colors.reset}`);
  console.log(`${colors.blue}=======================================${colors.reset}`);
  console.log(`${colors.cyan}Target URL: ${TARGET_URL}${colors.reset}\n`);
  
  try {
    // Ensure source map directory exists
    if (!fs.existsSync(SOURCE_MAP_DIR)) {
      fs.mkdirSync(SOURCE_MAP_DIR, { recursive: true });
    }
    
    // Launch Chrome browser
    console.log(`${colors.yellow}Launching Chrome browser...${colors.reset}`);
    const browser = await chromium.launch({
      headless: false,
      args: [
        '--auto-open-devtools-for-tabs',
        `--disable-extensions`,
        `--disable-component-extensions-with-background-pages`
      ]
    });
    
    // Create browser context and page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Prepare to capture errors
    const errors = [];
    
    // Listen for console messages
    page.on('console', async message => {
      const type = message.type();
      const text = message.text();
      
      // Get stack trace for errors when available
      let stack = null;
      if (type === 'error') {
        try {
          // Try to get the stack trace from the message args
          const args = await Promise.all(message.args().map(arg => arg.jsonValue()));
          const stackArg = args.find(arg => arg && typeof arg === 'object' && arg.stack);
          if (stackArg) {
            stack = stackArg.stack;
          }
        } catch (e) {
          // Ignore errors getting stack trace
        }
      }
      
      const location = {
        url: page.url(),
        timestamp: new Date().toISOString(),
        stack: stack
      };
      
      if (type === 'error') {
        console.log(`${colors.red}ERROR: ${text}${colors.reset}`);
        
        errors.push({
          type: 'error',
          message: text,
          location,
          browser: 'chrome'
        });
        
        // Write to file for Cursor to pick up
        writeErrorsToCursor(errors);
      } else if (type === 'warning') {
        console.log(`${colors.yellow}WARNING: ${text}${colors.reset}`);
        
        errors.push({
          type: 'warning',
          message: text,
          location,
          browser: 'chrome'
        });
        
        // Write to file for Cursor to pick up
        writeErrorsToCursor(errors);
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`${colors.red}PAGE ERROR: ${error.message}${colors.reset}`);
      if (error.stack) {
        console.log(`${colors.red}STACK: ${error.stack}${colors.reset}`);
      }
      
      errors.push({
        type: 'pageerror',
        message: error.message,
        location: {
          url: page.url(),
          timestamp: new Date().toISOString(),
          stack: error.stack
        },
        browser: 'chrome'
      });
      
      // Write to file for Cursor to pick up
      writeErrorsToCursor(errors);
    });
    
    // Setup source map handling for better error reporting
    page.on('response', async response => {
      const url = response.url();
      if (url.endsWith('.map')) {
        try {
          const content = await response.text();
          const filename = path.basename(url);
          fs.writeFileSync(path.join(SOURCE_MAP_DIR, filename), content);
        } catch (e) {
          // Ignore errors saving source maps
        }
      }
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
 * Parse stack trace to get source location
 */
function parseStackTrace(stack) {
  if (!stack) return null;
  
  // Try to extract the source file and line number from the stack trace
  const stackLines = stack.split('\n');
  for (const line of stackLines) {
    // Look for patterns like: at functionName (file.js:line:column)
    const match = line.match(/at .*? \((.+):(\d+):(\d+)\)/);
    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10)
      };
    }
  }
  
  return null;
}

/**
 * Write errors to a file and open in Cursor
 */
function writeErrorsToCursor(errors) {
  // Format errors for display in Cursor
  const formattedErrors = errors.map(error => {
    const { type, message, location, browser } = error;
    
    // Parse stack trace if available
    const sourceLocation = location.stack ? parseStackTrace(location.stack) : null;
    
    // Create a line reference format that Cursor can jump to
    return {
      type,
      message,
      location: location.url,
      timestamp: location.timestamp,
      browser,
      // Add cursor-specific metadata
      cursorMetadata: {
        errorSource: 'chrome-console-monitor',
        jumpToSource: sourceLocation ? sourceLocation.file : location.url,
        line: sourceLocation ? sourceLocation.line : undefined,
        column: sourceLocation ? sourceLocation.column : undefined,
        stack: location.stack
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
  console.log(`\n${colors.yellow}Shutting down Chrome console monitor...${colors.reset}`);
  process.exit(0);
});

// Run the monitor
monitorChromeConsole().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
}); 