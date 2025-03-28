import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../contexts/AuthContext';
import { Medal, Trophy, Award, Star, Zap, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

// Achievement types and structure
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earnedAt?: number;
  progress?: number;
  maxProgress?: number;
  category: 'streak' | 'milestone' | 'activity' | 'social' | 'challenge';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  hidden?: boolean;
}

// Tier-based styles
const tierStyles = {
  bronze: {
    bg: 'bg-amber-600/10',
    border: 'border-amber-600/50',
    text: 'text-amber-600 dark:text-amber-500',
    shadow: 'shadow-amber-600/10',
    glow: 'from-amber-600/20 to-transparent',
  },
  silver: {
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/50',
    text: 'text-slate-500 dark:text-slate-300',
    shadow: 'shadow-slate-400/10',
    glow: 'from-slate-400/20 to-transparent',
  },
  gold: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/50',
    text: 'text-yellow-600 dark:text-yellow-400',
    shadow: 'shadow-yellow-500/10',
    glow: 'from-yellow-500/20 to-transparent',
  },
  platinum: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/50',
    text: 'text-cyan-600 dark:text-cyan-300',
    shadow: 'shadow-cyan-500/20',
    glow: 'from-cyan-500/30 to-transparent',
  },
};

// Category-based icons
const categoryIcons = {
  streak: <Zap size={18} />,
  milestone: <Trophy size={18} />,
  activity: <Star size={18} />,
  social: <Medal size={18} />,
  challenge: <Target size={18} />,
};

// Default achievements for the application
const defaultAchievements: Achievement[] = [
  {
    id: 'first-login',
    title: 'First Steps',
    description: 'Logged into the app for the first time',
    icon: <Star size={24} />,
    category: 'milestone',
    tier: 'bronze',
  },
  {
    id: 'first-log',
    title: 'Track Record',
    description: 'Logged your consumption for the first time',
    icon: <Award size={24} />,
    category: 'activity',
    tier: 'bronze',
  },
  {
    id: 'first-streak',
    title: 'Getting Started',
    description: 'Logged in for 3 consecutive days',
    icon: <Zap size={24} />,
    category: 'streak',
    tier: 'bronze',
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'first-week',
    title: 'One Week Strong',
    description: 'Logged in for 7 consecutive days',
    icon: <Trophy size={24} />,
    category: 'streak',
    tier: 'silver',
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'profile-complete',
    title: 'Identity Established',
    description: 'Completed your user profile',
    icon: <Medal size={24} />,
    category: 'milestone',
    tier: 'bronze',
  },
  {
    id: 'nrt-explorer',
    title: 'NRT Explorer',
    description: 'Viewed 10 different NRT products',
    icon: <Target size={24} />,
    category: 'activity',
    tier: 'silver',
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'consumption-tracker',
    title: 'Consumption Tracker',
    description: 'Logged your consumption for 14 days',
    icon: <Award size={24} />,
    category: 'activity',
    tier: 'gold',
    progress: 0,
    maxProgress: 14,
  },
  {
    id: 'first-month',
    title: 'First Month Milestone',
    description: 'Maintained your progress for 30 days',
    icon: <Trophy size={24} />,
    category: 'milestone',
    tier: 'platinum',
    progress: 0,
    maxProgress: 30,
    hidden: true,
  },
];

interface AchievementCardProps {
  achievement: Achievement;
  onView?: (id: string) => void;
}

