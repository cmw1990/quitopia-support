-- Create encryption keys table
CREATE TABLE IF NOT EXISTS user_encryption_keys8 (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE user_encryption_keys8 ENABLE ROW LEVEL SECURITY;

-- Allow users to read any public key
CREATE POLICY "Users can read any public key" ON user_encryption_keys8
  FOR SELECT
  USING (true);

-- Allow users to insert their own public key
CREATE POLICY "Users can insert their own public key" ON user_encryption_keys8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own public key
CREATE POLICY "Users can update their own public key" ON user_encryption_keys8
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_user_encryption_keys_updated_at
  BEFORE UPDATE ON user_encryption_keys8
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 