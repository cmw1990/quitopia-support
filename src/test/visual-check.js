const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Updated COLOR_THEME based on prompt and common Tailwind usage
const COLOR_THEME = {
  // Base Theme Colors (Approximations)
  primary: '#3b82f6', // Example: blue-500 (Adjust if theme differs)
  secondary: '#6b7280', // Example: gray-500
  accent: '#f59e0b', // Example: amber-500
  muted: '#f3f4f6', // Example: gray-100 (Background/Card)
  destructive: '#ef4444', // Example: red-500

  // Feature-Specific Text Colors (Directly from prompt)
  sleepText: '#3b82f6', // text-blue-500
  energyText: '#f59e0b', // text-yellow-500 (Prompt used yellow, maps to amber typically)
  focusText: '#a855f7', // text-purple-500
  socialText: '#22c55e', // text-green-500
  healthText: '#ef4444', // text-red-500

  // Gamification Colors
  achievementText: '#f59e0b', // text-amber-500
  rewardText: '#a855f7', // text-purple-500
  pointText: '#f59e0b', // text-amber-500

  // Status Indicators
  successText: '#22c55e', // text-green-500
  pendingText: '#f59e0b', // text-amber-500
  errorText: '#ef4444', // text-red-500
};

// Get port from environment variable or default
const PORT = process.env.TEST_PORT || 6001;
const BASE_URL = `http://localhost:${PORT}`;

async function checkVisualConsistency() {
  console.log('Starting visual consistency check...');
  
  // Use the determined BASE_URL
  console.log(`Using base URL: ${BASE_URL}`);

  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Increase timeout and set larger viewport
  await page.setDefaultTimeout(60000);
  await page.setViewport({ width: 1920, height: 1080 });

  const visualReport = {
    colorInconsistencies: {},
    fontIssues: {},
    layoutProblems: {}
  };

  const routes = [
    '/', '/login', '/signup', 
    '/dashboard', '/focus-timer', 
    '/tasks', '/settings'
  ];

  for (const route of routes) {
    try {
      console.log(`Checking route: ${route}`);
      
      await page.goto(`${BASE_URL}${route}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      // Color Consistency Check
      const colorInconsistencies = await page.evaluate((themeColors) => {
        const inconsistencies = [];
        const elements = document.querySelectorAll('body *:not(script):not(style)');
        const themeColorValues = Object.values(themeColors);

        const normalizeColor = (colorStr) => {
          if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') return null;
          if (colorStr.startsWith('#')) return colorStr.toLowerCase();
          if (colorStr.startsWith('rgb')) {
            try {
              const rgb = colorStr.match(/\d+/g).map(Number);
              return "#" + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
            } catch (e) { return colorStr; }
          }
          return colorStr;
        };
        
        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const backgroundColor = normalizeColor(style.backgroundColor);
          const color = normalizeColor(style.color);
          
          const isBgOk = !backgroundColor || themeColorValues.includes(backgroundColor);
          const isColorOk = !color || themeColorValues.includes(color);

          if (!isBgOk) {
            inconsistencies.push({
              element: el.outerHTML.substring(0, 100),
              property: 'background-color',
              value: style.backgroundColor,
            });
          }

          if (!isColorOk) {
            inconsistencies.push({
              element: el.outerHTML.substring(0, 100),
              property: 'color',
              value: style.color,
            });
          }
        });

        return inconsistencies;
      }, COLOR_THEME);

      // Font and Layout Check
      const layoutIssues = await page.evaluate(() => {
        const issues = [];
        const elements = document.querySelectorAll('body *:not(script):not(style)');

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);

          if (fontSize < 12) {
            issues.push({
              type: 'small-font',
              element: el.outerHTML.substring(0, 100),
              fontSize
            });
          }
        });

        return issues;
      });

      // Collect route-specific visual issues
      visualReport.colorInconsistencies[route] = colorInconsistencies;
      visualReport.layoutProblems[route] = layoutIssues;

    } catch (error) {
      console.error(`Error checking visual consistency for route ${route}:`, error);
      visualReport.layoutProblems[route] = {
        loadError: error.message
      };
    }
  }

  await browser.close();

  // Write comprehensive visual report
  fs.writeFileSync(
    './chrome-results/visual-consistency-report.json', 
    JSON.stringify(visualReport, null, 2)
  );

  console.log('Visual consistency check completed.');
  return visualReport;
}

checkVisualConsistency()
  .then(console.log)
  .catch(error => {
    console.error('Fatal error in visual consistency check:', error);
    process.exit(1);
  });