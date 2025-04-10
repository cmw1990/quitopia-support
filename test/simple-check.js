import puppeteer from 'puppeteer';

const routes = [
  '/',
  '/auth',
  '/webapp',
  '/distractions'
];

async function simpleCheck() {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080'
    ]
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set default timeouts
    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);
    
    // Disable cache
    await page.setCacheEnabled(false);
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Listen for console messages
    page.on('console', message => {
      console.log(`Console ${message.type()}: ${message.text()}`);
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`Page error: ${error.message}`);
    });
    
    // Check each route
    for (const route of routes) {
      const url = `http://localhost:6002${route}`;
      
      console.log(`\nNavigating to ${url}...`);
      try {
        // Clear all cookies before each navigation
        await page.deleteCookie();
        
        // Navigate to page
        const response = await page.goto(url, { 
          timeout: 30000,
          waitUntil: ['domcontentloaded', 'networkidle2']
        });
        
        console.log(`Status: ${response.status()}`);
        
        // Wait for any dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get the page content
        const content = await page.content();
        console.log(`Page content length: ${content.length}`);
        console.log(`Successfully loaded ${route}`);
        
        // Take a screenshot
        await page.screenshot({ 
          path: `screenshots/${route.replace(/\//g, '-') || 'home'}.png`,
          fullPage: true 
        });
        
        // Additional check for document.body
        const bodyHandle = await page.$('body');
        if (bodyHandle) {
          console.log('Body element found');
          await bodyHandle.dispose();
        } else {
          console.log('Body element not found');
        }
      } catch (error) {
        console.error(`Error navigating to ${route}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the test
simpleCheck().catch(console.error); 