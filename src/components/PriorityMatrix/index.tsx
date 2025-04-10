import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Clock,
  Info,
  BarChart2,
  Grid,
  Check,
  AlertTriangle,
  X,
  Plus,
  Edit,
  Trash,
  Save,
  ThumbsUp,
  Calendar,
  ArrowRight,
  Sparkles,
  Loader2,
  MoveVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../AuthProvider';
import { supabaseRequest } from '@/utils/supabaseRequest'; // Corrected import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  quadrant: 'important-urgent' | 'important-not-urgent' | 'not-important-urgent' | 'not-important-not-urgent';
  created_at: string;
  updated_at: string;
  user_id: string;
  completed: boolean;
  due_date?: string;
  estimate_minutes?: number;
}

interface QuadrantInfo {
  id: 'important-urgent' | 'important-not-urgent' | 'not-important-urgent' | 'not-important-not-urgent';
  title: string;
  description: string;
  color: string;
  icon: JSX.Element;
  strategy: string;
}

export function PriorityMatrix() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeQuadrant, setActiveQuadrant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formQuadrant, setFormQuadrant] = useState<string>('important-urgent');
  const [formDueDate, setFormDueDate] = useState('');
  const [formEstimate, setFormEstimate] = useState<number | undefined>(undefined);
  
  const { session, user } = useAuth();
  
  // Define quadrant information
  const quadrants: QuadrantInfo[] = [
    {
      id: 'important-urgent',
      title: 'Do First',
      description: 'Important & Urgent',
      color: 'bg-red-500',
      icon: <AlertTriangle className="h-5 w-5" />,
      strategy: 'Handle these tasks immediately to avoid negative consequences'
    },
    {
      id: 'important-not-urgent',
      title: 'Schedule',
      description: 'Important & Not Urgent',
      color: 'bg-blue-500',
      icon: <Calendar className="h-5 w-5" />,
      strategy: 'Plan and schedule time for these tasks to achieve your goals'
    },
    {
      id: 'not-important-urgent',
      title: 'Delegate',
      description: 'Not Important & Urgent',
      color: 'bg-amber-500',
      icon: <ArrowRight className="h-5 w-5" />,
      strategy: 'Find ways to delegate or minimize time spent on these tasks'
    },
    {
      id: 'not-important-not-urgent',
      title: 'Eliminate',
      description: 'Not Important & Not Urgent',
      color: 'bg-green-500',
      icon: <X className="h-5 w-5" />,
      strategy: "Minimize or eliminate these tasks as they don't contribute value"
    }
  ];
  
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
        `/rest/v1/priority_tasks8?user_id=eq.${user.id}&order=created_at.desc`,
        { method: "GET" }
        // Removed session argument
      );
      if (loadError) throw loadError; // Propagate error
      
      if (data) {
        setTasks(data);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error('Failed to load priority tasks');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createTask = async () => {
    if (!user || !session) {
      toast.error('Please log in to create tasks');
      return;
    }
    
    if (!formTitle.trim()) {
      toast.error('Task title is required');
      return;
    }
    
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      const newTask = {
        user_id: user.id,
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        quadrant: formQuadrant,
        created_at: now,
        updated_at: now,
        completed: false,
        due_date: formDueDate || null,
        estimate_minutes: formEstimate || null
      };
      
      // Use supabaseRequest, handle response, remove session arg
      // Add select=* and Prefer header to get the created item back
      const { data: dataResponse, error: createError } = await supabaseRequest<Task[]>( // Expect array
        `/rest/v1/priority_tasks8?select=*`,
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
        resetForm();
        setIsCreating(false);
        toast.success('Task created successfully');
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTask = async (taskId: string) => {
    if (!user || !session) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      // Use supabaseRequest, handle error, remove session arg
      const { error: updateError } = await supabaseRequest(
        `/rest/v1/priority_tasks8?id=eq.${taskId}`,
        {
          method: "PATCH",
          headers: { 'Prefer': 'return=minimal' }, // Don't need result back
          body: JSON.stringify({
            title: formTitle.trim() || task.title,
            description: formDescription.trim() || null,
            quadrant: formQuadrant,
            updated_at: now,
            due_date: formDueDate || null,
            estimate_minutes: formEstimate || null
          })
        }
        // Removed session argument
      );
       if (updateError) throw updateError; // Propagate error
      
      // Update local state
      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              title: formTitle.trim() || t.title,
              description: formDescription.trim() || null,
              quadrant: formQuadrant as any,
              updated_at: now,
              due_date: formDueDate || undefined,
              estimate_minutes: formEstimate
            } 
          : t
      ));
      
      resetForm();
      setIsEditing(null);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!user || !session) return;
    
    try {
      const now = new Date().toISOString();
      
       // Use supabaseRequest, handle error, remove session arg
       const { error: toggleError } = await supabaseRequest(
         `/rest/v1/priority_tasks8?id=eq.${taskId}`,
         {
           method: "PATCH",
           headers: { 'Prefer': 'return=minimal' }, // Don't need result back
           body: JSON.stringify({
             completed: !completed,
             updated_at: now
           })
         }
         // Removed session argument
       );
       if (toggleError) throw toggleError; // Propagate error
      
      // Update local state
      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { ...t, completed: !completed, updated_at: now } 
          : t
      ));
      
      toast.success(completed ? 'Task marked as incomplete' : 'Task completed');
    } catch (error) {
      console.error("Error updating task completion:", error);
      toast.error('Failed to update task');
    }
  };
  
  const deleteTask = async (taskId: string) => {
    if (!user || !session) return;
    
    setIsLoading(true);
    try {
      // Use supabaseRequest, handle error, remove session arg
      const { error: deleteError } = await supabaseRequest(
        `/rest/v1/priority_tasks8?id=eq.${taskId}`,
        { method: "DELETE" }
        // Removed session argument
      );
      if (deleteError) throw deleteError; // Propagate error
      
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormQuadrant('important-urgent');
    setFormDueDate('');
    setFormEstimate(undefined);
  };
  
  const prepareEditForm = (task: Task) => {
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormQuadrant(task.quadrant);
    setFormDueDate(task.due_date || '');
    setFormEstimate(task.estimate_minutes);
    setIsEditing(task.id);
  };
  
  const getFilteredTasks = (quadrant: string) => {
    return tasks.filter(task => task.quadrant === quadrant);
  };
  
  const renderQuadrant = (quadrant: QuadrantInfo) => {
    const quadrantTasks = getFilteredTasks(quadrant.id);
    const totalTasks = quadrantTasks.length;
    const completedTasks = quadrantTasks.filter(t => t.completed).length;
    
    return (
      <div key={quadrant.id} className="relative">
        <Card className={`h-full border-t-4 ${quadrant.color}`}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2">
                {quadrant.icon}
                {quadrant.title}
              </CardTitle>
              <Badge variant="outline" className="font-mono">
                {completedTasks}/{totalTasks}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {quadrant.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[200px]">
            {quadrantTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-md">
                No tasks in this quadrant
              </div>
            ) : (
              <div className="space-y-2">
                {quadrantTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-3 border rounded-md ${task.completed ? 'bg-muted/50 border-dashed' : 'bg-card'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTaskCompletion(task.id, task.completed)}
                          className={`h-5 w-5 rounded-full flex items-center justify-center mt-0.5 ${
                            task.completed 
                              ? 'bg-primary text-primary-foreground' 
                              : 'border border-input'
                          }`}
                        >
                          {task.completed && <Check className="h-3 w-3" />}
                        </button>
                        <div>
                          <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.description.substring(0, 100)}
                              {task.description.length > 100 ? '...' : ''}
                            </p>
                          )}
                          
                          <div className="flex gap-2 mt-2">
                            {task.due_date && (
                              <Badge variant="secondary" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </Badge>
                            )}
                            {task.estimate_minutes && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {Math.floor(task.estimate_minutes / 60)}h {task.estimate_minutes % 60}m
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => prepareEditForm(task)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Priority Matrix
          </h2>
          <p className="text-muted-foreground mt-1">
            Organize tasks based on their importance and urgency
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                How to use the Eisenhower Matrix
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button onClick={() => { resetForm(); setIsCreating(true); }} className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">How to Use the Eisenhower Matrix</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      The Eisenhower Matrix helps you prioritize tasks based on their importance and urgency.
                      This method was named after President Dwight D. Eisenhower, who was known for his
                      exceptional productivity.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quadrants.map(q => (
                        <div key={q.id} className="flex items-start gap-2">
                          <div className={`h-8 w-8 rounded-full ${q.color} flex items-center justify-center flex-shrink-0`}>
                            {q.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{q.title} ({q.description})</h4>
                            <p className="text-sm text-muted-foreground">{q.strategy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-dashed border-primary/40 mb-4">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    placeholder="What needs to be done?"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description (Optional)</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Add more details about this task"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-quadrant">Priority Quadrant</Label>
                    <Select value={formQuadrant} onValueChange={setFormQuadrant}>
                      <SelectTrigger id="task-quadrant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="important-urgent">Important & Urgent</SelectItem>
                        <SelectItem value="important-not-urgent">Important & Not Urgent</SelectItem>
                        <SelectItem value="not-important-urgent">Not Important & Urgent</SelectItem>
                        <SelectItem value="not-important-not-urgent">Not Important & Not Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due Date (Optional)</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="task-estimate">Time Estimate (Minutes)</Label>
                    <Input
                      id="task-estimate"
                      type="number"
                      min="0"
                      placeholder="60"
                      value={formEstimate || ''}
                      onChange={(e) => setFormEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createTask}
                    disabled={!formTitle.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/40 mb-4">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-task-title">Task Title</Label>
                  <Input
                    id="edit-task-title"
                    placeholder="What needs to be done?"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-task-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-task-description"
                    placeholder="Add more details about this task"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-task-quadrant">Priority Quadrant</Label>
                    <Select value={formQuadrant} onValueChange={setFormQuadrant}>
                      <SelectTrigger id="edit-task-quadrant">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="important-urgent">Important & Urgent</SelectItem>
                        <SelectItem value="important-not-urgent">Important & Not Urgent</SelectItem>
                        <SelectItem value="not-important-urgent">Not Important & Urgent</SelectItem>
                        <SelectItem value="not-important-not-urgent">Not Important & Not Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-task-due-date">Due Date (Optional)</Label>
                    <Input
                      id="edit-task-due-date"
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-task-estimate">Time Estimate (Minutes)</Label>
                    <Input
                      id="edit-task-estimate"
                      type="number"
                      min="0"
                      placeholder="60"
                      value={formEstimate || ''}
                      onChange={(e) => setFormEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => isEditing && updateTask(isEditing)}
                    disabled={!formTitle.trim() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {renderQuadrant(quadrants[0])}
          {renderQuadrant(quadrants[2])}
        </div>
        <div className="space-y-4">
          {renderQuadrant(quadrants[1])}
          {renderQuadrant(quadrants[3])}
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>
          Tip: Tasks in the "Do First" quadrant should be your immediate focus, while "Schedule" tasks should be planned for deeper work sessions.
        </p>
      </div>
    </div>
  );
} 