#!/usr/bin/env node

/**
 * Cursor Extension: Puppeteer Auto Console Monitor
 * 
 * This script automatically checks for console errors on specified pages 
 * using Puppeteer and sends them to Cursor IDE for debugging.
 * 
 * Usage: node cursor-extensions/puppeteer-auto-monitor.js [url] [--scan-links] [--depth=2]
 */

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { URL, fileURLToPath } from 'url';
import { dirname } from 'path';

// Get directory name correctly in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const TARGET_URL = args.find(arg => !arg.startsWith('--')) || 'http://localhost:5003/';
const SCAN_LINKS = args.includes('--scan-links');
const DEPTH = parseInt(args.find(arg => arg.startsWith('--depth='))?.split('=')[1] || '1', 10);
const WITH_LOGIN = args.includes('--with-login');
const CLICK_BUTTONS = args.includes('--click-buttons');

// Configure options
const ERROR_LOG_PATH = path.join(__dirname, 'puppeteer-errors.json');
const CURSOR_PATH = '/Applications/Cursor.app/Contents/MacOS/Cursor';
const ROUTES_TO_CHECK = [
  '/',
  '/auth',
  '/app',
  '/app/dashboard',
  '/app/progress'
];

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

/**
 * Main function to automatically monitor console errors
 */
