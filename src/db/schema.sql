-- Mission Fresh Database Schema following SSOT5001 guidelines

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Nicotine consumption logs
CREATE TABLE mission4_consumption_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  consumption_date TIMESTAMP WITH TIME ZONE NOT NULL,
  product_type TEXT NOT NULL,
  brand TEXT,
  variant TEXT,
  nicotine_strength DECIMAL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  trigger TEXT,
  location TEXT,
  mood TEXT,
  intensity INTEGER CHECK (intensity BETWEEN 0 AND 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nicotine products directory
CREATE TABLE mission4_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  nicotine_strength DECIMAL NOT NULL,
  nicotine_type TEXT,
  description TEXT,
  image_url TEXT,
  ingredients TEXT[],
  warnings TEXT[],
  flavors TEXT[],
  price_range DECIMAL[2],
  average_rating DECIMAL CHECK (average_rating BETWEEN 0 AND 5),
  total_reviews INTEGER DEFAULT 0,
  country_availability TEXT[],
  retail_links JSONB,
  health_impact_rating INTEGER CHECK (health_impact_rating BETWEEN 0 AND 10),
  gum_health_rating INTEGER CHECK (gum_health_rating BETWEEN 0 AND 10),
  chemicals_of_concern TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User progress tracking
CREATE TABLE mission4_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  nicotine_free BOOLEAN NOT NULL DEFAULT false,
  reduced_intake BOOLEAN,
  products_used TEXT[],
  quantities JSONB,
  cravings_count INTEGER,
  craving_intensity INTEGER CHECK (craving_intensity BETWEEN 0 AND 10),
  mood TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 0 AND 10),
  focus_level INTEGER CHECK (focus_level BETWEEN 0 AND 10),
  physical_symptoms TEXT[],
  step_count INTEGER,
  exercise_minutes INTEGER,
  sleep_hours DECIMAL,
  water_intake DECIMAL,
  stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 10),
  meditation_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Quit plans
CREATE TABLE mission4_quit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  start_date DATE NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('cold_turkey', 'reduction', 'nrt_transition')),
  target_quit_date DATE,
  reduction_schedule JSONB,
  nrt_plan JSONB,
  triggers_identified TEXT[],
  coping_strategies TEXT[],
  support_network TEXT[],
  rewards_milestones JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Health metrics
CREATE TABLE mission4_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  step_count INTEGER,
  exercise_minutes INTEGER,
  sleep_hours DECIMAL,
  heart_rate INTEGER[],
  stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Product reviews
CREATE TABLE mission4_product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES mission4_products(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review_text TEXT,
  pros TEXT[],
  cons TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Row Level Security Policies

-- Consumption logs
ALTER TABLE mission4_consumption_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consumption logs"
  ON mission4_consumption_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consumption logs"
  ON mission4_consumption_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consumption logs"
  ON mission4_consumption_logs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consumption logs"
  ON mission4_consumption_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Products directory
ALTER TABLE mission4_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON mission4_products
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify products"
  ON mission4_products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND is_admin = true
    )
  );

-- Progress tracking
ALTER TABLE mission4_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON mission4_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON mission4_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON mission4_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Quit plans
ALTER TABLE mission4_quit_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quit plans"
  ON mission4_quit_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quit plans"
  ON mission4_quit_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quit plans"
  ON mission4_quit_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Health metrics
ALTER TABLE mission4_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health metrics"
  ON mission4_health_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health metrics"
  ON mission4_health_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics"
  ON mission4_health_metrics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Product reviews
ALTER TABLE mission4_product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product reviews"
  ON mission4_product_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own reviews"
  ON mission4_product_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON mission4_product_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Stored Procedures

-- Calculate step rewards
CREATE OR REPLACE FUNCTION mission4_calculate_step_rewards(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_steps BIGINT,
  rewards_earned DECIMAL,
  subscription_discount DECIMAL
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH step_data AS (
    SELECT COALESCE(SUM(step_count), 0) as total_steps
    FROM mission4_health_metrics
    WHERE user_id = p_user_id
    AND date BETWEEN p_start_date AND p_end_date
  )
  SELECT 
    sd.total_steps,
    (sd.total_steps / 10000.0)::DECIMAL as rewards_earned,
    LEAST((sd.total_steps / 100000.0 * 5)::DECIMAL, 30.0) as subscription_discount
  FROM step_data sd;
END;
$$;

-- Get consumption analytics
CREATE OR REPLACE FUNCTION mission4_get_consumption_analytics(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  date DATE,
  total_consumption INTEGER,
  reduced_percentage DECIMAL,
  most_common_trigger TEXT,
  average_intensity DECIMAL
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT 
      DATE(consumption_date) as log_date,
      COUNT(*) as consumption_count,
      AVG(intensity) as avg_intensity,
      MODE() WITHIN GROUP (ORDER BY trigger) as common_trigger
    FROM mission4_consumption_logs
    WHERE user_id = p_user_id
    AND consumption_date::DATE BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(consumption_date)
  ),
  baseline AS (
    SELECT AVG(consumption_count)::DECIMAL as avg_daily_consumption
    FROM daily_stats
    WHERE log_date <= p_start_date + INTERVAL '7 days'
  )
  SELECT 
    ds.log_date,
    ds.consumption_count::INTEGER,
    ((1 - (ds.consumption_count::DECIMAL / b.avg_daily_consumption)) * 100)::DECIMAL,
    ds.common_trigger,
    ds.avg_intensity::DECIMAL
  FROM daily_stats ds, baseline b
  ORDER BY ds.log_date;
END;
$$;

-- Get health improvements
CREATE OR REPLACE FUNCTION mission4_get_health_improvements(
  p_user_id UUID,
  p_quit_date DATE
) RETURNS TABLE (
  days_quit INTEGER,
  health_milestone TEXT,
  description TEXT,
  achieved BOOLEAN
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  WITH milestones AS (
    SELECT * FROM (VALUES
      (1, 'Blood Oxygen', 'Blood oxygen levels have returned to normal'),
      (2, 'Carbon Monoxide', 'Carbon monoxide levels have dropped to normal'),
      (3, 'Nicotine Out', 'Nicotine is completely out of your body'),
      (14, 'Heart Attack Risk', 'Your risk of heart attack has started to drop'),
      (30, 'Lung Function', 'Your lung function is improving'),
      (90, 'Circulation', 'Circulation has improved significantly'),
      (180, 'Lung Capacity', 'Lung capacity has increased by up to 10%'),
      (365, 'Heart Disease', 'Risk of heart disease has dropped by 50%')
    ) AS m(days, title, descr)
  )
  SELECT 
    m.days,
    m.title,
    m.descr,
    (CURRENT_DATE - p_quit_date >= m.days) as achieved
  FROM milestones m
  ORDER BY m.days;
END;
$$;
