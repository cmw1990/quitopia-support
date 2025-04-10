const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zoubqdwxemivxrjruvam.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdWJxZHd4ZW1pdnhyanJ1dmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQyMDE5NywiZXhwIjoyMDUzOTk2MTk3fQ.VMGEmVXub9PA-lQiE4b1XJu-dqjdUq1UpqVnppynYFw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createDatabaseFunctions() {
  console.log('Verifying core database functions...');
  
  const requiredFunctions = [
    {
      name: 'run_migration',
      description: 'Function to execute and track database migrations',
      sql: `
        CREATE OR REPLACE FUNCTION run_migration(migration_sql text, migration_name text)
        RETURNS void AS $$
        BEGIN
          EXECUTE migration_sql;
          INSERT INTO schema_version (version, name)
          SELECT 
            COALESCE(MAX(version), 0) + 1,
            migration_name
          FROM schema_version;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Migration error: %', SQLERRM;
          RAISE;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    },
    {
      name: 'create_rls_policy',
      description: 'Function to dynamically create Row Level Security policies',
      sql: `
        CREATE OR REPLACE FUNCTION create_rls_policy(
          table_name text,
          policy_name text,
          policy_action text,
          policy_definition text
        )
        RETURNS void AS $$
        BEGIN
          EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I; ' ||
            'CREATE POLICY %I ON %I FOR %s USING (%s)',
            policy_name, table_name,
            policy_name, table_name, 
            policy_action, policy_definition
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    }
  ];

  try {
    for (const func of requiredFunctions) {
      const { error } = await supabase.rpc('exec_sql', { sql: func.sql });
      
      if (error) {
        console.error(`Error creating function ${func.name}:`, error);
        throw error;
      }
    }

    console.log('All core database functions verified and created successfully');
  } catch (error) {
    console.error('Critical database function creation failure:', error);
    process.exit(1);
  }
}

createDatabaseFunctions().catch(console.error);