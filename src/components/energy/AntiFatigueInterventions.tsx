import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Battery, 
  Brain, 
  Heart, 
  Activity,
  Plus,
  Ban,
  Coffee,
  Eye,
  Zap,
  Clock,
  XCircle,
  ThumbsUp,
  Bell,
  Calendar,
  Timer,
  ArrowRight,
  AlertCircle,
  Check,
  CheckCircle,
  Droplets,
  HeartPulse,
  LayoutDashboard,
  LineChart,
  Loader2,
  Moon,
  SkipForward,
  Sun,
  ZapOff,
  Monitor,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { antiFatigueSettingsApi } from '@/api/supabase-rest'; // Corrected import
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Slider } from "../ui/slider";

interface FatigueWarningSign {
  id: string;
  category: 'physical' | 'mental' | 'emotional';
  title: string;
  description: string;
  warningLevel: 'low' | 'medium' | 'high';
  iconName: string;
}

interface Intervention {
  id: string;
  title: string;
  description: string;
  category: 'physical' | 'mental' | 'emotional';
  duration: string;
  effectiveness: number;
  iconName: string;
}

interface AntiFatigueInterventionsProps {
  mentalFatigue?: number;
  physicalFatigue?: number;
  emotionalFatigue?: number;
  onStartIntervention?: (intervention: Intervention) => void;
}

