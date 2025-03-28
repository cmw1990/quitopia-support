import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter,
  Calendar, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger, 
  Slider, 
  Label, 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  Button,
  Checkbox,
  Badge,
  Input,
  Switch,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from './ui';
import { toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Battery, 
  BrainCircuit, 
  CalendarDays, 
  Heart, 
  Smile, 
  SunMedium, 
  Zap,
  Share2,
  Coffee,
  Moon,
  Droplets,
  Link,
  Copy,
  Twitter,
  Facebook,
  Instagram,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Award,
  X,
  Shield,
  Clock, 
  Cigarette, 
  Trophy, 
  TrendingDown, 
  Brain, 
  Activity,
  Footprints, 
  Medal, 
  HeartPulse, 
  TrendingUp, 
  Gift,
  Coins,
  Linkedin
} from 'lucide-react';
import { 
  getProgressData, 
  addProgressEntry, 
  ProgressEntry,
  shareProgressToSocial,
  getUserProgress,
  getHealthImprovements,
  shareProgressToSocialMedia,
  UserProgressResponse,
} from "../api/apiCompatibility";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import html2canvas from 'html2canvas';
import { SocialShareDialog } from './SocialShareDialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  parseProgressParams, 
  shareProgress, 
  ProgressShareData, 
  shareToSocialPlatform,
  generateProgressMetaTags 
} from '@/utils/progressDeepLinking';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressProps {
  session: Session | null;
}

// Adding mood options
type MoodOption = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
const moodOptions: { value: MoodOption; label: string; emoji: string }[] = [
  { value: 'very_negative', label: 'Very Low', emoji: '😭' },
  { value: 'negative', label: 'Low', emoji: '😟' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'positive', label: 'Good', emoji: '😊' },
  { value: 'very_positive', label: 'Great', emoji: '😁' },
];

// Physical symptoms commonly associated with nicotine withdrawal
const physicalSymptoms = [
  'Headache',
  'Irritability',
  'Increased appetite',
  'Difficulty sleeping',
  'Anxiety',
  'Restlessness',
  'Cough',
  'Fatigue',
  'Constipation',
  'Concentration issues'
];

// Social media platforms
type SocialPlatform = 'twitter' | 'facebook' | 'instagram';

// Define achievement types
interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  date?: string;
  icon: JSX.Element;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress?: number;
  shareImage?: string;
}

// Replace the Walking icon with Footprints which exists in lucide-react
const stepIcon = <Footprints className="h-8 w-8 text-green-500" />;

