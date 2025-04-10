import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseGet, supabasePost, supabasePatch, supabaseDelete } from '@/lib/supabaseApiService';
import { Task as TaskType, TaskPriority, TaskStatus } from '@/types/tasks';
import { Helmet } from 'react-helmet-async';
import { Trash2, Loader2, Filter } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const initialNewTaskState = {
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  due_date: ''
};

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [newTask, setNewTask] = useState(initialNewTaskState);
  const [filter, setFilter] = useState<{
    status?: TaskStatus,
    priority?: TaskPriority
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
        let query = `user_id=eq.${user.id}`;
        if (filter.status) {
            query += `&status=eq.${filter.status}`;
        }
        if (filter.priority) {
            query += `&priority=eq.${filter.priority}`;
        }
        query += `&order=created_at.desc`;

        const { data: fetchedTasks, error } = await supabaseGet<TaskType>('tasks', query);
        if (error) throw error;
        setTasks(fetchedTasks || []);
    } catch (err: any) {
        console.error("Error fetching tasks:", err);
        toast.error('Failed to load tasks.', { description: err.message });
        setTasks([]);
    } finally {
        setIsLoading(false);
    }
  }, [user?.id, filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const taskStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    return { totalTasks, completedTasks, pendingTasks };
  }, [tasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newTask.title) return;

    setIsSubmitting(true);
    try {
      const taskToCreate: Omit<TaskType, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        status: 'todo',
        due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
      };

      const { data: createdTask, error } = await supabasePost<TaskType>('tasks', [taskToCreate]);

      if (error) throw error;
      
      if (createdTask && createdTask.length > 0) {
        toast.success('Task Created', { description: newTask.title });
        setNewTask(initialNewTaskState);
        fetchTasks();
      } else {
         throw new Error("Task created but no data returned.");
      }

    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error('Task Creation Failed', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingTaskId(taskId);
    try {
      const { error } = await supabasePatch<TaskType>('tasks', { status: newStatus }, `id=eq.${taskId}`);
      if (error) throw error;

      setTasks(prevTasks => 
         prevTasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
      );
      toast.success('Task Status Updated');
    } catch (error: any) {
      console.error("Error updating task status:", error);
      toast.error('Task Update Failed', { description: error.message });
      fetchTasks(); 
    } finally {
        setUpdatingTaskId(null);
    }
  };

  const handleTaskCheck = (taskId: string, currentStatus: TaskStatus) => {
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      handleUpdateTaskStatus(taskId, newStatus);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setDeletingTaskId(taskId);
    try {
        const { error } = await supabaseDelete('tasks', `id=eq.${taskId}`);
        if (error) throw error;

        toast.success('Task Deleted');
        fetchTasks();
    } catch (error: any) {
        console.error("Error deleting task:", error);
        toast.error('Task Deletion Failed', { description: error.message });
    } finally {
        setDeletingTaskId(null);
    }
  };

  const formatDate = (dateString?: string | null) => {
      if (!dateString) return 'No due date';
      try {
          return new Date(dateString).toLocaleDateString();
      } catch (e) {
          return 'Invalid date';
      }
  };

  const getPriorityBadgeVariant = (priority: TaskPriority): "destructive" | "secondary" | "outline" => {
      switch(priority) {
          case 'high': return 'destructive';
          case 'medium': return 'secondary';
          case 'low':
          default: return 'outline';
      }
  };

  return (
    <div className="container mx-auto px-4 py-8">
       <Helmet>
          <title>Manage Tasks - Easier Focus</title>
       </Helmet>
      
       <h1 className="text-3xl font-bold mb-6">My Tasks</h1>

       <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card>
            <CardHeader>
                <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-4">
                <Input
                    placeholder="Task Title *"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    required
                    disabled={isSubmitting}
                />
                <Input
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isSubmitting}
                />
                <Select
                    value={newTask.priority}
                    onValueChange={(value: TaskPriority) => setNewTask(prev => ({ ...prev, priority: value }))}
                    disabled={isSubmitting}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
                <div>
                     <Label htmlFor="due-date" className="text-xs mb-1 block">Due Date (optional)</Label>
                     <Input
                        id="due-date"
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                        className="text-sm"
                        disabled={isSubmitting}
                     />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting || !newTask.title}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
                </form>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Task Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{taskStats.totalTasks}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{taskStats.completedTasks}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-orange-500">{taskStats.pendingTasks}</p>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
                 <CardTitle>Task List</CardTitle>
                 <div className="flex items-center space-x-2">
                     <Filter className="h-4 w-4 text-muted-foreground"/>
                    <Select
                        value={filter.status || 'all'}
                        onValueChange={(value) => 
                        setFilter(prev => ({ ...prev, status: value === 'all' ? undefined : value as TaskStatus }))
                        }
                    >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filter.priority || 'all'}
                        onValueChange={(value) => 
                        setFilter(prev => ({ ...prev, priority: value === 'all' ? undefined : value as TaskPriority }))
                        }
                    >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-3 py-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : tasks.length > 0 ? (
                <div className="space-y-3">
                {tasks.map(task => (
                    <div 
                    key={task.id} 
                    className={cn(
                        "border rounded-lg p-3 flex items-start gap-3 transition-colors hover:bg-muted/50",
                        task.status === 'completed' && 'opacity-60'
                    )}
                    >
                        <Checkbox 
                            id={`task-${task.id}`}
                            checked={task.status === 'completed'}
                            onCheckedChange={() => handleTaskCheck(task.id, task.status ?? 'todo')}
                            disabled={updatingTaskId === task.id || deletingTaskId === task.id}
                            className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                            <Label htmlFor={`task-${task.id}`} className={cn("font-medium cursor-pointer", task.status === 'completed' && 'line-through')}>{task.title}</Label>
                            {task.description && (
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant={getPriorityBadgeVariant(task.priority ?? 'low')} className="text-xs capitalize">
                                    {task.priority || 'low'}
                                </Badge>
                                {task.due_date && (
                                    <span>Due: {formatDate(task.due_date)}</span>
                                )}
                             </div>
                        </div>
                         <div className="flex items-center space-x-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={deletingTaskId === task.id || updatingTaskId === task.id}
                            >
                                {deletingTaskId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                         </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-6">No tasks found matching your filters.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksPage;