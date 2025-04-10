import { createClient } from '@supabase/supabase-js';

// Supabase Connection Details (SSOT8001 compliant)
const SUPABASE_URL = 'https://zoubqdwxemivxrjruvam.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.jtvt-5Ovlmtqla21K9LhHSFYUFWHCEucTfGvN_O31Fw';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Database Migration Script (SSOT8001 compliant)
 * 
 * This script creates all necessary tables for the easier-focus application
 * following the SSOT8001 guidelines.
 */

// SQL statements for creating tables
const createTableStatements = [
  // Focus sessions table (version 8)
  `CREATE TABLE IF NOT EXISTS focus_sessions8 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    focus_type TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version8 INTEGER NOT NULL DEFAULT 8
  );`,
  
  // Tasks table
  `CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending'
  );`,
  
  // Energy logs table
  `CREATE TABLE IF NOT EXISTS energy_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
    notes TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  
  // Sleep logs table
  `CREATE TABLE IF NOT EXISTS sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sleep_start TIMESTAMPTZ NOT NULL,
    sleep_end TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (sleep_end - sleep_start))/60)::INTEGER STORED,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  
  // Noise sessions table (version 8)
  `CREATE TABLE IF NOT EXISTS noise_sessions8 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sound_type TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    volume FLOAT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version8 INTEGER NOT NULL DEFAULT 8
  );`
];

// Function to execute SQL
const executeSQL = async (sql: string): Promise<void> => {
  console.log(`Executing SQL: ${sql.slice(0, 50)}...`);
  try {
    const { error } = await supabase.rpc('execute_sql', { sql });
    if (error) {
      // If the function doesn't exist, we need to create it first
      if (error.message.includes('function "execute_sql" does not exist')) {
        console.log('Creating execute_sql function first...');
        await createExecuteSQLFunction();
        // Try executing the SQL again after creating the function
        const { error: retryError } = await supabase.rpc('execute_sql', { sql });
        if (retryError) {
          console.error('Error executing SQL after creating function:', retryError);
          throw retryError;
        }
      } else {
        console.error('Error executing SQL:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
};

// Create SQL execution function in the database
const createExecuteSQLFunction = async (): Promise<void> => {
  try {
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION execute_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    // Execute raw SQL to create the function
    const { error } = await supabase.from('_functions').select('*').limit(1).then(
      () => supabase.rpc('exec_sql', { sql: createFunctionSQL }),
      // Fallback if _functions table doesn't exist
      async () => {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'apikey': SUPABASE_SERVICE_KEY
          },
          body: JSON.stringify({ sql: createFunctionSQL })
        });
        
        if (!res.ok) {
          const text = await res.text();
          return { error: new Error(`Failed to create function: ${text}`) };
        }
        
        return { error: null };
      }
    );
    
    if (error) {
      console.error('Failed to create execute_sql function:', error);
      throw error;
    }
    
    console.log('execute_sql function created successfully');
  } catch (error) {
    console.error('Error creating execute_sql function:', error);
    throw error;
  }
};

// Main migration function
export const runMigration = async (): Promise<void> => {
  console.log('Starting database migration (SSOT8001 compliant)...');
  
  try {
    // Create execute_sql function
    console.log('Creating execute_sql function...');
    await createExecuteSQLFunction();
    
    // Create tables
    console.log('Creating tables...');
    for (const sql of createTableStatements) {
      await executeSQL(sql);
    }
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Run the migration automatically
runMigration()
  .then(() => console.log('Migration completed'))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  }); 