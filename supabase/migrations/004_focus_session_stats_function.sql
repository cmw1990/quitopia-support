-- Function to get focus session statistics
CREATE OR REPLACE FUNCTION get_focus_session_stats(p_user_id UUID)
RETURNS TABLE (
  total_focus_sessions BIGINT,
  total_focus_time NUMERIC,
  completed_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS total_focus_sessions,
    COALESCE(SUM(duration), 0) AS total_focus_time,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_sessions
  FROM focus_sessions
  WHERE user_id = p_user_id AND type = 'focus';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_focus_session_stats(UUID) TO authenticated;