import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Textarea } from '../ui/textarea';
import { 
  AlertTriangle, 
  ArrowRightToLine, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Edit3, 
  GripVertical, 
  ListTodo, 
  Plus, 
  Save, 
  Timer, 
  Trash, 
  Trophy, 
  Zap 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import

interface TaskStep {
  id: string;
  content: string;
  completed: boolean;
  estimated_minutes?: number;
  notes?: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
}

interface Task {
  id: string;
  title: string;
  description?: string;
  steps: TaskStep[];
  created_at: string;
  updated_at: string;
  completed: boolean;
}

export function TaskBreakdown() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskIndex, setActiveTaskIndex] = useState<number | null>(null);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newStepContent, setNewStepContent] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { session, user } = useAuth();
  
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);
  
  const loadTasks = async () => {
    if (!user || !session) return;
    
    setIsLoading(true);
    try {
      // Use supabaseRequest, handle response, remove session arg
      const { data, error: loadError } = await supabaseRequest<Task[]>(
        `/rest/v1/tasks8?user_id=eq.${user.id}&order=created_at.desc`,
        { method: "GET" }
        // Removed session argument
      );
      if (loadError) throw loadError; // Propagate error
      
      if (data) {
        setTasks(data);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createTask = async () => {
    if (!user || !session) {
      toast.error('Please log in to create tasks');
      return;
    }
    
    if (!newTaskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    setIsLoading(true);
    try {
      const newTask = {
        user_id: user.id,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || null,
        steps: [],
        completed: false
      };
      
      // Use supabaseRequest, handle response, remove session arg
      // Add select=* and Prefer header to get the created item back
      const { data: dataResponse, error: createError } = await supabaseRequest<Task[]>( // Expect array
        `/rest/v1/tasks8?select=*`,
        {
          method: "POST",
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify(newTask)
        }
        // Removed session argument
      );
      if (createError) throw createError; // Propagate error
      const data = dataResponse; // Keep as array for check below
      
      if (data && data.length > 0) {
        setTasks([data[0], ...tasks]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        toast.success('Task created successfully');
        setActiveTaskIndex(0);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTask = async (taskIndex: number) => {
    if (!user || !session) return;
    
    const task = tasks[taskIndex];
    if (!task) return;
    
    setIsLoading(true);
    try {
      // Use supabaseRequest, handle error, remove session arg
      const { error: updateError } = await supabaseRequest(
        `/rest/v1/tasks8?id=eq.${task.id}`,
        {
          method: "PATCH",
          headers: { 'Prefer': 'return=minimal' }, // Don't need result back
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            steps: task.steps,
            completed: task.completed,
            updated_at: new Date().toISOString()
          })
        }
        // Removed session argument
      );
      if (updateError) throw updateError; // Propagate error
      
      toast.success('Task updated successfully');
      setEditingTaskIndex(null);
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteTask = async (taskIndex: number) => {
    if (!user || !session) return;
    
    const task = tasks[taskIndex];
    if (!task) return;
    
    setIsLoading(true);
    try {
      // Use supabaseRequest, handle error, remove session arg
      const { error: deleteError } = await supabaseRequest(
        `/rest/v1/tasks8?id=eq.${task.id}`,
        { method: "DELETE" }
        // Removed session argument
      );
      if (deleteError) throw deleteError; // Propagate error
      
      const updatedTasks = [...tasks];
      updatedTasks.splice(taskIndex, 1);
      setTasks(updatedTasks);
      toast.success('Task deleted successfully');
      
      if (activeTaskIndex === taskIndex) {
        setActiveTaskIndex(null);
      } else if (activeTaskIndex !== null && activeTaskIndex > taskIndex) {
        setActiveTaskIndex(activeTaskIndex - 1);
      }
      
      if (editingTaskIndex === taskIndex) {
        setEditingTaskIndex(null);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };
  
  const addStep = (taskIndex: number) => {
    if (!newStepContent.trim()) {
      toast.error('Step content is required');
      return;
    }
    
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];
    
    if (!task) return;
    
    const newStep: TaskStep = {
      id: Date.now().toString(),
      content: newStepContent.trim(),
      completed: false,
      estimated_minutes: 15
    };
    
    task.steps = [...task.steps, newStep];
    setTasks(updatedTasks);
    setNewStepContent('');
    updateTask(taskIndex);
  };
  
  const updateStep = (taskIndex: number, stepIndex: number, updates: Partial<TaskStep>) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];
    
    if (!task || !task.steps[stepIndex]) return;
    
    task.steps[stepIndex] = { ...task.steps[stepIndex], ...updates };
    setTasks(updatedTasks);
    
    // Check if all steps are completed
    const allStepsCompleted = task.steps.length > 0 && task.steps.every(step => step.completed);
    if (allStepsCompleted && !task.completed) {
      task.completed = true;
      toast.success('🎉 Task completed! Great job!');
    } else if (!allStepsCompleted && task.completed) {
      task.completed = false;
    }
    
    updateTask(taskIndex);
  };
  
  const deleteStep = (taskIndex: number, stepIndex: number) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];
    
    if (!task) return;
    
    task.steps.splice(stepIndex, 1);
    setTasks(updatedTasks);
    updateTask(taskIndex);
    
    if (expandedStepIndex === stepIndex) {
      setExpandedStepIndex(null);
    } else if (expandedStepIndex !== null && expandedStepIndex > stepIndex) {
      setExpandedStepIndex(expandedStepIndex - 1);
    }
  };
  
  const reorderSteps = (taskIndex: number, reorderedSteps: TaskStep[]) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];
    
    if (!task) return;
    
    task.steps = reorderedSteps;
    setTasks(updatedTasks);
    updateTask(taskIndex);
  };
  
  const toggleTaskCompletion = (taskIndex: number) => {
    const updatedTasks = [...tasks];
    const task = updatedTasks[taskIndex];
    
    if (!task) return;
    
    task.completed = !task.completed;
    
    // If marking as complete, mark all steps as complete too
    if (task.completed) {
      task.steps = task.steps.map(step => ({
        ...step,
        completed: true
      }));
    }
    
    setTasks(updatedTasks);
    updateTask(taskIndex);
  };
  
  const visibleTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => !task.completed);
  
  const getDifficultyColor = (difficulty?: string) => {
    switch(difficulty) {
      case 'easy': return 'text-green-500';
      case 'moderate': return 'text-amber-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Task Breakdown
          </CardTitle>
          <CardDescription>
            Break down complex tasks into manageable steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New Task */}
          <Card className="border-dashed border-primary/40 bg-primary/5">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  placeholder="What do you need to accomplish?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description">Description (Optional)</Label>
                <Textarea
                  id="task-description"
                  placeholder="Add any additional details..."
                  rows={2}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>
              <Button 
                onClick={createTask} 
                disabled={!newTaskTitle.trim() || isLoading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" /> Create Task
              </Button>
            </CardContent>
          </Card>
          
          {/* Tasks List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-1">
                Your Tasks ({visibleTasks.length})
              </Label>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="show-completed" 
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
                />
                <Label htmlFor="show-completed" className="text-sm cursor-pointer">
                  Show Completed
                </Label>
              </div>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-8 text-muted-foreground"
                  >
                    <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tasks yet. Create one to get started!</p>
                  </motion.div>
                ) : (
                  visibleTasks.map((task, taskIndex) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className={`border ${task.completed ? 'bg-muted/50 border-muted' : ''}`}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={task.completed}
                              onCheckedChange={() => toggleTaskCompletion(taskIndex)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              {editingTaskIndex === taskIndex ? (
                                <div className="space-y-3">
                                  <Input
                                    value={task.title}
                                    onChange={(e) => {
                                      const updatedTasks = [...tasks];
                                      updatedTasks[taskIndex].title = e.target.value;
                                      setTasks(updatedTasks);
                                    }}
                                    className="font-medium"
                                    placeholder="Task title"
                                  />
                                  <Textarea
                                    value={task.description || ''}
                                    onChange={(e) => {
                                      const updatedTasks = [...tasks];
                                      updatedTasks[taskIndex].description = e.target.value;
                                      setTasks(updatedTasks);
                                    }}
                                    placeholder="Task description (optional)"
                                    rows={2}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      onClick={() => setEditingTaskIndex(null)}
                                      className="h-8"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => updateTask(taskIndex)}
                                      className="h-8"
                                    >
                                      <Save className="h-4 w-4 mr-1" /> Save
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {task.title}
                                    </h3>
                                    <div className="flex items-center gap-1">
                                      <Badge 
                                        variant={task.completed ? "outline" : "secondary"}
                                        className="text-xs"
                                      >
                                        {task.steps.filter(step => step.completed).length}/{task.steps.length} steps
                                      </Badge>
                                    </div>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingTaskIndex(editingTaskIndex === taskIndex ? null : taskIndex)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteTask(taskIndex)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setActiveTaskIndex(activeTaskIndex === taskIndex ? null : taskIndex)}
                              >
                                {activeTaskIndex === taskIndex ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {activeTaskIndex === taskIndex && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t"
                              >
                                <div className="space-y-4">
                                  {/* Steps */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-sm flex items-center gap-1">
                                        <ArrowRightToLine className="h-3 w-3" /> Break It Down
                                      </Label>
                                      {task.steps.length > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                          {task.steps.filter(step => step.completed).length}/{task.steps.length} completed
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <Reorder.Group
                                      axis="y"
                                      values={task.steps}
                                      onReorder={(newOrder) => reorderSteps(taskIndex, newOrder)}
                                      className="space-y-2"
                                    >
                                      <AnimatePresence mode="popLayout">
                                        {task.steps.map((step, stepIndex) => (
                                          <Reorder.Item
                                            key={step.id}
                                            value={step}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            whileDrag={{ scale: 1.02, backgroundColor: 'var(--primary-50)' }}
                                          >
                                            <motion.div
                                              className={`flex items-start gap-2 p-2 border rounded-md ${
                                                step.completed ? 'bg-muted/50 border-muted' : 'bg-card border-border'
                                              }`}
                                              transition={{ duration: 0.2 }}
                                            >
                                              <div className="pt-1">
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                              </div>
                                              
                                              <Checkbox 
                                                checked={step.completed}
                                                onCheckedChange={(checked) => 
                                                  updateStep(taskIndex, stepIndex, { completed: checked as boolean })
                                                }
                                                className="mt-1"
                                              />
                                              
                                              <div className="flex-1">
                                                <div className={`font-medium text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                  {step.content}
                                                </div>
                                                
                                                <AnimatePresence>
                                                  {expandedStepIndex === stepIndex && (
                                                    <motion.div
                                                      initial={{ opacity: 0, height: 0 }}
                                                      animate={{ opacity: 1, height: 'auto' }}
                                                      exit={{ opacity: 0, height: 0 }}
                                                      transition={{ duration: 0.2 }}
                                                      className="mt-2 space-y-2"
                                                    >
                                                      <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                          <Label className="text-xs">
                                                            Estimated Time
                                                          </Label>
                                                          <div className="flex items-center">
                                                            <Timer className="h-3 w-3 mr-1 text-muted-foreground" />
                                                            <Input
                                                              type="number"
                                                              min="1"
                                                              max="120"
                                                              value={step.estimated_minutes || 15}
                                                              onChange={(e) => 
                                                                updateStep(taskIndex, stepIndex, { 
                                                                  estimated_minutes: parseInt(e.target.value) || 15 
                                                                })
                                                              }
                                                              className="h-7 text-xs"
                                                            />
                                                            <span className="ml-1 text-xs text-muted-foreground">min</span>
                                                          </div>
                                                        </div>
                                                        
                                                        <div className="space-y-1">
                                                          <Label className="text-xs">
                                                            Difficulty
                                                          </Label>
                                                          <Select
                                                            value={step.difficulty || 'moderate'}
                                                            onValueChange={(value) => 
                                                              updateStep(taskIndex, stepIndex, { 
                                                                difficulty: value as any
                                                              })
                                                            }
                                                          >
                                                            <SelectTrigger className="h-7 text-xs">
                                                              <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                              <SelectItem value="easy">Easy</SelectItem>
                                                              <SelectItem value="moderate">Moderate</SelectItem>
                                                              <SelectItem value="hard">Hard</SelectItem>
                                                            </SelectContent>
                                                          </Select>
                                                        </div>
                                                      </div>
                                                      
                                                      <div className="space-y-1">
                                                        <Label className="text-xs">Notes</Label>
                                                        <Textarea
                                                          placeholder="Add any details or reminders..."
                                                          value={step.notes || ''}
                                                          onChange={(e) => 
                                                            updateStep(taskIndex, stepIndex, { 
                                                              notes: e.target.value 
                                                            })
                                                          }
                                                          className="min-h-[60px] text-xs"
                                                        />
                                                      </div>
                                                    </motion.div>
                                                  )}
                                                </AnimatePresence>
                                              </div>
                                              
                                              <div className="flex items-center gap-1 pt-1">
                                                {!step.completed && (
                                                  <Badge 
                                                    variant="outline" 
                                                    className={`text-xs ${
                                                      getDifficultyColor(step.difficulty)
                                                    }`}
                                                  >
                                                    {step.estimated_minutes || 15}m
                                                  </Badge>
                                                )}
                                                
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => 
                                                    setExpandedStepIndex(
                                                      expandedStepIndex === stepIndex ? null : stepIndex
                                                    )
                                                  }
                                                >
                                                  {expandedStepIndex === stepIndex ? (
                                                    <ChevronUp className="h-3 w-3" />
                                                  ) : (
                                                    <ChevronDown className="h-3 w-3" />
                                                  )}
                                                </Button>
                                                
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-destructive hover:text-destructive"
                                                  onClick={() => deleteStep(taskIndex, stepIndex)}
                                                >
                                                  <Trash className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </motion.div>
                                          </Reorder.Item>
                                        ))}
                                      </AnimatePresence>
                                    </Reorder.Group>
                                  </div>
                                  
                                  {/* Add Step */}
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Add a step..."
                                      value={newStepContent}
                                      onChange={(e) => setNewStepContent(e.target.value)}
                                      className="flex-1"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newStepContent.trim()) {
                                          addStep(taskIndex);
                                        }
                                      }}
                                    />
                                    <Button
                                      onClick={() => addStep(taskIndex)}
                                      disabled={!newStepContent.trim() || isLoading}
                                    >
                                      <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                  </div>
                                  
                                  {task.steps.length > 0 && (
                                    <div className="bg-muted/30 p-3 rounded-lg text-sm">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-muted-foreground">
                                            <strong>ADHD Tip:</strong> Start with the easiest task first to build momentum.
                                            Consider the "2-minute rule" - if a step takes less than 2 minutes, do it immediately.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 