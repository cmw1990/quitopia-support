#!/usr/bin/env node

/**
 * Direct SQL execution for Supabase
 * This script will execute SQL directly using the Supabase API
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables or use default values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MjAxOTcsImV4cCI6MjA1Mzk5NjE5N30.tq2ssOiA8CbFUZc6HXWXMEev1dODzKZxzNrpvyzbbXs';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to SQL file
const sqlFilePath = path.join(__dirname, 'init_schema.sql');

async function execDirectSQL() {
  try {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL statements directly...');
    
    // Execute SQL statements through Supabase REST API
    const endpoint = `${supabaseUrl}/rest/v1/`;
    
    // Split into statements
    const statements = sqlContent.split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Create tables one by one
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`\nExecuting statement ${i + 1}/${statements.length}`);
        console.log(statement);
        
        // Execute using direct HTTP request to avoid the need for exec_sql function
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            query: statement
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error(`Error executing statement ${i + 1}:`, error);
        } else {
          console.log(`Successfully executed statement ${i + 1}.`);
        }
      } catch (error) {
        console.error(`Error in statement ${i + 1}:`, error.message);
      }
    }
    
    console.log('\nAll statements executed. Check Supabase dashboard to verify the tables were created.');
    
  } catch (error) {
    console.error('Execution failed:', error);
    process.exit(1);
  }
}

// Run the execution
execDirectSQL(); 