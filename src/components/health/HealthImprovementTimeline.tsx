import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter,
  Button,
  Progress,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertTitle,
  AlertDescription,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui';
import { 
  Heart, 
  Activity, 
  Clock, 
  Check,
  ChevronRight, 
  Calendar,
  ArrowRight,
  Zap,
  Share2,
  Trophy,
  BookOpen,
  Hourglass,
  Coffee,
  Smile,
  PlusCircle,
  Droplet,
  Wind,
  BarChart3,
  Stethoscope,
  AlertCircle,
  Grid,
  List,
  Minimize2,
  Maximize2,
  Filter
} from 'lucide-react';
import { getHealthImprovements, HealthImprovement } from "../../api/apiCompatibility";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  addHours, 
  differenceInHours, 
  format, 
  formatDistance, 
  formatDistanceToNow,
  formatDistanceToNowStrict
} from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

// Enhanced health improvement interface with more detailed data
export interface EnhancedHealthImprovement extends HealthImprovement {
  detailed_explanation?: string;
  wellness_score_impact?: number;
  organ_system: string;
  priority?: number;
  scientific_sources?: string[];
  recommended_activities?: Array<{ title: string; description: string; duration_minutes: number }>;
  next?: boolean;
  hoursPassed?: number;
  hoursElapsed?: number;
  hoursRemaining?: number;
  progressPercentage?: number;
  targetDate?: Date;
  category?: string;
}

interface HealthImprovementTimelineProps {
  session: Session | null;
  quitDate?: string;
  className?: string;
  onlyShowAchieved?: boolean;
  compact?: boolean;
  highlightNext?: boolean;
  maxItems?: number;
  showCategories?: boolean;
}

// Map string icon names to Lucide React components
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'heart':
      return <Heart className="h-5 w-5 text-rose-500" />;
    case 'lungs':
      return <Activity className="h-5 w-5 text-blue-500" />;
    case 'brain':
      return <Activity className="h-5 w-5 text-purple-500" />;
    case 'activity':
      return <Activity className="h-5 w-5 text-green-500" />;
    case 'clock':
      return <Clock className="h-5 w-5 text-amber-500" />;
    default:
      return <Activity className="h-5 w-5 text-slate-500" />;
  }
};

const categoryIcons: Record<string, React.ReactNode> = {
  heart: <Heart className="h-6 w-6 text-red-500" />,
  lungs: <Stethoscope className="h-6 w-6 text-blue-500" />,
  brain: <Activity className="h-6 w-6 text-purple-500" />,
  energy: <Zap className="h-6 w-6 text-amber-500" />,
  bloodstream: <Droplet className="h-6 w-6 text-rose-500" />,
  taste: <Coffee className="h-6 w-6 text-amber-700" />,
  smell: <Wind className="h-6 w-6 text-green-500" />,
  mood: <Smile className="h-6 w-6 text-indigo-500" />,
  stress: <Activity className="h-6 w-6 text-orange-500" />,
  default: <Clock className="h-6 w-6 text-slate-500" />
};

// Helper function to determine category from icon name
const getCategoryFromIcon = (iconName: string): string => {
  if (iconName.includes('heart')) return 'heart';
  if (iconName.includes('lung')) return 'lungs';
  if (iconName.includes('brain')) return 'brain';
  if (iconName.includes('energy') || iconName.includes('zap')) return 'energy';
  if (iconName.includes('blood') || iconName.includes('drop')) return 'bloodstream';
  if (iconName.includes('taste') || iconName.includes('coffee')) return 'taste';
  if (iconName.includes('smell')) return 'smell';
  if (iconName.includes('smile') || iconName.includes('mood')) return 'mood';
  if (iconName.includes('stress') || iconName.includes('activity')) return 'stress';
  return 'default';
};

