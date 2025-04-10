import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';

// Initialize dotenv
dotenv.config();

// Get environment variables or use defaults
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://efwcqbeznlrfggbothsl.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmd2NxYmV6bmxyZmdnYm90aHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3OTQ2MTAsImV4cCI6MjAyMzM3MDYxMH0.z1Lz9-ILwq9JIrAmNDDJdvcx51TJP9QQVUIPv-LWWXo';

// Test credentials
const TEST_EMAIL = 'hertzofhopes@gmail.com';
const TEST_PASSWORD = 'J4913836j';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Output directory for results
const RESULTS_DIR = './api-test-results';

// Create directory if it doesn't exist
try {
  await fs.mkdir(RESULTS_DIR, { recursive: true });
} catch (err) {
  console.error(`Error creating directory: ${err.message}`);
}

async function testLogin() {
  console.log('🔍 Testing Supabase login API...');
  console.log(`Using Supabase URL: ${SUPABASE_URL}`);
  
  const results = {
    timestamp: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    login_success: false,
    auth_request_success: false,
    errors: []
  };
  
  try {
    console.log('Attempting login with credentials...');
    
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    
    const data = await response.json();
    
    console.log(`Response status: ${response.status}`);
    results.login_status = response.status;
    
    if (response.ok) {
      console.log('✅ Login successful!');
      results.login_success = true;
      
      const hasToken = !!data.access_token;
      console.log('Access token received:', hasToken ? '(token hidden for security)' : 'No token received');
      results.token_received = hasToken;
      
      if (data.user) {
        const userInfo = {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at
        };
        console.log('User information:', userInfo);
        results.user_info = userInfo;
      } else {
        console.log('No user data received');
        results.errors.push('No user data in successful response');
      }
      
      // Test authentication by making a request to a protected endpoint
      if (hasToken) {
        console.log('\n🔍 Testing authenticated request...');
        
        try {
          const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${data.access_token}`
            }
          });
          
          console.log(`Profile request status: ${profileResponse.status}`);
          results.auth_request_status = profileResponse.status;
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('✅ Authenticated request successful!');
            console.log(`Retrieved ${profileData.length} profiles`);
            results.auth_request_success = true;
            results.profiles_count = profileData.length;
          } else {
            const errorData = await profileResponse.json();
            console.log('❌ Authenticated request failed!');
            console.log('Error:', errorData);
            results.errors.push({
              type: 'auth_request',
              message: 'Authenticated request failed',
              details: errorData
            });
          }
        } catch (error) {
          console.error('❌ Error making authenticated request:', error.message);
          results.errors.push({
            type: 'auth_request',
            message: `Error making authenticated request: ${error.message}`
          });
        }
      }
    } else {
      console.log('❌ Login failed!');
      console.log('Error:', data);
      results.errors.push({
        type: 'login',
        message: 'Login failed',
        details: data
      });
    }
  } catch (error) {
    console.error('❌ Error testing login API:', error.message);
    results.errors.push({
      type: 'api_test',
      message: `Error testing login API: ${error.message}`
    });
  }
  
  // Save results to file
  try {
    const resultsFile = `${RESULTS_DIR}/login-test-results.json`;
    await fs.writeFile(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${resultsFile}`);
  } catch (error) {
    console.error(`Error saving results: ${error.message}`);
  }
  
  return results;
}

// Run the test
console.log('Starting API test...');
const results = await testLogin();

// Output final summary
console.log('\n=== TEST SUMMARY ===');
console.log(`Login Success: ${results.login_success ? '✅ Yes' : '❌ No'}`);
console.log(`Auth Request Success: ${results.auth_request_success ? '✅ Yes' : '❌ No'}`);
console.log(`Errors: ${results.errors.length}`);

if (results.errors.length > 0) {
  console.log('\nEncountered the following errors:');
  results.errors.forEach((error, i) => {
    console.log(`${i+1}. [${error.type}] ${error.message}`);
  });
} 