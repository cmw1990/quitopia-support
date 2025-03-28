/**
 * Authentication API Debug Script
 * Directly tests the Supabase authentication API endpoint
 */

const fetch = require('node-fetch');

// Credentials to test
const EMAIL = 'hertzofhopes@gmail.com';
const PASSWORD = 'J4913836j';

// Constants from supabase-client.ts
const SUPABASE_URL = 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

async function testAuthAPI() {
  console.log('=== Supabase Authentication API Test ===');
  console.log(`Testing with account: ${EMAIL}`);
  console.log(`API URL: ${SUPABASE_URL}/auth/v1/token?grant_type=password\n`);
  
  try {
    // Test the sign in endpoint
    console.log('Attempting direct API login...');
    
    const signInResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: EMAIL, 
        password: PASSWORD 
      }),
    });
    
    console.log(`Response status: ${signInResponse.status} ${signInResponse.statusText}`);
    console.log('Response headers:');
    signInResponse.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Parse response
    const responseText = await signInResponse.text();
    console.log('\nResponse body:');
    
    try {
      // Try to parse as JSON
      const responseData = JSON.parse(responseText);
      console.log(JSON.stringify(responseData, null, 2));
      
      if (signInResponse.ok) {
        console.log('\n✅ Authentication successful!');
        
        if (responseData.user) {
          console.log(`\nUser ID: ${responseData.user.id}`);
          console.log(`Email: ${responseData.user.email}`);
          console.log(`Created: ${new Date(responseData.user.created_at).toLocaleString()}`);
        }
        
        if (responseData.access_token) {
          console.log(`\nAccess token received (${responseData.access_token.substring(0, 10)}...)`);
          console.log(`Token type: ${responseData.token_type}`);
          console.log(`Expires in: ${responseData.expires_in} seconds`);
        }
      } else {
        console.log('\n❌ Authentication failed');
        
        if (responseData.error) {
          console.log(`Error: ${responseData.error}`);
        }
        
        if (responseData.error_description) {
          console.log(`Error description: ${responseData.error_description}`);
        }
        
        if (responseData.message) {
          console.log(`Message: ${responseData.message}`);
        }
      }
    } catch (e) {
      // Not valid JSON, just print the text
      console.log(responseText);
      console.log('\n❌ Authentication failed - Invalid JSON response');
    }
    
    // Test user info endpoint with anonymous key
    console.log('\n--- Testing public endpoint ---');
    console.log('Attempting to access public endpoint...');
    
    const publicResponse = await fetch(`${SUPABASE_URL}/rest/v1/health`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Public endpoint status: ${publicResponse.status} ${publicResponse.statusText}`);
    
    try {
      const publicData = await publicResponse.json();
      console.log('Public endpoint response:');
      console.log(JSON.stringify(publicData, null, 2));
    } catch (e) {
      console.log('Could not parse public endpoint response as JSON');
      console.log(await publicResponse.text());
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run the test
testAuthAPI(); 