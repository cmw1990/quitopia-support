/**
 * SSOT8001 Migration Script
 * 
 * This script applies SQL migrations to the Supabase database
 * following SSOT8001 standards by using direct REST API calls
 * instead of Supabase client libraries.
 */

// Import required packages
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Use node-fetch explicitly

// SSOT8001 compliant hardcoded credentials
const SUPABASE_URL = 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';

// Path to migrations directory
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

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

// Create migrations tracking table
async function createMigrationsTable() {
  console.log('Creating migrations tracking table...');
  
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY, 
      name VARCHAR(255) NOT NULL UNIQUE, 
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `;
  
  await supabaseRestCall('/rest/v1/sql', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  
  console.log('Migrations table created or already exists.');
}

// Check if migration has been applied
async function isMigrationApplied(migrationName) {
  const result = await supabaseRestCall(
    `/rest/v1/migrations?name=eq.${encodeURIComponent(migrationName)}`,
    { method: 'GET' }
  );
  
  return result && result.length > 0;
}

// Record migration as applied
async function recordMigration(migrationName) {
  await supabaseRestCall('/rest/v1/migrations', {
    method: 'POST',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify({ name: migrationName })
  });
  
  console.log(`Migration '${migrationName}' recorded as applied.`);
}

// Execute SQL migration
async function executeMigration(migrationName, sql) {
  console.log(`Executing migration '${migrationName}'...`);
  
  // Check if already applied
  const applied = await isMigrationApplied(migrationName);
  if (applied) {
    console.log(`Migration '${migrationName}' already applied, skipping.`);
    return;
  }
  
  // Execute SQL
  await supabaseRestCall('/rest/v1/sql', {
    method: 'POST',
    body: JSON.stringify({ query: sql })
  });
  
  // Record migration
  await recordMigration(migrationName);
  
  console.log(`Migration '${migrationName}' applied successfully.`);
}

// Main migration function
async function runMigrations() {
  try {
    console.log('🚀 Starting SSOT8001 compliant migrations...');
    
    // Create migrations table
    await createMigrationsTable();
    
    // Get migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure files are applied in order
    
    console.log(`📋 Found ${migrationFiles.length} migration file(s) to apply`);
    
    // Apply each migration
    for (const fileName of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, fileName);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await executeMigration(fileName, sql);
    }
    
    console.log('✅ All migrations applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations(); 