// Single achievement card component
const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onView }) => {
  const styles = tierStyles[achievement.tier];
  const isCompleted = !!achievement.earnedAt;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onView?.(achievement.id)}
      className={cn(
        "relative cursor-pointer rounded-lg border p-4 transition-all",
        styles.bg,
        styles.border,
        isCompleted ? "opacity-100" : "opacity-70 grayscale"
      )}
    >
      {/* Achievement icon */}
      <div className="flex justify-between items-start mb-3">
        <div className={cn("p-2.5 rounded-full", styles.bg, styles.text)}>
          {achievement.icon}
        </div>
        <div className={cn("text-xs font-semibold uppercase", styles.text)}>
          {categoryIcons[achievement.category]}
          <span className="ml-1">{achievement.category}</span>
        </div>
      </div>
      
      {/* Achievement details */}
      <h3 className={cn("text-base font-bold mb-1", styles.text)}>
        {achievement.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {achievement.description}
      </p>
      
      {/* Progress bar for achievements with progress */}
      {achievement.progress !== undefined && achievement.maxProgress && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className={styles.text}>Progress</span>
            <span className={styles.text}>
              {achievement.progress} / {achievement.maxProgress}
            </span>
          </div>
          <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
            <div 
              className={cn("h-full", styles.text, "bg-current")} 
              style={{ 
                width: `${Math.min(100, (achievement.progress / achievement.maxProgress) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}
      
      {/* Earned status */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
          Earned
        </div>
      )}
    </motion.div>
  );
};

// Achievement notification component for newly earned achievements
const AchievementNotification: React.FC<{ achievement: Achievement; onClose: () => void }> = ({ 
  achievement, 
  onClose
}) => {
  const styles = tierStyles[achievement.tier];
  
  // Close notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg border",
        styles.bg,
        styles.border,
        "max-w-xs w-full"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-3 rounded-full", styles.bg)}>
          <div className={styles.text}>{achievement.icon}</div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={cn("font-bold", styles.text)}>Achievement Unlocked!</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>
          <p className={cn("font-medium text-sm", styles.text)}>{achievement.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
        </div>
      </div>
      
      {/* Radial glow effect */}
      <div className={cn(
        "absolute inset-0 -z-10 rounded-lg opacity-50 blur-xl radial-progress",
        `bg-gradient-radial ${styles.glow}`
      )} />
    </motion.div>
  );
};

// Main achievement system props
interface AchievementSystemProps {
  userId?: string;
  onAchieve?: (achievement: Achievement) => void;
}

/**
 * Achievement System Component
 * 
 * Manages the tracking, displaying, and earning of user achievements
 */
export const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  userId,
  onAchieve 
}) => {
  const { user } = useAuth();
  const actualUserId = userId || (user?.id as string);
  
  // Store achievements in localStorage
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>(
    `achievements_${actualUserId}`,
    defaultAchievements
  );
  
  // Track newly earned achievements for notifications
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | Achievement['category']>('all');
  const [selectedTier, setSelectedTier] = useState<'all' | Achievement['tier']>('all');
  
  // Award an achievement
  const awardAchievement = (id: string) => {
    const now = Date.now();
    
    setAchievements(prev => {
      const updated = prev.map(achievement => 
        achievement.id === id && !achievement.earnedAt
          ? { ...achievement, earnedAt: now }
          : achievement
      );
      
      // Find the newly earned achievement for notification
      const earned = updated.find(a => a.id === id && a.earnedAt === now);
      if (earned) {
        setRecentAchievement(earned);
        onAchieve?.(earned);
      }
      
      return updated;
    });
  };
  
  // Update achievement progress
  const updateProgress = (id: string, progress: number) => {
    setAchievements(prev => {
      return prev.map(achievement => {
        if (achievement.id === id) {
          const updatedProgress = Math.min(progress, achievement.maxProgress || progress);
          const completed = achievement.maxProgress && updatedProgress >= achievement.maxProgress;
          
          // If achievement is completed by this progress update, award it
          if (completed && !achievement.earnedAt) {
            const now = Date.now();
            const earned = { 
              ...achievement, 
              progress: updatedProgress, 
              earnedAt: now 
            };
            
            setRecentAchievement(earned);
            onAchieve?.(earned);
            
            return earned;
          }
          
          return { ...achievement, progress: updatedProgress };
        }
        return achievement;
      });
    });
  };
  
  // Reset achievements for testing
  const resetAchievements = () => {
    setAchievements(defaultAchievements);
    setRecentAchievement(null);
  };
  
  // Filter achievements by category and tier
  const filteredAchievements = achievements.filter(achievement => 
    (selectedFilter === 'all' || achievement.category === selectedFilter) &&
    (selectedTier === 'all' || achievement.tier === selectedTier) &&
    !achievement.hidden
  );
  
  // Get counts for UI
  const earnedCount = achievements.filter(a => a.earnedAt).length;
  const totalVisible = achievements.filter(a => !a.hidden).length;
  
  return (
    <div className="space-y-6">
      {/* Stats and filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Achievements</h2>
          <p className="text-muted-foreground">
            {earnedCount} of {totalVisible} achievements unlocked
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Category filter */}
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-3 py-1 rounded-md border bg-background text-sm"
          >
            <option value="all">All Categories</option>
            <option value="streak">Streaks</option>
            <option value="milestone">Milestones</option>
            <option value="activity">Activities</option>
            <option value="social">Social</option>
            <option value="challenge">Challenges</option>
          </select>
          
          {/* Tier filter */}
          <select 
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as any)}
            className="px-3 py-1 rounded-md border bg-background text-sm"
          >
            <option value="all">All Tiers</option>
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>
      </div>
      
      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement} 
          />
        ))}
        
        {filteredAchievements.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            <p>No achievements found for the selected filters.</p>
          </div>
        )}
      </div>
      
      {/* Debug buttons - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 border rounded-lg bg-muted/10">
          <h3 className="font-semibold mb-2">Development Tools</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => awardAchievement('first-login')}
              className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md"
            >
              Award First Login
            </button>
            <button 
              onClick={() => updateProgress('first-streak', 2)}
              className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md"
            >
              Update Streak Progress
            </button>
            <button 
              onClick={resetAchievements}
              className="px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded-md"
            >
              Reset All
            </button>
          </div>
        </div>
      )}
      
      {/* Achievement notification */}
      <AnimatePresence>
        {recentAchievement && (
          <AchievementNotification 
            achievement={recentAchievement}
            onClose={() => setRecentAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementSystem; 