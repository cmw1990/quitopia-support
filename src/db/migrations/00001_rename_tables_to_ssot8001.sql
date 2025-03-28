-- Rename tables to follow SSOT8001 naming convention with suffix "8"

-- Drop stored procedures first since they reference the old table names
DROP FUNCTION IF EXISTS mission4_calculate_step_rewards;
DROP FUNCTION IF EXISTS mission4_get_consumption_analytics;
DROP FUNCTION IF EXISTS mission4_get_health_improvements;

-- Rename tables
ALTER TABLE IF EXISTS mission4_consumption_logs RENAME TO consumption_logs8;
ALTER TABLE IF EXISTS mission4_products RENAME TO products8;
ALTER TABLE IF EXISTS mission4_progress RENAME TO progress8;
ALTER TABLE IF EXISTS mission4_quit_plans RENAME TO quit_plans8;
ALTER TABLE IF EXISTS mission4_health_metrics RENAME TO health_metrics8;
ALTER TABLE IF EXISTS mission4_product_reviews RENAME TO product_reviews8;

-- Update foreign key references
ALTER TABLE product_reviews8 
  DROP CONSTRAINT IF EXISTS mission4_product_reviews_product_id_fkey,
  ADD CONSTRAINT product_reviews8_product_id_fkey 
  FOREIGN KEY (product_id) REFERENCES products8(id);

-- Recreate stored procedures with new table names
CREATE OR REPLACE FUNCTION calculate_step_rewards8(
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
    FROM health_metrics8
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

CREATE OR REPLACE FUNCTION get_consumption_analytics8(
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
    FROM consumption_logs8
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

CREATE OR REPLACE FUNCTION get_health_improvements8(
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
