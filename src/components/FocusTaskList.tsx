import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTasks } from '@/hooks/useFocusTasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { FocusTask } from '@/hooks/useFocusTasks';

interface TaskFormData {
  title: string;
  description?: string;
  priority: FocusTask['priority'];
  due_date?: string;
  estimated_duration?: number;
  cognitive_load?: number;
  tags?: string[];
}

export function FocusTaskList() {
  const {
    isLoading,
    error,
    tasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
  } = useFocusTasks();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState<TaskFormData>({
    title: '',
    priority: 'medium',
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filterStatus, setFilterStatus] = useState<FocusTask['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<FocusTask['priority'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        ...newTaskData,
        due_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
      });
      setIsCreateDialogOpen(false);
      setNewTaskData({ title: '', priority: 'medium' });
      setSelectedDate(undefined);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleStatusChange = async (taskId: string, status: FocusTask['status']) => {
    try {
      await updateTask(taskId, { status });
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={(value: any) => setFilterPriority(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTaskData.title}
                    onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTaskData.description || ''}
                    onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTaskData.priority}
                    onValueChange={(value: FocusTask['priority']) =>
                      setNewTaskData({ ...newTaskData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="estimated_duration"
                    type="number"
                    value={newTaskData.estimated_duration || ''}
                    onChange={(e) =>
                      setNewTaskData({
                        ...newTaskData,
                        estimated_duration: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognitive_load">Cognitive Load (1-10)</Label>
                  <Input
                    id="cognitive_load"
                    type="number"
                    min="1"
                    max="10"
                    value={newTaskData.cognitive_load || ''}
                    onChange={(e) =>
                      setNewTaskData({
                        ...newTaskData,
                        cognitive_load: parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
                <Button type="submit">Create Task</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{task.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        task.priority === 'high' && 'bg-red-100',
                        task.priority === 'medium' && 'bg-yellow-100',
                        task.priority === 'low' && 'bg-green-100'
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  {task.description && (
                    <CardDescription>{task.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {task.due_date && (
                      <div className="text-sm">
                        Due: {format(new Date(task.due_date), 'PPP')}
                      </div>
                    )}
                    {task.estimated_duration && (
                      <div className="text-sm">
                        Estimated: {task.estimated_duration} minutes
                      </div>
                    )}
                    {task.cognitive_load && (
                      <div className="text-sm">
                        Cognitive Load: {task.cognitive_load}/10
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Select
                    value={task.status}
                    onValueChange={(value: FocusTask['status']) =>
                      handleStatusChange(task.id, value)
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 