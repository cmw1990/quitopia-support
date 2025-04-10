const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Store all console messages
let allConsoleMessages = [];

// Force port 6001
const PORT = 6001;
const BASE_URL = `http://localhost:${PORT}`;

// All routes to test
const ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/app/dashboard',
  '/app/tasks',
  '/app/focus-timer',
  '/app/pomodoro',
  '/app/anti-fatigue',
  '/app/anti-googlitis',
  '/app/body-doubling',
  '/app/energy',
  '/app/enhanced-focus',
  '/app/flow-state',
  '/app/focus-sounds',
  '/app/settings'
];

class ErrorMonitor {
  constructor() {
    this.errorLog = {
      consoleErrors: [],
      networkErrors: [],
      performanceIssues: [],
      uiInconsistencies: [],
      visualErrors: []
    };
    allConsoleMessages = [];
  }

  async initializeBrowser() {
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--window-size=1920,1080']
    });
    this.page = await this.browser.newPage();

    // Capture ALL console messages
    this.page.on('console', (msg) => {
      const messageData = {
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      };
      allConsoleMessages.push(messageData);
      if (msg.type() === 'error') {
        this.errorLog.consoleErrors.push(messageData);
      }
    });

    // Capture network errors
    this.page.on('requestfailed', (request) => {
      const url = request.url();
      if (!url.includes('google-analytics') && !url.includes('googletagmanager')) {
        this.errorLog.networkErrors.push({
          url: url,
          failure: request.failure().errorText,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async loginUser() {
    try {
      await this.page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      await this.page.waitForSelector('#email');
      await this.page.waitForSelector('#password');
      await this.page.type('#email', 'hertzofhopes@gmail.com');
      await this.page.type('#password', 'J4913836j');
      await this.page.click('button[type="submit"]');
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async checkVisualElements() {
    // Check for visual issues like overlapping elements
    const visualIssues = await this.page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        // Check for elements outside viewport
        if (rect.top < 0 || rect.left < 0) {
          issues.push({
            element: el.tagName,
            issue: 'Element outside viewport',
            position: {top: rect.top, left: rect.left}
          });
        }

        // Check for zero-size elements with content
        if ((rect.width === 0 || rect.height === 0) && el.textContent.trim()) {
          issues.push({
            element: el.tagName,
            issue: 'Zero-size element with content',
            content: el.textContent.trim()
          });
        }

        // Check for overlapping clickable elements
        if (style.pointerEvents !== 'none' && (el.tagName === 'BUTTON' || el.tagName === 'A')) {
          const box = rect;
          elements.forEach(other => {
            if (el !== other && window.getComputedStyle(other).pointerEvents !== 'none') {
              const otherBox = other.getBoundingClientRect();
              if (!(box.right < otherBox.left || 
                    box.left > otherBox.right || 
                    box.bottom < otherBox.top || 
                    box.top > otherBox.bottom)) {
                issues.push({
                  element: el.tagName,
                  issue: 'Overlapping clickable elements',
                  overlapping: other.tagName
                });
              }
            }
          });
        }
      });
      return issues;
    });

    if (visualIssues.length > 0) {
      this.errorLog.visualErrors.push({
        route: this.page.url(),
        issues: visualIssues,
        timestamp: new Date().toISOString()
      });
    }
  }

  async checkButtonsForms() {
    // Check all buttons are clickable
    const buttonIssues = await this.page.evaluate(() => {
      const issues = [];
      const buttons = document.querySelectorAll('button, [role="button"], input[type="submit"]');
      buttons.forEach(button => {
        if (!button.disabled && window.getComputedStyle(button).display !== 'none') {
          const rect = button.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            issues.push({
              element: button.tagName,
              text: button.textContent,
              issue: 'Zero-size button'
            });
          }
        }
      });
      return issues;
    });

    if (buttonIssues.length > 0) {
      this.errorLog.uiInconsistencies.push({
        route: this.page.url(),
        buttonIssues,
        timestamp: new Date().toISOString()
      });
    }
  }

  async performComprehensiveCheck() {
    await this.initializeBrowser();
    let isLoggedIn = false;

    for (const route of ROUTES) {
      console.log(`Testing route: ${route}`);
      
      // Handle protected routes
      if (route.startsWith('/app/') && !isLoggedIn) {
        isLoggedIn = await this.loginUser();
        if (!isLoggedIn) {
          console.error('Failed to login for protected routes');
          continue;
        }
      }

      try {
        await this.page.goto(`${BASE_URL}${route}`, { 
          waitUntil: 'networkidle0',
          timeout: 20000 
        });

        // Take error screenshot if needed
        if (this.errorLog.consoleErrors.length > 0 || this.errorLog.networkErrors.length > 0) {
          await this.page.screenshot({
            path: `./chrome-results/error-monitor-${route.replace(/\//g, '-')}.png`
          });
        }

        // Visual and UI checks
        await this.checkVisualElements();
        await this.checkButtonsForms();

        // Wait a bit to catch any delayed errors
        await this.page.waitForTimeout(2000);

      } catch (error) {
        console.error(`Failed testing route ${route}:`, error);
        this.errorLog.networkErrors.push({
          route,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    await this.browser.close();

    // Write reports
    const reportsDir = './chrome-results';
    if (!fs.existsSync(reportsDir)){
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportsDir, 'error-monitor-report.json'),
      JSON.stringify(this.errorLog, null, 2)
    );

    fs.writeFileSync(
      path.join(reportsDir, 'all-console-messages.json'),
      JSON.stringify(allConsoleMessages, null, 2)
    );

    return this.errorLog;
  }

  generateSummaryReport() {
    const summary = {
      totalConsoleErrors: this.errorLog.consoleErrors.length,
      totalNetworkErrors: this.errorLog.networkErrors.length,
      totalPerformanceIssues: this.errorLog.performanceIssues.length,
      totalUiInconsistencies: this.errorLog.uiInconsistencies.length,
      totalVisualErrors: this.errorLog.visualErrors.length,
      overallStatus: 'PASSED'
    };

    if (
      summary.totalConsoleErrors > 0 ||
      summary.totalNetworkErrors > 0 ||
      summary.totalPerformanceIssues > 0 ||
      summary.totalUiInconsistencies > 0 ||
      summary.totalVisualErrors > 0
    ) {
      summary.overallStatus = 'FAILED';
    }

    return summary;
  }
}

// Run the error monitor
const errorMonitor = new ErrorMonitor();
errorMonitor.performComprehensiveCheck()
  .then(() => {
    const summary = errorMonitor.generateSummaryReport();
    console.log('Error Monitoring Summary:', summary);
    
    if (summary.overallStatus === 'FAILED') {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error monitoring failed:', error);
    process.exit(1);
  });