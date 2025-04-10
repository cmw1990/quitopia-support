import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../components/ui/toast';
import { supabase } from '../../contexts/AuthContext';
import { format, parseISO } from 'date-fns';

type TaskPriority = 'low' | 'medium' | 'high';
type TaskStatus = 'todo' | 'in_progress' | 'completed';

interface Task {
  id?: string;
  user_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  created_at?: string;
}

const TaskManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo'
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('focus_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      toast({
        title: 'Error Fetching Tasks',
        description: err.message,
        variant: 'destructive'
      });
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async () => {
    if (!user || !newTask.title) return;

    try {
      const taskToCreate: Omit<Task, 'id'> = {
        user_id: user.id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority || 'medium',
        status: 'todo',
        due_date: newTask.due_date || null
      };

      const { data, error } = await supabase
        .from('focus_tasks')
        .insert(taskToCreate)
        .select();

      if (error) throw error;

      setTasks(prev => [data[0], ...prev]);
      setNewTask({ title: '', description: '', priority: 'medium', status: 'todo' });

      toast({
        title: 'Task Created',
        description: 'Your new task has been added',
        variant: 'success'
      });
    } catch (err: any) {
      toast({
        title: 'Error Creating Task',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('focus_tasks')
        .update(updates)
        .eq('id', taskId)
        .select();

      if (error) throw error;

      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );

      if (editingTask) setEditingTask(null);

      toast({
        title: 'Task Updated',
        description: 'Task details have been modified',
        variant: 'success'
      });
    } catch (err: any) {
      toast({
        title: 'Error Updating Task',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('focus_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));

      toast({
        title: 'Task Deleted',
        description: 'The task has been removed',
        variant: 'success'
      });
    } catch (err: any) {
      toast({
        title: 'Error Deleting Task',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus: TaskStatus = 
      task.status === 'completed' ? 'todo' : 'completed';

    await updateTask(task.id!, { status: newStatus });
  };

  const renderTaskList = () => {
    return tasks.map(task => (
      <Card key={task.id} className="mb-2">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => toggleTaskStatus(task)}
            />
            <div>
              <div className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </div>
              {task.description && (
                <div className="text-sm text-gray-500">{task.description}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {task.due_date && `Due: ${format(parseISO(task.due_date), 'MMM d, yyyy')}`}
                {task.priority && ` | Priority: ${task.priority}`}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setEditingTask(task)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => deleteTask(task.id!)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  };

  const renderTaskForm = () => {
    const isEditing = !!editingTask;
    const currentTask = isEditing ? editingTask : newTask;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Task Title"
            value={currentTask.title || ''}
            onChange={(e) => 
              isEditing 
                ? setEditingTask(prev => ({ ...prev!, title: e.target.value }))
                : setNewTask(prev => ({ ...prev, title: e.target.value }))
            }
          />
          <Input
            placeholder="Description (optional)"
            value={currentTask.description || ''}
            onChange={(e) => 
              isEditing 
                ? setEditingTask(prev => ({ ...prev!, description: e.target.value }))
                : setNewTask(prev => ({ ...prev, description: e.target.value }))
            }
          />
          <div className="flex space-x-4">
            <Select
              value={currentTask.priority || 'medium'}
              onValueChange={(value: TaskPriority) => 
                isEditing 
                  ? setEditingTask(prev => ({ ...prev!, priority: value }))
                  : setNewTask(prev => ({ ...prev, priority: value }))
              }
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
            <Input
              type="date"
              value={currentTask.due_date ? format(parseISO(currentTask.due_date), 'yyyy-MM-dd') : ''}
              onChange={(e) => 
                isEditing 
                  ? setEditingTask(prev => ({ ...prev!, due_date: e.target.value }))
                  : setNewTask(prev => ({ ...prev, due_date: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end space-x-2">
            {isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setEditingTask(null)}
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
            <Button 
              onClick={
                isEditing 
                  ? () => updateTask(editingTask!.id!, editingTask!) 
                  : createTask
              }
            >
              {isEditing ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Update Task
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Create Task
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <Helmet>
        <title>Task Manager - Easier Focus</title>
        <meta name="description" content="Manage your tasks and stay focused" />
      </Helmet>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {renderTaskForm()}
        <div className="mt-6">
          {renderTaskList()}
        </div>
      </main>
    </div>
  );
};

export default TaskManagerPage;