-- Create function to execute SQL statements via RPC
-- This requires the postgres role to have appropriate permissions
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Grant execute permission to authenticated users (may need to be adjusted based on your security needs)
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon; 