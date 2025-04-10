import puppeteer from 'puppeteer';

async function testApp() {
  console.log('Testing app routes...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Track console errors
  page.on('console', msg => {
    console.log(`Console [${msg.type()}]: ${msg.text()}`);
  });
  
  // Track network requests
  page.on('request', request => {
    console.log(`Request: ${request.url()}`);
  });
  
  // Track network errors
  page.on('requestfailed', request => {
    console.log(`Failed request: ${request.url()}: ${request.failure().errorText}`);
  });
  
  try {
    // Test home page
    console.log('Testing home page...');
    await page.goto('http://localhost:6001/easier-focus/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.screenshot({ path: 'home-page.png' });
    
    // Test login page 
    console.log('Testing login page...');
    await page.goto('http://localhost:6001/easier-focus/auth/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.screenshot({ path: 'login-page.png' });
    
    // Test forgot password page
    console.log('Testing forgot password page...');
    await page.goto('http://localhost:6001/easier-focus/auth/forgot-password', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.screenshot({ path: 'forgot-password-page.png' });
    
    console.log('All tests completed');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testApp().catch(console.error); 