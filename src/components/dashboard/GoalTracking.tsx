import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Check, 
  Plus, 
  Edit, 
  Trash, 
  ChevronRight,
  Clock,
  Calendar,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/hooks/use-toast';

interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  goalType: 'focus_time' | 'task_completion' | 'flow_state' | 'streak' | 'custom';
  periodType: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate?: string;
  color?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GoalTrackingProps {
  userId: string;
}

// Sample goal data
const SAMPLE_GOALS: Goal[] = [
  {
    id: '1',
    userId: '',
    title: 'Daily Focus Time',
    description: 'Complete at least 2 hours of focused work daily',
    targetValue: 120,
    currentValue: 85,
    goalType: 'focus_time',
    periodType: 'daily',
    startDate: new Date().toISOString(),
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    userId: '',
    title: 'Weekly Task Completion',
    description: 'Complete at least 20 tasks this week',
    targetValue: 20,
    currentValue: 12,
    goalType: 'task_completion',
    periodType: 'weekly',
    startDate: new Date().toISOString(),
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    userId: '',
    title: 'Flow State Duration',
    description: 'Achieve 30 minutes of deep flow state in a single session',
    targetValue: 30,
    currentValue: 22,
    goalType: 'flow_state',
    periodType: 'daily',
    startDate: new Date().toISOString(),
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    userId: '',
    title: 'Maintain Focus Streak',
    description: 'Maintain a 7-day streak of daily focus sessions',
    targetValue: 7,
    currentValue: 4,
    goalType: 'streak',
    periodType: 'custom',
    startDate: new Date().toISOString(),
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const GoalTracking: React.FC<GoalTrackingProps> = ({ userId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // Form state for new goal
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetValue: 0,
    goalType: 'focus_time',
    periodType: 'daily'
  });
  
  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      
      try {
        // In a real app, we would fetch goals from the API
        // For now, we'll just use the sample data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Assign the userId to the sample goals
        const goalsWithUserId = SAMPLE_GOALS.map(goal => ({
          ...goal,
          userId
        }));
        
        setGoals(goalsWithUserId);
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your goals. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchGoals();
    }
  }, [userId, toast]);
  
  const handleCreateGoal = () => {
    // Validate form
    if (!newGoal.title || newGoal.targetValue <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a title and a target value greater than zero.',
        variant: 'destructive'
      });
      return;
    }
    
    // Create new goal
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      userId,
      title: newGoal.title,
      description: newGoal.description,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      goalType: newGoal.goalType as any,
      periodType: newGoal.periodType as any,
      startDate: new Date().toISOString(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setGoals(prev => [...prev, goal]);
    
    // Reset form and close dialog
    setNewGoal({
      title: '',
      description: '',
      targetValue: 0,
      goalType: 'focus_time',
      periodType: 'daily'
    });
    
    setShowNewGoalDialog(false);
    
    toast({
      title: 'Goal Created',
      description: 'Your new goal has been created successfully.',
      variant: 'default'
    });
  };
  
  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id 
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() } 
          : goal
      )
    );
  };
  
  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    
    toast({
      title: 'Goal Deleted',
      description: 'Your goal has been removed.',
      variant: 'default'
    });
  };
  
  // Helper function to get goal icon
  const getGoalIcon = (goalType: Goal['goalType']) => {
    switch (goalType) {
      case 'focus_time':
        return <Clock className="h-5 w-5" />;
      case 'task_completion':
        return <Check className="h-5 w-5" />;
      case 'flow_state':
        return <Brain className="h-5 w-5" />;
      case 'streak':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };
  
  // Helper function to get goal type label
  const getGoalTypeLabel = (goalType: Goal['goalType']) => {
    switch (goalType) {
      case 'focus_time':
        return 'Focus Time';
      case 'task_completion':
        return 'Task Completion';
      case 'flow_state':
        return 'Flow State';
      case 'streak':
        return 'Streak';
      case 'custom':
        return 'Custom';
      default:
        return 'Unknown';
    }
  };
  
  // Helper function to get period type label
  const getPeriodTypeLabel = (periodType: Goal['periodType']) => {
    switch (periodType) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'custom':
        return 'Custom';
      default:
        return 'Unknown';
    }
  };
  
  // Helper function to get color based on progress
  const getProgressColor = (currentValue: number, targetValue: number) => {
    const percentage = (currentValue / targetValue) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-emerald-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Goal Tracking
            </CardTitle>
            <CardDescription>
              Track and manage your productivity goals
            </CardDescription>
          </div>
          <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new goal to help track your productivity
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Complete 2 hours of focused work daily"
                    value={newGoal.title}
                    onChange={e => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    placeholder="Add details about your goal"
                    value={newGoal.description}
                    onChange={e => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalType">Goal Type</Label>
                    <Select 
                      value={newGoal.goalType} 
                      onValueChange={value => setNewGoal(prev => ({ ...prev, goalType: value }))}
                    >
                      <SelectTrigger id="goalType">
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="focus_time">Focus Time</SelectItem>
                        <SelectItem value="task_completion">Task Completion</SelectItem>
                        <SelectItem value="flow_state">Flow State</SelectItem>
                        <SelectItem value="streak">Streak</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="periodType">Time Period</Label>
                    <Select 
                      value={newGoal.periodType} 
                      onValueChange={value => setNewGoal(prev => ({ ...prev, periodType: value }))}
                    >
                      <SelectTrigger id="periodType">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input 
                    id="targetValue" 
                    type="number"
                    min="1"
                    placeholder="e.g., 120 (minutes)"
                    value={newGoal.targetValue || ''}
                    onChange={e => setNewGoal(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    For focus time goals, enter minutes. For tasks, enter the number of tasks.
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewGoalDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>
                  Create Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {loading ? (
            // Loading skeleton
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            // Empty state
            <div className="text-center py-6">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Goals Set</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set goals to track your progress and stay motivated
              </p>
              <Button onClick={() => setShowNewGoalDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            // Goal list
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {goals.map((goal) => (
                  <Card key={goal.id} className="overflow-hidden">
                    <div className="flex items-start p-4">
                      <div className={`p-2 rounded-full mr-3 bg-primary/10 text-primary shrink-0`}>
                        {getGoalIcon(goal.goalType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">{goal.title}</h3>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              {getPeriodTypeLabel(goal.periodType)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {getGoalTypeLabel(goal.goalType)}
                            </Badge>
                          </div>
                        </div>
                        
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>
                              {goal.currentValue} / {goal.targetValue} 
                              {goal.goalType === 'focus_time' ? ' min' : ''}
                            </span>
                          </div>
                          <Progress 
                            value={(goal.currentValue / goal.targetValue) * 100} 
                            className={`h-1.5 ${getProgressColor(goal.currentValue, goal.targetValue)}`}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedGoal(goal)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive/80" 
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {goals.filter(g => g.isCompleted).length} of {goals.length} goals completed
            </p>
            <Button variant="link" size="sm" className="gap-1 p-0">
              View All Goals <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Edit Goal Dialog (would be implemented in a real application) */}
      {selectedGoal && (
        <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
              <DialogDescription>
                Update your goal settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Goal editing functionality would be implemented here
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedGoal(null)}>
                Cancel
              </Button>
              <Button onClick={() => setSelectedGoal(null)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
};

export default GoalTracking; 