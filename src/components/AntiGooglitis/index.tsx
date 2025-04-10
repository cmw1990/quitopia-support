import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  AlertTriangle,
  Brain,
  Clock,
  Calendar,
  CheckCircle,
  Shield,
  Activity,
  X,
  Trash,
  AlarmClock,
  BarChart,
  LineChart,
  Zap,
  Globe,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';

// Format time remaining for display
const formatTimeRemaining = (seconds: number): string => {
  if (!seconds && seconds !== 0) return "00:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Define pattern analysis type for Deep Work mode
interface PatternAnalysis {
  peakDistractionTimes: string[];
  recommendedBlockTimes: string[];
  mostProductiveDay: string;
  distractionTriggers: string[];
}

// Add type for Deep Work achievements and statistics
interface DeepWorkStats {
  totalSessions: number;
  totalMinutes: number;
  longestSession: number;
  avgSessionLength: number;
  completionRate: number;
  lastCompletedTimestamp?: string;
  currentStreak: number;
  achievements: DeepWorkAchievement[];
}

interface DeepWorkAchievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedTimestamp?: string;
  progress: number;
  goal: number;
  icon: string;
}

// Add Digital Wellness models and types
interface DigitalWellnessScore {
  overall: number;
  balance: number;
  mindfulness: number;
  healthyHabits: number;
  weeklyTrend: number[];
}

interface WellnessRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'balance' | 'mindfulness' | 'habits' | 'productivity';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeMin: number;
  impact: number;
}

