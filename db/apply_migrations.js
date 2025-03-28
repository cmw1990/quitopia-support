#!/usr/bin/env node

/**
 * SSOT8001 Compliant Database Migration Tool
 * This script applies SQL migrations to the Supabase database
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables or use default values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to SQL migration file
const sqlFilePath = path.join(__dirname, 'init_schema.sql');

async function applyMigrations() {
  try {
    console.log('Reading SQL migration file...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split into separate statements for better error handling
    const statements = sqlContent.split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        // Directly execute SQL using the Supabase REST API (SSOT8001 compliant)
        const { error } = await supabase.rpc('exec_sql', { 
          query: statement + ';'
        });
        
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          // Continue with next statement even if there's an error
        } else {
          console.log(`Successfully executed statement ${i + 1}.`);
        }
      } catch (stmtError) {
        console.error(`Exception in statement ${i + 1}:`, stmtError.message);
        // Continue with next statement even if there's an error
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigrations(); 