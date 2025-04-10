import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import { TopNav } from '@/components/layout/TopNav';
import { 
  ListChecks, 
  Plus, 
  Trash2, 
  MoveVertical, 
  Clock, 
  Brain, 
  CheckCircle, 
  Sparkles, 
  Zap, 
  PlusCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Paintbrush,
  Download,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Types
interface SubTask {
  id: string;
  content: string;
  completed: boolean;
  estimated_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  notes: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  steps: SubTask[];
  created_at: string;
  adhd_friendly_mode: boolean;
  color_coding: boolean;
  progress_tracking: boolean;
  reward: string;
}

const DEFAULT_TASK: Task = {
  id: uuidv4(),
  title: '',
  description: '',
  steps: [],
  created_at: new Date().toISOString(),
  adhd_friendly_mode: true,
  color_coding: true,
  progress_tracking: true,
  reward: ''
};

const TaskBreakdown = () => {
  const [currentTask, setCurrentTask] = useState<Task>(DEFAULT_TASK);
  const [savedTasks, setSavedTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [newStepContent, setNewStepContent] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const { session } = useAuth();
  
  // Load saved tasks when component mounts
  useEffect(() => {
    if (session?.user) {
      loadTasks();
    }
  }, [session]);
  
  // Load tasks from Supabase
  const loadTasks = async () => {
    if (!session?.user?.id) return;
    
    try {
      // Load incomplete tasks
      // Use supabaseRequest, handle response, remove session arg
      const { data: incompleteTasks, error: incompleteError } = await supabaseRequest<any[]>(
        `/rest/v1/task_breakdowns?user_id=eq.${session.user.id}&is_completed=eq.false&order=created_at.desc`,
        { method: 'GET' }
        // Removed session argument
      );
      if (incompleteError) throw incompleteError; // Propagate error
      
      if (incompleteTasks && incompleteTasks.length > 0) {
        setSavedTasks(incompleteTasks.map(formatTaskFromDb));
        setCurrentTask(formatTaskFromDb(incompleteTasks[0]));
      }
      
      // Load completed tasks
      // Use supabaseRequest, handle response, remove session arg
      const { data: completedTasksData, error: completedError } = await supabaseRequest<any[]>(
        `/rest/v1/task_breakdowns?user_id=eq.${session.user.id}&is_completed=eq.true&order=completed_at.desc&limit=10`,
        { method: 'GET' }
        // Removed session argument
      );
      if (completedError) throw completedError; // Propagate error
      
      if (completedTasksData) {
        setCompletedTasks(completedTasksData.map(formatTaskFromDb));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your tasks',
        variant: 'destructive',
      });
    }
  };
  
  // Format task from database
  const formatTaskFromDb = (dbTask: any): Task => {
    return {
      id: dbTask.id,
      title: dbTask.title,
      description: dbTask.description,
      steps: dbTask.steps || [],
      created_at: dbTask.created_at,
      adhd_friendly_mode: dbTask.adhd_friendly_mode !== false,
      color_coding: dbTask.color_coding !== false,
      progress_tracking: dbTask.progress_tracking !== false,
      reward: dbTask.reward || ''
    };
  };
  
  // Save task to Supabase
  const saveTask = async () => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save your task',
        variant: 'destructive',
      });
      return;
    }
    
    if (!currentTask.title.trim()) {
      toast({
        title: 'Task Title Required',
        description: 'Please enter a title for your task',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const isNew = !savedTasks.some(task => task.id === currentTask.id);
      
      const taskData = {
        user_id: session.user.id,
        title: currentTask.title,
        description: currentTask.description,
        steps: currentTask.steps,
        adhd_friendly_mode: currentTask.adhd_friendly_mode,
        color_coding: currentTask.color_coding,
        progress_tracking: currentTask.progress_tracking,
        reward: currentTask.reward,
        is_completed: false
      };
      
      if (isNew) {
        // Create new task
        // Use supabaseRequest, handle response, remove session arg
        // Also ensure select and Prefer header to get the created item back
        const { data: newTaskResponse, error: createError } = await supabaseRequest<any[]>( // Expect array
          `/rest/v1/task_breakdowns?select=*`,
          {
            method: 'POST',
            headers: { 'Prefer': 'return=representation' }, // Request result back
            body: JSON.stringify(taskData),
          }
          // Removed session argument
        );
        if (createError) throw createError; // Propagate error
        const newTask = newTaskResponse?.[0]; // Extract single item from response array
        
        if (newTask && newTask[0]) {
          toast({
            title: 'Task Saved',
            description: 'Your task has been saved',
          });
          
          await loadTasks();
        }
      } else {
        // Update existing task
        // Use supabaseRequest, handle error, remove session arg
         const { error: updateError } = await supabaseRequest(
           `/rest/v1/task_breakdowns?id=eq.${currentTask.id}`,
           {
             method: 'PATCH',
              headers: { 'Prefer': 'return=minimal' }, // Don't need full object back
             body: JSON.stringify(taskData),
           }
           // Removed session argument
         );
         if (updateError) throw updateError; // Propagate error
        
        toast({
          title: 'Task Updated',
          description: 'Your task has been updated',
        });
        
        await loadTasks();
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your task',
        variant: 'destructive',
      });
    }
  };
  
  // Mark task as completed
  const completeTask = async () => {
    if (!session?.user?.id || !currentTask.id) return;
    
    try {
      // Use supabaseRequest, handle error, remove session arg
      const { error: completeError } = await supabaseRequest(
        `/rest/v1/task_breakdowns?id=eq.${currentTask.id}`,
        {
          method: 'PATCH',
           headers: { 'Prefer': 'return=minimal' }, // Don't need full object back
          body: JSON.stringify({
            is_completed: true,
            completed_at: new Date().toISOString(),
          }),
        }
        // Removed session argument
      );
       if (completeError) throw completeError; // Propagate error
      
      // Trigger confetti effect
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast({
        title: 'Task Completed! 🎉',
        description: 'Congratulations on completing your task!',
      });
      
      // Reset current task and reload tasks
      setCurrentTask(DEFAULT_TASK);
      await loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };
  
  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!session?.user?.id) return;
    
    try {
      // Use supabaseRequest, handle error, remove session arg
      const { error: deleteError } = await supabaseRequest(
        `/rest/v1/task_breakdowns?id=eq.${taskId}`,
        { method: 'DELETE' }
        // Removed session argument
      );
       if (deleteError) throw deleteError; // Propagate error
      
      toast({
        title: 'Task Deleted',
        description: 'Your task has been deleted',
      });
      
      // Reset if current task was deleted
      if (currentTask.id === taskId) {
        setCurrentTask(DEFAULT_TASK);
      }
      
      // Reload tasks
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  
  // Create a new task
  const createNewTask = () => {
    setCurrentTask({
      ...DEFAULT_TASK,
      id: uuidv4(),
      created_at: new Date().toISOString()
    });
    setIsEditing(true);
  };
  
  // Load a saved task
  const loadTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditing(false);
  };
  
  // Add a new step
  const addStep = () => {
    if (!newStepContent.trim()) return;
    
    const newStep: SubTask = {
      id: uuidv4(),
      content: newStepContent,
      completed: false,
      estimated_minutes: 15,
      difficulty: 'medium',
      notes: ''
    };
    
    setCurrentTask({
      ...currentTask,
      steps: [...currentTask.steps, newStep]
    });
    
    setNewStepContent('');
  };
  
  // Update a step
  const updateStep = (stepId: string, updates: Partial<SubTask>) => {
    setCurrentTask({
      ...currentTask,
      steps: currentTask.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    });
  };
  
  // Remove a step
  const removeStep = (stepId: string) => {
    setCurrentTask({
      ...currentTask,
      steps: currentTask.steps.filter(step => step.id !== stepId)
    });
  };
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const steps = Array.from(currentTask.steps);
    const [reorderedItem] = steps.splice(result.source.index, 1);
    steps.splice(result.destination.index, 0, reorderedItem);
    
    setCurrentTask({
      ...currentTask,
      steps: steps
    });
  };
  
  // Toggle a setting
  const toggleSetting = (setting: keyof Task) => {
    setCurrentTask({
      ...currentTask,
      [setting]: !currentTask[setting]
    });
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: SubTask['difficulty']) => {
    if (!currentTask.color_coding) return 'bg-muted';
    
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-500 border-green-200';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-200';
      case 'hard': return 'bg-red-500/20 text-red-500 border-red-200';
      default: return 'bg-muted';
    }
  };
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!currentTask.steps.length) return 0;
    const completedSteps = currentTask.steps.filter(step => step.completed).length;
    return Math.round((completedSteps / currentTask.steps.length) * 100);
  };
  
  // Get ADHD-friendly motivational messages
  const getMotivationalMessage = () => {
    const messages = [
      "Break it down, knock it down! 💪",
      "Small steps lead to big victories! ✨",
      "You've got this! One step at a time. 🚶",
      "Progress is progress, no matter how small. 🌱",
      "Focus on just the next step. 🔍",
      "You're doing great! Keep going! 🎯",
      "Remember your 'why' - you can do this! 🌟"
    ];
    
    const completionPercentage = calculateCompletion();
    
    if (completionPercentage === 0) {
      return "Ready to start? You can do this! 🚀";
    } else if (completionPercentage < 25) {
      return "Great start! Keep that momentum going! 🌊";
    } else if (completionPercentage < 50) {
      return "You're making progress! Almost halfway there! 🏃‍♂️";
    } else if (completionPercentage < 75) {
      return "Over halfway done! You're crushing it! 💯";
    } else if (completionPercentage < 100) {
      return "So close to the finish line! You've got this! 🏁";
    } else {
      return "Task complete! Celebrate your accomplishment! 🎉";
    }
  };
  
  // Export task as PDF
  const exportAsPDF = () => {
    // Placeholder for PDF export feature
    toast({
      title: "Export Feature",
      description: "PDF export will be available in the next update",
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Task Breakdown Tool</h1>
            </div>
            <p className="text-muted-foreground mb-8">
              Break complex tasks into manageable steps - designed specifically for ADHD brains.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content area */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="current">Current Task</TabsTrigger>
                  <TabsTrigger value="saved">Saved Tasks</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="current" className="space-y-6 pt-4">
                  {/* Task title and description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {isEditing ? (
                          <Input
                            type="text"
                            placeholder="Task Title"
                            value={currentTask.title}
                            onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                            className="text-xl font-bold"
                          />
                        ) : (
                          <div className="flex justify-between items-center">
                            <span>{currentTask.title || "Untitled Task"}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setIsEditing(true)}
                            >
                              {isEditing ? "Done" : "Edit"}
                            </Button>
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea
                          placeholder="Describe what you're trying to accomplish..."
                          value={currentTask.description}
                          onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                          className="resize-none"
                          rows={3}
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {currentTask.description || "No description provided."}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Progress bar */}
                  {currentTask.progress_tracking && currentTask.steps.length > 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Progress</span>
                            <Badge variant="outline">{calculateCompletion()}% Complete</Badge>
                          </div>
                          <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300 ease-in-out"
                              style={{ width: `${calculateCompletion()}%` }}
                            ></div>
                          </div>
                          {currentTask.adhd_friendly_mode && (
                            <p className="text-sm font-medium text-center text-primary">
                              {getMotivationalMessage()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Steps list */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Steps Breakdown
                      </CardTitle>
                      <CardDescription>
                        Break your task into small, manageable steps
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Add new step */}
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add a new step..."
                          value={newStepContent}
                          onChange={(e) => setNewStepContent(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addStep()}
                        />
                        <Button onClick={addStep}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      
                      {/* Steps list with drag and drop */}
                      {currentTask.steps.length > 0 ? (
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="steps">
                            {(provided: DroppableProvided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-3"
                              >
                                {currentTask.steps.map((step, index) => (
                                  <Draggable key={step.id} draggableId={step.id} index={index}>
                                    {(provided: DraggableProvided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`border rounded-lg p-3 ${step.completed ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-input bg-card'} ${currentTask.color_coding ? getDifficultyColor(step.difficulty) : ''}`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="pt-1">
                                            <Checkbox
                                              checked={step.completed}
                                              onCheckedChange={(checked) => 
                                                updateStep(step.id, { completed: Boolean(checked) })
                                              }
                                            />
                                          </div>
                                          <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                              <div className={`flex-1 font-medium ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {step.content}
                                              </div>
                                              <div className="flex items-center ml-2">
                                                <div 
                                                  {...provided.dragHandleProps}
                                                  className="cursor-grab p-1 rounded-md hover:bg-muted"
                                                >
                                                  <MoveVertical className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => removeStep(step.id)}
                                                  className="h-8 w-8 p-0 ml-1"
                                                >
                                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                </Button>
                                              </div>
                                            </div>
                                            
                                            {isEditing && (
                                              <div className="grid grid-cols-2 gap-2 mt-2">
                                                <div className="space-y-1">
                                                  <Label htmlFor={`time-${step.id}`} className="text-xs flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" /> Estimated time
                                                  </Label>
                                                  <Slider
                                                    id={`time-${step.id}`}
                                                    min={5}
                                                    max={60}
                                                    step={5}
                                                    value={[step.estimated_minutes]}
                                                    onValueChange={(value) => 
                                                      updateStep(step.id, { estimated_minutes: value[0] })
                                                    }
                                                  />
                                                  <div className="text-xs text-right text-muted-foreground">
                                                    {step.estimated_minutes} min
                                                  </div>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                  <Label htmlFor={`difficulty-${step.id}`} className="text-xs">
                                                    Difficulty
                                                  </Label>
                                                  <div className="flex gap-1">
                                                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                                                      <Button
                                                        key={diff}
                                                        type="button"
                                                        size="sm"
                                                        variant={step.difficulty === diff ? "default" : "outline"}
                                                        className="flex-1 h-8 text-xs"
                                                        onClick={() => 
                                                          updateStep(step.id, { difficulty: diff })
                                                        }
                                                      >
                                                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                                      </Button>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                            
                                            {!isEditing && (
                                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center">
                                                  <Clock className="h-3 w-3 mr-1" /> 
                                                  {step.estimated_minutes} min
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                  {step.difficulty}
                                                </Badge>
                                              </div>
                                            )}
                                            
                                            {isEditing && (
                                              <div className="mt-2">
                                                <Textarea
                                                  placeholder="Add notes for this step..."
                                                  value={step.notes}
                                                  onChange={(e) => 
                                                    updateStep(step.id, { notes: e.target.value })
                                                  }
                                                  className="text-xs resize-none h-16"
                                                />
                                              </div>
                                            )}
                                            
                                            {!isEditing && step.notes && (
                                              <div className="mt-1 text-xs text-muted-foreground italic">
                                                {step.notes}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      ) : (
                        <div className="text-center py-8 border border-dashed rounded-lg">
                          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">
                            No steps yet. Break your task into smaller steps to make it more manageable.
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto"
                        onClick={saveTask}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Task
                      </Button>
                      
                      {currentTask.steps.length > 0 && calculateCompletion() === 100 && (
                        <Button 
                          className="w-full sm:w-auto"
                          onClick={completeTask}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Task Complete
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                  
                  {/* Reward for completion */}
                  {currentTask.adhd_friendly_mode && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Reward & Motivation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Label htmlFor="reward" className="mb-2 block">
                          What's your reward for completing this task?
                        </Label>
                        <Textarea
                          id="reward"
                          placeholder="Define your reward (e.g., '15 minutes of gaming', 'coffee at my favorite shop')"
                          value={currentTask.reward}
                          onChange={(e) => setCurrentTask({...currentTask, reward: e.target.value})}
                          className="resize-none"
                          rows={2}
                        />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="saved" className="space-y-4 pt-4">
                  {savedTasks.length > 0 ? (
                    <div className="space-y-3">
                      {savedTasks.map((task) => (
                        <Card key={task.id} className="overflow-hidden">
                          <div className="flex items-center cursor-pointer" onClick={() => loadTask(task)}>
                            <div className="p-4 flex-1">
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {task.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span>{task.steps.length} steps</span>
                                <span>
                                  {task.steps.filter(s => s.completed).length}/{task.steps.length} completed
                                </span>
                              </div>
                            </div>
                            <div className="p-4 flex flex-col items-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed rounded-lg">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Saved Tasks</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first task breakdown to get started.
                      </p>
                      <Button onClick={createNewTask}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create New Task
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="space-y-4 pt-4">
                  {completedTasks.length > 0 ? (
                    <div className="space-y-3">
                      {completedTasks.map((task) => (
                        <Card key={task.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  {task.title}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {task.description || 'No description'}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                Completed
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border border-dashed rounded-lg">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Completed Tasks</h3>
                      <p className="text-muted-foreground">
                        Your completed tasks will appear here.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Settings/controls card */}
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Customize your task breakdown experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="adhd-mode" className="text-base">ADHD-Friendly Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Visual cues and dopamine rewards
                      </p>
                    </div>
                    <Switch
                      id="adhd-mode"
                      checked={currentTask.adhd_friendly_mode}
                      onCheckedChange={() => toggleSetting('adhd_friendly_mode')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="color-coding" className="text-base">Color Coding</Label>
                      <p className="text-sm text-muted-foreground">
                        Highlight steps by difficulty
                      </p>
                    </div>
                    <Switch
                      id="color-coding"
                      checked={currentTask.color_coding}
                      onCheckedChange={() => toggleSetting('color_coding')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="progress-tracking" className="text-base">Progress Tracking</Label>
                      <p className="text-sm text-muted-foreground">
                        Visual progress indicators
                      </p>
                    </div>
                    <Switch
                      id="progress-tracking"
                      checked={currentTask.progress_tracking}
                      onCheckedChange={() => toggleSetting('progress_tracking')}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={createNewTask}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Task
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Tips card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    ADHD Task Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-medium mb-1">Break Tasks Down</h3>
                      <p className="text-muted-foreground">
                        Create tiny, achievable steps. The smaller, the better for the ADHD brain.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Body Doubling</h3>
                      <p className="text-muted-foreground">
                        Work alongside someone else (even virtually) to increase accountability.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Time Blocking</h3>
                      <p className="text-muted-foreground">
                        Set a timer for 15-25 minutes to work on just one step, then take a short break.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Reward Yourself</h3>
                      <p className="text-muted-foreground">
                        Define a specific reward for task completion to motivate your brain.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={exportAsPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Task Breakdown
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskBreakdown; 