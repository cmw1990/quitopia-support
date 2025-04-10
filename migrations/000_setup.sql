-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create function to run migrations
CREATE OR REPLACE FUNCTION run_migration(migration_sql text, migration_name text)
RETURNS void AS $$
BEGIN
    -- Log migration start
    RAISE NOTICE 'Running migration: %', migration_name;
    
    -- Execute the migration SQL
    EXECUTE migration_sql;
    
    -- Record successful migration
    INSERT INTO schema_version (version, name)
    SELECT 
        COALESCE(MAX(version), 0) + 1,
        migration_name
    FROM schema_version;
    
    RAISE NOTICE 'Migration completed: %', migration_name;
EXCEPTION WHEN OTHERS THEN
    -- Log error details
    RAISE NOTICE 'Error running migration %: %', migration_name, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create any stored procedure
CREATE OR REPLACE FUNCTION create_stored_procedures(sql text)
RETURNS void AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create RLS policies
CREATE OR REPLACE FUNCTION create_rls_policy(
    table_name text,
    policy_name text,
    policy_action text,
    policy_definition text
)
RETURNS void AS $$
BEGIN
    -- Drop existing policy if it exists
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    
    -- Create new policy
    EXECUTE format(
        'CREATE POLICY %I ON %I FOR %s USING (%s)',
        policy_name,
        table_name,
        policy_action,
        policy_definition
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create version tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT now()
);

-- Record setup migration
INSERT INTO schema_version (version, name)
VALUES (0, '000_setup.sql')
ON CONFLICT DO NOTHING;