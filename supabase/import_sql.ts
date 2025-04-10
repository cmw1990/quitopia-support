import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runSqlFile(filePath: string) {
  try {
    console.log(`Reading SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Executing SQL from ${path.basename(filePath)}`);
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Error executing SQL from ${path.basename(filePath)}:`, error);
      return false;
    }
    
    console.log(`Successfully executed SQL from ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`Failed to process SQL file ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting SQL import process...');
  
  // Define the SQL files to import in order
  const sqlFiles = [
    path.resolve(__dirname, 'context_switching_schema.sql'),
    // Add other SQL files as needed
  ];
  
  let success = true;
  
  // Process each SQL file
  for (const file of sqlFiles) {
    const result = await runSqlFile(file);
    if (!result) success = false;
  }
  
  if (success) {
    console.log('All SQL files imported successfully!');
    process.exit(0);
  } else {
    console.error('Some SQL files failed to import.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error during SQL import:', error);
  process.exit(1);
}); 