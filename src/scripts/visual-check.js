import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, '../../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Configuration
const BASE_URL = 'http://localhost:6001/easier-focus';
const LOGIN_CREDENTIALS = {
  email: 'test@example.com',
  password: 'password123'
};

// List of pages to check
const pagesToCheck = [
  { route: '/', name: 'landing-page' },
  { route: '/auth/login', name: 'login-page' },
  { route: '/auth/signup', name: 'signup-page' },
  { route: '/web-tools', name: 'web-tools' },
  { route: '/mobile-app', name: 'mobile-app' },
  { route: '/why-us', name: 'why-us' },
];

// Protected pages (require login)
const protectedPages = [
  { route: '/app/dashboard', name: 'dashboard' },
  { route: '/app/focus-timer', name: 'focus-timer' },
  { route: '/app/tasks', name: 'tasks' },
  { route: '/app/analytics', name: 'analytics' },
  { route: '/app/settings', name: 'settings' },
  { route: '/app/profile', name: 'profile' },
];

// Color scheme to check for
const colorScheme = {
  primary: '#6366F1', // indigo-500
  secondary: '#8B5CF6', // violet-500
  accent: '#EC4899', // pink-500
  background: '#FFFFFF', // white
  text: '#111827', // gray-900
};

const takeScreenshot = async (page, name) => {
  const screenshotPath = path.join(screenshotsDir, `${name}.png`);
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true
  });
  console.log(`Screenshot saved to ${screenshotPath}`);
};

// Check if colors from the color scheme are used in the page
const checkColorScheme = async (page) => {
  return await page.evaluate((scheme) => {
    const elements = document.querySelectorAll('*');
    const styleProperties = ['color', 'background-color', 'border-color'];
    const usedColors = {};
    
    // Function to convert rgb to hex
    const rgbToHex = (rgb) => {
      if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return null;
      
      try {
        // Extract RGB values
        const rgbMatch = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (!rgbMatch) return rgb; // Return as is if not RGB format
        
        const [_, r, g, b] = rgbMatch;
        return `#${[r, g, b].map(x => {
          const hex = parseInt(x).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`.toUpperCase();
      } catch (e) {
        return null;
      }
    };
    
    // Check each element for color usage
    elements.forEach(el => {
      const styles = window.getComputedStyle(el);
      styleProperties.forEach(prop => {
        const color = rgbToHex(styles[prop]);
        if (color) {
          usedColors[color] = (usedColors[color] || 0) + 1;
        }
      });
    });
    
    // Check if scheme colors are used
    const schemeColors = Object.values(scheme).map(color => color.toUpperCase());
    const usedSchemeColors = schemeColors.filter(color => usedColors[color]);
    
    return {
      usedSchemeColors,
      colorCounts: usedColors,
      schemeAdherence: (usedSchemeColors.length / schemeColors.length) * 100
    };
  }, colorScheme);
};

// Main function
const main = async () => {
  console.log('Starting visual check of the application...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent screenshots
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    console.log('\n=== Checking public pages ===');
    
    // Check public pages
    for (const { route, name } of pagesToCheck) {
      console.log(`\nChecking ${name} at ${route}`);
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
      console.log(`Page loaded: ${name}`);
      
      // Take screenshot
      await takeScreenshot(page, name);
      
      // Check color scheme
      const colorResults = await checkColorScheme(page);
      console.log(`Color scheme adherence: ${colorResults.schemeAdherence.toFixed(2)}%`);
      console.log(`Used scheme colors: ${colorResults.usedSchemeColors.join(', ')}`);
    }
    
    console.log('\n=== Logging in ===');
    
    // Login
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.type('input[type="email"]', LOGIN_CREDENTIALS.email);
    await page.type('input[type="password"]', LOGIN_CREDENTIALS.password);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(e => console.log('Navigation after login timed out, but continuing...')),
    ]);
    
    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      return localStorage.getItem('sb-zoubqdwxemivxrjruvam-auth-token') !== null;
    });
    
    if (isLoggedIn) {
      console.log('Login successful!');
      
      console.log('\n=== Checking protected pages ===');
      
      // Check protected pages
      for (const { route, name } of protectedPages) {
        console.log(`\nChecking ${name} at ${route}`);
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
        console.log(`Page loaded: ${name}`);
        
        // Take screenshot
        await takeScreenshot(page, name);
        
        // Check color scheme
        const colorResults = await checkColorScheme(page);
        console.log(`Color scheme adherence: ${colorResults.schemeAdherence.toFixed(2)}%`);
        console.log(`Used scheme colors: ${colorResults.usedSchemeColors.join(', ')}`);
        
        // Additional UI checks
        const hasHeader = await page.evaluate(() => !!document.querySelector('header, .header, nav, .nav'));
        const hasMainContent = await page.evaluate(() => !!document.querySelector('main, .main, .content, #root > div'));
        
        console.log(`Has header/navigation: ${hasHeader}`);
        console.log(`Has main content: ${hasMainContent}`);
      }
    } else {
      console.log('Login failed. Skipping protected pages.');
    }
    
    console.log('\nVisual check completed successfully!');
    
  } catch (error) {
    console.error('Error during visual check:', error);
  } finally {
    await browser.close();
  }
};

// Execute main function
main(); 