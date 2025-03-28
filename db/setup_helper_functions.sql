-- Setup helper functions for table creation and RLS management
-- SSOT8001 compliant

-- Function to create a table
CREATE OR REPLACE FUNCTION create_table(table_name text, definition text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I (%s)', table_name, definition);
END;
$$;

-- Function to enable RLS on a table
CREATE OR REPLACE FUNCTION enable_rls(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
END;
$$;

-- Function to create a policy on a table
CREATE OR REPLACE FUNCTION create_policy(table_name text, name text, definition text, operation text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop the policy if it exists to avoid errors
  BEGIN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', name, table_name);
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if policy doesn't exist
  END;
  
  -- Create the policy
  IF operation = 'SELECT' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (%s)', name, table_name, definition);
  ELSIF operation = 'INSERT' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (%s)', name, table_name, definition);
  ELSIF operation = 'UPDATE' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (%s)', name, table_name, definition);
  ELSIF operation = 'DELETE' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (%s)', name, table_name, definition);
  ELSE
    RAISE EXCEPTION 'Unsupported operation: %', operation;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_table(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_table(text, text) TO anon;
GRANT EXECUTE ON FUNCTION enable_rls(text) TO authenticated;
GRANT EXECUTE ON FUNCTION enable_rls(text) TO anon;
GRANT EXECUTE ON FUNCTION create_policy(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_policy(text, text, text, text) TO anon; 