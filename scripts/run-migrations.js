const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabaseUrl = 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createStoredProcedures() {
  console.log('Creating stored procedures...');
  
  try {
    // First create the create_stored_procedures function if it doesn't exist
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION create_stored_procedures(sql text) 
        RETURNS void AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'focus_migrations.sql');
    const sql = await fs.readFile(migrationPath, 'utf8');

    // Create tables and RLS policies using stored procedures
    await supabase.rpc('create_stored_procedures', { sql });
    
    console.log('Database schema created successfully');

    // Run the login test to verify setup
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'hertzofhopes@gmail.com',
      password: 'J4913836j'
    });

    if (loginError) {
      throw loginError;
    }

    // Test database access
    const tables = ['focus_sessions', 'focus_tasks', 'focus_achievements', 'focus_distractions'];
    
    for (const table of tables) {
      const { error: testError } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (testError) {
        throw new Error(`Error accessing ${table}: ${testError.message}`);
      }
      console.log(`Successfully verified access to ${table}`);
    }

    console.log('Database setup verified successfully');

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createStoredProcedures();