import puppeteer from 'puppeteer';

async function testForgotPassword() {
  console.log('Starting test for /auth/forgot-password...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  
  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Page error: ${msg.text()}`);
    }
  });
  
  try {
    await page.goto('http://localhost:6001/auth/forgot-password', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'forgot-password-test.png' });
    
    // Wait for form to be visible
    await page.waitForSelector('input#email', { timeout: 5000 });
    
    // Fill email
    await page.type('input#email', 'test@example.com');
    
    // Click submit button
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      
      // Wait for success message
      await page.waitForSelector('div:has-text("Check Your Email")', { timeout: 10000 });
      
      console.log('Forgot password form submitted successfully');
      
      // Take a screenshot after submission
      await page.screenshot({ path: 'forgot-password-success.png' });
    } else {
      console.error('Submit button not found');
    }
    
    // Wait a moment to collect any errors
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Test completed');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testForgotPassword().catch(console.error); 