export const Progress: React.FC<ProgressProps> = ({ session }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [activeTab, setActiveTab] = useState('tracking');
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');
  
  // Basic progress tracking
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [mood, setMood] = useState<MoodOption>('neutral');
  const [cravings, setCravings] = useState<number>(0);
  const [cigarettesAvoided, setCigarettesAvoided] = useState<number>(0);
  
  // Enhanced health metrics
  const [focusLevel, setFocusLevel] = useState<number>(5);
  const [sleepQuality, setSleepQuality] = useState<number>(5);
  const [sleepDuration, setSleepDuration] = useState<number>(7);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [stressLevel, setStressLevel] = useState<number>(5);
  const [exerciseDuration, setExerciseDuration] = useState<number>(0);
  const [stepCount, setStepCount] = useState<number>(0);
  const [waterIntake, setWaterIntake] = useState<number>(0);
  
  // Sharing functionality
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [shareMessage, setShareMessage] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>("twitter");
  const [isSharing, setIsSharing] = useState<boolean>(false);
  
  // UI state
  const [showMoreMetrics, setShowMoreMetrics] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [activeView, setActiveView] = useState('timeline');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [healthImprovements, setHealthImprovements] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [shareItem, setShareItem] = useState<any>(null);
  const [showSocialShareDialog, setShowSocialShareDialog] = useState(false);
  const [progressShareData, setProgressShareData] = useState<ProgressShareData | null>(null);

  // Example achievements - in a real app, these would be fetched from the database
  const allAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Day Fresh',
      description: 'Completed your first day smoke-free',
      earned: true,
      date: '2023-05-10',
      icon: <Award className="h-8 w-8 text-amber-500" />,
      level: 'bronze',
      shareImage: '/achievements/first-day-fresh.png'
    },
    {
      id: '2',
      title: 'Week of Wellness',
      description: 'Stayed smoke-free for a full week',
      earned: true,
      date: '2023-05-17',
      icon: <Award className="h-8 w-8 text-zinc-400" />,
      level: 'silver',
      shareImage: '/achievements/week-wellness.png'
    },
    {
      id: '3',
      title: 'Month Milestone',
      description: 'Completed a full month smoke-free',
      earned: true,
      date: '2023-06-10',
      icon: <Award className="h-8 w-8 text-yellow-500" />,
      level: 'gold',
      shareImage: '/achievements/month-milestone.png'
    },
    {
      id: '4',
      title: 'Oxygen Master',
      description: 'Improved oxygen levels significantly',
      earned: true,
      date: '2023-05-11',
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      level: 'bronze',
      shareImage: '/achievements/oxygen-master.png'
    },
    {
      id: '5',
      title: 'Money Saver',
      description: 'Saved $100 by not smoking',
      earned: true,
      date: '2023-05-25',
      icon: <CircleDollarSign className="h-8 w-8 text-green-500" />,
      level: 'silver',
      shareImage: '/achievements/money-saver.png'
    },
    {
      id: '6',
      title: 'Craving Crusher',
      description: 'Successfully managed 50 cravings',
      earned: false,
      progress: 68,
      icon: <Activity className="h-8 w-8 text-red-500" />,
      level: 'gold',
      shareImage: '/achievements/craving-crusher.png'
    },
    {
      id: '7',
      title: 'Breathing Better',
      description: 'Lung function has improved by 10%',
      earned: false,
      progress: 83,
      icon: <Heart className="h-8 w-8 text-purple-500" />,
      level: 'silver',
      shareImage: '/achievements/breathing-better.png'
    },
    {
      id: '8',
      title: 'One Year Fresh',
      description: 'Completed a full year smoke-free',
      earned: false,
      progress: 28,
      icon: <Award className="h-8 w-8 text-indigo-500" />,
      level: 'platinum',
      shareImage: '/achievements/year-fresh.png'
    }
  ];

  useEffect(() => {
    loadProgressData();
    if (session?.user?.id) {
      loadUserProgress();
      loadHealthImprovements();
    }
  }, [session, date, dateRange, currentDate]);

  const loadProgressData = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      // Get start date 30 days ago for the progress data
      const startDate = format(addDays(new Date(), -30), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');
      
      const data = await getUserProgress(session.user.id, startDate, endDate, session);
      if (data && Array.isArray(data.progressEntries)) {
        // Convert to ProgressEntry[] array type that setState expects
        setProgressData(data.progressEntries as unknown as ProgressEntry[]);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!session?.user?.id) return;

    try {
      // Calculate date range based on selected view
      let startDate, endDate;
      const today = new Date();
      
      switch (dateRange) {
        case 'week':
          startDate = format(startOfWeek(currentDate), 'yyyy-MM-dd');
          endDate = format(endOfWeek(currentDate), 'yyyy-MM-dd');
          break;
        case 'month':
          startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
          endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
          break;
        case 'year':
          const startYear = new Date(currentDate.getFullYear(), 0, 1);
          const endYear = new Date(currentDate.getFullYear(), 11, 31);
          startDate = format(startYear, 'yyyy-MM-dd');
          endDate = format(endYear, 'yyyy-MM-dd');
          break;
        default:
          startDate = format(startOfWeek(today), 'yyyy-MM-dd');
          endDate = format(endOfWeek(today), 'yyyy-MM-dd');
      }
      
      const userProgressResponse = await getUserProgress(session.user.id, startDate, endDate, session);
      if (userProgressResponse && Array.isArray(userProgressResponse.progressEntries)) {
        setProgressData(userProgressResponse.progressEntries);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
      toast.error('Failed to load progress data');
    }
  };

  const loadHealthImprovements = async () => {
    if (!session?.user?.id) return;

    try {
      // Assume quit date is 30 days ago for demo
      const quitDate = new Date();
      quitDate.setDate(quitDate.getDate() - 30);
      const formattedQuitDate = format(quitDate, 'yyyy-MM-dd');
      
      const improvements = await getHealthImprovements(
        session.user.id,
        formattedQuitDate,
        session
      );
      
      setHealthImprovements(improvements || []);
    } catch (error) {
      console.error('Failed to load health improvements:', error);
      toast.error('Failed to load health improvements');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('You must be logged in to save progress');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const entryData = {
        user_id: session.user.id,
        date: format(date, 'yyyy-MM-dd'),
        cravings,
        cigarettes_avoided: cigarettesAvoided,
        energy_level: energyLevel,
        mood_score: mood,
        focus_level: focusLevel,
        sleep_quality: sleepQuality,
        sleep_duration: sleepDuration,
        physical_symptoms: selectedSymptoms,
        stress_level: stressLevel,
        exercise_duration: exerciseDuration,
        step_count: stepCount,
        water_intake: waterIntake,
        smoke_free: cigarettesAvoided > 0 // If they avoided cigarettes, they were smoke-free
      };
      
      await addProgressEntry(entryData, session);
      
      toast.success('Progress entry saved successfully');
      
      // Refresh data
      loadProgressData();
      
      // Auto-generate share message
      const autoMessage = `I've been ${cigarettesAvoided > 0 ? `smoke-free for another day, avoiding ${cigarettesAvoided} cigarettes` : 'making progress on my health journey'}! My energy level is ${energyLevel}/10. #MissionFresh #HealthyChoices`;
      setShareMessage(autoMessage);
      
      // Reset form
      setCravings(0);
      setCigarettesAvoided(0);
      setEnergyLevel(5);
      setMood('neutral');
      setFocusLevel(5);
      setSleepQuality(5);
      setSleepDuration(7);
      setSelectedSymptoms([]);
      setStressLevel(5);
      setExerciseDuration(0);
      setStepCount(0);
      setWaterIntake(0);
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareProgress = async () => {
    setIsSharing(true);
    try {
      if (session?.user?.id) {
        // Get the latest progress data to share
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        
        const userProgressResponse = await getUserProgress(
          session.user.id,
          startDate,
          endDate,
          session
        );
        
        if (userProgressResponse && Array.isArray(userProgressResponse.progressEntries) && userProgressResponse.progressEntries.length > 0) {
          // Create a comprehensive share item with meaningful data
          const daysSmokeFree = progressData.filter(entry => entry.smoke_free).length;
          const cigarettesAvoided = progressData.reduce((total, entry) => total + (entry?.cigarettes_avoided || 0), 0);
          const moneySaved = (userProgressResponse.totalSavings || 0).toFixed(2);
          const healthScore = userProgressResponse.healthScore || 0;
          const smokeFreeStreak = userProgressResponse.smokeFreeStreak || 0;
          
          // Create a more engaging share message
          const achievements = healthImprovements.filter(imp => imp.achieved).length;
          const milestones = healthImprovements.length;
          
          // Format a more engaging share message with emojis for better visual appeal
          const shareTitle = smokeFreeStreak > 0 
            ? `🎯 ${smokeFreeStreak} Day Streak: My Fresh Journey!` 
            : "🌱 My Progress on Mission Fresh";
            
          let shareDescription = `In the last ${daysSmokeFree} days smoke-free, I've avoided ${cigarettesAvoided} cigarettes`;
          
          if (parseFloat(moneySaved) > 0) {
            shareDescription += ` and saved $${moneySaved} 💰`;
          }
          
          if (achievements > 0) {
            shareDescription += `. I've unlocked ${achievements}/${milestones} health milestones 🏆`;
          }
          
          shareDescription += `. My health score is now ${healthScore}%! #MissionFresh #StayingFresh`;
          
          // Create a more detailed share item with additional metrics
          const shareItem = {
            title: shareTitle,
            description: shareDescription,
            type: 'progress',
            id: 'progress-summary',
            shareUrl: `${window.location.origin}/share/${session.user.id}/progress`,
            healthScore,
            daysSmokeFree,
            cigarettesAvoided,
            moneySaved,
            smokeFreeStreak
          };
          
          // Create progressShareData for enhanced sharing
          const progressShareData: ProgressShareData = {
            title: shareTitle,
            message: shareDescription,
            periodId: 'latest', // Use latest since we're sharing overall progress
            stats: {
              daysSmokeFree,
              cigarettesAvoided,
              moneySaved: parseFloat(moneySaved),
              healthScore
            }
          };
          
          // Store for potential direct platform sharing
          setProgressShareData(progressShareData);
          
          // Set standard share item for the dialog
          setShareItem(shareItem);
          setShareMessage(shareDescription);
          setShowSocialShareDialog(true);
          
          // Log the share attempt
          logSocialShare(session.user.id, 'progress', 'dialog_open', session);
        } else {
          toast.error('No progress data available to share.');
        }
      } else {
        toast.error('You must be logged in to share your progress.');
      }
    } catch (error) {
      console.error('Failed to prepare progress for sharing:', error);
      toast.error('Failed to share progress. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link has been copied to clipboard.');
  };

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  // Transform data for charts
  const chartData = progressData.map(entry => ({
    date: entry.date,
    cravings: entry?.cravings || 0,
    cigarettesAvoided: entry?.cigarettes_avoided || 0,
    energyLevel: entry.energy_level || 0,
    focusLevel: entry.focus_level || 0,
    sleepQuality: entry?.sleep_quality || 0,
    sleepDuration: entry?.sleep_duration || 0,
    stressLevel: entry?.stress_level || 0,
    exerciseDuration: entry?.exercise_duration || 0,
    stepCount: entry?.step_count || 0,
    waterIntake: entry?.water_intake || 0,
    mood: entry?.mood_score || 'neutral'
  })).reverse(); // Reverse to show oldest to newest

  // Data for radar chart (comparing progress metrics)
  const recentEntry = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const radarData = recentEntry ? [
    { subject: 'Energy', A: recentEntry.energyLevel / 10 * 100 },
    { subject: 'Focus', A: recentEntry.focusLevel / 10 * 100 },
    { subject: 'Sleep', A: recentEntry.sleepQuality / 10 * 100 },
    { subject: 'Stress', A: (10 - recentEntry.stressLevel) / 10 * 100 }, // Invert (lower stress is better)
    { subject: 'Exercise', A: Math.min(recentEntry.exerciseDuration / 60 * 100, 100) }, // Max at 60 mins
    { subject: 'Water', A: Math.min(recentEntry.waterIntake / 8 * 100, 100) }, // Max at 8 glasses
  ] : [];

  // For pie chart - symptom distribution
  const symptomCounts: Record<string, number> = {};
  progressData.forEach(entry => {
    if (entry?.physical_symptoms && entry?.physical_symptoms.length > 0) {
      entry?.physical_symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    }
  });
  
  const symptomPieData = Object.entries(symptomCounts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const handlePreviousPeriod = () => {
    if (dateRange === 'week') {
      setCurrentDate(addWeeks(currentDate, -1));
    } else if (dateRange === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate()));
    }
  };

  const handleNextPeriod = () => {
    if (dateRange === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (dateRange === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()));
    }
  };

  const handleShareAchievement = (achievement: Achievement) => {
    const shareData = {
      title: achievement.title,
      description: achievement.description,
      imageUrl: achievement.shareImage,
      achievementId: achievement.id
    };
    
    setShareItem(shareData);
  };

  // Render achievement badges
  const renderAchievementsList = () => {
    // Group achievements by earned status
    const earnedAchievements = achievements.filter(a => a.earned);
    const inProgressAchievements = achievements.filter(a => !a.earned);
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="font-medium text-lg mb-4">Earned Achievements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedAchievements.map(achievement => (
              <Card key={achievement.id} className={`
                border-${achievement.level === 'bronze' 
                  ? 'amber-500/30' 
                  : achievement.level === 'silver' 
                  ? 'gray-400/30' 
                  : achievement.level === 'gold' 
                  ? 'yellow-500/30' 
                  : 'indigo-500/30'} 
                hover:shadow-md transition-shadow
              `}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge 
                        className={`
                          ${achievement.level === 'bronze' 
                            ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' 
                            : achievement.level === 'silver' 
                            ? 'bg-gray-300/10 text-gray-600 border-gray-400/30' 
                            : achievement.level === 'gold' 
                            ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' 
                            : 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30'}
                        `}
                      >
                        {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleShareAchievement(achievement)}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-center py-4">
                  <div className="mb-4">
                    {achievement.icon}
                  </div>
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned on {format(new Date(achievement.date), 'MMMM d, yyyy')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-lg mb-4">Achievements In Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAchievements.map(achievement => (
              <Card key={achievement.id} className="border-gray-200 bg-gray-50/50 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge 
                      variant="outline" 
                      className={`
                        ${achievement.level === 'bronze' 
                          ? 'bg-amber-500/5 text-amber-700/50 border-amber-500/20' 
                          : achievement.level === 'silver' 
                          ? 'bg-gray-300/5 text-gray-600/50 border-gray-400/20' 
                          : achievement.level === 'gold' 
                          ? 'bg-yellow-500/5 text-yellow-700/50 border-yellow-500/20' 
                          : 'bg-indigo-500/5 text-indigo-700/50 border-indigo-500/20'}
                      `}
                    >
                      {achievement.level.charAt(0).toUpperCase() + achievement.level.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-center py-4">
                  <div className="mb-4 opacity-40">
                    {achievement.icon}
                  </div>
                  <h3 className="font-medium text-gray-600">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.progress !== undefined && (
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 ${
                            achievement.level === 'bronze' 
                              ? 'bg-amber-500' 
                              : achievement.level === 'silver' 
                              ? 'bg-gray-400' 
                              : achievement.level === 'gold' 
                              ? 'bg-yellow-500' 
                              : 'bg-indigo-500'
                          } rounded-full`}
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-right text-muted-foreground mt-1">
                        {achievement.progress}% complete
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const logSocialShare = async (
    userId: string, 
    contentType: string, 
    platform: string, 
    session: Session | null
  ) => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/mission4_social_share_analytics`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          content_type: contentType,
          platform,
          share_date: new Date().toISOString(),
          engagement_clicks: 0,
          engagement_likes: 0,
          engagement_shares: 0
        })
      });
    } catch (error) {
      console.error('Failed to log social share analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Progress Tracking</h1>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={handleShareProgress}
          disabled={isSharing}
        >
          {isSharing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Sharing...
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 mr-2" />
              Share Progress
            </>
          )}
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-4 sm:mb-8">
          <TabsTrigger value="tracking">Track Today</TabsTrigger>
          <TabsTrigger value="history">View History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tracking" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-2 sm:pb-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <CalendarDays className="mr-2 h-5 w-5" />
                Track Your Progress
              </CardTitle>
              <CardDescription>
                Record your daily fresh journey progress and how you're feeling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cravings">Cravings Experienced</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCravings(Math.max(0, cravings - 1))}
                    disabled={isSubmitting || cravings === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{cravings}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCravings(cravings + 1)}
                    disabled={isSubmitting}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cigarettes">Cigarettes Avoided</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCigarettesAvoided(Math.max(0, cigarettesAvoided - 1))}
                    disabled={isSubmitting || cigarettesAvoided === 0}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{cigarettesAvoided}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setCigarettesAvoided(cigarettesAvoided + 1)}
                    disabled={isSubmitting}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="energy">Energy Level (1-10)</Label>
                <div className="flex items-center space-x-4">
                  <Battery className="h-5 w-5 text-gray-500" />
                  <Slider
                    value={[energyLevel]}
                    onValueChange={(value) => setEnergyLevel(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    disabled={isSubmitting}
                  />
                  <span className="w-8 text-center">{energyLevel}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mood">Overall Mood</Label>
                <Select
                  value={mood}
                  onValueChange={(value) => setMood(value as MoodOption)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {moodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center">
                          <span className="mr-2">{option.emoji}</span>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="more-metrics" className="text-sm font-medium">
                  Track more health metrics
                </Label>
                <Switch
                  id="more-metrics"
                  checked={showMoreMetrics}
                  onCheckedChange={setShowMoreMetrics}
                  disabled={isSubmitting}
                />
              </div>
              
              {showMoreMetrics && (
                <div className="space-y-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="focus">Focus Level (1-10)</Label>
                    <div className="flex items-center space-x-4">
                      <BrainCircuit className="h-5 w-5 text-gray-500" />
                      <Slider
                        value={[focusLevel]}
                        onValueChange={(value) => setFocusLevel(value[0])}
                        min={1}
                        max={10}
                        step={1}
                        disabled={isSubmitting}
                      />
                      <span className="w-8 text-center">{focusLevel}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sleep-quality">Sleep Quality (1-10)</Label>
                    <div className="flex items-center space-x-4">
                      <Moon className="h-5 w-5 text-gray-500" />
                      <Slider
                        value={[sleepQuality]}
                        onValueChange={(value) => setSleepQuality(value[0])}
                        min={1}
                        max={10}
                        step={1}
                        disabled={isSubmitting}
                      />
                      <span className="w-8 text-center">{sleepQuality}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sleep-duration">Sleep Duration (hours)</Label>
                    <div className="flex items-center space-x-4">
                      <Moon className="h-5 w-5 text-gray-500" />
                      <Slider
                        value={[sleepDuration]}
                        onValueChange={(value) => setSleepDuration(value[0])}
                        min={1}
                        max={12}
                        step={0.5}
                        disabled={isSubmitting}
                      />
                      <span className="w-8 text-center">{sleepDuration}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stress">Stress Level (1-10)</Label>
                    <div className="flex items-center space-x-4">
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                      <Slider
                        value={[stressLevel]}
                        onValueChange={(value) => setStressLevel(value[0])}
                        min={1}
                        max={10}
                        step={1}
                        disabled={isSubmitting}
                      />
                      <span className="w-8 text-center">{stressLevel}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="exercise">Exercise Duration (minutes)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Label htmlFor="exercise" className="w-3/4">Minutes</Label>
                        <Input
                          type="number"
                          value={exerciseDuration}
                          onChange={(e) => setExerciseDuration(parseInt(e.target.value) || 0)}
                          min={0}
                          max={300}
                          className="w-1/4"
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <Label htmlFor="steps" className="w-3/4">Steps</Label>
                        <Input
                          type="number"
                          value={stepCount}
                          onChange={(e) => setStepCount(parseInt(e.target.value) || 0)}
                          min={0}
                          className="w-1/4"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="water">Water Intake (glasses)</Label>
                    <div className="flex items-center space-x-4">
                      <Droplets className="h-5 w-5 text-gray-500" />
                      <Slider
                        value={[waterIntake]}
                        onValueChange={(value) => setWaterIntake(value[0])}
                        min={0}
                        max={12}
                        step={1}
                        disabled={isSubmitting}
                      />
                      <span className="w-8 text-center">{waterIntake}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Physical Symptoms</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {physicalSymptoms.map((symptom) => (
                        <div key={symptom} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`symptom-${symptom}`}
                            checked={selectedSymptoms.includes(symptom)}
                            onCheckedChange={() => toggleSymptom(symptom)}
                            disabled={isSubmitting}
                          />
                          <label 
                            htmlFor={`symptom-${symptom}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {symptom}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Saving...' : 'Save Progress'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-2 sm:pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <BrainCircuit className="mr-2 h-5 w-5" />
                  Progress History
                </CardTitle>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleShareProgress}
                  className="ml-auto hidden sm:flex"
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Progress
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                View your fresh journey over time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
                <Select
                  value={viewMode}
                  onValueChange={(value) => setViewMode(value as 'single' | 'compare')}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="View Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Metrics</SelectItem>
                    <SelectItem value="compare">Compare All</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Select
                    value={dateRange}
                    onValueChange={(value) => setDateRange(value as 'week' | 'month' | 'year')}
                  >
                    <SelectTrigger className="w-full sm:w-[120px]">
                      <SelectValue placeholder="Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handlePreviousPeriod}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      {dateRange === 'week' ? (
                        `Week of ${format(startOfWeek(currentDate), 'MMM d')}`
                      ) : dateRange === 'month' ? (
                        format(currentDate, 'MMMM yyyy')
                      ) : (
                        format(currentDate, 'yyyy')
                      )}
                    </span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleNextPeriod}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : chartData.length > 0 ? (
                viewMode === 'single' ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Cravings vs. Cigarettes Avoided</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => {
                                const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                                return isNaN(numValue) 
                                  ? [String(value), name] 
                                  : [numValue.toFixed(1), name === 'cravings' ? 'Cravings' : 'Cigarettes Avoided'];
                              }}
                              labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="cravings" 
                              stroke="#ef4444" 
                              name="Cravings" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="cigarettesAvoided" 
                              stroke="#22c55e" 
                              name="Cigarettes Avoided"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Energy & Focus Levels</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis domain={[0, 10]} />
                            <Tooltip 
                              formatter={(value, name) => {
                                const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                                return isNaN(numValue) 
                                  ? [String(value), name] 
                                  : [numValue.toFixed(1), name === 'cravings' ? 'Cravings' : 'Cigarettes Avoided'];
                              }}
                              labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="energyLevel" 
                              stroke="#3b82f6" 
                              name="Energy" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="focusLevel" 
                              stroke="#8b5cf6" 
                              name="Focus"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Sleep Quality & Duration</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis yAxisId="left" domain={[0, 10]} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 12]} />
                            <Tooltip 
                              formatter={(value, name) => {
                                const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                                return isNaN(numValue) 
                                  ? [String(value), name] 
                                  : [numValue.toFixed(1), name === 'cravings' ? 'Cravings' : 'Cigarettes Avoided'];
                              }}
                              labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend />
                            <Line 
                              yAxisId="left"
                              type="monotone" 
                              dataKey="sleepQuality" 
                              stroke="#ec4899" 
                              name="Quality" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                            <Line 
                              yAxisId="right"
                              type="monotone" 
                              dataKey="sleepDuration" 
                              stroke="#8b5cf6" 
                              name="Duration"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Show symptom distribution if there's data */}
                    {symptomPieData.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Symptom Distribution</h3>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={symptomPieData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {symptomPieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value, name) => {
                                  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                                  return isNaN(numValue) 
                                    ? [String(value), name] 
                                    : [numValue.toFixed(1), name === 'cravings' ? 'Cravings' : 'Cigarettes Avoided'];
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Comparison view - Radar Chart
                  (<div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Health Metrics Overview</h3>
                      <p className="text-sm text-muted-foreground">
                        This radar chart shows how your key health metrics compare to each other
                      </p>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Today" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Tooltip 
                              formatter={(value, name) => {
                                const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                                return isNaN(numValue) 
                                  ? [String(value), name] 
                                  : [numValue.toFixed(1), name === 'cravings' ? 'Cravings' : 'Cigarettes Avoided'];
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>)
                )
              ) : (
                <div className="text-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No progress data yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Start tracking your progress to see your journey here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Add a mobile-friendly share button at the bottom */}
          <div className="flex sm:hidden justify-center">
            <Button 
              onClick={handleShareProgress}
              className="w-full"
              disabled={isSharing}
            >
              {isSharing ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              ) : (
                <Share2 className="h-4 w-4 mr-2" />
              )}
              Share Your Progress
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      {/* Mobile-optimized social share sheet */}
      <Sheet open={shareOpen} onOpenChange={setShareOpen}>
        <SheetContent className="sm:max-w-md px-4 sm:px-6">
          <SheetHeader className="mb-4 sm:mb-6">
            <SheetTitle className="text-xl">Share Your Progress</SheetTitle>
            <SheetDescription>
              Share your fresh journey with friends and family to get more support.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-sm font-medium block mb-2">Choose Platform</Label>
              <RadioGroup 
                value={selectedPlatform} 
                onValueChange={(value) => setSelectedPlatform(value as SocialPlatform)}
                className="grid grid-cols-2 sm:flex sm:space-x-4 gap-2 sm:gap-0"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="twitter" id="twitter" />
                  <Label htmlFor="twitter" className="flex items-center">
                    <Twitter className="h-4 w-4 mr-1" />
                    Twitter
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="facebook" id="facebook" />
                  <Label htmlFor="facebook" className="flex items-center">
                    <Facebook className="h-4 w-4 mr-1" />
                    Facebook
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instagram" id="instagram" />
                  <Label htmlFor="instagram" className="flex items-center">
                    <Instagram className="h-4 w-4 mr-1" />
                    Instagram
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium block">Your Message</Label>
              <Textarea
                id="message"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Share your thoughts on your progress..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The hashtags #MissionFresh and #HealthyChoices will be added to your post.
              </p>
            </div>
            
            {shareUrl && (
              <div className="space-y-2 pt-4 border-t">
                <Label className="text-sm font-medium block">Share Link</Label>
                <div className="flex items-center">
                  <Input value={shareUrl} readOnly className="flex-1 mr-2 text-xs sm:text-sm" />
                  <Button size="sm" variant="outline" onClick={copyShareLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4 mt-4 sm:mt-6 border-t">
              <Button variant="outline" onClick={() => setShareOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShareProgress} disabled={isSharing}>
                {isSharing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* Render share modal */}
      {shareItem && showSocialShareDialog && (
        <SocialShareDialog
          item={shareItem}
          trigger={null}
          onClose={() => setShowSocialShareDialog(false)}
          onShare={(platform) => {
            // Use our enhanced social sharing if we have progressShareData
            if (progressShareData && session?.user?.id) {
              if (platform === 'whatsapp') {
                // Direct platform sharing for WhatsApp
                const success = shareToSocialPlatform('whatsapp', progressShareData);
                if (success) {
                  toast.success(`Shared to WhatsApp!`);
                } else {
                  toast.error(`Failed to share to WhatsApp.`);
                }
              } else if (['twitter', 'facebook', 'linkedIn'].includes(platform)) {
                // For other platforms, use direct links when available
                const mappedPlatform = platform === 'linkedIn' ? 'linkedin' : platform;
                const success = shareToSocialPlatform(
                  mappedPlatform as 'twitter' | 'facebook' | 'linkedin' | 'whatsapp',
                  progressShareData
                );
                if (success) {
                  toast.success(`Shared to ${platform}!`);
                }
              } else {
                // Use enhanced progress sharing for other cases
                shareProgress(progressShareData)
                  .then(success => {
                    if (success) {
                      toast.success(`Shared successfully!`);
                    } else {
                      toast.error(`Share failed. Please try again.`);
                    }
                  });
              }
              
              // Record analytics for the share
              logSocialShare(session.user.id, 'progress', platform, session);
            } else {
              // Fallback to old method if progressShareData is not available
              toast.success(`Shared to ${platform}!`);
              
              // Record analytics for the share
              if (session?.user?.id) {
                logSocialShare(session.user.id, 'progress', platform, session);
              }
            }
            
            setShowSocialShareDialog(false);
          }}
        />
      )}
    </div>
  );
};
