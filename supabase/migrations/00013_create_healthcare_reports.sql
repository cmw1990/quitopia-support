-- Create healthcare reports table
CREATE TABLE IF NOT EXISTS healthcare_reports8 (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id text NOT NULL,
  format text NOT NULL,
  content jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE healthcare_reports8 ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own reports
CREATE POLICY "Users can read their own reports" ON healthcare_reports8
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own reports
CREATE POLICY "Users can create their own reports" ON healthcare_reports8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create provider shares table
CREATE TABLE IF NOT EXISTS provider_shares8 (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  report_content jsonb NOT NULL,
  shared_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE provider_shares8 ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own shared reports
CREATE POLICY "Users can read their own shared reports" ON provider_shares8
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = provider_id);

-- Allow users to share reports with providers
CREATE POLICY "Users can share reports with providers" ON provider_shares8
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_healthcare_reports_updated_at
  BEFORE UPDATE ON healthcare_reports8
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_shares_updated_at
  BEFORE UPDATE ON provider_shares8
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 