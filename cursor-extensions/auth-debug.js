/**
 * Authentication Debug Script
 * Focuses on testing the authentication flow with detailed logging
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EMAIL = 'hertzofhopes@gmail.com';
const PASSWORD = 'J4913836j';

async function captureScreenshot(page, name) {
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  await page.screenshot({ 
    path: path.join(dir, `${name}_${Date.now()}.png`),
    fullPage: true 
  });
  console.log(`Screenshot saved: ${name}`);
}

async function debugAuthentication() {
  console.log('Mission Fresh Authentication Debug');
  console.log('================================');
  console.log(`Testing with account: ${EMAIL}`);
  
  const browser = await puppeteer.launch({
    headless: false, // Use visible browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null,
    slowMo: 100 // Slow down operations for visibility
  });
  
  try {
    const page = await browser.newPage();
    
    // Enhanced network and console logging
    page.on('console', msg => {
      const type = msg.type().padEnd(7);
      console.log(`[Browser Console ${type}] ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.error('[Browser JS Error]', error.message);
    });
    
    page.on('requestfailed', request => {
      console.error(`[Network Failure] ${request.method()} ${request.url()} - ${request.failure().errorText}`);
    });
    
    page.on('response', response => {
      const status = response.status();
      if (status >= 400) {
        console.error(`[Network Error] ${response.request().method()} ${response.url()} - Status ${status}`);
      }
    });
    
    // Navigate to login page
    console.log('\nNavigating to login page...');
    await page.goto('http://localhost:5003/auth', { waitUntil: 'networkidle0', timeout: 60000 });
    await captureScreenshot(page, 'login_page');
    
    console.log('Checking login form elements...');
    
    // Detailed form inspection with updated selectors
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    // Try different selectors for the submit button
    let submitButton = await page.$('button[type="submit"]');
    if (!submitButton) {
      submitButton = await page.$('form button');
    }
    if (!submitButton) {
      // Look for any button within the form
      submitButton = await page.$('form .w-full');
    }
    if (!submitButton) {
      // Try looking for the button by text content
      const buttons = await page.$$eval('button', buttons => 
        buttons.map(button => ({ 
          text: button.textContent.trim(),
          index: Array.from(document.querySelectorAll('button')).indexOf(button)
        }))
      );
      console.log('Found buttons:', buttons);
      
      // Try to find a button with "Sign in" text
      const signInButtonIndex = buttons.findIndex(b => 
        b.text.toLowerCase().includes('sign in') || 
        b.text.toLowerCase().includes('signin') ||
        b.text.toLowerCase().includes('log in') ||
        b.text.toLowerCase().includes('login')
      );
      
      if (signInButtonIndex !== -1) {
        // Get the button at that index
        const allButtons = await page.$$('button');
        if (allButtons.length > signInButtonIndex) {
          submitButton = allButtons[signInButtonIndex];
          console.log(`Found submit button by text at index ${signInButtonIndex}`);
        }
      }
    }
    
    if (!emailInput) {
      console.error('❌ Email input not found on page');
      await captureScreenshot(page, 'login_error_no_email_input');
    } else {
      console.log('✅ Email input found');
    }
    
    if (!passwordInput) {
      console.error('❌ Password input not found on page');
      await captureScreenshot(page, 'login_error_no_password_input');
    } else {
      console.log('✅ Password input found');
    }
    
    if (!submitButton) {
      console.error('❌ Submit button not found on page');
      await captureScreenshot(page, 'login_error_no_submit_button');
      
      // Dump HTML for debugging
      const html = await page.content();
      fs.writeFileSync(path.join(__dirname, 'login_page_dump.html'), html);
      console.log('Saved HTML content to login_page_dump.html for inspection');
    } else {
      console.log('✅ Submit button found');
    }
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.error('Login form inspection failed - aborting login attempt');
      return;
    }
    
    // Fill login form
    console.log('\nFilling login form...');
    await emailInput.type(EMAIL);
    await passwordInput.type(PASSWORD);
    
    // Capture form before submission
    await captureScreenshot(page, 'login_form_filled');
    
    // Check local storage before login
    const localStorageBefore = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const result = {};
      for (const key of keys) {
        result[key] = localStorage.getItem(key);
      }
      return result;
    });
    console.log('\nLocal Storage before login:', JSON.stringify(localStorageBefore, null, 2));
    
    // Submit form
    console.log('\nSubmitting login form...');
    await Promise.all([
      submitButton.click(),
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }).catch(e => {
        console.error('Navigation error:', e.message);
        return null;
      })
    ]);
    
    // Check local storage after login attempt
    const localStorageAfter = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const result = {};
      for (const key of keys) {
        result[key] = localStorage.getItem(key);
      }
      return result;
    });
    console.log('\nLocal Storage after login attempt:', JSON.stringify(localStorageAfter, null, 2));
    
    // Capture result page
    await captureScreenshot(page, 'after_login');
    
    // Check if login was successful
    const currentUrl = page.url();
    console.log(`\nCurrent URL after login: ${currentUrl}`);
    
    if (currentUrl.includes('/app')) {
      console.log('✅ Login successful!');
      
      // Check session token existence
      const hasSession = await page.evaluate(() => {
        return !!localStorage.getItem('supabase.auth.token');
      });
      
      if (hasSession) {
        console.log('✅ Session token found in localStorage');
      } else {
        console.error('❌ Session token NOT found in localStorage (unexpected for successful login)');
      }
      
    } else {
      console.error('❌ Login failed - did not redirect to protected area');
      
      // Check for visible error messages
      const errorMessages = await page.$$eval(
        '.error, .error-message, [role="alert"], .MuiAlert-root, .toast, .notification', 
        elements => elements
          .filter(el => el.offsetParent !== null) // Check if visible
          .map(el => el.textContent.trim())
      );
      
      if (errorMessages.length > 0) {
        console.log('Error messages displayed on page:');
        errorMessages.forEach(msg => console.log(`  - ${msg}`));
      } else {
        console.log('No visible error messages found on page');
      }
    }
    
    console.log('\nDebug information complete.');
    console.log('Press Ctrl+C to exit...');
    
    // Keep the browser open for manual inspection
    await new Promise(resolve => setTimeout(resolve, 3600000)); // Wait for 1 hour
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed');
  }
}

// Run the test
debugAuthentication(); 