// Schedule Blocking Component
const ScheduledBlockingSection: React.FC<{
  schedules: any[];
  onAddSchedule: (schedule: any) => void;
  onRemoveSchedule: (id: string) => void;
  onToggleSchedule: (id: string, enabled: boolean) => void;
}> = ({ schedules, onAddSchedule, onRemoveSchedule, onToggleSchedule }) => {
  const [newSchedule, setNewSchedule] = useState({
    startTime: '09:00',
    endTime: '17:00',
    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    blockLevel: 'moderate' as 'light' | 'moderate' | 'strict',
    name: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' },
  ];

  const handleToggleDay = (day: string) => {
    if (newSchedule.daysOfWeek.includes(day)) {
      setNewSchedule({
        ...newSchedule,
        daysOfWeek: newSchedule.daysOfWeek.filter(d => d !== day)
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        daysOfWeek: [...newSchedule.daysOfWeek, day]
      });
    }
  };

  const handleAddSchedule = () => {
    if (!newSchedule.name.trim()) {
      toast.error('Please provide a name for this schedule');
      return;
    }

    if (newSchedule.startTime >= newSchedule.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (newSchedule.daysOfWeek.length === 0) {
      toast.error('Please select at least one day of the week');
      return;
    }

    onAddSchedule({
      ...newSchedule,
      id: new Date().getTime().toString(),
      enabled: true,
    });

    setNewSchedule({
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      blockLevel: 'moderate',
      name: '',
    });

    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Scheduled Blocking</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Schedule'}
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Set up automated blocking schedules to help maintain focus during specific times.
      </div>
      
      {/* Add new schedule form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">New Blocking Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-name">Schedule Name</Label>
                  <Input 
                    id="schedule-name" 
                    placeholder="e.g., Work Hours, Study Time" 
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input 
                      id="start-time" 
                      type="time" 
                      value={newSchedule.startTime}
                      onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input 
                      id="end-time" 
                      type="time" 
                      value={newSchedule.endTime}
                      onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleToggleDay(day.id)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          newSchedule.daysOfWeek.includes(day.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="block-level">Blocking Level</Label>
                  <Select
                    value={newSchedule.blockLevel}
                    onValueChange={(value: 'light' | 'moderate' | 'strict') => 
                      setNewSchedule({...newSchedule, blockLevel: value})
                    }
                  >
                    <SelectTrigger id="block-level">
                      <SelectValue placeholder="Select blocking level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light (Block most distracting sites)</SelectItem>
                      <SelectItem value="moderate">Moderate (Block most non-work sites)</SelectItem>
                      <SelectItem value="strict">Strict (Allow only essential work sites)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleAddSchedule}
                >
                  Add Schedule
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Schedule list */}
      {schedules.length > 0 ? (
        <div className="space-y-2">
          {schedules.map(schedule => (
            <Card key={schedule.id} className={`border ${schedule.enabled ? 'border-primary/20' : 'border-muted'}`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlarmClock className={`h-4 w-4 ${schedule.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    <CardTitle className="text-base">{schedule.name}</CardTitle>
                  </div>
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={(checked) => onToggleSchedule(schedule.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <p>{schedule.startTime} - {schedule.endTime}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <p className="capitalize">
                        {schedule.daysOfWeek.map((day: string) => day.slice(0, 3)).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5" />
                      <p className="capitalize">{schedule.blockLevel} blocking</p>
                    </div>
                    {schedule.enabled && (
                      <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive hover:text-destructive"
                  onClick={() => onRemoveSchedule(schedule.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>You don't have any scheduled blocking times yet.</p>
          <p>Click "Add Schedule" to set up automated blocking during specific times.</p>
        </div>
      )}
    </div>
  );
};

export function AntiGooglitis() {
  useAuth(); // Initialize auth without destructuring unused variables
  const [activeTab, setActiveTab] = useState("overview");
  
  // Block settings state
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(false);
  const [blockLevel, setBlockLevel] = useState<'light' | 'moderate' | 'strict'>('moderate');
  const [blockedSites, setBlockedSites] = useState<string[]>([
    'facebook.com', 'twitter.com', 'reddit.com', 'youtube.com', 'instagram.com'
  ]);
  const [newSite, setNewSite] = useState('');
  
  // Digital wellness state
  const [wellnessScore, setWellnessScore] = useState<DigitalWellnessScore>({
    overall: 68,
    balance: 72,
    mindfulness: 64,
    healthyHabits: 58,
    weeklyTrend: [62, 65, 63, 70, 68, 66, 68]
  });
  const [dailySearches, setDailySearches] = useState(24);
  const [distractionRate, setDistractionRate] = useState(42);
  
  // Search pattern tracking state
  const [searchPatterns, setSearchPatterns] = useState([
    { pattern: 'how to focus better', category: 'research', occurrences: 8 },
    { pattern: 'social media news', category: 'distraction', occurrences: 15 },
    { pattern: 'reddit funny posts', category: 'distraction', occurrences: 12 },
    { pattern: 'productivity tips', category: 'research', occurrences: 5 },
  ]);
  
  // Deep Work mode
  const [deepWorkEnabled, setDeepWorkEnabled] = useState(false);
  const [deepWorkDuration, setDeepWorkDuration] = useState(60); // minutes
  const [deepWorkProgress, setDeepWorkProgress] = useState(0);
  const [deepWorkActive, setDeepWorkActive] = useState(false);
  const [deepWorkTimer, setDeepWorkTimer] = useState<NodeJS.Timeout | null>(null);
  const [deepWorkTimeRemaining, setDeepWorkTimeRemaining] = useState(60 * 60); // seconds
  
  // Wellness recommendations
  const [recommendations, setRecommendations] = useState<WellnessRecommendation[]>([
    {
      id: '1',
      title: 'Schedule focused work blocks',
      description: 'Set aside 2-hour chunks of time for deep work without distractions',
      category: 'productivity',
      difficulty: 'medium',
      estimatedTimeMin: 120,
      impact: 8
    },
    {
      id: '2',
      title: 'Take regular screen breaks',
      description: 'Take a 5-minute break from screens every hour to reduce eye strain and mental fatigue',
      category: 'balance',
      difficulty: 'easy',
      estimatedTimeMin: 5,
      impact: 6
    },
    {
      id: '3',
      title: 'Set a daily search limit',
      description: 'Limit yourself to a specific number of searches per day to reduce information overload',
      category: 'habits',
      difficulty: 'hard',
      estimatedTimeMin: 0,
      impact: 9
    }
  ]);
  
  // Pattern analysis for optimized deep work sessions
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis>({
    peakDistractionTimes: ['2:00 PM', '4:30 PM', '7:15 PM'],
    recommendedBlockTimes: ['9:00 AM', '11:30 AM', '8:00 PM'],
    mostProductiveDay: 'Tuesday',
    distractionTriggers: ['Email notifications', 'Social media', 'News sites']
  });
  
  // Deep Work stats
  const [deepWorkStats, setDeepWorkStats] = useState<DeepWorkStats>({
    totalSessions: 12,
    totalMinutes: 720,
    longestSession: 105,
    avgSessionLength: 60,
    completionRate: 0.75,
    lastCompletedTimestamp: new Date().toISOString(),
    currentStreak: 3,
    achievements: [
      {
        id: '1',
        name: 'Focus Initiate',
        description: 'Complete 5 deep work sessions',
        completed: true,
        completedTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        progress: 5,
        goal: 5,
        icon: 'award'
      },
      {
        id: '2',
        name: 'Consistency Master',
        description: 'Maintain a 5-day deep work streak',
        completed: false,
        progress: 3,
        goal: 5,
        icon: 'flame'
      },
      {
        id: '3',
        name: 'Distraction Slayer',
        description: 'Block 100 distractions during deep work',
        completed: false,
        progress: 78,
        goal: 100,
        icon: 'shield'
      }
    ]
  });
  
  // Add this new state for scheduled blocking
  const [schedules, setSchedules] = useState<any[]>([
    {
      id: '1',
      name: 'Work Hours',
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      blockLevel: 'moderate',
      enabled: true
    },
    {
      id: '2',
      name: 'Study Time',
      startTime: '19:00',
      endTime: '21:00',
      daysOfWeek: ['monday', 'wednesday', 'friday'],
      blockLevel: 'strict',
      enabled: false
    }
  ]);
  
  // Toggle blocking
  const toggleBlocking = () => {
    setIsBlockingEnabled(!isBlockingEnabled);
    toast.success(isBlockingEnabled ? "Website blocking disabled" : "Website blocking enabled");
  };
  
  // Add a new site to block list
  const addBlockedSite = () => {
    if (!newSite) return;
    
    if (!blockedSites.includes(newSite)) {
      setBlockedSites([...blockedSites, newSite]);
      toast.success(`Added ${newSite} to blocked sites`);
      } else {
      toast.error(`${newSite} is already in your blocked list`);
    }
    setNewSite('');
  };
  
  // Remove site from block list
  const removeSite = (site: string) => {
    setBlockedSites(blockedSites.filter(s => s !== site));
    toast.success(`Removed ${site} from blocked sites`);
  };
  
  // Toggle Deep Work mode
  const toggleDeepWork = () => {
    setDeepWorkEnabled(!deepWorkEnabled);
    setDeepWorkActive(false);
    setDeepWorkProgress(0);
    
    if (deepWorkTimer) {
      clearInterval(deepWorkTimer);
      setDeepWorkTimer(null);
    }
    
    if (!deepWorkEnabled) {
      toast.success("Deep Work mode enabled");
    } else {
      toast.info("Deep Work mode disabled");
    }
  };
  
  // Start Deep Work session
  const startDeepWork = () => {
    if (!deepWorkEnabled) return;
    
    setDeepWorkActive(true);
    setDeepWorkProgress(0);
    setDeepWorkTimeRemaining(deepWorkDuration * 60);
    
    const timer = setInterval(() => {
      setDeepWorkTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setDeepWorkActive(false);
          setDeepWorkProgress(100);
          completeDeepWorkSession();
          return 0;
        }
        
        const newRemaining = prev - 1;
        setDeepWorkProgress((1 - newRemaining / (deepWorkDuration * 60)) * 100);
        return newRemaining;
      });
    }, 1000);
    
    setDeepWorkTimer(timer);
    toast.success(`Starting ${deepWorkDuration} minute Deep Work session`);
  };
  
  // Complete Deep Work session
  const completeDeepWorkSession = () => {
    // Would normally save to database
    toast.success("Deep Work session completed!");
    
    // Update stats
    setDeepWorkStats(prev => ({
      ...prev,
      totalSessions: prev.totalSessions + 1,
      totalMinutes: prev.totalMinutes + deepWorkDuration,
      completionRate: (prev.completionRate * prev.totalSessions + 1) / (prev.totalSessions + 1),
      currentStreak: prev.currentStreak + 1,
      lastCompletedTimestamp: new Date().toISOString()
    }));
  };
  
  // Update wellness score (in a real app, this would come from actual usage data)
  useEffect(() => {
    if (isBlockingEnabled) {
      const newOverall = Math.min(wellnessScore.overall + 2, 100);
      if (newOverall !== wellnessScore.overall) {
        setTimeout(() => setWellnessScore(prev => ({
          ...prev,
          overall: newOverall
        })), 3000);
      }
    }
    
    // Cleanup deep work timer on component unmount
    return () => {
      if (deepWorkTimer) {
        clearInterval(deepWorkTimer);
      }
    };
  }, [isBlockingEnabled, wellnessScore.overall]);

  // Add these handler functions for scheduled blocking
  const handleAddSchedule = (schedule: any) => {
    setSchedules([...schedules, schedule]);
    toast.success(`Schedule "${schedule.name}" created`);
  };
  
  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast.success('Schedule removed');
  };
  
  const handleToggleSchedule = (id: string, enabled: boolean) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, enabled } : s
    ));
    
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      toast.success(`Schedule "${schedule.name}" ${enabled ? 'enabled' : 'disabled'}`);
    }
  };

    return (
    <div className="container mx-auto py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">AntiGooglitis</h1>
            <p className="text-muted-foreground">
          Break free from the excessive Googling habit and build your focus muscle.
        </p>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="digitalWellness">Digital Wellness</TabsTrigger>
            <TabsTrigger value="website-blocker">Website Blocker</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
                  <CardTitle>Anti-Googlitis Overview</CardTitle>
              <CardDescription>
                    Monitor and manage your search habits
              </CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium leading-none">Digital Wellness Score</h4>
                        <p className="text-sm text-muted-foreground">Your overall digital wellness level</p>
                  </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={wellnessScore.overall > 70 ? "secondary" : wellnessScore.overall > 40 ? "outline" : "destructive"}>
                          {wellnessScore.overall}/100
                      </Badge>
                    </div>
              </div>
              <Progress value={wellnessScore.overall} className="h-2" />
            
                    <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Daily Searches</span>
                </div>
                        <span className="text-sm">{dailySearches}</span>
              </div>
                <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Distraction Rate</span>
                </div>
                        <span className="text-sm">{distractionRate}%</span>
              </div>
                <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Blocked Sites</span>
                </div>
                        <span className="text-sm">{blockedSites.length}</span>
              </div>
              </div>
            </div>
          </CardContent>
                <CardFooter>
                  <Button onClick={toggleBlocking} variant={isBlockingEnabled ? "default" : "outline"} className="w-full">
                    {isBlockingEnabled ? "Disable Website Blocking" : "Enable Website Blocking"}
            </Button>
                </CardFooter>
        </Card>
      
      <Card>
        <CardHeader>
                  <CardTitle>Deep Work Mode</CardTitle>
                  <CardDescription>Block distractions for focused work sessions</CardDescription>
        </CardHeader>
        <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
            <Switch
                        id="deep-work-mode"
                        checked={deepWorkEnabled}
                        onCheckedChange={toggleDeepWork}
                      />
                      <Label htmlFor="deep-work-mode">Enable Deep Work Mode</Label>
          </div>
          
              <div className="space-y-2">
                      <Label htmlFor="duration">Session Duration (minutes)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="duration"
                          defaultValue={[deepWorkDuration]}
                          min={15}
                          max={120}
                          step={5}
                          onValueChange={([val]) => setDeepWorkDuration(val)}
                          disabled={!deepWorkEnabled}
                        />
                        <span className="w-12 text-sm">{deepWorkDuration}</span>
              </div>
              </div>
                    
                    {deepWorkActive && (
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm">{formatTimeRemaining(deepWorkTimeRemaining)}</span>
                </div>
                        <Progress value={deepWorkProgress} className="h-2" />
            </div>
          )}
                    
                    <div className="text-sm text-muted-foreground mt-4">
                      <p>During Deep Work mode:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>All distracting websites will be blocked</li>
                        <li>Search engines will be restricted</li>
                        <li>Notifications will be silenced</li>
                        <li>Focus music can be enabled</li>
                      </ul>
            </div>
                  </div>
        </CardContent>
        <CardFooter>
                        <Button 
                          onClick={startDeepWork}
                    variant={deepWorkActive ? "destructive" : "default"}
                    disabled={!deepWorkEnabled}
                    className="w-full"
                        >
                    {deepWorkActive ? "End Deep Work Session" : "Start Deep Work Session"}
                        </Button>
                </CardFooter>
                </Card>
                        </div>
          </TabsContent>
          
          {/* Digital Wellness Tab */}
          <TabsContent value="digitalWellness">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                  <CardTitle>Digital Wellness</CardTitle>
                    <CardDescription>
                    Monitor your digital well-being
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-6">
                        <div>
                      <h3 className="text-lg font-medium">Your Wellness Score: {wellnessScore.overall}</h3>
                      <Progress value={wellnessScore.overall} className="h-2 mt-2" />
                      </div>
                      
                    <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Mindfulness</span>
                          </div>
                        <Progress value={wellnessScore.mindfulness} className="h-1" />
                          </div>
                      
                            <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Balance</span>
                            </div>
                        <Progress value={wellnessScore.balance} className="h-1" />
                          </div>
                          
                          <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Habits</span>
                            </div>
                        <Progress value={wellnessScore.healthyHabits} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Productivity</span>
                        </div>
                        <Progress value={78} className="h-1" />
                    </div>
                  </div>
                  
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-3">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {recommendations.map(rec => (
                          <li key={rec.id} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span className="text-sm">{rec.title}</span>
                          </li>
                        ))}
                      </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          
            <Card>
              <CardHeader>
                  <CardTitle>Search Pattern Analysis</CardTitle>
                <CardDescription>
                    Understand your searching habits
                </CardDescription>
              </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Common Search Patterns</h3>
                      <div className="space-y-3">
                        {searchPatterns.map((pattern, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium truncate max-w-[200px]">{pattern.pattern}</span>
                    </div>
                              <Badge variant={pattern.category === 'research' ? 'secondary' : 'destructive'} className="mt-1">
                                {pattern.category}
                              </Badge>
                  </div>
                            <div className="text-sm text-muted-foreground">
                              {pattern.occurrences} times
                </div>
                      </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-3">Insights</h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex gap-2 items-start">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span>42% of your searches are categorized as distractions</span>
                        </p>
                        <p className="flex gap-2 items-start">
                          <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span>Most searches occur between 2-4pm (low energy periods)</span>
                        </p>
                        <p className="flex gap-2 items-start">
                          <LineChart className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>Your search discipline has improved 12% this week</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" size="sm">
                    <LineChart className="h-4 w-4 mr-2" />
                    Full Analysis
                </Button>
                  <Button variant="outline" size="sm">
                      <BarChart className="h-4 w-4 mr-2" />
                    Weekly Report
                    </Button>
                </CardFooter>
            </Card>
            </div>
          </TabsContent>
          
          {/* Website Blocker Tab */}
          <TabsContent value="website-blocker">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Website Blocker</CardTitle>
                  <CardDescription>
                    Prevent access to distracting websites
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={isBlockingEnabled} 
                      onCheckedChange={toggleBlocking}
                      id="blocking-toggle"
                    />
                    <Label htmlFor="blocking-toggle">
                      {isBlockingEnabled ? 'Blocking Enabled' : 'Blocking Disabled'}
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Blocking Level</Label>
                    <Select
                      value={blockLevel}
                      onValueChange={(value: 'light' | 'moderate' | 'strict') => setBlockLevel(value)}
                      disabled={!isBlockingEnabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blocking level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light (Block most distracting sites)</SelectItem>
                        <SelectItem value="moderate">Moderate (Block most non-work sites)</SelectItem>
                        <SelectItem value="strict">Strict (Allow only essential work sites)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Blocked Websites</Label>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="e.g., facebook.com"
                        value={newSite}
                        onChange={(e) => setNewSite(e.target.value)}
                        disabled={!isBlockingEnabled}
                      />
                      <Button 
                        variant="outline" 
                        onClick={addBlockedSite}
                        disabled={!isBlockingEnabled || !newSite}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      {blockedSites.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {blockedSites.map((site, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                              <div className="flex items-center">
                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{site}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setBlockedSites(blockedSites.filter(s => s !== site));
                                  toast.success(`Removed ${site} from blocked sites`);
                                }}
                                disabled={!isBlockingEnabled}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-4 text-muted-foreground">
                          <p>No websites blocked</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Blocking</CardTitle>
                  <CardDescription>
                    Set up automated website blocking schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScheduledBlockingSection 
                    schedules={schedules}
                    onAddSchedule={handleAddSchedule}
                    onRemoveSchedule={handleRemoveSchedule}
                    onToggleSchedule={handleToggleSchedule}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 

export default AntiGooglitis;
