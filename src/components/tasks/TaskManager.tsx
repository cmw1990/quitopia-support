import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { tasksApi } from '@/api/supabase-rest';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  ResponderProvided
} from '@hello-pangea/dnd';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card';
import { Button, buttonVariants } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Skeleton } from '../ui/skeleton';
import {
  PlusCircle,
  Edit,
  Trash2,
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  MoreHorizontal,
  Brain,
  Zap,
  ListFilter,
  Search,
  Calendar,
  LayoutList,
  KanbanSquare,
  Loader2,
  ClipboardList,
  FilterX
} from 'lucide-react';
import { format } from 'date-fns';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import type { Task as SharedTask, Subtask as SharedSubtask } from '@/types/tasks';

export type Task = SharedTask;
export type Subtask = SharedSubtask;

export interface Column {
  id: Task['status'];
  title: string;
  taskIds: string[];
}

export interface BoardState {
  tasks: Record<string, Task>;
  columns: Record<Task['status'], Column>;
  columnOrder: Array<Task['status']>;
}

const columnDetails: Record<Task['status'], { title: string; icon: React.ReactNode; colorClass: string }> = {
  todo: { title: 'To Do', icon: <Clock className="h-4 w-4" />, colorClass: 'text-blue-500' },
  inprogress: { title: 'In Progress', icon: <Loader2 className="h-4 w-4 animate-spin" />, colorClass: 'text-yellow-600' },
  done: { title: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, colorClass: 'text-green-600' },
};