export function AntiFatigueInterventions({
  mentalFatigue = 30,
  physicalFatigue = 40,
  emotionalFatigue = 25,
  onStartIntervention
}: AntiFatigueInterventionsProps) {
  const { toast } = useToast();
  const { session } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'warning' | 'intervention'>('warning');
  const [warningCategory, setWarningCategory] = useState<'physical' | 'mental' | 'emotional'>('mental');
  const [interventionCategory, setInterventionCategory] = useState<'physical' | 'mental' | 'emotional'>('mental');
  const [warningDetectionEnabled, setWarningDetectionEnabled] = useState(true);
  const [autoInterventionEnabled, setAutoInterventionEnabled] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(70);
  const [waringSigns, setWarningSigns] = useState<FatigueWarningSign[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  
  useEffect(() => {
    fetchData();
  }, [session]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // In a real app, these would be fetched from the database
      const mockWarningSigns: FatigueWarningSign[] = generateMockWarningSigns();
      const mockInterventions: Intervention[] = generateMockInterventions();
      
      setWarningSigns(mockWarningSigns);
      setInterventions(mockInterventions);
      
      const userId = session?.user?.id;
      if (userId) {
        // Use correct API object, remove session arg
        const userSettings = await antiFatigueSettingsApi.getUserAntiFatigueSettings(userId);
        if (userSettings) {
          // Assuming userSettings is not null and contains the expected fields
          // Add checks if userSettings itself or its properties might be null/undefined
          setWarningDetectionEnabled(userSettings.warning_detection_enabled ?? true); // Default if undefined
          setAutoInterventionEnabled(userSettings.auto_intervention_enabled ?? false); // Default if undefined
          setWarningThreshold(userSettings.warning_threshold ?? 70); // Default if undefined
        }
      } else {
        console.warn('[AntiFatigueInterventions] No user ID found in session, skipping settings fetch.');
        // Consider setting default state values or handling the lack of settings
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load anti-fatigue data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveSettings = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      console.error('Error saving settings: No user ID available.');
      toast({ title: "Error", description: "Cannot save settings: User not authenticated.", variant: "destructive" });
      return; // Prevent API call if no user ID
    }

    try {
      await antiFatigueSettingsApi.updateUserAntiFatigueSettings(
        userId, // Use validated userId
        {
          warning_detection_enabled: warningDetectionEnabled,
          auto_intervention_enabled: autoInterventionEnabled,
          warning_threshold: warningThreshold,
          // Ensure other necessary fields from the type are included if the API expects the full object
        }
      );
      toast({
        title: "Settings Saved",
        description: "Your anti-fatigue settings have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleStartIntervention = (intervention: Intervention) => {
    if (onStartIntervention) {
      onStartIntervention(intervention);
    } else {
      toast({
        title: "Intervention Started",
        description: `Starting "${intervention.title}" for ${intervention.duration}.`,
      });
    }
  };
  
  const generateMockWarningSigns = (): FatigueWarningSign[] => {
    return [
      // Mental warning signs
      {
        id: 'mental-1',
        category: 'mental',
        title: 'Decreased Focus',
        description: 'Difficulty concentrating or maintaining attention on tasks',
        warningLevel: 'medium',
        iconName: 'brain'
      },
      {
        id: 'mental-2',
        category: 'mental',
        title: 'Increased Errors',
        description: 'Making more mistakes than usual in your work',
        warningLevel: 'high',
        iconName: 'alertCircle'
      },
      {
        id: 'mental-3',
        category: 'mental',
        title: 'Slower Processing',
        description: 'Taking longer to understand or process information',
        warningLevel: 'medium',
        iconName: 'brain'
      },
      {
        id: 'mental-4',
        category: 'mental',
        title: 'Forgetfulness',
        description: 'Forgetting steps, instructions, or details more frequently',
        warningLevel: 'low',
        iconName: 'brain'
      },
      {
        id: 'mental-5',
        category: 'mental',
        title: 'Task Switching Difficulty',
        description: 'Having trouble moving between different activities or contexts',
        warningLevel: 'medium',
        iconName: 'skipForward'
      },
      
      // Physical warning signs
      {
        id: 'physical-1',
        category: 'physical',
        title: 'Eye Strain',
        description: 'Dry, tired, or sore eyes, especially after screen use',
        warningLevel: 'medium',
        iconName: 'eye'
      },
      {
        id: 'physical-2',
        category: 'physical',
        title: 'Muscle Tension',
        description: 'Stiffness in neck, shoulders, or back from prolonged sitting',
        warningLevel: 'high',
        iconName: 'heartPulse'
      },
      {
        id: 'physical-3',
        category: 'physical',
        title: 'Yawning',
        description: 'Frequent yawning or physical signs of tiredness',
        warningLevel: 'low',
        iconName: 'moon'
      },
      {
        id: 'physical-4',
        category: 'physical',
        title: 'Restlessness',
        description: 'Feeling physically uncomfortable or unable to sit still',
        warningLevel: 'medium',
        iconName: 'moon'
      },
      {
        id: 'physical-5',
        category: 'physical',
        title: 'Headache',
        description: 'Developing a headache, especially at the temples or back of head',
        warningLevel: 'high',
        iconName: 'brain'
      },
      
      // Emotional warning signs
      {
        id: 'emotional-1',
        category: 'emotional',
        title: 'Irritability',
        description: 'Becoming easily frustrated or annoyed by minor issues',
        warningLevel: 'high',
        iconName: 'zapOff'
      },
      {
        id: 'emotional-2',
        category: 'emotional',
        title: 'Reduced Motivation',
        description: 'Feeling less interested in tasks you normally enjoy',
        warningLevel: 'medium',
        iconName: 'zapOff'
      },
      {
        id: 'emotional-3',
        category: 'emotional',
        title: 'Anxiety',
        description: 'Increased worry about completing tasks or meeting deadlines',
        warningLevel: 'medium',
        iconName: 'alertCircle'
      },
      {
        id: 'emotional-4',
        category: 'emotional',
        title: 'Emotional Numbness',
        description: 'Feeling detached or disconnected from your work or surroundings',
        warningLevel: 'low',
        iconName: 'zapOff'
      },
      {
        id: 'emotional-5',
        category: 'emotional',
        title: 'Impatience',
        description: 'Rushing through tasks or feeling urgency to finish quickly',
        warningLevel: 'medium',
        iconName: 'clock'
      }
    ];
  };
  
  const generateMockInterventions = (): Intervention[] => {
    return [
      // Mental interventions
      {
        id: 'mental-int-1',
        title: 'Task Switching',
        description: 'Change to a different type of task that uses different cognitive resources',
        category: 'mental',
        duration: '15-30 min',
        effectiveness: 8,
        iconName: 'skipForward'
      },
      {
        id: 'mental-int-2',
        title: 'Pomodoro Reset',
        description: 'Take a structured break using the Pomodoro technique (25 min work, 5 min break)',
        category: 'mental',
        duration: '5 min',
        effectiveness: 7,
        iconName: 'timer'
      },
      {
        id: 'mental-int-3',
        title: 'Mind Mapping',
        description: 'Create a visual map of your current project to engage different parts of your brain',
        category: 'mental',
        duration: '10 min',
        effectiveness: 6,
        iconName: 'layoutDashboard'
      },
      {
        id: 'mental-int-4',
        title: 'Digital Detox',
        description: 'Step away from all screens and digital devices completely',
        category: 'mental',
        duration: '15-30 min',
        effectiveness: 9,
        iconName: 'monitor'
      },
      {
        id: 'mental-int-5',
        title: 'Mindful Meditation',
        description: 'Practice a short guided meditation focusing on breath and awareness',
        category: 'mental',
        duration: '5-10 min',
        effectiveness: 8,
        iconName: 'brain'
      },
      
      // Physical interventions
      {
        id: 'physical-int-1',
        title: 'Desk Stretches',
        description: 'Perform a series of stretches designed for office workers',
        category: 'physical',
        duration: '5 min',
        effectiveness: 7,
        iconName: 'heartPulse'
      },
      {
        id: 'physical-int-2',
        title: 'Walk Break',
        description: 'Take a short walk, preferably outdoors in natural light',
        category: 'physical',
        duration: '10-15 min',
        effectiveness: 9,
        iconName: 'heartPulse'
      },
      {
        id: 'physical-int-3',
        title: 'Hydration Reset',
        description: 'Drink a full glass of water and refill your water bottle',
        category: 'physical',
        duration: '2 min',
        effectiveness: 6,
        iconName: 'droplets'
      },
      {
        id: 'physical-int-4',
        title: 'Eye Relief',
        description: 'Practice the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds',
        category: 'physical',
        duration: '1 min',
        effectiveness: 7,
        iconName: 'eye'
      },
      {
        id: 'physical-int-5',
        title: 'Power Nap',
        description: 'Take a short nap (10-20 minutes) to restore energy without entering deep sleep',
        category: 'physical',
        duration: '20 min',
        effectiveness: 10,
        iconName: 'moon'
      },
      
      // Emotional interventions
      {
        id: 'emotional-int-1',
        title: 'Gratitude Moment',
        description: 'Write down three things you are grateful for or that are going well today',
        category: 'emotional',
        duration: '5 min',
        effectiveness: 7,
        iconName: 'check'
      },
      {
        id: 'emotional-int-2',
        title: 'Nature Contact',
        description: 'Spend time near plants, looking out a window at nature, or viewing nature images',
        category: 'emotional',
        duration: '10 min',
        effectiveness: 8,
        iconName: 'sun'
      },
      {
        id: 'emotional-int-3',
        title: 'Social Connection',
        description: 'Have a brief, positive conversation with a colleague, friend, or family member',
        category: 'emotional',
        duration: '5-10 min',
        effectiveness: 9,
        iconName: 'heart'
      },
      {
        id: 'emotional-int-4',
        title: 'Achievement Review',
        description: 'Review your accomplishments for the day so far to boost confidence and motivation',
        category: 'emotional',
        duration: '5 min',
        effectiveness: 6,
        iconName: 'checkCircle'
      },
      {
        id: 'emotional-int-5',
        title: 'Breathing Exercise',
        description: 'Practice box breathing: inhale for 4 counts, hold for 4, exhale for 4, hold for 4',
        category: 'emotional',
        duration: '3-5 min',
        effectiveness: 8,
        iconName: 'droplets'
      }
    ];
  };
  
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'brain': return <Brain className="h-5 w-5" />;
      case 'alertCircle': return <AlertCircle className="h-5 w-5" />;
      case 'skipForward': return <SkipForward className="h-5 w-5" />;
      case 'eye': return <Eye className="h-5 w-5" />;
      case 'heartPulse': return <HeartPulse className="h-5 w-5" />;
      case 'moon': return <Moon className="h-5 w-5" />;
      case 'zapOff': return <ZapOff className="h-5 w-5" />;
      case 'clock': return <Clock className="h-5 w-5" />;
      case 'timer': return <Timer className="h-5 w-5" />;
      case 'layoutDashboard': return <LayoutDashboard className="h-5 w-5" />;
      case 'monitor': return <Monitor className="h-5 w-5" />;
      case 'droplets': return <Droplets className="h-5 w-5" />;
      case 'check': return <Check className="h-5 w-5" />;
      case 'checkCircle': return <CheckCircle className="h-5 w-5" />;
      case 'sun': return <Sun className="h-5 w-5" />;
      case 'heart': return <Heart className="h-5 w-5" />;
      case 'zap': return <Zap className="h-5 w-5" />;
      case 'calendar': return <Calendar className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };
  
  const getWarningLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  const getFatigueColor = (value: number) => {
    if (value < 30) return "bg-green-500";
    if (value < 50) return "bg-yellow-500";
    if (value < 70) return "bg-orange-500";
    return "bg-red-500";
  };
  
  // Filter by category
  const filteredWarningSigns = waringSigns.filter(sign => sign.category === warningCategory);
  const filteredInterventions = interventions.filter(intervention => intervention.category === interventionCategory);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Anti-Fatigue Interventions
        </CardTitle>
        <CardDescription>
          Detect and prevent fatigue before it affects your productivity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Mental Fatigue
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`${mentalFatigue >= warningThreshold ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}`}
                    >
                      {mentalFatigue >= warningThreshold ? 'Warning' : 'OK'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={mentalFatigue} className={getFatigueColor(mentalFatigue)} />
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <HeartPulse className="h-4 w-4" />
                      Physical Fatigue
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`${physicalFatigue >= warningThreshold ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}`}
                    >
                      {physicalFatigue >= warningThreshold ? 'Warning' : 'OK'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={physicalFatigue} className={getFatigueColor(physicalFatigue)} />
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <ZapOff className="h-4 w-4" />
                      Emotional Fatigue
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`${emotionalFatigue >= warningThreshold ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}`}
                    >
                      {emotionalFatigue >= warningThreshold ? 'Warning' : 'OK'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={emotionalFatigue} className={getFatigueColor(emotionalFatigue)} />
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center justify-between bg-muted/30 p-3 rounded-lg">
              <div className="flex-1 space-y-2 min-w-[200px]">
                <div className="flex items-center justify-between">
                  <Label htmlFor="warningThreshold" className="text-sm font-medium">
                    Fatigue Warning Threshold: {warningThreshold}%
                  </Label>
                  <Button variant="outline" size="sm" onClick={saveSettings}>
                    Save Settings
                  </Button>
                </div>
                <Slider
                  id="warningThreshold"
                  min={40}
                  max={90}
                  step={5}
                  value={[warningThreshold]}
                  onValueChange={(value) => setWarningThreshold(value[0])}
                />
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="warningDetection"
                    checked={warningDetectionEnabled}
                    onCheckedChange={setWarningDetectionEnabled}
                  />
                  <Label htmlFor="warningDetection" className="text-sm">
                    Warning Detection
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoIntervention"
                    checked={autoInterventionEnabled}
                    onCheckedChange={setAutoInterventionEnabled}
                  />
                  <Label htmlFor="autoIntervention" className="text-sm">
                    Auto-Intervention
                  </Label>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'warning' | 'intervention')}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="warning" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Warning Signs
                </TabsTrigger>
                <TabsTrigger value="intervention" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Interventions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="warning">
                <div className="flex gap-2 my-4">
                  <TabsList>
                    <TabsTrigger
                      value="mental"
                      className={warningCategory === 'mental' ? 'bg-primary text-primary-foreground' : ''}
                      onClick={() => setWarningCategory('mental')}
                    >
                      Mental
                    </TabsTrigger>
                    <TabsTrigger
                      value="physical"
                      className={warningCategory === 'physical' ? 'bg-primary text-primary-foreground' : ''}
                      onClick={() => setWarningCategory('physical')}
                    >
                      Physical
                    </TabsTrigger>
                    <TabsTrigger
                      value="emotional"
                      className={warningCategory === 'emotional' ? 'bg-primary text-primary-foreground' : ''}
                      onClick={() => setWarningCategory('emotional')}
                    >
                      Emotional
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredWarningSigns.map(sign => (
                    <Card key={sign.id} className="border border-muted">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getIconComponent(sign.iconName)}
                            <CardTitle className="text-base">{sign.title}</CardTitle>
                          </div>
                          <Badge className={getWarningLevelColor(sign.warningLevel)}>
                            {sign.warningLevel.charAt(0).toUpperCase() + sign.warningLevel.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{sign.description}</p>
                      </CardContent>
                      <CardFooter className="flex justify-end pt-0">
                        <Button variant="link" size="sm" className="text-xs h-7">
                          Learn more
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="intervention">
                <div className="flex gap-2 my-4">
                  <TabsList>
                    <TabsTrigger
                      value="mental"
                      className={interventionCategory === 'mental' ? 'bg-primary text-primary-foreground' : ''}
                      onClick={() => setInterventionCategory('mental')}
                    >
                      Mental
                    </TabsTrigger>
                    <TabsTrigger
                      value="physical"
                      className={interventionCategory === 'physical' ? 'bg-primary text-primary-foreground' : ''}
                      onClick={() => setInterventionCategory('physical')}
                    >
                      Physical
                    </TabsTrigger>
                    <TabsTrigger
                      value="emotional"
                      className={interventionCategory === 'emotional' ? 'bg-primary text-primary-foreground' : ''}
                      onClick={() => setInterventionCategory('emotional')}
                    >
                      Emotional
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredInterventions.map(intervention => (
                    <Card key={intervention.id} className="border border-muted">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getIconComponent(intervention.iconName)}
                            <CardTitle className="text-base">{intervention.title}</CardTitle>
                          </div>
                          <Badge variant="outline">{intervention.duration}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">{intervention.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Effectiveness:</span>
                          <div className="flex">
                            {Array.from({ length: intervention.effectiveness }).map((_, i) => (
                              <div key={i} className="w-1 h-3 bg-primary rounded-sm mr-[2px]" />
                            ))}
                            {Array.from({ length: 10 - intervention.effectiveness }).map((_, i) => (
                              <div key={i} className="w-1 h-3 bg-muted rounded-sm mr-[2px]" />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleStartIntervention(intervention)}
                        >
                          Start Intervention
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 