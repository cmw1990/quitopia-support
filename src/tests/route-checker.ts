import puppeteer, { Page } from 'puppeteer';

const routes = [
  '/',
  '/login',
  '/signup',
  '/dashboard',
  '/focus',
  '/energy',
  '/sleep',
  '/mental-health',
  '/tools',
  '/settings',
  '/profile',
  '/focus-timer',
  '/focus-journal',
  '/focus-stats',
  '/focus-strategies',
  '/focus-sessions',
  '/achievements',
  '/tasks',
  '/mood-energy',
  '/analytics',
  '/web-tools',
  '/mobile-app',
  '/why-us',
  '/body-doubling',
  '/context-switching',
  '/executive-function',
  '/anti-googlitis',
  '/digital-minimalism',
  '/notification-manager',
  '/energy-scheduler',
  '/distraction-blocker',
  '/enhanced-focus',
  '/anti-fatigue',
  '/nicotine-and-focus',
  '/energy-support',
  '/expert-consultancy',
  '/pregnancy',
  '/bathing',
  '/sleep-track',
  '/food',
  '/energy-plans',
  '/mental-health',
  '/nicotine',
  '/directory',
  '/recipes',
  '/tools',
  '/development-tools',
  '/edit-energy-plan',
  '/sobriety',
  '/cbt',
  '/shop',
  '/smoke-free',
  '/caffeine',
  '/motivation',
  '/pregnancy-log',
  '/supplements',
  '/support',
  '/quit-plan',
  '/recovery'
];

async function checkRoutes() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Login first
  await page.goto('http://localhost:6001/login');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'hertzofhopes@gmail.com');
  await page.type('input[type="password"]', 'J4913836j');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  const consoleErrors: { [key: string]: string[] } = {};
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const currentUrl = page.url();
      const route = currentUrl.replace('http://localhost:6001', '');
      if (!consoleErrors[route]) {
        consoleErrors[route] = [];
      }
      consoleErrors[route].push(msg.text());
    }
  });

  for (const route of routes) {
    console.log(`Checking route: ${route}`);
    try {
      await page.goto(`http://localhost:6001${route}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for any potential errors
      
      // Check for clickable elements
      const clickableElements = await page.$$('a, button');
      console.log(`Found ${clickableElements.length} clickable elements on ${route}`);
      
      // Check for forms
      const forms = await page.$$('form');
      console.log(`Found ${forms.length} forms on ${route}`);
      
      // Check for data fetching (look for loading states or data containers)
      const dataContainers = await page.$$('[data-loading], [data-loaded], .data-container');
      console.log(`Found ${dataContainers.length} data containers on ${route}`);
      
    } catch (error: unknown) {
      console.error(`Error on route ${route}:`, error);
      if (!consoleErrors[route]) {
        consoleErrors[route] = [];
      }
      consoleErrors[route].push(error instanceof Error ? error.message : String(error));
    }
  }

  console.log('\nConsole Errors Summary:');
  for (const [route, errors] of Object.entries(consoleErrors)) {
    if (errors.length > 0) {
      console.log(`\nRoute: ${route}`);
      errors.forEach((error) => console.log(`- ${error}`));
    }
  }

  await browser.close();
}

checkRoutes().catch(console.error); 