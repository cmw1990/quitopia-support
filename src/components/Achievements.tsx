import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Progress,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertTitle,
  AlertDescription,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Skeleton
} from './ui';
import { 
  Award, 
  Calendar, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  EggFried, 
  Flame, 
  Gift, 
  Laugh,
  Leaf, 
  Lightbulb, 
  Linkedin, 
  Medal, 
  Sparkles, 
  Smile, 
  Star, 
  Trophy, 
  Twitter, 
  Zap,
  Share2,
  Lock,
  ArrowRight,
  Heart,
  BatteryFull,
  Brain,
  ScrollText,
  HeartPulse,
  BarChart2,
  Users,
  Activity,
  BadgeCheck,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { supabaseRestCall } from "../lib/supabase/rest-client";
import { SocialShareDialog } from './SocialShareDialog';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { useToast } from "./ui/use-toast";
import { useSession } from '../hooks/useSession';

// Custom SVG components for icons
// Custom Lungs icon component since it's missing from lucide-react
const Lungs = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6.081 20C6.026 20 5.971 20 5.916 20c-2.167-.146-3.972-1.87-4.101-4.035C1.486 8.522 2.4 3.578 4.65 2.05 5.483 1.563 6.542 1.998 6.85 2.85c.317.883-.126 2.797-.258 3.921C6.494 7.443 6.376 8.208 6.537 8.816c.281 1.065 1.664 7.383 1.45 9.492-.08.789-.797 1.692-1.906 1.692z" />
    <path d="M12 13c-1.715-2.148-4.524-3.037-6.837-3.557-.773-.173-1.543-.36-2.184-.673-1.992-.977-.753 2.694-.753 2.694" />
    <path d="M17.357 13c-.81 2.87-2.094 5.329-3.138 6.2-1.333 1.117-2.857 1.312-4.078 1.097M17.919 20C17.974 20 18.029 20 18.084 20c2.167-.146 3.972-1.87 4.101-4.035C22.514 8.522 21.6 3.578 19.35 2.05 18.517 1.563 17.458 1.998 17.15 2.85c-.317.883.126 2.797.258 3.921C17.506 7.443 17.624 8.208 17.463 8.816c-.281 1.065-1.664 7.383-1.45 9.492.08.789.797 1.692 1.906 1.692z" />
    <path d="M12 13c1.715-2.148 4.524-3.037 6.837-3.557.773-.173 1.543-.36 2.184-.673 1.992-.977.753 2.694.753 2.694" />
    <path d="M6.643 13c.81 2.87 2.094 5.329 3.138 6.2 1.333 1.117 2.857 1.312 4.078 1.097" />
  </svg>
);

// Custom Pocket icon component since it's missing from lucide-react
const Pocket = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z" />
    <path d="m8 10 4 4 4-4" />
  </svg>
);

// Custom Wind icon for achievements
function WindIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

// Type definitions
export type AchievementCategory = 
  | 'milestones' 
  | 'streaks' 
  | 'health' 
  | 'community' 
  | 'activities'
  | 'holistic'
  | 'quitting_methods'
  | 'special';

// Define achievement icon mapping
interface AchievementIcon {
  icon: React.ReactNode;
  color: string;
}

// Achievement category to icon mapping
const achievementIcons: Record<string, AchievementIcon> = {
  "milestones": { icon: <Trophy size={24} />, color: "text-amber-500" },
  "streaks": { icon: <Flame size={24} />, color: "text-red-500" },
  "health": { icon: <Heart size={24} />, color: "text-rose-500" },
  "community": { icon: <Users size={24} />, color: "text-green-600" },
  "activities": { icon: <Activity size={24} />, color: "text-emerald-600" },
  "holistic": { icon: <Leaf size={24} />, color: "text-green-500" },
  "special": { icon: <Star size={24} />, color: "text-amber-500" },
  "quitting_cold_turkey": { icon: <Pocket size={24} />, color: "text-emerald-700" },
  "quitting_reduction": { icon: <ArrowRight size={24} />, color: "text-emerald-500" },
  "quitting_nrt": { icon: <Lungs size={24} />, color: "text-green-700" },
  "energy": { icon: <BatteryFull size={24} />, color: "text-yellow-600" },
  "focus": { icon: <Brain size={24} />, color: "text-green-800" },
  "mood": { icon: <Laugh size={24} />, color: "text-pink-500" },
};

// Define our component's Achievement interface
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  completed: boolean;
  unlocked_at?: string;
  category: AchievementCategory;
  game_id?: string;
}

interface AchievementsProps {
  session: Session | null;
  onShareAchievement?: (achievement: Achievement) => void;
}

