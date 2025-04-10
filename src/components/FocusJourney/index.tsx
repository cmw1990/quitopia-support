import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { useAuth } from '../AuthProvider'
import { toast } from 'sonner'
import { focusSessionsApi } from '../../api/supabase-rest'
import { BarChart, BarChartHorizontal, TrendingUp, Calendar, Clock, Target, Award, ChevronRight, Maximize2, Trophy, X, Brain } from 'lucide-react'

// Define interfaces for data structure
interface FocusSession {
  id: string
  user_id: string
  start_time: string
  end_time: string
  duration: number
  focus_level: number
  energy_level: number
  distractions: number
  tasks_completed: number
  notes?: string
}

interface DailyStats {
  date: string
  totalMinutes: number
  averageFocus: number
  sessionsCount: number
  tasksCompleted: number
}

interface Milestone {
  id: string
  title: string
  description: string
  icon: string
  achieved: boolean
  date?: string
  progress: number
  target: number
  unit: string
}

// Define interface for flow state exercise
interface FlowExercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techniques: string[];
  benefits: string[];
  steps: string[];
  completed: boolean;
}

// Example flow exercises that we'll use to enhance the component later
const exampleFlowExercises: FlowExercise[] = [
  {
    id: 'fe1',
    title: 'Focus Warmup',
    description: 'A short exercise to prepare your mind for focused work',
    duration: 5,
    difficulty: 'beginner',
    techniques: ['Breathing', 'Intention Setting'],
    benefits: ['Mental preparation', 'Reduced startup resistance'],
    steps: [
      'Find a quiet space with minimal distractions',
      'Sit comfortably and close your eyes',
      'Take 10 deep breaths, focusing only on your breathing',
      'Set a clear intention for your upcoming focus session',
      'Visualize yourself completing the task successfully'
    ],
    completed: false
  },
  {
    id: 'fe2',
    title: 'Pomodoro Flow',
    description: 'Build focus momentum using the Pomodoro technique',
    duration: 25,
    difficulty: 'beginner',
    techniques: ['Pomodoro', 'Task Batching'],
    benefits: ['Sustained attention', 'Measurable progress'],
    steps: [
      'Choose a single task to focus on',
      'Set a timer for 25 minutes',
      'Work exclusively on that task until the timer rings',
      'Take a 5-minute break',
      'Repeat the cycle up to 4 times, then take a longer break'
    ],
    completed: false
  }
];

