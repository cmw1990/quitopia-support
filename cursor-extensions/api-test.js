/**
 * Direct API Test Script
 * Tests the Supabase authentication API directly
 */

const EMAIL = 'hertzofhopes@gmail.com';
const PASSWORD = 'J4913836j';

// Get values from .env file if possible
let SUPABASE_URL = 'https://zoubqdwxemivxrjruvam.supabase.co';
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.resolve(__dirname, '../.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      if (line.startsWith('VITE_SUPABASE_URL=')) {
        SUPABASE_URL = line.split('=')[1].trim();
      } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
        SUPABASE_ANON_KEY = line.split('=')[1].trim();
      }
    }
  }
} catch (error) {
  console.warn('Could not load .env file, using default values:', error.message);
}

console.log('API Test: Supabase Authentication');
console.log('=================================');
console.log(`Testing with: ${EMAIL}`);
console.log(`SUPABASE_URL: ${SUPABASE_URL}`);
console.log(`SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);

async function testLogin() {
  try {
    console.log('\nSending login request...');
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    console.log(`Response status: ${response.status}`);
    const data = await response.text();
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Response JSON:', JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
    
    if (!response.ok) {
      console.error('Login failed');
    } else {
      console.log('Login successful!');
    }
  } catch (error) {
    console.error('Error during API call:', error);
  }
}

// Run the test
testLogin(); 