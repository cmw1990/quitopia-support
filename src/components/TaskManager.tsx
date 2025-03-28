import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Button,
  Input,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  Badge,
  ScrollArea,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui';
import { 
  CheckCircle2, 
  Plus, 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isPast, addDays, parseISO } from 'date-fns';
import useOfflineStatus from '../hooks/useOfflineStatus';
import { offlineStorage } from '../services/OfflineStorageService';
import useDebounce from '../hooks/useDebounce';
import apiClient, { Task } from '../services/ApiClient';

interface TaskManagerProps {
  session: Session | null;
}

const TaskManager: React.FC<TaskManagerProps> = ({ session }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskCategory, setTaskCategory] = useState('general');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [sortOrder, setSortOrder] = useState<'due_asc' | 'due_desc' | 'name_asc' | 'name_desc' | 'priority'>('due_asc');
  const [showAddTask, setShowAddTask] = useState(false);
  
  const { isOnline, syncProgress } = useOfflineStatus();
  
  // Define task categories
  const taskCategories = [
    { id: 'general', name: 'General', color: 'bg-gray-500' },
    { id: 'craving', name: 'Craving Management', color: 'bg-red-500' },
    { id: 'wellness', name: 'Wellness', color: 'bg-green-500' },
    { id: 'social', name: 'Social Support', color: 'bg-blue-500' },
    { id: 'progress', name: 'Progress Tracking', color: 'bg-purple-500' },
    { id: 'nrt', name: 'NRT & Products', color: 'bg-amber-500' },
  ];
  
  // Get task priority label and color
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'High', color: 'bg-red-500' };
      case 'medium':
        return { label: 'Medium', color: 'bg-yellow-500' };
      case 'low':
        return { label: 'Low', color: 'bg-green-500' };
      default:
        return { label: 'None', color: 'bg-gray-500' };
    }
  };
  
  // Debounced search function
  const debouncedSearch = useDebounce((value: string) => {
    setSearchQuery(value);
  }, 300);
  
  // Fetch tasks from API or offline storage
  const fetchTasks = async () => {
    if (!session?.user?.id) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isOnline) {
        const { data, error } = await apiClient.getTasks(session.user.id, session);
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
        setTasks(data);
        // Update offline storage with latest data
        await offlineStorage.setItem(`tasks_${session.user.id}`, data);
        }
      } else {
        const offlineTasks = await offlineStorage.getItem<Task[]>(`tasks_${session.user.id}`);
        if (offlineTasks) {
          setTasks(offlineTasks);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks. Using cached data if available.');
      
      if (session?.user?.id) {
      // Fall back to offline storage if API call fails
        const offlineTasks = await offlineStorage.getItem<Task[]>(`tasks_${session.user.id}`);
      if (offlineTasks) {
        setTasks(offlineTasks);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new task
  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to create tasks");
      return null;
    }

    try {
      if (isOnline) {
        const { data, error } = await apiClient.createTask(taskData, session);
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
          setTasks([data, ...tasks]);
          toast.success("Task created successfully!");
          return data;
        }
      } else {
        // For offline mode, generate a temporary ID
        const newTask: Task = {
          id: `temp_${Date.now()}`,
          ...taskData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const updatedTasks = [newTask, ...tasks];
        await offlineStorage.setItem(`tasks_${session.user.id}`, updatedTasks);
        setTasks(updatedTasks);
        
        await offlineStorage.addToSyncQueue(
          'mission4_tasks',
          'create',
          {
          type: 'CREATE_TASK',
            url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/mission4_tasks`,
          data: newTask,
          method: 'POST'
          }
        );
        
        toast.success("Task created in offline mode. Will sync when online.");
        return newTask;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
    }
    
    return null;
  };

  // Handle creating a new task
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("Task title cannot be empty");
      return;
    }
    
    if (!session?.user?.id) {
      toast.error("You must be logged in to create tasks");
      return;
    }
    
    const taskData = {
      user_id: session.user.id,
      title: newTaskTitle,
      description: newTaskDescription,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      priority: taskPriority,
      category: taskCategory,
      completed: false
    };
    
    const newTask = await createTask(taskData);
    
    if (newTask) {
      setNewTaskTitle('');
      setNewTaskDescription('');
      setDueDate(null);
      setTaskPriority('medium');
      setTaskCategory('general');
      setShowAddTask(false);
    }
  };
  
  // Handle task updates
  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to update tasks");
      return;
    }

    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      const updatedTask = { ...tasks[taskIndex], ...updates, updated_at: new Date().toISOString() };
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      
      if (isOnline) {
        const { error } = await apiClient.updateTask(taskId, updates, session);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setTasks(updatedTasks);
        await offlineStorage.setItem(`tasks_${session.user.id}`, updatedTasks);
        toast.success("Task updated successfully!");
      } else {
        await offlineStorage.setItem(`tasks_${session.user.id}`, updatedTasks);
        setTasks(updatedTasks);
        
        await offlineStorage.addToSyncQueue(
          'mission4_tasks',
          'update',
          {
          type: 'UPDATE_TASK',
            url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/mission4_tasks?id=eq.${taskId}`,
            data: updatedTask,
          method: 'PATCH'
          }
        );
        
        toast.success("Task updated in offline mode. Will sync when online.");
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Failed to update task. Please try again.");
    }
  };
  
  // Handle task completion toggle
  const handleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to update tasks");
      return;
    }

    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      const taskUpdate = {
        completed,
        completed_at: completed ? new Date().toISOString() : null
      };
      
      const updatedTask = { ...tasks[taskIndex], ...taskUpdate, updated_at: new Date().toISOString() };
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = updatedTask;
      
      if (isOnline) {
        const { error } = await apiClient.updateTask(taskId, taskUpdate, session);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setTasks(updatedTasks);
        await offlineStorage.setItem(`tasks_${session.user.id}`, updatedTasks);
        toast.success(`Task ${completed ? 'completed' : 'reopened'}`);
      } else {
        await offlineStorage.setItem(`tasks_${session.user.id}`, updatedTasks);
        setTasks(updatedTasks);
        
        await offlineStorage.addToSyncQueue(
          'mission4_tasks',
          'update',
          {
          type: 'UPDATE_TASK',
            url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/mission4_tasks?id=eq.${taskId}`,
            data: taskUpdate,
          method: 'PATCH'
          }
        );
        
        toast.success(`Task ${completed ? 'completed' : 'reopened'} (offline)`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Failed to update task. Please try again.");
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to delete tasks");
      return;
    }

    try {
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      
      if (isOnline) {
        const { error } = await apiClient.deleteTask(taskId, session);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setTasks(filteredTasks);
        await offlineStorage.setItem(`tasks_${session.user.id}`, filteredTasks);
        toast.success("Task deleted successfully!");
      } else {
        await offlineStorage.setItem(`tasks_${session.user.id}`, filteredTasks);
        setTasks(filteredTasks);
        
        await offlineStorage.addToSyncQueue(
          'mission4_tasks',
          'delete',
          {
          type: 'DELETE_TASK',
            url: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/mission4_tasks?id=eq.${taskId}`,
          method: 'DELETE'
          }
        );
        
        toast.success("Task deleted in offline mode. Will sync when online.");
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error("Failed to delete task. Please try again.");
    }
  };
  
  // Filter tasks based on current selections
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Apply status filter
    if (currentFilter === 'today') {
      filtered = filtered.filter(task => 
        task.due_date && isToday(parseISO(task.due_date)) && !task.completed
      );
    } else if (currentFilter === 'upcoming') {
      filtered = filtered.filter(task => 
        (task.due_date && !isPast(parseISO(task.due_date))) || !task.due_date && !task.completed
      );
    } else if (currentFilter === 'completed') {
      filtered = filtered.filter(task => task.completed);
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }
    
    // Apply priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'due_asc':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'due_desc':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        case 'name_asc':
          return a.title.localeCompare(b.title);
        case 'name_desc':
          return b.title.localeCompare(a.title);
        case 'priority':
          const priorityValues: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return priorityValues[a.priority as keyof typeof priorityValues] - priorityValues[b.priority as keyof typeof priorityValues];
        default:
          return 0;
      }
    });
    
    return filtered;
  };
  
  // Get task category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = taskCategories.find(c => c.id === categoryId);
    return category ? category.name : 'General';
  };
  
  // Get task category color by ID
  const getCategoryColor = (categoryId: string) => {
    const category = taskCategories.find(c => c.id === categoryId);
    return category ? category.color : 'bg-gray-500';
  };
  
  // Force refresh tasks
  const refreshTasks = () => {
    fetchTasks();
  };
  
  useEffect(() => {
    fetchTasks();
  }, [session, isOnline]);
  
  const filteredTasks = getFilteredTasks();
  
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Task Manager</h1>
          <p className="text-muted-foreground">
            Organize your quit journey with daily tasks and reminders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? "default" : "secondary"} className="flex items-center gap-1 px-3 py-1">
            {isOnline ? (
              <>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Online</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Offline</span>
              </>
            )}
          </Badge>
          
          <Button size="sm" variant="outline" onClick={refreshTasks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Task input section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && session?.user?.id) {
                    handleCreateTask();
                  }
                }}
              className="flex-1"
            />
              <Button onClick={() => session?.user?.id ? setShowAddTask(!showAddTask) : toast.error("You must be logged in")}>
              <Plus className="h-4 w-4 mr-2" />
                {showAddTask ? 'Cancel' : 'Add Task'}
              </Button>
            </div>
            
            {showAddTask && (
              <div className="space-y-4 pt-2 pb-1">
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input
                    placeholder="Task description (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select value={taskCategory} onValueChange={setTaskCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Priority</label>
                    <Select value={taskPriority} onValueChange={(val) => setTaskPriority(val as 'low' | 'medium' | 'high')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Due Date</label>
                    <Input
                      type="date"
                      onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                    />
                  </div>
                </div>
                
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
            </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Filters and sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs 
          defaultValue="all" 
          value={currentFilter} 
          onValueChange={(value) => setCurrentFilter(value as 'all' | 'today' | 'upcoming' | 'completed')}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search tasks..."
            onChange={(e) => debouncedSearch(e.target.value)}
            className="max-w-[200px]"
          />
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {taskCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort Tasks</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortOrder('due_asc')}>
                Due Date (Earlier First)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('due_desc')}>
                Due Date (Later First)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder('name_asc')}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('name_desc')}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder('priority')}>
                Priority (High to Low)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tasks list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-md animate-pulse">
                  <div className="h-5 w-5 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`flex items-start gap-3 p-3 border rounded-md ${task.completed ? 'bg-muted/30' : ''}`}>
                        <Checkbox 
                          checked={task.completed} 
                          onCheckedChange={() => handleTaskCompletion(task.id, !task.completed)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1">
                              <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={`${getCategoryColor(task.category)} bg-opacity-10 text-xs`}>
                                {getCategoryName(task.category)}
                              </Badge>
                              
                              <Badge className={`${getPriorityInfo(task.priority).color} text-xs`}>
                                {getPriorityInfo(task.priority).label}
                              </Badge>
                              
                              {task.due_date && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {task.tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {task.completed && task.completed_at && (
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed {format(new Date(task.completed_at), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              // Update task implementation
                              // This would open a modal to edit the task
                              // For simplicity, we'll just update the priority
                              const newPriority = task.priority === 'high' ? 'low' : 
                                task.priority === 'medium' ? 'high' : 'medium';
                              handleTaskUpdate(task.id, { priority: newPriority });
                            }}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              // Set due date for today
                              handleTaskUpdate(task.id, { due_date: new Date().toISOString() });
                            }}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Due Today
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              // Set due date for tomorrow
                              handleTaskUpdate(task.id, { due_date: addDays(new Date(), 1).toISOString() });
                            }}>
                              <Clock className="h-4 w-4 mr-2" />
                              Due Tomorrow
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No tasks found</h3>
              <p className="text-muted-foreground mt-1">
                {currentFilter === 'completed' 
                  ? "You haven't completed any tasks yet." 
                  : "Add your first task to get started!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {!isOnline && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="bg-amber-50 border-amber-200 shadow-lg">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-amber-800 font-medium">
                  Offline Mode: Changes will sync when you're back online
                </p>
              </div>
              {syncProgress && syncProgress.total > 0 && (
                <Badge variant="outline" className="bg-amber-100">
                  {syncProgress.completed}/{syncProgress.total} {syncProgress.total === 1 ? 'item' : 'items'} to sync
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TaskManager; 
