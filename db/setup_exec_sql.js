#!/usr/bin/env node

/**
 * SSOT8001 Compliant Function Setup Tool
 * This script sets up the exec_sql function on the Supabase database
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

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to SQL function file
const sqlFilePath = path.join(__dirname, 'create_exec_sql_function.sql');

async function setupExecSQL() {
  try {
    console.log('Reading SQL function definition...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL directly in Supabase
    console.log('Creating exec_sql function...');
    
    // Since we can't use the exec_sql function itself yet (we're creating it),
    // we need to use another method. For Supabase, this typically requires:
    // 1. SQL Editor in the Supabase dashboard
    // 2. Supabase Management API
    // 3. Direct PostgreSQL connection
    
    console.log('To set up the exec_sql function, please follow these steps:');
    console.log('1. Log in to the Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Paste and execute the following SQL:');
    console.log('\n' + sqlContent);
    console.log('\nOnce this is done, you can run the apply_migrations.js script.');
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupExecSQL(); 