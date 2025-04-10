import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Trophy, Zap } from 'lucide-react';

interface MotivationBoosterProps {
  streakCount: number;
  taskCompleted: number;
  focusMinutes: number;
  showRewards?: boolean;
  onBoostRequest?: () => void;
}

const motivationalQuotes = [
  "Small steps lead to big achievements!",
  "You've got this - one task at a time!",
  "Progress over perfection!",
  "Every minute of focus counts!",
  "Celebrate each small win!",
  "Your brain is capable of amazing things!",
  "Taking breaks makes you stronger!",
  "You're building great habits!",
];

const achievements = [
  { threshold: 5, title: "Focus Finder", icon: Zap },
  { threshold: 15, title: "Task Master", icon: Star },
  { threshold: 30, title: "Productivity Pro", icon: Trophy },
  { threshold: 60, title: "Flow State Guru", icon: Sparkles },
];

export const MotivationBooster = ({
  streakCount,
  taskCompleted,
  focusMinutes,
  showRewards = true,
  onBoostRequest
}: MotivationBoosterProps) => {
  const [currentQuote, setCurrentQuote] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState<typeof achievements[0] | null>(null);

  useEffect(() => {
    rotateQuote();
    const interval = setInterval(rotateQuote, 30000); // Rotate quotes every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for new achievements
    const newAchievement = achievements.find(a => focusMinutes >= a.threshold);
    if (newAchievement && (!recentAchievement || recentAchievement.threshold < newAchievement.threshold)) {
      setRecentAchievement(newAchievement);
      setTimeout(() => setRecentAchievement(null), 5000); // Hide after 5 seconds
    }
  }, [focusMinutes]);

  const rotateQuote = () => {
    setShowQuote(false);
    setTimeout(() => {
      const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setCurrentQuote(newQuote);
      setShowQuote(true);
    }, 500);
  };

  return (
    <div className="relative">
      {/* Motivational Quote */}
      <AnimatePresence mode="wait">
        {showQuote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg mb-4"
          >
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {currentQuote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats and Achievements */}
      {showRewards && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center"
          >
            <div className="text-2xl font-bold text-green-600">{streakCount}</div>
            <div className="text-xs text-green-600">Day Streak</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center"
          >
            <div className="text-2xl font-bold text-blue-600">{taskCompleted}</div>
            <div className="text-xs text-blue-600">Tasks Done</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center"
          >
            <div className="text-2xl font-bold text-purple-600">{focusMinutes}</div>
            <div className="text-xs text-purple-600">Focus Mins</div>
          </motion.div>
        </div>
      )}

      {/* Achievement Popup */}
      <AnimatePresence>
        {recentAchievement && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2">
              <recentAchievement.icon className="w-6 h-6" />
              <div>
                <div className="text-sm font-bold">Achievement Unlocked!</div>
                <div className="text-xs">{recentAchievement.title}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boost Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBoostRequest}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        <span>Need a Motivation Boost?</span>
      </motion.button>
    </div>
  );
};
