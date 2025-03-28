// Simple script to test connectivity to Supabase directly
import fetch from 'node-fetch';

// Supabase configuration
const SUPABASE_URL = 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Test multiple endpoints to see what works
async function testSupabaseConnections() {
  console.log('Testing direct connection to Supabase...');
  
  try {
    // Test 1: Public health check endpoint
    console.log('\nTest 1: Health check');
    try {
      const healthResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
        }
      });
      console.log(`Health check status: ${healthResponse.status}`);
      console.log('Health check headers:', healthResponse.headers);
      const healthData = await healthResponse.text();
      console.log('Health check response:', healthData);
    } catch (error) {
      console.error('Health check error:', error);
    }

    // Test 2: Authentication API check
    console.log('\nTest 2: Auth API check');
    try {
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
        }
      });
      console.log(`Auth API status: ${authResponse.status}`);
      const authData = await authResponse.text();
      console.log('Auth API response:', authData);
    } catch (error) {
      console.error('Auth API error:', error);
    }

    // Test 3: Test login with test credentials
    console.log('\nTest 3: Login test with test@example.com');
    try {
      const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'password123' 
        }),
      });

      console.log(`Login test status: ${loginResponse.status}`);
      const loginData = await loginResponse.json();
      console.log('Login test response:', loginData);
    } catch (error) {
      console.error('Login test error:', error);
    }
  } catch (error) {
    console.error('Main test error:', error);
  }
}

testSupabaseConnections();