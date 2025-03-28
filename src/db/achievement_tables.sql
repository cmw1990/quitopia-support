-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('milestone', 'streak', 'progress', 'action', 'holistic')),
  icon VARCHAR(50) NOT NULL,
  requirement_value INTEGER NOT NULL CHECK (requirement_value >= 0),
  reward_points INTEGER NOT NULL CHECK (reward_points >= 0),
  badge_color VARCHAR(50) NOT NULL,
  unlock_message TEXT,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user achievements table to track progress
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  celebration_shown BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- Create achievement shares table to track social sharing
CREATE TABLE IF NOT EXISTS achievement_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for achievements table
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view achievements
CREATE POLICY "Authenticated users can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Only allow admins to create, update, or delete achievements
CREATE POLICY "Only admins can create achievements"
  ON achievements FOR INSERT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
    WHERE auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  ));

CREATE POLICY "Only admins can update achievements"
  ON achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users
    WHERE auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  ));

-- Add RLS policies for user_achievements table
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own achievements
CREATE POLICY "Users can view their own achievement progress"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow achievement system to update user achievements on their behalf
CREATE POLICY "Achievement system can update user achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add RLS policies for achievement_shares table
ALTER TABLE achievement_shares ENABLE ROW LEVEL SECURITY;

-- Allow users to view and create their own achievement shares
CREATE POLICY "Users can view their own achievement shares"
  ON achievement_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can share their own achievements"
  ON achievement_shares FOR INSERT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add database function to update unlock date when achievement is completed
CREATE OR REPLACE FUNCTION set_achievement_unlocked_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_complete = true AND OLD.is_complete = false THEN
    NEW.unlocked_at := CURRENT_TIMESTAMP;
  END IF;
  
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for setting the unlocked_at timestamp
CREATE TRIGGER trigger_set_achievement_unlocked_timestamp
BEFORE UPDATE ON user_achievements
FOR EACH ROW
EXECUTE FUNCTION set_achievement_unlocked_timestamp();

-- Sample Achievement Data
INSERT INTO achievements (title, description, category, icon, requirement_value, reward_points, badge_color, unlock_message, is_hidden)
VALUES 
-- Milestone Achievements
('Fresh Start', 'Begin your journey to a fresher life by signing up', 'milestone', 'sunrise', 1, 10, 'sunrise', 'Welcome to a fresher you! Your journey has just begun.', false),
('Week One Wonder', 'Complete your first week smoke-free', 'milestone', 'calendar', 7, 50, 'bronze', 'A full week of freshness! Your body is already thanking you.', false),
('30-Day Milestone', 'Stay fresh for 30 consecutive days', 'milestone', 'calendar', 30, 150, 'silver', 'A month of fresh choices! Your lungs are clearing up.', false),
('Quarterly Victory', 'Maintain your fresh lifestyle for 90 days', 'milestone', 'calendar', 90, 300, 'gold', 'Three months of breathing easy! Your circulation has significantly improved.', false),
('Half-Year Hero', 'Six months of embracing freshness', 'milestone', 'award', 180, 500, 'platinum', 'Half a year of triumph! Your risk of heart disease has started to drop.', false),
('Year of Renewal', 'Celebrate one year of your fresh life', 'milestone', 'award', 365, 1000, 'diamond', 'A full year of freshness! Your risk of heart attack has dropped dramatically.', false),

-- Streak Achievements
('Consistency Counts', 'Log your status for 3 consecutive days', 'streak', 'clock', 3, 15, 'bronze', 'You're building habits that last!', false),
('Week Warrior', 'Complete all daily check-ins for a week', 'streak', 'trending-up', 7, 40, 'bronze', 'A perfect week of accountability!', false),
('Perfect Month', 'Log your status every day for 30 days', 'streak', 'trending-up', 30, 200, 'silver', 'Your dedication to tracking is impressive!', false),
('Unstoppable', 'Maintain a 60-day logging streak', 'streak', 'zap', 60, 300, 'gold', 'Nothing can break your momentum now!', false),

-- Progress Achievements
('First Victory', 'Resist your first tracked craving', 'progress', 'star', 1, 20, 'bronze', 'The first of many victories to come!', false),
('Craving Crusher', 'Successfully resist 10 cravings', 'progress', 'zap', 10, 75, 'silver', 'You're mastering the art of saying no!', false),
('Temptation Tamer', 'Overcome 50 recorded cravings', 'progress', 'zap', 50, 250, 'gold', 'You've proven your strength against temptation!', false),
('Money Saver', 'Save $100 by staying fresh', 'progress', 'leaf', 100, 100, 'bronze', 'Your wallet is getting healthier too!', false),
('Fresh Fortune', 'Save $500 through your fresh choices', 'progress', 'leaf', 500, 300, 'silver', 'Investing in your health pays dividends!', false),
('Wealth of Health', 'Save $1000+ by maintaining freshness', 'progress', 'leaf', 1000, 500, 'gold', 'A fortune saved and health gained!', false),

-- Action Achievements
('Profile Perfectionist', 'Complete your user profile', 'action', 'user', 1, 25, 'bronze', 'Your journey is now personalized!', false),
('Community Connector', 'Join your first community challenge', 'action', 'heart', 1, 30, 'bronze', 'You're not alone on this journey!', false),
('Challenge Champion', 'Complete a community challenge', 'action', 'award', 1, 100, 'silver', 'Together we achieve more!', false),
('Knowledge Seeker', 'Read 5 articles in the resource library', 'action', 'book', 5, 50, 'bronze', 'Knowledge is power in your fresh journey!', false),
('Fresh Ambassador', 'Share your first achievement on social media', 'action', 'share2', 1, 40, 'bronze', 'Inspiring others with your success!', false),

-- Holistic Achievements
('Breath of Fresh Air', 'Complete your first breathing exercise', 'holistic', 'wind', 1, 25, 'sea', 'Breathing techniques help manage stress and cravings.', false),
('Mindfulness Master', 'Perform 10 mindfulness sessions', 'holistic', 'cloud-off', 10, 100, 'forest', 'Your mind is becoming clearer and more focused!', false),
('Water Wise', 'Track drinking 8 glasses of water for 7 days', 'holistic', 'droplet', 7, 75, 'sea', 'Staying hydrated helps flush toxins and reduce cravings!', false),
('Movement Motivator', 'Log 30 minutes of physical activity 5 times', 'holistic', 'activity', 5, 100, 'forest', 'Exercise reduces stress and improves your mood!', false),
('Sleep Superstar', 'Record 7 nights of quality sleep', 'holistic', 'moon', 7, 80, 'sunset', 'Better sleep contributes to better health decisions!', false);

-- Create function to automatically create user achievement records for new users
CREATE OR REPLACE FUNCTION initialize_user_achievements()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_achievements (user_id, achievement_id, progress, is_complete)
  SELECT NEW.id, id, 0, false FROM achievements;
  
  -- Auto-complete the signup achievement
  UPDATE user_achievements
  SET progress = 1, is_complete = true, unlocked_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.id AND achievement_id = (
    SELECT id FROM achievements WHERE title = 'Fresh Start'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize achievements for new users
CREATE TRIGGER trigger_initialize_user_achievements
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION initialize_user_achievements(); 