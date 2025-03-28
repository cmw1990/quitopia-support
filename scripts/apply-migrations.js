#!/usr/bin/env node

/**
 * Supabase Migration Script
 * 
 * This script applies SQL migrations to the Supabase project.
 * It follows SSOT8001 guidelines by using REST API calls instead of direct client methods.
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const { program } = require('commander');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const MIGRATIONS_DIR = path.join(__dirname, '..', 'src', 'db', 'migrations');

// Parse command line arguments
program
  .name('apply-migrations')
  .description('Apply SQL migrations to Supabase')
  .option('-f, --file <file>', 'Apply a specific migration file')
  .option('-a, --all', 'Apply all migrations')
  .option('-d, --dry-run', 'Show SQL without executing')
  .option('-k, --key <key>', 'Supabase service key (required if not in env)')
  .parse(process.argv);

const options = program.opts();

// Check if service key is provided
if (!SUPABASE_SERVICE_KEY && !options.key) {
  console.error('Error: SUPABASE_SERVICE_KEY is required. Provide it through:');
  console.error('1. Environment variable: SUPABASE_SERVICE_KEY');
  console.error('2. Command line: --key <your-service-key>');
  process.exit(1);
}

const serviceKey = options.key || SUPABASE_SERVICE_KEY;

// Main function to apply migrations
async function applyMigrations() {
  console.log(`🚀 Supabase Migration Tool - SSOT8001 Edition`);
  console.log(`🔗 Connected to: ${SUPABASE_URL}`);
  
  try {
    // Get migration files
    let migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure files are applied in order
    
    // If specific file is requested
    if (options.file) {
      const requestedFile = options.file.endsWith('.sql') ? options.file : `${options.file}.sql`;
      if (migrationFiles.includes(requestedFile)) {
        migrationFiles = [requestedFile];
      } else {
        console.error(`⛔ Error: Migration file '${requestedFile}' not found in ${MIGRATIONS_DIR}`);
        process.exit(1);
      }
    } else if (!options.all) {
      console.error('⛔ Error: Either --file <filename> or --all is required');
      process.exit(1);
    }
    
    console.log(`📋 Found ${migrationFiles.length} migration file(s) to apply`);
    
    // Process each migration file
    for (const file of migrationFiles) {
      console.log(`\n📄 Processing migration: ${file}`);
      
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      if (options.dryRun) {
        console.log(`\n--- SQL (DRY RUN) ---\n${sql}\n-------------------`);
        console.log(`✓ Dry run completed for ${file}`);
        continue;
      }
      
      console.log(`🔄 Applying migration...`);
      
      // Apply the migration using the REST API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/apply_migration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({
          sql_migration: sql
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`⛔ Error applying migration ${file}: ${response.status} ${response.statusText}`);
        console.error(errorText);
        process.exit(1);
      }
      
      const result = await response.json();
      console.log(`✅ Successfully applied migration: ${file}`);
    }
    
    console.log(`\n🎉 All migrations completed successfully`);
  } catch (error) {
    console.error(`⛔ Error: ${error.message}`);
    process.exit(1);
  }
}

// Execute main function
applyMigrations(); 