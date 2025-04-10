import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '@/services/taskService';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types/task';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, AlertCircle, ListTodo, Loader2, Circle, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

// Use string priorities aligned with Task type
const priorityOptions: { value: Task['priority']; label: string; color: string }[] = [
    { value: 'high', label: 'High', color: 'bg-red-500' },
    { value: 'medium', label: 'Medium', color: 'bg-orange-500' },
    { value: 'low', label: 'Low', color: 'bg-blue-500' },
    { value: null, label: 'None', color: 'bg-gray-400' }, // Represent null priority
];

export const TaskManagement: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState<string>('');
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium'); // Default to Medium string
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState<boolean>(false);
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const fetchTasks = useCallback(async () => {
        if (!user?.id) return;
        console.log('TaskManagement: Fetching tasks (Show completed:', showCompleted, ')');
        setIsLoading(true);
        setError(null);
        try {
            // Fetch non-archived tasks (default)
            const { data: incompleteData, error: incompleteError } = await taskService.getTasks('pending'); 
            if (incompleteError) throw incompleteError;
            
            let completedTasks: Task[] = [];
            if (showCompleted) {
                const { data: completedData, error: completedError } = await taskService.getTasks('completed');
                if (completedError) throw completedError;
                completedTasks = completedData || [];
            }
            
            setTasks([...(incompleteData || []), ...completedTasks]);
            console.log('TaskManagement: Fetched tasks:', incompleteData, completedTasks);
        } catch (err: any) {
            console.error('TaskManagement: Error fetching tasks:', err);
            const message = err.message || 'Failed to load tasks.';
            setError(message);
            toast({ title: "Error Loading Tasks", description: message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, toast, showCompleted]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchTasks();
        }
    }, [user, authLoading, fetchTasks]); // Rerun when showCompleted changes too

    const handleAddTask = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user?.id || !newTaskTitle.trim()) return;

        setIsAdding(true);
        try {
            const taskDto: CreateTaskDto = {
                title: newTaskTitle.trim(),
                priority: newTaskPriority,
                status: 'pending', // Explicitly set status
                // description can be added if needed
            };
            const { data: newTask, error } = await taskService.createTask(taskDto);
            if (error) throw error;
            if (!newTask) throw new Error("Failed to create task, no data returned.");

            // Add to the top of the list (assuming fetchTasks will sort later if needed)
            setTasks(prev => [newTask, ...prev]); 
            setNewTaskTitle('');
            setNewTaskPriority('medium'); // Reset priority
            toast({ title: "Task Added", description: `"${newTask.title}" created.` });
        } catch (err: any) {
            console.error('TaskManagement: Error adding task:', err);
            const message = err.message || 'Failed to add task.';
            toast({ title: "Error Adding Task", description: message, variant: "destructive" });
        } finally {
            setIsAdding(false);
        }
    };

    // Use status string for toggling
    const handleToggleComplete = async (taskId: string, currentStatus: Task['status']) => {
        if (!user?.id) return;
        const newStatus: Task['status'] = currentStatus === 'completed' ? 'pending' : 'completed';
        
        // Optimistic update
        const originalTasks = tasks;
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null } : task));
        
        try {
            const updateDto: UpdateTaskDto = { status: newStatus };
            const { error } = await taskService.updateTask(taskId, updateDto);
            if (error) throw error;
            
            toast({ title: `Task Marked as ${newStatus === 'completed' ? 'Completed' : 'Pending'}` });
            // Optional: Re-fetch if filtering/sorting is complex or depends on backend logic
            // fetchTasks(); 
            // If not re-fetching, filter out completed if showCompleted is false
            if (!showCompleted && newStatus === 'completed') {
                 setTasks(prev => prev.filter(task => task.id !== taskId));
            }
        } catch (err: any) {
            console.error('TaskManagement: Error updating task completion:', err);
            const message = err.message || 'Failed to update task status.';
            toast({ title: "Error Updating Task", description: message, variant: "destructive" });
            // Revert optimistic update on error
            setTasks(originalTasks);
        }
    };

    // Use priority string
    const handleChangePriority = async (taskId: string, newPriority: Task['priority']) => {
        if (!user?.id) return;
        
        // Optimistic update
        const originalTasks = tasks;
        setTasks(prev => prev.map(task => task.id === taskId ? { ...task, priority: newPriority } : task));
         
         try {
            const updateDto: UpdateTaskDto = { priority: newPriority };
            const { error } = await taskService.updateTask(taskId, updateDto);
            if (error) throw error;

            toast({ title: "Task Priority Updated" });
             // Optional: Re-fetch if sorting depends on backend logic
             // fetchTasks(); 
         } catch (err: any) {
            console.error('TaskManagement: Error updating task priority:', err);
             const message = err.message || 'Failed to update priority.';
            toast({ title: "Error Updating Priority", description: message, variant: "destructive" });
            // Revert optimistic update
            setTasks(originalTasks);
         }
    };
    
    const handleDeleteTask = async (taskId: string) => {
        if (!user?.id || !window.confirm("Are you sure you want to delete this task?")) return;
        
        // Optimistic update
        const originalTasks = tasks;
        setTasks(prev => prev.filter(task => task.id !== taskId));
        try {
            // Corrected call: only taskId is needed
            const { error } = await taskService.deleteTask(taskId);
            if (error) throw error;
            
            toast({ title: "Task Deleted" });
        } catch (err: any) {
             console.error('TaskManagement: Error deleting task:', err);
             const message = err.message || 'Failed to delete task.';
             toast({ title: "Error Deleting Task", description: message, variant: "destructive" });
             // Revert optimistic update
             setTasks(originalTasks);
        }
    };

    // Filter tasks based on status for display
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    const completedTasksToDisplay = showCompleted ? tasks.filter(t => t.status === 'completed') : [];

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ListTodo className="h-6 w-6" />
                        <span>Task Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="showCompleted"
                            checked={showCompleted}
                            onCheckedChange={(checked) => setShowCompleted(Boolean(checked))}
                        />
                        <label htmlFor="showCompleted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Show Completed
                        </label>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add Task Form */}
                <form onSubmit={handleAddTask} className="flex gap-2 mb-4 items-end">
                    <div className="flex-grow space-y-1">
                         <label htmlFor="new-task-title" className="text-xs font-medium">New Task Title</label>
                        <Input
                            id="new-task-title"
                            placeholder="What needs to be done?"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            required
                            className="flex-grow"
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="new-task-priority" className="text-xs font-medium">Priority</label>
                        {/* Use string value for Select */}
                        <Select value={newTaskPriority ?? 'none'} onValueChange={(value) => setNewTaskPriority(value === 'none' ? null : value as Task['priority'])}>
                            <SelectTrigger id="new-task-priority" className="w-[110px]">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                {priorityOptions.map(({ value, label }) => (
                                    <SelectItem key={label} value={value ?? 'none'}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={isAdding || !newTaskTitle.trim()}>
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} 
                        <span className="ml-2">Add</span>
                    </Button>
                </form>

                {/* Task List */}
                {isLoading && !authLoading && <div className="text-center p-4 text-muted-foreground">Loading tasks...</div>}
                {error && <div className="text-center p-4 text-red-600">Error: {error}</div>}
                {!isLoading && !error && tasks.length === 0 && <div className="text-center p-4 text-muted-foreground">No tasks yet. Add one above!</div>}

                 {!isLoading && !error && (
                    <div className="space-y-2">
                        {incompleteTasks.map(task => (
                            <TaskItem 
                                key={task.id}
                                task={task}
                                onToggleComplete={handleToggleComplete}
                                onChangePriority={handleChangePriority}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                        {showCompleted && completedTasksToDisplay.length > 0 && (
                            <>
                                <div className="text-sm font-medium text-muted-foreground pt-4 pb-2">Completed Tasks</div>
                                {completedTasksToDisplay.map(task => (
                                    <TaskItem 
                                        key={task.id}
                                        task={task}
                                        onToggleComplete={handleToggleComplete}
                                        onChangePriority={handleChangePriority}
                                        onDelete={handleDeleteTask}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Sub-component for individual task item
interface TaskItemProps {
    task: Task;
    onToggleComplete: (taskId: string, currentStatus: Task['status']) => void;
    onChangePriority: (taskId: string, newPriority: Task['priority']) => void;
    onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onChangePriority, onDelete }) => {
    
    const priorityStyle = priorityOptions.find(p => p.value === task.priority) || priorityOptions.find(p => p.value === null);

    return (
        <div 
            className={cn(
                "flex items-center gap-3 p-2 border rounded-md", 
                task.status === 'completed' && "opacity-60 bg-muted/50"
            )}
        >
            <button 
                onClick={() => onToggleComplete(task.id, task.status)} 
                title={task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
            >
                {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5" />}
            </button>

            <div className="flex-grow overflow-hidden">
                <span className={cn("text-sm", task.status === 'completed' && "line-through")}>{task.title}</span>
                {/* Optionally display description or due date here */}
            </div>

            <div className="flex-shrink-0 flex items-center gap-2">
                 {/* Priority Indicator/Select */}
                 <Select value={task.priority ?? 'none'} onValueChange={(value) => onChangePriority(task.id, value === 'none' ? null : value as Task['priority'])}>
                     <SelectTrigger className={cn(
                         "h-6 px-1.5 text-xs rounded-full border-0 focus:ring-0 focus:ring-offset-0",
                         priorityStyle?.color ?? 'bg-gray-400',
                         "text-white",
                         "w-[85px]"
                     )}>
                        <SelectValue placeholder="Prio" />
                    </SelectTrigger>
                    <SelectContent>
                        {priorityOptions.map(({ value, label }) => (
                             <SelectItem key={label} value={value ?? 'none'} className="text-xs">{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(task.id)} title="Delete Task">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}; 