#!/usr/bin/env node

/**
 * L1 Core Table Verification Script
 * This script verifies that all essential tables exist in the Supabase database
 * using direct REST API calls as per SSOT8001 guidelines
 */

// SSOT8001 compliant hardcoded credentials
const SUPABASE_URL = 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';

// Helper function for REST API calls
async function supabaseRestCall(endpoint, options = {}) {
  try {
    const headers = {
      "apikey": SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...options.headers
    };

    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText
      }));
      throw new Error(`API Error (${response.status}): ${error.message || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Supabase REST API call failed:', error);
    throw error;
  }
}

// List of essential tables to verify
const tables = [
  // Core tables
  'user_settings8',
  'guide_articles8',
  'nrt_products8',
  'progress8',
  'consumption_logs8',
  'quit_plans8',
  'financial_tracking8',
  'craving_logs8',
  'connected_devices',
  
  // Energy and sleep tracking tables
  'energy_tracking8',
  'sleep_tracking8',
  
  // Achievement tables
  'achievements8',
  'user_achievements8',
  'achievement_shares8',
  
  // Challenge tables
  'challenges8',
  'challenge_tasks8',
  'challenge_progress8',
  'challenge_task_progress8',
  
  // Social sharing tables
  'social_shares8',
  'social_share_analytics8'
];

// Check if a table exists using direct REST API calls
async function checkTableExists(tableName) {
  try {
    // Use a simple query to check if the table exists
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=0`, {
      method: 'GET',
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "count=exact"
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Table ${tableName} does not exist`);
        return false;
      }
      throw new Error(`API Error (${response.status}): ${response.statusText}`);
    }
    
    // The count is in the content-range header
    const contentRange = response.headers.get('content-range');
    const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    console.log(`Table ${tableName} exists and has ${count} rows`);
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Verifying essential tables...');
  
  let allTablesExist = true;
  
  for (const tableName of tables) {
    const exists = await checkTableExists(tableName);
    if (!exists) {
      allTablesExist = false;
      console.error(`Missing table: ${tableName}`);
    }
  }
  
  if (allTablesExist) {
    console.log('\nAll essential tables exist and are accessible!');
    console.log('The application is ready to use.');
  } else {
    console.error('\nSome essential tables are missing.');
    console.error('Please run the l1-migrations.js script to create the missing tables.');
  }
}

// Run the main function
main();