interface GameAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  completed: boolean;
  unlocked_at?: string;
  game_id?: string;
  category: AchievementCategory;
}

export const Achievements: React.FC<AchievementsProps> = ({ 
  session,
  onShareAchievement
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<GameAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<GameAchievement | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<GameAchievement | null>(null);
  const [points, setPoints] = useState(0);
  const [achievementStats, setAchievementStats] = useState({
    total: 0,
    unlocked: 0,
    percentage: 0
  });
  const [filteredAchievements, setFilteredAchievements] = useState<GameAchievement[]>([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    achievementsUnlocked: 0,
    nextMilestone: '',
    rank: 'Novice'
  });
  const { session: sessionFromUseSession } = useSession();
  
  useEffect(() => {
    if (sessionFromUseSession?.user) {
      fetchAchievements();
    }
  }, [sessionFromUseSession]);
  
  const fetchAchievements = async () => {
    try {
    setLoading(true);
    
      // Use REST API call instead of direct Supabase client
      const data = await supabaseRestCall<GameAchievement[]>(
        `/rest/v1/achievements?user_id=eq.${sessionFromUseSession?.user.id}&order=category.asc,title.asc`,
        {
          method: 'GET',
        },
        sessionFromUseSession
      );
      
      if (Array.isArray(data)) {
        const processedAchievements = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          icon: renderAchievementIcon(item.icon_name || 'trophy'),
          progress: item.progress || 0,
          completed: item.completed || false,
          unlocked_at: item.unlocked_at,
          game_id: item.game_id,
          category: item.category as AchievementCategory
        }));
        
        setAchievements(processedAchievements);
        calculateStats(processedAchievements);
      } else {
        // If no data, load sample achievements for testing/demo
        const sampleAchievements = getSampleAchievements();
        setAchievements(sampleAchievements);
        calculateStats(sampleAchievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      // Load sample achievements as fallback
      const sampleAchievements = getSampleAchievements();
      setAchievements(sampleAchievements);
      calculateStats(sampleAchievements);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStats = (achievementsList: GameAchievement[]) => {
    const total = achievementsList.length;
    const unlocked = achievementsList.filter(a => a.completed).length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    
    setAchievementStats({
      total,
      unlocked,
      percentage
    });
    
    // Calculate total points (each completed achievement is worth 100 points)
    const calculatedPoints = unlocked * 100;
    setPoints(calculatedPoints);
  };
  
  // Sample achievements for development/testing
  const getSampleAchievements = (): GameAchievement[] => {
    return [
      {
        id: 'fresh-start',
        title: 'Fresh Start',
        description: 'Begin your journey to a fresher life',
        icon: <Star className="h-6 w-6 text-yellow-500" />,
        progress: 100,
        completed: true,
        unlocked_at: new Date().toISOString(),
        category: 'milestones'
      },
      {
        id: 'one-week-fresh',
        title: 'One Week Fresh',
        description: 'Complete one week of your fresh journey',
        icon: <Calendar className="h-6 w-6 text-blue-500" />,
        progress: 70,
        completed: false,
        category: 'milestones'
      },
      {
        id: 'health-milestone',
        title: 'Health Milestone',
        description: 'Achieve your first health improvement',
        icon: <Heart className="h-6 w-6 text-red-500" />,
        progress: 100,
        completed: true,
        unlocked_at: new Date(Date.now() - 86400000).toISOString(),
        category: 'health'
      },
      {
        id: 'task-master',
        title: 'Task Master',
        description: 'Complete 10 tasks in your fresh journey',
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        progress: 80,
        completed: false,
        category: 'milestones'
      },
      {
        id: 'community-supporter',
        title: 'Community Supporter',
        description: 'Help another fresh user on their journey',
        icon: <Smile className="h-6 w-6 text-blue-500" />,
        progress: 0,
        completed: false,
        category: 'community'
      },
      {
        id: 'breathing-sessions',
        title: 'Deep Breather',
        description: 'Complete 5 breathing exercise sessions',
        icon: <WindIcon className="h-6 w-6 text-blue-500" />,
        progress: 60,
        completed: false,
        game_id: 'breathing-exercise',
        category: 'activities'
      },
      {
        id: 'memory-games-played',
        title: 'Mind Sharpener',
        description: 'Play 10 memory card games',
        icon: <Brain className="h-6 w-6 text-purple-500" />,
        progress: 50,
        completed: false,
        game_id: 'memory-cards',
        category: 'activities'
      },
      {
        id: 'daily-challenge',
        title: 'Daily Challenger',
        description: 'Complete a game every day for 7 days',
        icon: <WindIcon className="h-6 w-6 text-green-500" />,
        progress: 45,
        completed: false,
        category: 'activities'
      }
    ];
  };
  
  // Filter achievements based on active tab
  useEffect(() => {
    // Create a filtered array based on the active tab
    const filtered = activeTab === 'all' 
    ? achievements 
    : activeTab === 'unlocked' 
      ? achievements.filter(a => a.completed) 
      : achievements.filter(a => !a.completed);
    
    // Update the filteredAchievements state
    setFilteredAchievements(filtered);
  }, [activeTab, achievements]);
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Function to handle achievement sharing
  const handleShareAchievement = (achievement: GameAchievement) => {
    if (onShareAchievement) {
      // Cast the GameAchievement to Achievement with a default category
      const achievementWithCategory = {
        ...achievement,
        category: 'milestones' as AchievementCategory
      };
      onShareAchievement(achievementWithCategory);
    } else {
      // Fallback if no share handler provided
      const shareMessage = `I just earned the "${achievement.title}" achievement in Mission Fresh! ${achievement.description}`;
      
      // Try to use the Web Share API if available
      if (navigator.share) {
        navigator.share({
          title: 'Mission Fresh Achievement',
          text: shareMessage,
          url: window.location.origin
        }).catch(err => {
          console.error('Error sharing:', err);
          // Fallback to copy to clipboard
          navigator.clipboard.writeText(shareMessage)
            .then(() => toast({
              title: 'Achievement Shared',
              description: 'Achievement shared successfully!',
              variant: 'success'
            }))
            .catch(err => console.error('Could not copy text:', err));
        });
      } else {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(shareMessage)
          .then(() => toast({
            title: 'Achievement Shared',
            description: 'Achievement shared successfully!',
            variant: 'success'
          }))
          .catch(err => console.error('Could not copy text:', err));
      }
    }
  };
  
  // Function to handle unlocking an achievement (triggered by game completion)
  const handleUnlockAchievement = async (achievement: GameAchievement) => {
    if (!sessionFromUseSession?.user?.id) return;
    
    // Optimistic update
    setRecentlyUnlocked(achievement);
    setShowUnlockAnimation(true);
    
    // Play confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Show toast notification
    toast({
      title: 'Achievement Unlocked!',
      description: `You've unlocked "${achievement.title}"`,
      variant: 'success'
    });
    
    // Update the achievement in the database using direct REST API
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/achievement_unlocks`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${sessionFromUseSession.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: sessionFromUseSession.user.id,
          achievement_id: achievement.id,
           completed: true, 
          unlocked_at: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to record achievement unlock');
      }
      
      // Update the local achievement data
      fetchAchievements();
      
    } catch (err) {
      console.error('Error unlocking achievement:', err);
      toast({
        title: 'Error',
        description: 'Failed to save your achievement progress',
        variant: 'destructive'
      });
    }
    
    // Hide the animation after a delay
    setTimeout(() => {
      setShowUnlockAnimation(false);
      setRecentlyUnlocked(null);
    }, 5000);
  };
  
  // Render functions for smaller components
  const renderTierBadge = (tier: 1 | 2 | 3) => (
    <Badge variant={tier === 1 ? "default" : tier === 2 ? "secondary" : "outline"} className="ml-2">
      Tier {tier}
    </Badge>
  );
  
  // Function to render the appropriate icon for an achievement
  const renderAchievementIcon = (iconName: string) => {
    const iconInfo = achievementIcons[iconName] || achievementIcons["milestones"];
    return (
      <div className={`p-2 rounded-full bg-primary/10 ${iconInfo.color}`}>
        {iconInfo.icon}
      </div>
    );
  };
  
  // Function to get appropriate status badge for an achievement
  const getAchievementStatus = (achievement: GameAchievement) => {
    if (achievement.completed) {
      return <Badge variant="success">Completed</Badge>;
    } else if (achievement.progress > 0) {
      return <Badge variant="secondary">{achievement.progress}% Progress</Badge>;
    } else {
      return <Badge variant="outline">Not Started</Badge>;
    }
  };
  
  // Render personalized achievement recommendations
  const renderPersonalizedRecommendations = () => {
    // Filter achievements that are in progress but not completed
    const inProgressAchievements = achievements.filter(a => a.progress > 0 && a.progress < 100 && !a.completed);
    
    // Sort by progress (closest to completion first)
    const sortedAchievements = [...inProgressAchievements].sort((a, b) => b.progress - a.progress);
    
    // Take the top 3 achievements
    const topAchievements = sortedAchievements.slice(0, 3);
    
    if (topAchievements.length === 0) {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Complete some activities to get personalized recommendations</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Almost There!</CardTitle>
          <CardDescription>These achievements are within your reach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  <Progress value={achievement.progress} className="h-2 mt-2" />
                </div>
                <div className="flex-shrink-0">
                  <Badge variant="outline">{achievement.progress}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">View All Achievements</Button>
        </CardFooter>
      </Card>
    );
  };

  // Render achievement statistics
  const renderAchievementStatistics = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Achievement Stats</CardTitle>
          <CardDescription>Track your progress and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{achievementStats.unlocked}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Unlocked</p>
              </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{achievementStats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold">{achievementStats.percentage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete</p>
              </div>
              </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Overall Progress</p>
            <Progress value={achievementStats.percentage} className="h-2" />
            </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-1">Achievement Points</p>
            <div className="flex items-center">
              <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-lg font-bold">{points}</span>
                    </div>
                  </div>
        </CardContent>
      </Card>
    );
  };
  
  // Main render function
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <h1 className="text-3xl font-bold mb-2">Achievements</h1>
      <p className="text-muted-foreground">Track your progress and earn rewards as you quit smoking</p>
      
      {/* User Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-1">Rank</h3>
              <p className={`text-2xl font-bold ${getRankColor(userStats.rank)}`}>{userStats.rank}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-1">Points</h3>
              <p className="text-2xl font-bold">{userStats.totalPoints}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-1">Unlocked</h3>
              <p className="text-2xl font-bold">{userStats.achievementsUnlocked}/{achievements.length}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-1">Next Milestone</h3>
              <p className="text-lg font-medium">{userStats.nextMilestone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Achievement Categories */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 max-w-2xl mx-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="milestone">
            Milestones
            <Badge className="ml-1 text-xs" variant="outline">{achievements.filter(a => a.category === 'milestones' && a.completed).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="habit">
            Habits
            <Badge className="ml-1 text-xs" variant="outline">{achievements.filter(a => a.category === 'holistic' && a.completed).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="challenge">
            Challenges
            <Badge className="ml-1 text-xs" variant="outline">{achievements.filter(a => a.category === 'quitting_methods' && a.completed).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="community">
            Community
            <Badge className="ml-1 text-xs" variant="outline">{achievements.filter(a => a.category === 'community' && a.completed).length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100vh-350px)] mt-6">
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-4/5" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mt-4" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredAchievements.map(achievement => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AchievementCard 
                      achievement={achievement} 
                      onShare={handleShareAchievement} 
                    />
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="milestone" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AchievementCard 
                    achievement={achievement} 
                    onShare={handleShareAchievement} 
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="habit" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AchievementCard 
                    achievement={achievement} 
                    onShare={handleShareAchievement} 
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="challenge" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AchievementCard 
                    achievement={achievement} 
                    onShare={handleShareAchievement} 
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="community" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map(achievement => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AchievementCard 
                    achievement={achievement} 
                    onShare={handleShareAchievement} 
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

// Achievement Card Component
interface AchievementCardProps {
  achievement: GameAchievement;
  onShare: (achievement: GameAchievement) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onShare }) => {
  const { title, description, icon, progress, completed, unlocked_at } = achievement;
  
  const progressPercentage = Math.round((progress / 100) * 100);
  
  return (
    <Card className={`overflow-hidden transition-all duration-200 ${completed ? 'border-primary' : 'opacity-80'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {title}
              {completed && (
                <BadgeCheck className="h-5 w-5 text-green-500 ml-2" />
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className={`p-3 rounded-full ${completed ? 'bg-primary/20' : 'bg-muted'}`}>
            {completed ? (
              <div className="text-primary">{icon}</div>
            ) : (
              <div className="text-muted-foreground">{icon}</div>
            )}
          </div>
          <div>
            <div className="font-medium">
              {completed && (
                <span className="flex items-center">
                  Completed
                </span>
              )}
            </div>
            {completed && unlocked_at && (
              <div className="text-sm text-muted-foreground">
                Unlocked on {formatDate(unlocked_at)}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progressPercentage} />
        </div>
      </CardContent>
      {completed && (
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => onShare(achievement)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Achievement
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// Helper function to get rank color
const getRankColor = (rank: string) => {
  switch (rank) {
    case 'Novice': return 'text-gray-500';
    case 'Beginner': return 'text-green-500';
    case 'Intermediate': return 'text-blue-500';
    case 'Expert': return 'text-purple-500';
    case 'Master': return 'text-pink-500';
    case 'Legend': return 'text-amber-500';
    default: return 'text-gray-500';
  }
};

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default Achievements;