export const HealthImprovementTimeline: React.FC<HealthImprovementTimelineProps> = ({
  session,
  quitDate,
  className = '',
  onlyShowAchieved = false,
  compact = false,
  highlightNext = true,
  maxItems,
  showCategories = true
}) => {
  const [improvements, setImprovements] = useState<EnhancedHealthImprovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImprovement, setSelectedImprovement] = useState<EnhancedHealthImprovement | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'hours' | 'days' | 'summary'>('summary');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [timelineView, setTimelineView] = useState<'all' | 'achieved' | 'upcoming'>('all');
  const [category, setCategory] = useState<string | null>(null);
  
  // Calculate hours since quitting
  const calculateHoursSinceQuitting = () => {
    if (!quitDate) return 0;
    const quitDateTime = new Date(quitDate).getTime();
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - quitDateTime) / (1000 * 60 * 60));
  };
  
  const hoursSinceQuitting = calculateHoursSinceQuitting();
  
  // Fetch health improvements data
  useEffect(() => {
    const loadHealthImprovements = async () => {
      if (!quitDate || !session?.user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await getHealthImprovements(session.user.id, quitDate, session);
        
        // Enhance with additional data for our richer UI
        const enhancedData: EnhancedHealthImprovement[] = data.map(item => {
          const timelineHours = item.timeline_hours || 0;
          const hoursElapsed = calculateHoursSinceQuitting();
          const category = item.icon ? getCategoryFromIcon(item.icon) : 'default';
          
          return {
            ...item,
            organ_system: getOrganSystemFromTitle(item.title),
            detailed_explanation: getDetailedExplanation(item.description, timelineHours),
            wellness_score_impact: getWellnessScoreImpact(timelineHours),
            recommended_activities: getRecommendedActivities(timelineHours),
            targetDate: new Date(addHours(new Date(quitDate), timelineHours)),
            hoursElapsed: hoursElapsed,
            hoursRemaining: timelineHours - hoursElapsed,
            progressPercentage: Math.min(Math.round((hoursElapsed / timelineHours) * 100), 99),
            category: category
          };
        });
        
        setImprovements(enhancedData);
      } catch (error) {
        console.error('Error loading health improvements:', error);
        toast.error('Failed to load health improvements');
      } finally {
        setLoading(false);
      }
    };
    
    loadHealthImprovements();
  }, [quitDate, session]);
  
  // Filter improvements based on selected system and achievement status
  const filteredImprovements = improvements.filter(improvement => {
    const systemMatch = selectedSystem === 'all' || improvement.organ_system === selectedSystem;
    const statusMatch = !onlyShowAchieved || improvement.achieved;
    return systemMatch && statusMatch;
  });
  
  // Sort improvements by timeline hours
  const sortedImprovements = [...filteredImprovements].sort((a, b) => a?.timeline_hours - b?.timeline_hours);
  
  // Limit the number of displayed improvements if maxItems is specified
  const displayedImprovements = maxItems ? sortedImprovements.slice(0, maxItems) : sortedImprovements;
  
  // Find the next improvement to be achieved
  const nextImprovement = improvements.find(improvement => 
    !improvement.achieved && 
    improvement?.timeline_hours > hoursSinceQuitting
  );
  
  // Helper function to determine organ system from title/description
  const getOrganSystemFromTitle = (title: string): string => {
    if (!title) return 'general';
    
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('heart') || lowercaseTitle.includes('blood pressure')) return 'cardiovascular';
    if (lowercaseTitle.includes('lung') || lowercaseTitle.includes('breath')) return 'respiratory';
    if (lowercaseTitle.includes('brain') || lowercaseTitle.includes('cognitive')) return 'nervous';
    if (lowercaseTitle.includes('taste') || lowercaseTitle.includes('smell')) return 'sensory';
    if (lowercaseTitle.includes('energy')) return 'metabolic';
    
    return 'general';
  };
  
  // Helper function to generate detailed explanations
  const getDetailedExplanation = (description: string, hours: number): string => {
    if (!description) return '';
    
    // Add more scientific detail based on the original description
    return `${description} This typically occurs around ${hours} hours after quitting smoking as the body begins repairing damage caused by tobacco chemicals.`;
  };
  
  // Helper function to calculate wellness score impact
  const getWellnessScoreImpact = (hours: number): number => {
    if (hours <= 0) return 0;
    
    if (hours <= 24) return 10; // Higher impact for quick wins
    if (hours <= 72) return 15;
    if (hours <= 168) return 20; // 1 week
    if (hours <= 720) return 25; // 30 days
    if (hours <= 2160) return 30; // 90 days
    return 50; // Long-term benefits have higher impact
  };
  
  // Helper function to generate recommended activities
  const getRecommendedActivities = (hours: number): Array<{ title: string; description: string; duration_minutes: number }> => {
    if (hours <= 0) return [];
    
    if (hours <= 24) {
      return [
        { 
          title: 'Deep Breathing', 
          description: 'Practice deep breathing exercises to help your body adjust to improved oxygen levels.', 
          duration_minutes: 5 
        },
        { 
          title: 'Stay Hydrated', 
          description: 'Drink plenty of water to help your body clear toxins faster.', 
          duration_minutes: 0 
        }
      ];
    }
    
    if (hours <= 72) {
      return [
        { 
          title: 'Light Exercise', 
          description: 'Try a short walk to improve circulation and reduce withdrawal symptoms.', 
          duration_minutes: 15 
        },
        { 
          title: 'Relaxation Technique', 
          description: 'Practice a simple relaxation technique to manage stress without nicotine.', 
          duration_minutes: 10 
        }
      ];
    }
    
    return [
      { 
        title: 'Celebrate Progress', 
        description: 'Take a moment to reflect on your achievements so far.', 
        duration_minutes: 5 
      },
      { 
        title: 'Healthy Meal', 
        description: 'Prepare a nutrient-rich meal to support your body\'s healing process.', 
        duration_minutes: 30 
      }
    ];
  };
  
  // Calculate when the next improvement will be achieved
  const getNextImprovementTime = () => {
    if (!nextImprovement || !quitDate) return null;
    
    const quitDateTime = new Date(quitDate).getTime();
    const achievementTime = addHours(new Date(quitDateTime), nextImprovement?.timeline_hours);
    return formatDistance(achievementTime, new Date(), { addSuffix: true });
  };
  
  // Format the timeline hours based on selected format
  const formatTimelineHours = (hours: number) => {
    if (timeFormat === 'hours') {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else if (timeFormat === 'days') {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      if (days === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else if (remainingHours === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      } else {
        return `${days} ${days === 1 ? 'day' : 'days'}, ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
      }
    } else {
      // Summary format
      if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        const days = Math.floor(hours / 24);
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      }
    }
  };
  
  // Calculate a health improvement status
  const getImprovementStatus = (improvement: EnhancedHealthImprovement) => {
    if (improvement.achieved) {
      return {
        status: 'achieved',
        label: 'Achieved',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      };
    } else if (nextImprovement && improvement.id === nextImprovement.id) {
      return {
        status: 'next',
        label: 'Next',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      };
    } else {
      return {
        status: 'future',
        label: 'Coming up',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      };
    }
  };
  
  // Toggle fullscreen display
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Get progress percentage for an improvement
  const getProgressPercentage = (improvement: EnhancedHealthImprovement) => {
    if (improvement.achieved) return 100;
    if (!quitDate) return 0;
    
    const hoursPassed = hoursSinceQuitting;
    const hoursTotal = improvement?.timeline_hours;
    
    const percentage = Math.min(Math.round((hoursPassed / hoursTotal) * 100), 99);
    return percentage;
  };
  
  // Get all unique organ systems from improvements
  const organSystems = ['all', ...new Set(improvements.map(i => i.organ_system))];
  
  // Render progress indicator
  const renderProgressIndicator = (improvement: EnhancedHealthImprovement) => {
    const progressPercentage = getProgressPercentage(improvement);
    
    return (
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full ${improvement.achieved ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${progressPercentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    );
  };
  
  // Render the detailed view dialog
  const renderDetailedView = (improvement: EnhancedHealthImprovement) => {
    if (!selectedImprovement || selectedImprovement.id !== improvement.id) return null;
    
    return (
      <Dialog open={!!selectedImprovement} onOpenChange={() => setSelectedImprovement(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {getIconComponent(improvement.icon)}
              <span className="ml-2">{improvement.title}</span>
              <Badge className={`ml-3 ${getImprovementStatus(improvement).color}`}>
                {getImprovementStatus(improvement).label}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {formatTimelineHours(improvement?.timeline_hours)} after quitting
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>{improvement.detailed_explanation}</p>
            
            {improvement.recommended_activities && improvement.recommended_activities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recommended Activities</h4>
                <div className="space-y-2">
                  {improvement.recommended_activities.map((activity, index) => (
                    <div key={index} className="bg-muted p-3 rounded-md">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.description}</div>
                      {activity.duration_minutes > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {activity.duration_minutes} minutes
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {improvement.scientific_sources && improvement.scientific_sources.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Scientific Sources</h4>
                <ul className="text-sm space-y-1">
                  {improvement.scientific_sources.map((source, index) => (
                    <li key={index} className="text-muted-foreground">
                      • {source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {improvement.wellness_score_impact && (
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                <h4 className="text-sm font-semibold mb-1">Wellness Impact</h4>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-blue-700 dark:text-blue-300">
                    +{improvement.wellness_score_impact} points to your wellness score
                  </span>
                </div>
              </div>
            )}
            
            {!improvement.achieved && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Progress</h4>
                {renderProgressIndicator(improvement)}
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  {getProgressPercentage(improvement)}% complete
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedImprovement(null)}>
              Close
            </Button>
            <Button onClick={() => {
              // Share functionality would go here
              toast.success('Sharing this achievement');
              setSelectedImprovement(null);
            }}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Main render function
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Improvements</CardTitle>
          <CardDescription>Loading your health timeline...</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-muted rounded-full mb-4"></div>
            <div className="h-4 w-40 bg-muted rounded mb-2"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!quitDate) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Improvements</CardTitle>
          <CardDescription>Track your body's recovery journey</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No quit date set</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set your quit date to see your health improvement timeline
            </p>
            <Button>Set Quit Date</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (improvements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Improvements</CardTitle>
          <CardDescription>Track your body's recovery journey</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No health data available</h3>
            <p className="text-sm text-muted-foreground">
              We're preparing your health improvement timeline
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Health Improvements</CardTitle>
          <CardDescription>Track your body's recovery journey</CardDescription>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
            {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall progress summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Overall Recovery Progress</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Started {formatDistanceToNowStrict(new Date(quitDate), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>{improvements.filter(i => i.achieved).length} of {improvements.length} improvements achieved</span>
              </div>
              <Badge variant="outline">
                {Math.round((improvements.filter(i => i.achieved).length / improvements.length) * 100)}% complete
              </Badge>
            </div>
            
            <Progress 
              value={(improvements.filter(i => i.achieved).length / improvements.length) * 100} 
              className="h-2"
            />
          </div>
          
          {nextImprovement && (
            <Alert variant="default" className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle>Next Improvement</AlertTitle>
              <AlertDescription className="flex flex-col space-y-1">
                <span className="font-medium">{nextImprovement.title}</span>
                <span className="text-sm">{nextImprovement.description}</span>
                <span className="text-xs">Expected {getNextImprovementTime()}</span>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center mr-4">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">Filter:</span>
          </div>
          
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Body System" />
            </SelectTrigger>
            <SelectContent>
              {organSystems.map(system => (
                <SelectItem key={system} value={system}>
                  {system.charAt(0).toUpperCase() + system.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeFormat} onValueChange={(value: any) => setTimeFormat(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days & Hours</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Timeline visualization */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
          
          <div className={viewMode === 'list' ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
            {displayedImprovements.map((improvement, index) => {
              const status = getImprovementStatus(improvement);
              
              return (
                <React.Fragment key={improvement.id}>
                  <motion.div
                    className={`relative ${viewMode === 'list' ? 'pl-12' : 'pl-8'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className={`absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      improvement.achieved 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : nextImprovement?.id === improvement.id
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {getIconComponent(improvement.icon)}
                    </div>
                    
                    <div className="bg-card rounded-lg border p-4">
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg">{improvement.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{improvement.description}</p>
                          </div>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{formatTimelineHours(improvement?.timeline_hours)} after quitting</span>
                          {!improvement.achieved && (
                            <span>{getProgressPercentage(improvement)}% complete</span>
                          )}
                        </div>
                        
                        {!compact && !improvement.achieved && (
                          <div className="mt-2">
                            {renderProgressIndicator(improvement)}
                          </div>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 self-end"
                          onClick={() => setSelectedImprovement(improvement)}
                        >
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                  {/* Render detailed view dialog */}
                  {renderDetailedView(improvement)}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        
        {/* Show more button if maxItems is specified and there are more items */}
        {maxItems && sortedImprovements.length > maxItems && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => toggleFullscreen()}>
              Show All Improvements
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
      {!compact && (
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {improvements.filter(i => i.achieved).length} of {improvements.length} improvements achieved
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            // Share functionality would go here
            toast.success('Sharing your health journey');
          }}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}; 