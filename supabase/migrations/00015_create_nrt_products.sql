-- Create nicotine_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS nicotine_products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  usage_instructions text,
  typical_dosage text,
  benefits text[] DEFAULT '{}',
  side_effects text[] DEFAULT '{}',
  contraindications text[] DEFAULT '{}',
  price_range text,
  availability text,
  effectiveness_rating numeric DEFAULT 0,
  ease_of_use_rating numeric DEFAULT 0,
  side_effect_profile_rating numeric DEFAULT 0,
  prescription_required boolean DEFAULT false,
  image_url text,
  manufacturer text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies for nicotine_products
ALTER TABLE nicotine_products ENABLE ROW LEVEL SECURITY;

-- Allow all users to read nicotine products
CREATE POLICY "Anyone can read nicotine products" ON nicotine_products
  FOR SELECT
  USING (true);

-- Allow only authenticated users with admin role to insert/update nicotine products
CREATE POLICY "Only admins can modify nicotine products" ON nicotine_products
  FOR INSERT
  WITH CHECK (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

CREATE POLICY "Only admins can update nicotine products" ON nicotine_products
  FOR UPDATE
  USING (auth.jwt() ? 'role' AND auth.jwt()->>'role' = 'admin');

-- Create user_nrt_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_nrt_preferences (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES nicotine_products(id) ON DELETE CASCADE,
  is_favorite boolean DEFAULT false,
  is_using boolean DEFAULT false,
  personal_rating numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Add RLS policies for user_nrt_preferences
ALTER TABLE user_nrt_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own NRT preferences
CREATE POLICY "Users can read their own NRT preferences" ON user_nrt_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own NRT preferences
CREATE POLICY "Users can create their own NRT preferences" ON user_nrt_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own NRT preferences
CREATE POLICY "Users can update their own NRT preferences" ON user_nrt_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_nicotine_products_updated_at
  BEFORE UPDATE ON nicotine_products
  FOR EACH ROW
  EXECUTE FUNCTION update_health_logs_timestamp();

CREATE TRIGGER update_user_nrt_preferences_updated_at
  BEFORE UPDATE ON user_nrt_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_health_logs_timestamp();

-- Insert sample NRT products
INSERT INTO nicotine_products (name, category, description, usage_instructions, typical_dosage, benefits, side_effects, contraindications, price_range, availability, effectiveness_rating, ease_of_use_rating, side_effect_profile_rating, prescription_required, image_url, manufacturer)
VALUES 
('Nicorette Gum', 'Gum', 'Nicotine replacement chewing gum', 'Chew slowly until you get a tingling feeling, then place between cheek and gums', '2mg or 4mg per piece, 9-12 pieces per day', ARRAY['Reduces cravings', 'Helps manage withdrawal symptoms', 'Easily portable'], ARRAY['Mouth soreness', 'Hiccups', 'Jaw ache'], ARRAY['Temporomandibular joint disorder', 'Dental work that may be affected by chewing'], '$30-50 for 100 pieces', 'Over the counter', 4.2, 4.5, 4.0, false, 'https://via.placeholder.com/150?text=Nicorette+Gum', 'Johnson & Johnson'),

('NicoDerm CQ Patch', 'Patch', 'Transdermal nicotine patch that delivers nicotine through the skin', 'Apply one patch daily to clean, dry, hairless skin', '21mg, 14mg, or 7mg (step-down treatment)', ARRAY['Provides steady nicotine delivery', 'Once-daily application', 'Discreet'], ARRAY['Skin irritation', 'Sleep disturbances', 'Vivid dreams'], ARRAY['Skin disorders', 'Allergies to adhesive'], '$35-45 for 14 patches', 'Over the counter', 4.3, 4.8, 3.9, false, 'https://via.placeholder.com/150?text=NicoDerm+Patch', 'GSK Consumer Healthcare'),

('Nicotrol Inhaler', 'Inhaler', 'Plastic device containing nicotine that delivers a vapor when inhaled', 'Inhale through mouthpiece when craving occurs', '6-16 cartridges per day, each delivering 4mg nicotine', ARRAY['Mimics hand-to-mouth action of smoking', 'Fast-acting relief', 'User-controlled dosing'], ARRAY['Mouth and throat irritation', 'Coughing', 'Rhinitis'], ARRAY['Severe asthma', 'Chronic nasal disorders'], '$45-60 per kit', 'Prescription only', 4.0, 3.8, 4.1, true, 'https://via.placeholder.com/150?text=Nicotrol+Inhaler', 'Pfizer'),

('Nicotrol NS Nasal Spray', 'Spray', 'Nicotine solution delivered as a fine spray into the nostril', 'Spray once in each nostril when craving occurs', '1-2 doses per hour, max 40 doses per day', ARRAY['Very rapid delivery of nicotine', 'Quick relief from cravings', 'Precise dosing'], ARRAY['Nasal irritation', 'Runny nose', 'Watery eyes', 'Sneezing'], ARRAY['Nasal or sinus conditions', 'Severe reactive airway disease'], '$50-70 per bottle', 'Prescription only', 4.1, 3.5, 3.7, true, 'https://via.placeholder.com/150?text=Nicotrol+NS', 'Pfizer'),

('Habitrol Lozenge', 'Lozenge', 'Nicotine lozenge that dissolves in the mouth', 'Place lozenge in mouth and allow to dissolve slowly (20-30 minutes)', '2mg or 4mg per lozenge, max 20 per day', ARRAY['Sugar-free', 'Discreet', 'No chewing required'], ARRAY['Hiccups', 'Heartburn', 'Nausea'], ARRAY['Recent heart attack', 'Life-threatening arrhythmias'], '$35-50 for 108 lozenges', 'Over the counter', 4.0, 4.6, 4.2, false, 'https://via.placeholder.com/150?text=Habitrol+Lozenge', 'Novartis Consumer Health'); 