const TaskManager: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterEnergy, setFilterEnergy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const initialBoardState: BoardState = {
    tasks: {},
    columns: {
      'todo': { id: 'todo', title: 'To Do', taskIds: [] },
      'inprogress': { id: 'inprogress', title: 'In Progress', taskIds: [] },
      'done': { id: 'done', title: 'Done', taskIds: [] }
    },
    columnOrder: ['todo', 'inprogress', 'done']
  };
  const [boardState, setBoardState] = useState<BoardState>(initialBoardState);

  const fetchTasks = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const fetchedTasks = await tasksApi.getTasks(user.id);
      const tasksWithDefaults = fetchedTasks.map(task => ({
        id: task.id,
        user_id: task.user_id,
        title: task.title,
        description: task.description || null,
        status: task.status || 'todo',
        priority: task.priority || null,
        cognitive_load: task.cognitive_load || null,
        created_at: task.created_at,
        due_date: task.due_date || null,
        energy_level_required: task.energy_level_required || null,
        updated_at: task.updated_at || task.created_at,
        subtasks: task.subtasks || [],
        tags: task.tags || [],
        estimated_minutes: task.estimated_minutes || null,
      })) as Task[];
      setTasks(tasksWithDefaults);
    } catch (error) {
      console.error('TaskManager: Error fetching tasks:', error);
      toast.error("Failed to load tasks.", { description: "Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);


  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    } else {
      setTasks([]);
      setBoardState(initialBoardState);
      setIsLoading(false);
    }
  }, [user?.id, fetchTasks]);

  useEffect(() => {
    const newBoardTasks: Record<string, Task> = {};
    const columnTaskIds: Record<Task['status'], string[]> = {
      todo: [],
      inprogress: [],
      done: [],
    };

    tasks.forEach(task => {
      newBoardTasks[task.id] = task;
      columnTaskIds[task.status]?.push(task.id);
    });

    setBoardState(prev => ({
      ...prev,
      tasks: newBoardTasks,
      columns: {
        'todo': { ...prev.columns.todo, taskIds: columnTaskIds.todo },
        'inprogress': { ...prev.columns.inprogress, taskIds: columnTaskIds.inprogress },
        'done': { ...prev.columns.done, taskIds: columnTaskIds.done }
      }
    }));
  }, [tasks]);

  const handleSaveTask = async (taskData: Partial<Task>, taskId?: string) => {
    if (!user) {
      toast.error("Authentication Error", { description: "You must be logged in to save tasks." });
      return;
    }
    setIsSubmitting(true);
    const isEditing = !!taskId;
    const toastId = toast.loading(isEditing ? "Updating task..." : "Creating task...");

    try {
      let savedTask: Task | null = null;
      if (isEditing) {
        const updatePayload = { ...taskData, updated_at: new Date().toISOString() };
        const result = await tasksApi.updateTask(taskId, updatePayload);
         savedTask = result?.[0] ?? null;
        if (savedTask) {
           setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? savedTask! : t));
           toast.success("Task updated successfully!", { id: toastId });
         } else {
             console.error("Update task API response invalid:", result);
             throw new Error("Update failed: Invalid response from server.");
         }
      } else {
        const createPayload = {
          ...taskData,
          user_id: user.id,
          status: 'todo',
        } as Omit<Task, 'id' | 'created_at'>;
         const result = await tasksApi.createTask(createPayload);
         savedTask = result?.[0] ?? null;
         if (savedTask) {
            setTasks(prevTasks => [...prevTasks, savedTask!]);
           toast.success("Task created successfully!", { id: toastId });
         } else {
              console.error("Create task API response invalid:", result);
              throw new Error("Create failed: Invalid response from server.");
         }
      }
      setEditingTask(null);
      setIsFormOpen(false);
    } catch (error: any) {
      console.error('Error saving task:', error);
      toast.error(isEditing ? "Failed to update task" : "Failed to create task", {
        description: error.message || "An unexpected error occurred.",
        id: toastId
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) {
       toast.error("Authentication Error", { description: "You must be logged in to delete tasks." });
       return;
    }
    setTaskToDelete(null);

    const originalTasks = [...tasks];
    const taskTitle = tasks.find(t => t.id === taskId)?.title || 'the task';
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

    const toastId = toast.loading(`Deleting "${taskTitle}"...`);

    try {
      await tasksApi.deleteTask(taskId);
      toast.success(`Task "${taskTitle}" deleted successfully!`, { id: toastId });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(`Failed to delete "${taskTitle}".`, {
        description: error.message || "Please try again. Restoring task.",
        id: toastId
      });
      setTasks(originalTasks);
    }
  };

  const onDragEnd = async (result: DropResult, provided: ResponderProvided) => {
    const { destination, source, draggableId } = result;

    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    const startColId = source.droppableId as Task['status'];
    const finishColId = destination.droppableId as Task['status'];
    const task = boardState.tasks[draggableId];

    if (!boardState.columns[startColId] || !boardState.columns[finishColId] || !task) {
      console.error("Drag Error: Invalid column or task ID.");
      toast.error("Drag Error", { description: "An internal error occurred. Please refresh." });
      return;
    }

    const startTaskIds = Array.from(boardState.columns[startColId].taskIds);
    const finishTaskIds = (startColId === finishColId)
      ? startTaskIds
      : Array.from(boardState.columns[finishColId].taskIds);

    startTaskIds.splice(source.index, 1);
    finishTaskIds.splice(destination.index, 0, draggableId);

    const newBoardState: BoardState = {
      ...boardState,
      columns: {
        ...boardState.columns,
        [startColId]: { ...boardState.columns[startColId], taskIds: startTaskIds },
        [finishColId]: { ...boardState.columns[finishColId], taskIds: finishTaskIds }
      },
    };
    setBoardState(newBoardState);

    if (task.status !== finishColId) {
      const originalTaskStatus = task.status;
      const updatedTaskWithStatus = { ...task, status: finishColId };

      setTasks(prevTasks => prevTasks.map(t => (t.id === draggableId ? updatedTaskWithStatus : t)));

      const toastId = toast.loading(`Moving "${task.title}" to ${columnDetails[finishColId].title}...`);
      try {
        await tasksApi.updateTask(draggableId, { status: finishColId });
        toast.success(`Task moved to ${columnDetails[finishColId].title}!`, { id: toastId });
      } catch (error: any) {
        console.error('Error updating task status after drag:', error);
        toast.error(`Failed to move task. Reverting.`, {
             description: error.message || "Please try again.",
             id: toastId
        });
        setBoardState(boardState);
        setTasks(prevTasks => prevTasks.map(t => (t.id === draggableId ? { ...t, status: originalTaskStatus } : t)));
      }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleUpdateSubtask = async (taskId: string, subtaskId: string, completed: boolean) => {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate || !taskToUpdate.subtasks) {
          toast.warning("Subtask Update Failed", { description: "Could not find the parent task." });
          return;
      }

      const updatedSubtasks = taskToUpdate.subtasks.map(sub =>
          sub.id === subtaskId ? { ...sub, completed } : sub
      );
      const updatedTaskData = { ...taskToUpdate, subtasks: updatedSubtasks };

      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTaskData : t));

      const toastId = toast.loading("Updating subtask status...");
      try {
          await tasksApi.updateTask(taskId, { subtasks: updatedSubtasks });
          toast.success("Subtask updated.", { id: toastId });
      } catch (error: any) {
          console.error("Failed to update subtask:", error);
          toast.error("Subtask update failed. Reverting.", {
              description: error.message || "Please try again.",
              id: toastId
          });
          setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? taskToUpdate : t));
      }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate || taskToUpdate.status === newStatus) return;

      const originalStatus = taskToUpdate.status;
      const updatedTaskData = { ...taskToUpdate, status: newStatus };

      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTaskData : t));

      const toastId = toast.loading(`Updating status to ${columnDetails[newStatus].title}...`);
      try {
          await tasksApi.updateTask(taskId, { status: newStatus });
          toast.success("Task status updated.", { id: toastId });
      } catch (error: any) {
          console.error("Failed to update task status:", error);
          toast.error("Status update failed. Reverting.", {
              description: error.message || "Please try again.",
              id: toastId
          });
          setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: originalStatus } : t));
      }
  };

  const handleToggleComplete = (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const newStatus = task.status === 'done' ? 'todo' : 'done';
      handleUpdateStatus(taskId, newStatus);
  };

  const filteredTasks = tasks.filter(task => {
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority || (filterPriority === 'none' && !task.priority);
    const energyMatch = filterEnergy === 'all' || task.energy_level_required === filterEnergy || (filterEnergy === 'none' && !task.energy_level_required);
    const searchTermMatch = searchTerm === '' ||
                            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return priorityMatch && energyMatch && searchTermMatch;
  });

  const filteredListTasks = viewMode === 'list' ? filteredTasks : tasks;

  const renderSkeletons = (count = 3) => (
    Array.from({ length: count }).map((_, index) => (
      <Card key={index} className="mb-3 animate-pulse bg-card/50 border border-border/20">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start space-x-2.5">
             <Skeleton className="h-5 w-5 rounded-sm mt-0.5 shrink-0" />
             <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-4/5 rounded" />
                <Skeleton className="h-3 w-3/5 rounded" />
             </div>
          </div>
        </CardHeader>
        <CardFooter className="px-3 pt-2 pb-2 border-t border-border/20">
          <div className="flex justify-between items-center w-full gap-2">
             <Skeleton className="h-4 w-10 rounded-full" />
             <Skeleton className="h-4 w-10 rounded-full" />
             <Skeleton className="h-4 w-8 rounded-full ml-auto" />
          </div>
        </CardFooter>
      </Card>
    ))
  );

  return (
    <div className="flex flex-col h-full p-4 md:p-6 bg-gradient-to-br from-background to-muted/20">
      <Card className="mb-4 shadow-sm bg-card/90 backdrop-blur-sm border-border/30 flex-shrink-0">
        <CardHeader className="pb-3 pt-4 px-4 md:px-5">
          <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight">My Tasks</CardTitle>
          <CardDescription className="text-sm">Organize and manage your workload effectively.</CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <Dialog open={isFormOpen} onOpenChange={(open) => {
                setIsFormOpen(open);
                if (!open) setEditingTask(null);
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="shadow hover:shadow-md transition-shadow w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
                 <DialogHeader className="p-6 pb-4 border-b border-border/30">
                   <DialogTitle className="text-xl font-semibold">
                       {editingTask ? 'Edit Task Details' : 'Create New Task'}
                   </DialogTitle>
                   <DialogDescription>
                     {editingTask ? 'Modify the task information below.' : 'Provide the details for your new task.'}
                   </DialogDescription>
                 </DialogHeader>
                 <div className="flex-grow overflow-y-auto px-6 pt-4 pb-6">
                    {user && (
                       <TaskForm
                          key={editingTask?.id || 'new'}
                          userId={user.id}
                          taskToEdit={editingTask}
                          onSaveTask={handleSaveTask}
                          onClose={() => setIsFormOpen(false)}
                       />
                    )}
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
              <div className="relative flex-grow sm:flex-grow-0 order-last sm:order-first w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      type="search"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-2 h-9 text-sm rounded-md border border-input bg-background/70 focus:bg-background w-full sm:w-36 md:w-44"
                  />
              </div>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="h-9 text-sm w-auto min-w-[110px] px-2.5 [&>span]:line-clamp-1">
                      <ListFilter className="h-3.5 w-3.5 mr-1.5 opacity-70 shrink-0" />
                      <span className="truncate">{filterPriority === 'all' ? 'Priority' : `${filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)}`}</span>
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high"><ArrowUp className="h-3.5 w-3.5 mr-1.5 text-red-500"/>High</SelectItem>
                      <SelectItem value="medium"><ArrowRight className="h-3.5 w-3.5 mr-1.5 text-yellow-500"/>Medium</SelectItem>
                      <SelectItem value="low"><ArrowDown className="h-3.5 w-3.5 mr-1.5 text-green-500"/>Low</SelectItem>
                      <SelectItem value="none">No Priority</SelectItem>
                  </SelectContent>
              </Select>

              <Select value={filterEnergy} onValueChange={setFilterEnergy}>
                  <SelectTrigger className="h-9 text-sm w-auto min-w-[110px] px-2.5 [&>span]:line-clamp-1">
                      <Zap className="h-3.5 w-3.5 mr-1.5 opacity-70 shrink-0"/>
                      <span className="truncate">{filterEnergy === 'all' ? 'Energy' : `${filterEnergy.charAt(0).toUpperCase() + filterEnergy.slice(1)}`}</span>
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Energy</SelectItem>
                      <SelectItem value="high"><Zap className="h-3.5 w-3.5 mr-1.5 text-orange-500"/>High Energy</SelectItem>
                      <SelectItem value="medium"><Zap className="h-3.5 w-3.5 mr-1.5 text-yellow-500 opacity-70"/>Medium Energy</SelectItem>
                      <SelectItem value="low"><Zap className="h-3.5 w-3.5 mr-1.5 text-blue-500 opacity-50"/>Low Energy</SelectItem>
                      <SelectItem value="none">None Required</SelectItem>
                  </SelectContent>
              </Select>

              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'board' | 'list')} className="w-auto">
                  <TabsList className="grid w-full grid-cols-2 h-9 p-0.5 bg-muted/60 border border-border/30">
                      <TabsTrigger value="board" className="text-xs px-2 py-1 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-[5px]">
                          <KanbanSquare className="h-4 w-4 mr-1"/> Board
                      </TabsTrigger>
                      <TabsTrigger value="list" className="text-xs px-2 py-1 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-[5px]">
                          <LayoutList className="h-4 w-4 mr-1"/> List
                      </TabsTrigger>
                  </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-grow overflow-y-auto pb-4 -mx-4 md:-mx-6 px-4 md:px-6">
         {isLoading ? (
            viewMode === 'board' ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  {initialBoardState.columnOrder.map(columnId => (
                     <Card key={columnId} className="bg-card/40 border-dashed border-border/20 min-h-[300px]">
                        <CardHeader className="border-b border-border/20 py-3 px-4">
                           <Skeleton className="h-5 w-2/5 rounded" />
                        </CardHeader>
                        <CardContent className="p-3 space-y-3">{renderSkeletons(2)}</CardContent>
                     </Card>
                  ))}
               </div>
            ) : (
               <div className="space-y-3">{renderSkeletons(5)}</div>
            )
         ) : tasks.length === 0 ? (
            <Card className="mt-4 text-center py-10 md:py-16 border-2 border-dashed border-border/20 bg-card/40 flex flex-col items-center justify-center">
               <CardContent className="flex flex-col items-center">
                  <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" strokeWidth={1.5} />
                  <h3 className="text-lg font-medium text-muted-foreground mb-1">No Tasks Yet</h3>
                  <p className="text-sm text-muted-foreground/70 mb-5 max-w-xs">Looks like your task list is empty. Ready to add something?</p>
                   <DialogTrigger asChild>
                     <Button onClick={handleAddTask} variant="outline" size="sm">
                       <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Task
                     </Button>
                   </DialogTrigger>
               </CardContent>
            </Card>
         ) : viewMode === 'board' ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {boardState.columnOrder.map(columnId => {
                  const column = boardState.columns[columnId];
                  const columnTasks = column.taskIds.map(taskId => boardState.tasks[taskId]).filter(Boolean);
                  const { title, icon, colorClass } = columnDetails[columnId];

                  return (
                    <Droppable key={column.id} droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                              "flex flex-col h-full rounded-lg border bg-card/70 shadow-sm",
                              snapshot.isDraggingOver ? 'border-primary/30 bg-primary/5' : 'border-border/30',
                              'transition-colors duration-200 ease-in-out'
                          )}
                        >
                          <div className="border-b border-border/30 py-2.5 px-3 sticky top-0 bg-card/90 backdrop-blur-sm z-10 rounded-t-lg">
                            <h3 className={cn("text-sm font-semibold flex items-center", colorClass)}>
                               <span className="mr-1.5">{icon}</span> {title}
                               <Badge variant="secondary" className="ml-auto text-xs font-normal px-1.5 py-0.5 bg-muted/70 border border-border/30">{columnTasks.length}</Badge>
                            </h3>
                          </div>
                          <div className="p-2 space-y-2 overflow-y-auto flex-grow min-h-[200px]">
                             {columnTasks.length === 0 && !snapshot.isDraggingOver ? (
                                <div className="text-center pt-8 pb-6 text-muted-foreground text-xs italic opacity-60 px-2">
                                    Drag tasks here or add new ones to this stage.
                                 </div>
                            ) : columnTasks.length === 0 && snapshot.isDraggingOver ? (
                                 <div className="m-2 text-center py-6 text-primary text-xs font-medium opacity-90 border-2 border-dashed border-primary/30 rounded-md bg-primary/10">
                                    Drop task here
                                 </div>
                             ) : (
                                columnTasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ ...provided.draggableProps.style }}
                                        className={cn(
                                          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg",
                                          snapshot.isDragging ? 'shadow-lg scale-[1.02] bg-card' : 'shadow-sm',
                                          'transition-all duration-150 ease-in-out'
                                        )}
                                      >
                                        <TaskCard
                                          task={task}
                                          onEdit={() => handleEditTask(task)}
                                          onDelete={() => setTaskToDelete(task.id)}
                                          onUpdateSubtask={(subtaskId, completed) => handleUpdateSubtask(task.id, subtaskId, completed)}
                                          onUpdateStatus={(status) => handleUpdateStatus(task.id, status)}
                                          onToggleComplete={() => handleToggleComplete(task.id)}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                            )}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </DragDropContext>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => setTaskToDelete(task.id)}
                      onUpdateSubtask={(subtaskId, completed) => handleUpdateSubtask(task.id, subtaskId, completed)}
                      onUpdateStatus={(status) => handleUpdateStatus(task.id, status)}
                      onToggleComplete={() => handleToggleComplete(task.id)}
                     />
                  ))
              ) : (
                   <Card className="mt-4 text-center py-10 md:py-16 border-2 border-dashed border-border/20 bg-card/40 flex flex-col items-center justify-center">
                     <CardContent className="flex flex-col items-center">
                        <FilterX className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" strokeWidth={1.5}/>
                        <h3 className="text-lg font-medium text-muted-foreground mb-1">No Matching Tasks</h3>
                        <p className="text-sm text-muted-foreground/70 mb-5 max-w-xs">Try adjusting your search or filter criteria.</p>
                          <Button onClick={() => {setFilterPriority('all'); setFilterEnergy('all'); setSearchTerm('');}} variant="outline" size="sm">
                             Clear Filters & Search
                          </Button>
                     </CardContent>
                  </Card>
              )}
            </div>
          )}
      </div>

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the task: <br />
              <span className="font-medium">"{tasks.find(t => t.id === taskToDelete)?.title || 'this task'}"</span>?
              <br /> This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
                onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
                className={buttonVariants({ variant: "destructive" })}
            >
              Yes, Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskManager;
