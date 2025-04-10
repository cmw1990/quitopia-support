import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "../ui/use-toast";
import { useAuth } from "../AuthProvider";
import { BrainCircuit, List, Lightbulb, Activity, Clock, CheckCircle2, ArrowRight, Bell, Brain, AlertCircle, Loader2, PlusCircle, CalendarIcon } from "lucide-react";
import { motion } from 'framer-motion';
import { useAdhdSupport, CopingStrategy } from "../../hooks/useAdhdSupport";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface Strategy {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

interface DailyRoutine {
  id: number;
  title: string;
  description: string;
  steps: string[];
}

interface ExecutiveFunction {
  title: string;
  description: string;
  tips: string[];
}

interface ResourceArticle {
  title: string;
  description: string;
  readTime: number;
}

interface ResourceMedia {
  type: 'video' | 'podcast';
  title: string;
  description: string;
  duration: number;
}

interface Resources {
  articles: ResourceArticle[];
  media: ResourceMedia[];
}

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ToolkitItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonText: string;
}

export function ADHDSupport() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("toolkit");
  const { 
    assessments, 
    strategies: userStrategies,
    latestAssessment,
    effectiveStrategies,
    frequentStrategies,
    createAssessment,
    createStrategy,
    updateStrategyUsage,
    isLoading,
    error,
    isAuthenticated
  } = useAdhdSupport();
  const [assessmentDate, setAssessmentDate] = useState<Date>(new Date());
  const [assessmentSymptoms, setAssessmentSymptoms] = useState({
    attention: 5,
    hyperactivity: 5,
    impulsivity: 5,
    organization: 5,
    emotionalRegulation: 5,
  });
  const [assessmentNotes, setAssessmentNotes] = useState("");
  const [isAssessmentFormOpen, setIsAssessmentFormOpen] = useState(false);

  // Show authentication prompt if not logged in
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>ADHD Support Center</CardTitle>
          <CardDescription>
            Access personalized ADHD support tools and resources
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center p-6">
          <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Please sign in to access your personalized ADHD support tools, track your progress, and manage your strategies.
          </p>
          <Button onClick={() => navigate("/login")}>
            Sign In to Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardContent className="flex flex-col items-center p-6">
          <div className="flex items-center justify-center w-full p-8">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-lg">Loading your ADHD support tools...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardContent className="flex flex-col items-center p-6">
          <div className="flex items-center justify-center w-full p-8 text-red-500">
            <AlertCircle className="h-8 w-8 mr-2" />
            <span className="text-lg">Error loading ADHD support data. Please try again later.</span>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Convert database strategies to UI strategies
  const getStrategyIcon = (category: string) => {
    switch (category) {
      case 'focus':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'organization':
        return <List className="h-5 w-5 text-green-500" />;
      case 'productivity':
        return <CheckCircle2 className="h-5 w-5 text-amber-500" />;
      case 'social':
        return <Activity className="h-5 w-5 text-purple-500" />;
      default:
        return <BrainCircuit className="h-5 w-5 text-gray-500" />;
    }
  };

  // Map database strategies to UI strategies if available, otherwise use sample data
  const focusStrategies: Strategy[] = userStrategies && userStrategies.length > 0
    ? userStrategies.slice(0, 4).map(strategy => ({
        id: parseInt(strategy.id.slice(0, 8), 16), // Convert UUID to number for id
        title: strategy.strategy_name,
        description: strategy.notes || `A ${strategy.category} strategy with effectiveness rating of ${strategy.effectiveness_rating}/10`,
        icon: getStrategyIcon(strategy.category),
        action: () => {
          updateStrategyUsage.mutate(strategy.id);
          if (strategy.category === 'focus' && strategy.strategy_name.toLowerCase().includes('pomodoro')) {
            navigate("/app/focus-timer");
          } else {
            toast({
              title: `Using ${strategy.strategy_name}`,
              description: "Strategy applied! Let's track how effective it is for you.",
            });
          }
        }
      }))
    : [
      {
        id: 1,
        title: "Pomodoro Technique",
        description: "Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer break.",
        icon: <Clock className="h-5 w-5 text-blue-500" />,
        action: () => navigate("/app/focus-timer")
      },
      {
        id: 2,
        title: "Body Doubling",
        description: "Work alongside someone else (virtually or in-person) to enhance accountability and focus.",
        icon: <Activity className="h-5 w-5 text-purple-500" />,
        action: () => window.open("https://www.focusmate.com", "_blank")
      },
      {
        id: 3,
        title: "Task Chunking",
        description: "Break large tasks into smaller, more manageable parts to reduce overwhelm.",
        icon: <List className="h-5 w-5 text-green-500" />,
        action: () => {}
      },
      {
        id: 4,
        title: "Implementation Intentions",
        description: "Create \"if-then\" plans for specific situations to automate decision-making.",
        icon: <CheckCircle2 className="h-5 w-5 text-amber-500" />,
        action: () => {}
      }
    ];

  const dailyRoutines: DailyRoutine[] = [
    {
      id: 1,
      title: "Morning Ritual",
      description: "Consistent morning routine to set up your day for success.",
      steps: [
        "Wake up at the same time each day",
        "Drink a glass of water",
        "5-minute mindfulness exercise",
        "Review today's top 3 priorities",
        "Take medication (if prescribed)"
      ]
    },
    {
      id: 2,
      title: "Workday Structure",
      description: "Framework for maintaining focus and energy throughout your workday.",
      steps: [
        "Start with your most important task",
        "Use time-blocking for your calendar",
        "Take scheduled breaks (use the Focus Timer)",
        "Switch tasks when energy naturally dips",
        "Plan tomorrow's tasks before ending work"
      ]
    },
    {
      id: 3,
      title: "Evening Wind-Down",
      description: "Prepare your mind and body for restful sleep.",
      steps: [
        "Stop screen time 1 hour before bed",
        "Review what went well today",
        "Set out clothes and items for tomorrow",
        "10-minute tidying session",
        "Relaxation practice (reading, stretching, etc.)"
      ]
    }
  ];

  const executiveFunctionTips: ExecutiveFunction[] = [
    {
      title: "Working Memory",
      description: "The ability to hold and manipulate information in your mind",
      tips: [
        "Use external memory aids like notes and apps",
        "Practice chunking information into manageable groups",
        "Create mnemonics for things you need to remember",
        "Repeat information out loud to reinforce memory"
      ]
    },
    {
      title: "Task Initiation",
      description: "The ability to start tasks without procrastination",
      tips: [
        "Use the '2-minute rule' - if it takes less than 2 minutes, do it now",
        "Set a timer for just 5 minutes of work to overcome initial resistance",
        "Create clear, specific first steps for each task",
        "Remove distractions before attempting to start"
      ]
    },
    {
      title: "Organization",
      description: "The ability to create and maintain systems",
      tips: [
        "Use consistent, simple organization systems",
        "Label everything and assign clear homes for items",
        "Schedule regular 15-minute decluttering sessions",
        "Use digital tools to organize information"
      ]
    },
    {
      title: "Time Management",
      description: "The ability to estimate and allocate time effectively",
      tips: [
        "Track how long tasks actually take to improve estimation",
        "Set timers for activities to maintain awareness",
        "Use visual timers to make time passage more concrete",
        "Schedule buffer time between activities"
      ]
    }
  ];

  const handleStrategyClick = (strategy: Strategy) => {
    strategy.action();
    toast({
      title: strategy.title,
      description: "Strategy activated! Let's get started.",
    });
  };

  const tabs: Tab[] = [
    { id: 'toolkit', name: 'ADHD Toolkit', icon: Lightbulb },
    { id: 'strategies', name: 'Strategies', icon: Brain },
    { id: 'resources', name: 'Resources', icon: BrainCircuit },
    { id: 'personal', name: 'Your Profile', icon: Brain }
  ];

  const toolkitItems: ToolkitItem[] = [
    {
      title: 'Body Doubling',
      description: 'Work alongside a virtual accountability partner to stay focused and motivated.',
      icon: Brain,
      buttonText: 'Start a Session'
    },
    {
      title: 'Task Timer',
      description: 'ADHD-optimized Pomodoro timer with flexible work periods and break reminders.',
      icon: Clock,
      buttonText: 'Launch Timer'
    },
    {
      title: 'Task Transition Helper',
      description: 'Tools to help ease the difficulty of switching between different tasks or activities.',
      icon: BrainCircuit,
      buttonText: 'Explore Tool'
    },
    {
      title: 'Time Blindness Support',
      description: 'Visual timers and reminders to improve time awareness and management.',
      icon: Clock,
      buttonText: 'Set Up Timer'
    },
    {
      title: 'Structured Planning',
      description: 'Templates and tools for breaking down complex tasks into manageable steps.',
      icon: List,
      buttonText: 'Create Plan'
    },
    {
      title: 'Routine Builder',
      description: 'Design consistent routines to reduce executive function burden and build habits.',
      icon: Calendar,
      buttonText: 'Build Routine'
    }
  ];

  const strategyItems = [
    {
      title: 'The 2-Minute Rule',
      description: 'If a task takes less than two minutes to complete, do it immediately instead of postponing it. This reduces the mental load of keeping track of small tasks and prevents them from piling up.',
      steps: [
        'Identify quick tasks that would take less than 2 minutes',
        'Instead of adding them to your to-do list, complete them immediately',
        'Track how many 2-minute tasks you complete each day',
        'Celebrate the accumulated time and mental energy you\'ve saved'
      ]
    },
    {
      title: 'Body Doubling',
      description: 'Working in the presence of another person to increase accountability and focus. The "body double" doesn\'t need to help with the task—their presence alone can help maintain focus and motivation.',
      steps: [
        'Schedule a body doubling session with a friend or use our virtual body doubling feature',
        'Briefly share what you\'re planning to work on',
        'Work on your tasks while the other person works on theirs',
        'Check in periodically to maintain accountability'
      ]
    },
    {
      title: 'Task Chunking',
      description: 'Breaking down large, overwhelming tasks into smaller, more manageable pieces. This technique helps overcome task initiation difficulties and makes progress more visible.',
      steps: [
        'Write down the large task that feels overwhelming',
        'Break it down into the smallest possible sub-tasks',
        'Assign estimated time requirements to each chunk',
        'Schedule specific chunks rather than the whole project',
        'Complete one chunk at a time, checking it off as you go'
      ]
    },
    {
      title: 'Time Blocking with Buffers',
      description: 'A modified time-blocking technique that includes transition periods between tasks, accounting for the difficulty many with ADHD have in task-switching.',
      steps: [
        'Plan your day in blocks of focused work (30-90 minutes)',
        'Add 15-30 minute buffer periods between blocks',
        'Use buffers for transitions, breaks, or catching up if tasks ran long',
        'Color-code blocks by energy requirement or task type',
        'Review and adjust your blocking strategy regularly'
      ]
    }
  ];

  const resources: Resources = {
    articles: [
      {
        title: 'ADHD and the Focused Mind: Strategies for Executive Functioning',
        description: 'Learn how to leverage your unique cognitive style for better productivity and focus.',
        readTime: 8
      },
      {
        title: 'The Science of Hyperfocus: Turning ADHD into a Superpower',
        description: 'Understanding and harnessing hyperfocus for deep work and creative problem-solving.',
        readTime: 12
      },
      {
        title: 'Environmental Design for ADHD Brains',
        description: 'How to set up your physical and digital workspace to minimize distractions and support focus.',
        readTime: 6
      }
    ],
    media: [
      {
        type: 'video',
        title: 'ADHD-Friendly Morning Routines',
        description: 'Starting your day right with strategies that work with your brain, not against it.',
        duration: 15
      },
      {
        type: 'podcast',
        title: 'The Dopamine-Driven ADHD Brain',
        description: 'Understanding how dopamine affects motivation and focus with practical applications.',
        duration: 32
      },
      {
        type: 'video',
        title: 'Task Initiation Techniques That Actually Work',
        description: 'Overcoming the paralysis of getting started with ADHD-friendly strategies.',
        duration: 18
      }
    ]
  };

  // Calculate average score for assessment
  const calculateAverageScore = () => {
    const values = Object.values(assessmentSymptoms);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  // Determine intensity level based on average score
  const determineIntensityLevel = (score: number): 'mild' | 'moderate' | 'severe' => {
    if (score <= 3.5) return 'mild';
    if (score <= 7) return 'moderate';
    return 'severe';
  };

  // Handle assessment form submission
  const handleSubmitAssessment = async () => {
    const averageScore = calculateAverageScore();
    const intensityLevel = determineIntensityLevel(averageScore);
    
    try {
      await createAssessment.mutateAsync({
        assessment_date: assessmentDate.toISOString(),
        score: averageScore,
        intensity_level: intensityLevel,
        notes: `Attention: ${assessmentSymptoms.attention}, Hyperactivity: ${assessmentSymptoms.hyperactivity}, Impulsivity: ${assessmentSymptoms.impulsivity}, Organization: ${assessmentSymptoms.organization}, Emotional Regulation: ${assessmentSymptoms.emotionalRegulation}. Notes: ${assessmentNotes}`
      });
      
      toast({
        title: "Assessment Submitted",
        description: `Your ADHD assessment for ${format(assessmentDate, 'PPP')} has been saved.`,
      });
      
      // Reset form and close dialog
      setAssessmentSymptoms({
        attention: 5,
        hyperactivity: 5,
        impulsivity: 5,
        organization: 5,
        emotionalRegulation: 5,
      });
      setAssessmentNotes("");
      setIsAssessmentFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Assessment Form Component
  const AssessmentForm = () => (
    <Dialog open={isAssessmentFormOpen} onOpenChange={setIsAssessmentFormOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle size={16} />
          New Assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>ADHD Symptom Assessment</DialogTitle>
          <DialogDescription>
            Rate your symptoms over the past week to track your ADHD patterns.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="flex items-center gap-4">
            <Label className="w-32">Assessment Date:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !assessmentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {assessmentDate ? format(assessmentDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={assessmentDate}
                  onSelect={(date) => date && setAssessmentDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Attention Difficulties</Label>
                <span className="text-sm text-muted-foreground">{assessmentSymptoms.attention}/10</span>
              </div>
              <Slider 
                defaultValue={[assessmentSymptoms.attention]} 
                max={10} 
                step={1} 
                onValueChange={(value) => setAssessmentSymptoms({...assessmentSymptoms, attention: value[0]})}
              />
              <p className="text-xs text-muted-foreground">Difficulty focusing, easily distracted, trouble completing tasks</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Hyperactivity</Label>
                <span className="text-sm text-muted-foreground">{assessmentSymptoms.hyperactivity}/10</span>
              </div>
              <Slider 
                defaultValue={[assessmentSymptoms.hyperactivity]} 
                max={10} 
                step={1} 
                onValueChange={(value) => setAssessmentSymptoms({...assessmentSymptoms, hyperactivity: value[0]})}
              />
              <p className="text-xs text-muted-foreground">Restlessness, fidgeting, excess energy, trouble sitting still</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Impulsivity</Label>
                <span className="text-sm text-muted-foreground">{assessmentSymptoms.impulsivity}/10</span>
              </div>
              <Slider 
                defaultValue={[assessmentSymptoms.impulsivity]} 
                max={10} 
                step={1} 
                onValueChange={(value) => setAssessmentSymptoms({...assessmentSymptoms, impulsivity: value[0]})}
              />
              <p className="text-xs text-muted-foreground">Acting without thinking, interrupting, difficulty waiting your turn</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Organization Issues</Label>
                <span className="text-sm text-muted-foreground">{assessmentSymptoms.organization}/10</span>
              </div>
              <Slider 
                defaultValue={[assessmentSymptoms.organization]} 
                max={10} 
                step={1} 
                onValueChange={(value) => setAssessmentSymptoms({...assessmentSymptoms, organization: value[0]})}
              />
              <p className="text-xs text-muted-foreground">Messiness, losing items, trouble with time management</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Emotional Regulation</Label>
                <span className="text-sm text-muted-foreground">{assessmentSymptoms.emotionalRegulation}/10</span>
              </div>
              <Slider 
                defaultValue={[assessmentSymptoms.emotionalRegulation]} 
                max={10} 
                step={1} 
                onValueChange={(value) => setAssessmentSymptoms({...assessmentSymptoms, emotionalRegulation: value[0]})}
              />
              <p className="text-xs text-muted-foreground">Mood swings, frustration, emotional sensitivity</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea 
              placeholder="Any other symptoms, triggers, or patterns you've noticed..." 
              value={assessmentNotes}
              onChange={(e) => setAssessmentNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-sm font-medium">Average Score:</span>
            <span className="text-lg font-bold">{calculateAverageScore().toFixed(1)}</span>
            <Badge variant={
              determineIntensityLevel(calculateAverageScore()) === 'mild' ? 'outline' :
              determineIntensityLevel(calculateAverageScore()) === 'moderate' ? 'secondary' : 'destructive'
            }>
              {determineIntensityLevel(calculateAverageScore())}
            </Badge>
          </div>
          <Button variant="outline" onClick={() => setIsAssessmentFormOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmitAssessment} disabled={createAssessment.isPending}>
            {createAssessment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Assessment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Show assessment history and summary in the toolkit section
  const AssessmentSummary = () => {
    if (!assessments || assessments.length === 0) {
      return (
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              ADHD Assessments
            </CardTitle>
            <CardDescription>Track your symptoms over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-medium mb-2">No Assessments Yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Track your ADHD symptoms to identify patterns and effective strategies.
              </p>
              <Button onClick={() => setIsAssessmentFormOpen(true)}>Create First Assessment</Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    const latestScore = latestAssessment?.score || 0;
    
    return (
      <Card className="col-span-1">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                ADHD Assessments
              </CardTitle>
              <CardDescription>Track your symptoms over time</CardDescription>
            </div>
            <AssessmentForm />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Latest Assessment</span>
                <span className="text-sm text-muted-foreground">
                  {latestAssessment ? format(new Date(latestAssessment.assessment_date), 'MMM d, yyyy') : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={latestScore * 10} className="h-2" />
                <span className="text-sm font-medium">{latestScore.toFixed(1)}/10</span>
              </div>
              <div className="flex items-center mt-1">
                <Badge variant={
                  latestAssessment?.intensity_level === 'mild' ? 'outline' :
                  latestAssessment?.intensity_level === 'moderate' ? 'secondary' : 'destructive'
                }>
                  {latestAssessment?.intensity_level || 'Unknown'} intensity
                </Badge>
              </div>
            </div>
            
            <h4 className="text-sm font-medium pt-2">Recent History</h4>
            <div className="space-y-3">
              {assessments.slice(0, 3).map((assessment, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{format(new Date(assessment.assessment_date), 'MMM d')}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          assessment.intensity_level === 'mild' ? 'bg-blue-500' :
                          assessment.intensity_level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${assessment.score * 10}%` }} 
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{assessment.score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setActiveTab("assessment-history")}>
            View Full History
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            ADHD Support Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tools, strategies, and resources designed specifically for ADHD minds to enhance focus and productivity.
          </p>
        </motion.div>
      </header>
      
      <nav className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <ul className="flex space-x-8">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center px-4 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {activeTab === 'toolkit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {toolkitItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start mb-4">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
                      <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
                    </div>
                  </div>
                  <Button>
                    {item.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {activeTab === 'strategies' && (
        <div className="space-y-8">
          {strategyItems.map((strategy, index) => (
            <motion.div
              key={strategy.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{strategy.title}</CardTitle>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">How to implement:</h4>
                    <ul className="space-y-2">
                      {strategy.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-2">
                            <span className="text-green-600 dark:text-green-400 text-sm font-medium">{idx + 1}</span>
                          </span>
                          <span className="text-gray-600 dark:text-gray-300">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Articles & Guides</h3>
            <div className="space-y-4">
              {resources.articles.map((article, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{article.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{article.readTime} min read</span>
                        <Button variant="outline" className="text-sm py-1">Read Article</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Videos & Podcasts</h3>
            <div className="space-y-4">
              {resources.media.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Card className="flex items-start">
                    <CardContent className="pt-6 w-full">
                      <div className="flex">
                        <div className="rounded bg-gray-200 dark:bg-gray-700 w-20 h-16 flex-shrink-0 mr-4 flex items-center justify-center">
                          {item.type === 'video' ? (
                            <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm3.75 10.35l-5.5 3.5A.5.5 0 0 1 7.5 13V7a.5.5 0 0 1 .75-.45l5.5 3a.5.5 0 0 1 0 .9z" />
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm2.5 14.5a.5.5 0 0 1-.5.5H8a.5.5 0 0 1-.5-.5v-9A.5.5 0 0 1 8 5h4a.5.5 0 0 1 .5.5v9z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{item.duration} min</span>
                            <Button variant="outline" className="text-sm py-1">{item.type === 'video' ? 'Watch' : 'Listen'}</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your ADHD Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-10">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Sign in to access your personalized ADHD profile and recommendations.</p>
                    <Button onClick={() => navigate('/login')}>Sign In / Register</Button>
                  </div>
                ) : (
                  <div>
                    {latestAssessment ? (
                      <>
                        <div className="mb-8">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Your ADHD Assessment</h4>
                          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600 dark:text-gray-300">Assessment Date:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {new Date(latestAssessment.assessment_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-600 dark:text-gray-300">Score:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {latestAssessment.score}/100
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-300">Intensity Level:</span>
                              <span className={`font-semibold px-2 py-1 rounded-full text-xs ${
                                latestAssessment.intensity_level === 'mild' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : latestAssessment.intensity_level === 'moderate'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {latestAssessment.intensity_level.charAt(0).toUpperCase() + latestAssessment.intensity_level.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          {latestAssessment.notes && (
                            <div className="mt-4">
                              <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Assessment Notes:</h5>
                              <p className="text-gray-600 dark:text-gray-300">{latestAssessment.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-8">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Your Most Effective Strategies</h4>
                          {effectiveStrategies.length > 0 ? (
                            <div className="space-y-3">
                              {effectiveStrategies.map((strategy) => (
                                <div key={strategy.id} className="flex items-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <div className="h-3 w-3 rounded-full bg-green-500 mr-3"></div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{strategy.strategy_name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Effectiveness: {strategy.effectiveness_rating}/10</p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateStrategyUsage.mutate(strategy.id)}
                                  >
                                    Use Now
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 dark:text-gray-300">No effective strategies recorded yet. Try some strategies and rate them to build your profile.</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't completed an ADHD assessment yet.</p>
                        <Button 
                          onClick={() => {
                            toast({
                              title: "Assessment Starting",
                              description: "Starting a new ADHD assessment.",
                            });
                            // This would ideally navigate to an assessment page
                            // For now we'll create a sample assessment
                            createAssessment.mutate({
                              assessment_date: new Date().toISOString(),
                              score: Math.floor(Math.random() * 30) + 40, // Random score between 40-70
                              intensity_level: 'moderate',
                              notes: "This is a sample assessment. In a real application, this would be based on comprehensive questionnaire responses."
                            });
                          }}
                        >
                          Take Assessment
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Coping Strategy</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => {
                              createStrategy.mutate({
                                strategy_name: "Pomodoro Technique",
                                category: "focus",
                                effectiveness_rating: 8,
                                used_count: 0,
                                notes: "Work for 25 minutes, then take a 5-minute break."
                              });
                              toast({
                                title: "Strategy Added",
                                description: "Pomodoro Technique added to your strategies.",
                              });
                            }}
                          >
                            Add Pomodoro Technique
                          </Button>
                        </div>
                        <div>
                          <Button 
                            className="w-full" 
                            variant="outline"
                            onClick={() => {
                              createStrategy.mutate({
                                strategy_name: "Body Doubling",
                                category: "social",
                                effectiveness_rating: 7,
                                used_count: 0,
                                notes: "Work alongside someone else to enhance accountability."
                              });
                              toast({
                                title: "Strategy Added",
                                description: "Body Doubling added to your strategies.",
                              });
                            }}
                          >
                            Add Body Doubling
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user ? (
                  <>
                    {/* If we have strategies with usage counts, display them */}
                    {frequentStrategies.length > 0 ? (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-300">Strategy Usage</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {frequentStrategies.reduce((total, s) => total + s.used_count, 0)} times
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-300">Focus Sessions</span>
                          <span className="font-semibold text-gray-900 dark:text-white">12/15</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-300">Task Completion</span>
                        <span className="font-semibold text-gray-900 dark:text-white">18/25</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-600 h-full rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-300">Distraction Reduction</span>
                        <span className="font-semibold text-gray-900 dark:text-white">65%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Next Steps</h4>
                      <ul className="space-y-3">
                        {!latestAssessment && (
                          <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm mr-3 flex-shrink-0 mt-0.5">1</span>
                            <span className="text-gray-600 dark:text-gray-300">Complete the ADHD assessment</span>
                          </li>
                        )}
                        {frequentStrategies.length === 0 && (
                          <li className="flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm mr-3 flex-shrink-0 mt-0.5">{!latestAssessment ? 2 : 1}</span>
                            <span className="text-gray-600 dark:text-gray-300">Try a coping strategy</span>
                          </li>
                        )}
                        <li className="flex items-start">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm mr-3 flex-shrink-0 mt-0.5">{!latestAssessment ? 3 : frequentStrategies.length === 0 ? 2 : 1}</span>
                          <span className="text-gray-600 dark:text-gray-300">Set up a task management system</span>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Sign in to view your progress metrics.</p>
                    <Button size="sm" onClick={() => navigate('/login')}>Sign In</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default ADHDSupport; 