async function autoMonitorConsole() {
  console.log(`${colors.bright}${colors.blue}Cursor Extension: Puppeteer Auto Console Monitor${colors.reset}`);
  console.log(`${colors.blue}=================================================${colors.reset}`);
  console.log(`${colors.cyan}Target URL: ${TARGET_URL}${colors.reset}`);
  console.log(`${colors.cyan}Scan Links: ${SCAN_LINKS ? 'Yes' : 'No'}${colors.reset}`);
  console.log(`${colors.cyan}Scan Depth: ${DEPTH}${colors.reset}\n`);
  
  try {
    // Launch headless browser
    console.log(`${colors.yellow}Launching headless browser...${colors.reset}`);
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Store all discovered routes and errors
    const visitedUrls = new Set();
    const urlsToVisit = new Set();
    const allErrors = [];
    
    // Add initial routes
    const baseUrlObj = new URL(TARGET_URL);
    ROUTES_TO_CHECK.forEach(route => {
      urlsToVisit.add(new URL(route, baseUrlObj).href);
    });
    
    // Process all URLs up to the specified depth
    let currentDepth = 0;
    
    while (currentDepth < DEPTH && urlsToVisit.size > 0) {
      console.log(`\n${colors.magenta}[Depth ${currentDepth + 1}/${DEPTH}] Checking ${urlsToVisit.size} URLs...${colors.reset}`);
      
      const currentUrls = Array.from(urlsToVisit);
      urlsToVisit.clear();
      
      for (const currentUrl of currentUrls) {
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);
        
        // Check this URL for errors
        const pageErrors = await checkUrlForErrors(browser, currentUrl);
        allErrors.push(...pageErrors);
        
        // Extract links if needed
        if (SCAN_LINKS) {
          const newLinks = await extractLinks(browser, currentUrl, baseUrlObj.origin);
          newLinks.forEach(link => {
            if (!visitedUrls.has(link)) {
              urlsToVisit.add(link);
            }
          });
        }
      }
      
      currentDepth++;
    }
    
    // Send all errors to Cursor
    if (allErrors.length > 0) {
      console.log(`\n${colors.red}Found ${allErrors.length} errors across ${visitedUrls.size} pages${colors.reset}`);
      writeErrorsToCursor(allErrors);
    } else {
      console.log(`\n${colors.green}No errors found across ${visitedUrls.size} pages${colors.reset}`);
    }
    
    // Close browser
    await browser.close();
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Check a specific URL for console errors
 */
async function checkUrlForErrors(browser, url) {
  console.log(`${colors.yellow}Checking: ${url}${colors.reset}`);
  
  const page = await browser.newPage();
  const pageErrors = [];
  
  // Collect console errors
  page.on('console', message => {
    const type = message.type();
    const text = message.text();
    
    if (type === 'error') {
      console.log(`${colors.red}ERROR: ${text}${colors.reset}`);
      
      pageErrors.push({
        type: 'error',
        message: text,
        location: {
          url,
          timestamp: new Date().toISOString()
        },
        browser: 'puppeteer-auto'
      });
    } else if (type === 'warning') {
      console.log(`${colors.yellow}WARNING: ${text}${colors.reset}`);
      
      pageErrors.push({
        type: 'warning',
        message: text,
        location: {
          url,
          timestamp: new Date().toISOString()
        },
        browser: 'puppeteer-auto'
      });
    }
  });
  
  // Collect uncaught exceptions
  page.on('pageerror', error => {
    console.log(`${colors.red}PAGE ERROR: ${error.message}${colors.reset}`);
    
    pageErrors.push({
      type: 'pageerror',
      message: error.message,
      location: {
        url,
        timestamp: new Date().toISOString(),
        stack: error.stack
      },
      browser: 'puppeteer-auto'
    });
  });
  
  try {
    // Navigate to the URL
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Scroll the page to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait a bit to collect any async errors
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (pageErrors.length === 0) {
      console.log(`${colors.green}✓ No errors found${colors.reset}`);
    } else {
      console.log(`${colors.red}✕ Found ${pageErrors.length} errors${colors.reset}`);
    }
    
  } catch (error) {
    console.log(`${colors.red}✕ Error loading page: ${error.message}${colors.reset}`);
    
    pageErrors.push({
      type: 'navigation',
      message: `Navigation error: ${error.message}`,
      location: {
        url,
        timestamp: new Date().toISOString()
      },
      browser: 'puppeteer-auto'
    });
  }
  
  await page.close();
  return pageErrors;
}

/**
 * Extract links from a page for further scanning
 */
async function extractLinks(browser, currentUrl, baseOrigin) {
  const page = await browser.newPage();
  let links = [];
  
  try {
    await page.goto(currentUrl, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Extract all links from the page
    links = await page.evaluate((baseOrigin) => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors
        .map(a => {
          try {
            // Convert to absolute URL
            const href = new URL(a.href, window.location.href).href;
            return href;
          } catch (e) {
            return null;
          }
        })
        .filter(href => {
          if (!href) return false;
          
          try {
            const url = new URL(href);
            // Only include links from the same origin
            return url.origin === baseOrigin;
          } catch (e) {
            return false;
          }
        });
    }, baseOrigin);
    
    console.log(`${colors.cyan}Found ${links.length} links to check${colors.reset}`);
    
  } catch (error) {
    console.log(`${colors.yellow}Warning: Could not extract links from ${currentUrl}: ${error.message}${colors.reset}`);
  }
  
  await page.close();
  return links;
}

/**
 * Write errors to a JSON file and open it in Cursor
 */
function writeErrorsToCursor(errors) {
  try {
    // Prepare error report
    const errorReport = {
      summary: {
        totalErrors: errors.length,
        urlsWithErrors: new Set(errors.map(e => e.location.url)).size,
        timestamp: new Date().toISOString()
      },
      errorsByUrl: {}
    };
    
    // Group errors by URL
    errors.forEach(error => {
      const url = error.location.url;
      
      if (!errorReport.errorsByUrl[url]) {
        errorReport.errorsByUrl[url] = [];
      }
      
      errorReport.errorsByUrl[url].push(error);
    });
    
    // Write to file
    fs.writeFileSync(ERROR_LOG_PATH, JSON.stringify(errorReport, null, 2));
    
    console.log(`Opening error report in Cursor...`);
    
    // Open file in Cursor
    spawn('open', ['-a', CURSOR_PATH, ERROR_LOG_PATH]);
    
    // Print error summary
    console.log('\nError Summary:');
    
    Object.keys(errorReport.errorsByUrl).forEach(url => {
      const urlErrors = errorReport.errorsByUrl[url];
      if (urlErrors.length > 0) {
        console.log(`${url}: ${urlErrors.length} errors`);
      }
    });
    
  } catch (error) {
    console.error(`${colors.red}Failed to write error report: ${error.message}${colors.reset}`);
  }
}

// Call the main function to start monitoring
autoMonitorConsole(); 