export function FocusJourney() {
  const { user, session } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([])
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [activeTab, setActiveTab] = useState('progress')
  const [error, setError] = useState<string | null>(null)
  
  // Add new state for flow exercises
  const [flowExercises, setFlowExercises] = useState<FlowExercise[]>([
    {
      id: 'fe1',
      title: 'Focus Warmup',
      description: 'A short exercise to prepare your mind for focused work',
      duration: 5,
      difficulty: 'beginner',
      techniques: ['Breathing', 'Intention Setting'],
      benefits: ['Mental preparation', 'Reduced startup resistance'],
      steps: [
        'Find a quiet space with minimal distractions',
        'Sit comfortably and close your eyes',
        'Take 10 deep breaths, focusing only on your breathing',
        'Set a clear intention for your upcoming focus session',
        'Visualize yourself completing the task successfully'
      ],
      completed: false
    },
    {
      id: 'fe2',
      title: 'Pomodoro Flow',
      description: 'Build focus momentum using the Pomodoro technique',
      duration: 25,
      difficulty: 'beginner',
      techniques: ['Pomodoro', 'Task Batching'],
      benefits: ['Sustained attention', 'Measurable progress'],
      steps: [
        'Choose a single task to focus on',
        'Set a timer for 25 minutes',
        'Work exclusively on that task until the timer rings',
        'Take a 5-minute break',
        'Repeat the cycle up to 4 times, then take a longer break'
      ],
      completed: false
    },
    {
      id: 'fe3',
      title: 'Deep Work Block',
      description: 'Extended focused work session with minimal interruptions',
      duration: 60,
      difficulty: 'intermediate',
      techniques: ['Deep Work', 'Digital Minimalism'],
      benefits: ['Deeper concentration', 'Complex problem solving'],
      steps: [
        'Schedule a 1-hour block of uninterrupted time',
        'Turn off all notifications and potential distractions',
        'Set a clear goal for what you want to accomplish',
        'Work exclusively on that goal for the full duration',
        'Document your experience immediately after finishing'
      ],
      completed: false
    }
  ]);
  const [selectedExercise, setSelectedExercise] = useState<FlowExercise | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [userFlowLevel, setUserFlowLevel] = useState(1); // 1-10 scale
  const [userFlowStrengths, setUserFlowStrengths] = useState<string[]>([]);
  const [userFlowWeaknesses, setUserFlowWeaknesses] = useState<string[]>([]);
  
  // Generate daily stats from focus sessions
  const getDailyStats = (): DailyStats[] => {
    const stats: { [date: string]: DailyStats } = {}
    
    focusSessions.forEach(session => {
      const date = new Date(session.start_time).toISOString().split('T')[0]
      
      if (!stats[date]) {
        stats[date] = {
          date,
          totalMinutes: 0,
          averageFocus: 0,
          sessionsCount: 0,
          tasksCompleted: 0
        }
      }
      
      stats[date].totalMinutes += session.duration
      stats[date].averageFocus += session.focus_level
      stats[date].sessionsCount++
      stats[date].tasksCompleted += session.tasks_completed
    })
    
    // Calculate averages
    Object.values(stats).forEach(day => {
      day.averageFocus = Math.round(day.averageFocus / day.sessionsCount)
    })
    
    // Sort by date
    return Object.values(stats).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }
  
  // Filter sessions based on time range
  const getFilteredSessions = () => {
    const now = new Date()
    const cutoffDate = new Date()
    
    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7)
    } else if (timeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1)
    } else {
      cutoffDate.setFullYear(now.getFullYear() - 1)
    }
    
    return focusSessions.filter(session => 
      new Date(session.start_time) >= cutoffDate
    )
  }
  
  // Calculate streak (consecutive days with focus sessions)
  const calculateStreak = (): number => {
    const dailyStats = getDailyStats()
    if (dailyStats.length === 0) return 0
    
    const today = new Date().toISOString().split('T')[0]
    const sortedDates = dailyStats.map(d => d.date).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    )
    
    // Check if there's a session today
    if (sortedDates[0] !== today && 
        new Date(sortedDates[0]).getTime() < new Date(today).getTime() - 86400000) {
      return 0
    }
    
    let streak = 1
    let currentDate = new Date(sortedDates[0])
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateStr = prevDate.toISOString().split('T')[0]
      
      if (sortedDates[i] === prevDateStr) {
        streak++
        currentDate = prevDate
      } else {
        break
      }
    }
    
    return streak
  }
  
  // Get total focus hours
  const getTotalFocusHours = (): number => {
    const totalMinutes = focusSessions.reduce(
      (total, session) => total + session.duration, 
      0
    )
    return Math.round(totalMinutes / 60 * 10) / 10
  }
  
  // Get milestones
  const getMilestones = (): Milestone[] => {
    const totalSessions = focusSessions.length
    const totalHours = getTotalFocusHours()
    const totalTasks = focusSessions.reduce(
      (total, session) => total + session.tasks_completed,
      0
    )
    const highFocusSessions = focusSessions.filter(
      session => session.focus_level >= 8
    ).length
    
    return [
      {
        id: '1',
        title: 'Focus Beginner',
        description: 'Complete 10 focus sessions',
        icon: '🔍',
        achieved: totalSessions >= 10,
        progress: Math.min(totalSessions, 10),
        target: 10,
        unit: 'sessions'
      },
      {
        id: '2',
        title: 'Focus Apprentice',
        description: 'Complete 50 focus sessions',
        icon: '⏱️',
        achieved: totalSessions >= 50,
        progress: Math.min(totalSessions, 50),
        target: 50,
        unit: 'sessions'
      },
      {
        id: '3',
        title: 'Focus Master',
        description: 'Complete 100 focus sessions',
        icon: '🏆',
        achieved: totalSessions >= 100,
        progress: Math.min(totalSessions, 100),
        target: 100,
        unit: 'sessions'
      },
      {
        id: '4',
        title: '10 Hour Club',
        description: 'Accumulate 10 hours of focus time',
        icon: '🕙',
        achieved: totalHours >= 10,
        progress: Math.min(totalHours, 10),
        target: 10,
        unit: 'hours'
      },
      {
        id: '5',
        title: '50 Hour Club',
        description: 'Accumulate 50 hours of focus time',
        icon: '⌛',
        achieved: totalHours >= 50,
        progress: Math.min(totalHours, 50),
        target: 50,
        unit: 'hours'
      },
      {
        id: '6',
        title: 'Task Novice',
        description: 'Complete 25 tasks during focus sessions',
        icon: '✅',
        achieved: totalTasks >= 25,
        progress: Math.min(totalTasks, 25),
        target: 25,
        unit: 'tasks'
      },
      {
        id: '7',
        title: 'Task Master',
        description: 'Complete 100 tasks during focus sessions',
        icon: '📝',
        achieved: totalTasks >= 100,
        progress: Math.min(totalTasks, 100),
        target: 100,
        unit: 'tasks'
      },
      {
        id: '8',
        title: 'Flow State',
        description: 'Achieve 10 high-focus sessions (level 8+)',
        icon: '🌊',
        achieved: highFocusSessions >= 10,
        progress: Math.min(highFocusSessions, 10),
        target: 10,
        unit: 'sessions'
      }
    ]
  }
  
  useEffect(() => {
    if (!user || !session) {
      setIsLoading(false)
      return
    }
    
    const loadFocusSessions = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await focusSessionsApi.getRecent(user.id, session, 100)
        setFocusSessions(response)
      } catch (err) {
        console.error('Failed to load focus sessions:', err)
        setError('Failed to load focus data. Please try again.')
        toast.error('Failed to load focus journey data')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadFocusSessions()
  }, [user, session])
  
  // Generate placeholders if no sessions exist
  const getPlaceholderSessions = (): FocusSession[] => {
    const placeholders: FocusSession[] = []
    const now = new Date()
    
    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(now.getDate() - i)
      
      // Skip some days to make it look realistic
      if (i % 3 === 0 && i > 0) continue
      
      // Random duration between 25 and 90 minutes
      const duration = Math.floor(Math.random() * 65) + 25
      
      // Random focus level between 5 and 10
      const focusLevel = Math.floor(Math.random() * 5) + 5
      
      // Random energy level between 4 and 10
      const energyLevel = Math.floor(Math.random() * 6) + 4
      
      // Random distractions between 0 and 5
      const distractions = Math.floor(Math.random() * 6)
      
      // Random tasks completed between 1 and 4
      const tasksCompleted = Math.floor(Math.random() * 4) + 1
      
      const startTime = date.toISOString()
      const endTime = new Date(date.getTime() + duration * 60000).toISOString()
      
      placeholders.push({
        id: `placeholder-${i}`,
        user_id: user?.id || 'demo',
        start_time: startTime,
        end_time: endTime,
        duration,
        focus_level: focusLevel,
        energy_level: energyLevel,
        distractions,
        tasks_completed: tasksCompleted
      })
    }
    
    return placeholders
  }
  
  // Use real data if available, otherwise use placeholders
  const sessions = focusSessions.length > 0 
    ? getFilteredSessions() 
    : getPlaceholderSessions()
  
  const dailyStats = sessions.length > 0 
    ? getDailyStats() 
    : []
  
  const streak = calculateStreak()
  const milestones = getMilestones()
  const totalFocusHours = getTotalFocusHours()
  const achievedMilestones = milestones.filter(m => m.achieved).length
  
  // Generate weekly focus chart data
  const generateFocusChart = () => {
    const stats = dailyStats.slice(-7)
    const chartData = stats.map(day => ({
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: day.totalMinutes,
      focus: day.averageFocus
    }))
    
    // If we have less than 7 days of data, pad with empty days
    if (chartData.length < 7) {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const today = new Date()
      const todayIndex = today.getDay()
      
      for (let i = 0; i < 7; i++) {
        const dayIndex = (todayIndex - i + 7) % 7
        const dayName = daysOfWeek[dayIndex]
        
        // Check if this day already exists in our data
        if (!chartData.find(d => d.day === dayName)) {
          chartData.unshift({
            day: dayName,
            minutes: 0,
            focus: 0
          })
        }
      }
    }
    
    return chartData.slice(-7)
  }
  
  const chartData = generateFocusChart()
  
  // Get max value for chart scaling
  const maxMinutes = Math.max(...chartData.map(d => d.minutes), 60)
  
  // Get user's estimated flow level based on focus sessions
  const calculateFlowLevel = (): number => {
    if (focusSessions.length === 0) return 1;
    
    // Calculate average focus level from recent sessions
    const recentSessions = [...focusSessions]
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 10);
    
    const avgFocusLevel = recentSessions.reduce((sum, session) => sum + session.focus_level, 0) / recentSessions.length;
    
    // Consider other factors: consistency, duration, distractions
    const sessionsPerWeek = recentSessions.length / (recentSessions.length > 5 ? 2 : 1);
    const avgDuration = recentSessions.reduce((sum, session) => sum + session.duration, 0) / recentSessions.length;
    const avgDistractions = recentSessions.reduce((sum, session) => sum + session.distractions, 0) / recentSessions.length;
    
    // Calculate flow level score (1-10)
    let flowScore = avgFocusLevel * 0.5;  // Base: 50% from focus level
    flowScore += Math.min(sessionsPerWeek / 2, 2) * 0.2;  // 20% from consistency
    flowScore += Math.min(avgDuration / 30, 2) * 0.2;  // 20% from duration
    flowScore += Math.max(0, 3 - avgDistractions) / 3 * 0.1;  // 10% from low distractions
    
    return Math.min(Math.max(Math.round(flowScore), 1), 10);
  };
  
  // Analyze user strengths and weaknesses
  const analyzeFlowProfile = () => {
    if (focusSessions.length < 3) {
      setUserFlowStrengths(['Beginner - not enough data yet']);
      setUserFlowWeaknesses(['Beginner - not enough data yet']);
      return;
    }
    
    const strengths = [];
    const weaknesses = [];
    
    // Sort sessions by focus level to find patterns
    const sessionsByFocus = [...focusSessions].sort((a, b) => b.focus_level - a.focus_level);
    const highFocusSessions = sessionsByFocus.filter(s => s.focus_level >= 8);
    const lowFocusSessions = sessionsByFocus.filter(s => s.focus_level <= 4);
    
    // Analyze time of day patterns
    const timeMap = new Map<number, {count: number, avgFocus: number}>();
    focusSessions.forEach(session => {
      const hour = new Date(session.start_time).getHours();
      const hourBucket = Math.floor(hour / 4) * 4; // Group into 4-hour blocks
      
      if (!timeMap.has(hourBucket)) {
        timeMap.set(hourBucket, {count: 0, avgFocus: 0});
      }
      
      const current = timeMap.get(hourBucket)!;
      current.count += 1;
      current.avgFocus += session.focus_level;
      
      timeMap.set(hourBucket, current);
    });
    
    // Find best and worst times
    timeMap.forEach((data, hour) => {
      data.avgFocus /= data.count;
    });
    
    const timeEntries = [...timeMap.entries()];
    const bestTimeEntry = timeEntries.sort((a, b) => b[1].avgFocus - a[1].avgFocus)[0];
    const worstTimeEntry = timeEntries.sort((a, b) => a[1].avgFocus - b[1].avgFocus)[0];
    
    if (bestTimeEntry && bestTimeEntry[1].avgFocus > 7) {
      const timeRange = `${bestTimeEntry[0]}-${bestTimeEntry[0] + 4}`;
      strengths.push(`High focus during ${timeRange} hours`);
    }
    
    if (worstTimeEntry && worstTimeEntry[1].avgFocus < 5) {
      const timeRange = `${worstTimeEntry[0]}-${worstTimeEntry[0] + 4}`;
      weaknesses.push(`Lower focus during ${timeRange} hours`);
    }
    
    // Analyze duration patterns
    const avgSessionLength = focusSessions.reduce((sum, s) => sum + s.duration, 0) / focusSessions.length;
    
    if (avgSessionLength > 45) {
      strengths.push('Good endurance with longer focus sessions');
    } else if (avgSessionLength < 25) {
      weaknesses.push('Short focus session length');
    }
    
    // Analyze distraction patterns
    const avgDistractions = focusSessions.reduce((sum, s) => sum + s.distractions, 0) / focusSessions.length;
    
    if (avgDistractions < 2) {
      strengths.push('Good at minimizing distractions');
    } else if (avgDistractions > 5) {
      weaknesses.push('Frequently distracted during sessions');
    }
    
    // Analyze consistency
    const streak = calculateStreak();
    if (streak >= 3) {
      strengths.push(`Consistent ${streak}-day focus streak`);
    }
    
    // Defaults if no patterns detected
    if (strengths.length === 0) {
      strengths.push('Building focus capacity');
    }
    
    if (weaknesses.length === 0) {
      weaknesses.push('Still gathering flow pattern data');
    }
    
    setUserFlowStrengths(strengths);
    setUserFlowWeaknesses(weaknesses);
  };
  
  // Generate flow exercises based on user level
  const generateFlowExercises = () => {
    const flowLevel = calculateFlowLevel();
    setUserFlowLevel(flowLevel);
    
    // Base exercises for all levels
    const baseExercises: FlowExercise[] = [
      {
        id: 'fe1',
        title: 'Focus Warmup',
        description: 'A short exercise to prepare your mind for focused work',
        duration: 5,
        difficulty: 'beginner',
        techniques: ['Breathing', 'Intention Setting'],
        benefits: ['Mental preparation', 'Reduced startup resistance'],
        steps: [
          'Find a quiet space with minimal distractions',
          'Sit comfortably and close your eyes',
          'Take 10 deep breaths, focusing only on your breathing',
          'Set a clear intention for your upcoming focus session',
          'Visualize yourself completing the task successfully'
        ],
        completed: false
      },
      {
        id: 'fe2',
        title: 'Pomodoro Flow',
        description: 'Build focus momentum using the Pomodoro technique',
        duration: 25,
        difficulty: 'beginner',
        techniques: ['Pomodoro', 'Task Batching'],
        benefits: ['Sustained attention', 'Measurable progress'],
        steps: [
          'Choose a single task to focus on',
          'Set a timer for 25 minutes',
          'Work exclusively on that task until the timer rings',
          'Take a 5-minute break',
          'Repeat the cycle up to 4 times, then take a longer break'
        ],
        completed: false
      }
    ];
    
    // Intermediate exercises for level 3+
    const intermediateExercises: FlowExercise[] = flowLevel >= 3 ? [
      {
        id: 'fe3',
        title: 'Deep Work Block',
        description: 'Extended focused work session with minimal interruptions',
        duration: 60,
        difficulty: 'intermediate',
        techniques: ['Deep Work', 'Digital Minimalism'],
        benefits: ['Deeper concentration', 'Complex problem solving'],
        steps: [
          'Schedule a 1-hour block of uninterrupted time',
          'Turn off all notifications and potential distractions',
          'Set a clear goal for what you want to accomplish',
          'Work exclusively on that goal for the full duration',
          'Document your experience immediately after finishing'
        ],
        completed: false
      },
      {
        id: 'fe4',
        title: 'Mindful Task Transition',
        description: 'Practice switching between tasks while maintaining focus',
        duration: 30,
        difficulty: 'intermediate',
        techniques: ['Mindful Transitions', 'Task Sequencing'],
        benefits: ['Reduced context switching cost', 'Improved task flow'],
        steps: [
          'Prepare two different but related tasks',
          'Work on the first task for 12 minutes with full attention',
          'Take 1 minute to mindfully close that task and prepare for the next',
          'Work on the second task for 12 minutes',
          'Take 5 minutes to reflect on how smoothly you transitioned'
        ],
        completed: false
      }
    ] : [];
    
    // Advanced exercises for level 6+
    const advancedExercises: FlowExercise[] = flowLevel >= 6 ? [
      {
        id: 'fe5',
        title: 'Flow State Trigger Practice',
        description: 'Deliberately practice entering the flow state using personal triggers',
        duration: 90,
        difficulty: 'advanced',
        techniques: ['Flow Triggers', 'Environment Design'],
        benefits: ['Faster flow state entry', 'Deeper immersion'],
        steps: [
          'Create your optimal focus environment (lighting, sound, temperature)',
          'Use a personal ritual to signal your brain it\'s focus time',
          'Work on a challenging but achievable task',
          'Maintain awareness of your focus level without breaking focus',
          'After the session, document what helped you reach flow'
        ],
        completed: false
      },
      {
        id: 'fe6',
        title: 'Focus Endurance Training',
        description: 'Gradually increase your ability to maintain deep focus',
        duration: 120,
        difficulty: 'advanced',
        techniques: ['Progressive Focus', 'Attention Restoration'],
        benefits: ['Extended focus periods', 'Mental stamina'],
        steps: [
          'Set aside a 2-hour block free of interruptions',
          'Begin with a 10-minute warmup focusing exercise',
          'Work in 30-minute blocks with 5-minute micro-breaks',
          'During each block, work with complete attention',
          'After the session, assess how your focus changed over time'
        ],
        completed: false
      }
    ] : [];
    
    // Combine exercises based on user level
    setFlowExercises([
      ...baseExercises,
      ...intermediateExercises,
      ...advancedExercises
    ]);
  };
  
  // Run analysis when focus sessions change
  useEffect(() => {
    if (!isLoading && focusSessions.length > 0) {
      generateFlowExercises();
      analyzeFlowProfile();
    }
  }, [isLoading, focusSessions.length]);
  
  const openExercise = (exercise: FlowExercise) => {
    setSelectedExercise(exercise);
    setShowExerciseModal(true);
  };
  
  const markExerciseCompleted = (exerciseId: string) => {
    setFlowExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId ? {...ex, completed: true} : ex
      )
    );
    setShowExerciseModal(false);
    
    toast.success('Exercise completed! Flow state practice recorded.');
  };
  
  if (!user && !session) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Focus Journey</CardTitle>
          <CardDescription>
            Track your focus progress and achieve milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Sign in to track your focus journey and view your progress over time.
          </p>
          <Button>Sign In to Track Progress</Button>
        </CardContent>
      </Card>
    )
  }
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Focus Journey</CardTitle>
          <CardDescription>
            Track your focus progress and achieve milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Focus Journey</CardTitle>
          <CardDescription>
            Track your focus progress and achieve milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Focus Journey</h2>
          <p className="text-muted-foreground">Track your focus progress and build flow state capacity</p>
        </div>
        <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="flow">Flow Building</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Weekly Focus Time
            </h3>
            
            <div className="h-[240px] w-full pt-6">
              <div className="flex items-end h-[200px] gap-2">
                {chartData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex justify-center group">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: day.minutes ? `${(day.minutes / maxMinutes) * 100}%` : '2px' }}
                        className={`w-4/5 bg-primary rounded-t-md ${day.minutes ? '' : 'bg-muted'}`}
                      />
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover rounded px-2 py-1 text-xs pointer-events-none">
                        {day.minutes} min
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChartHorizontal className="h-5 w-5" />
              Focus Sessions
            </h3>
            
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 border rounded-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {new Date(session.start_time).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(session.start_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration} min
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Focus: {session.focus_level}/10
                        </Badge>
                        <Badge variant="outline">
                          {session.tasks_completed} {session.tasks_completed === 1 ? 'task' : 'tasks'}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            {sessions.length > 5 && (
              <div className="flex justify-center">
                <Button variant="ghost" className="text-sm">
                  View All Sessions
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Build Your Flow State</CardTitle>
              <CardDescription>
                Practice these exercises to improve your ability to enter and maintain flow state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flowExercises.map(exercise => (
                  <Card key={exercise.id} className="w-full">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <CardTitle className="text-2xl">Focus Journey</CardTitle>
                          <CardDescription>
                            Track your focus progress and achieve milestones
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Exercise content would go here */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-6">
          {/* Achievement content would go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
} 