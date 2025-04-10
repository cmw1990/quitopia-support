import { useState, useEffect, useCallback } from 'react';
import { Task, Subtask, TaskColumns, ColumnId, TaskStatus, ImportanceLevel, EnergyLevel } from '@/types/tasks';
import { useAuth } from '@/hooks/useAuth';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useToast } from '@/components/ui/use-toast';
import { DropResult } from '@hello-pangea/dnd';
import { checkAndAwardAchievements } from '@/lib/achievements';
import { Achievement } from '@/types/achievements';
import { v4 as uuidv4 } from 'uuid';

// Simple map for titles if needed, can be expanded
const columnTitles: Record<ColumnId, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    completed: 'Completed'
};

export const useTasks = () => {
  // --- ADDED: Log hook entry ---
  console.log("useTasks hook entered."); 
  // --- END ADDITION ---

  // Get user and session state, including loading status
  const { user, session, loading: authLoading } = useAuth(); 
  const accessToken = session?.access_token; // Get token if session exists
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]); // Raw task list
  const [columns, setColumns] = useState<TaskColumns>({ todo: [], in_progress: [], completed: [] });
  const [isLoading, setIsLoading] = useState(true); // Internal loading state for tasks
  const [error, setError] = useState<string | null>(null);

  // --- ADDED: Log before useEffect ---
  console.log(`useTasks: Before useEffect - authLoading=${authLoading}, user=${user?.id}, token=${accessToken ? 'Exists' : 'Missing'}).`);
  // --- END ADDITION ---

  // Fetch tasks and organize into columns
  const fetchTasks = useCallback(async () => {
    setError(null);

    // Check for user ID AND accessToken before fetching
    if (!user?.id || !accessToken) {
        console.log(`useTasks: Skipping fetch (User ID: ${user?.id}, Token: ${accessToken ? 'Exists' : 'Missing'}).`);
        setIsLoading(false); 
        setTasks([]);
        setColumns({ todo: [], in_progress: [], completed: [] });
        return;
    }

    setIsLoading(true);
    try {
      const fetchedTasks = await supabaseRequest<Task[] | null>(
          'focus_tasks',
          'GET',
          {
              filters: { user_id: user.id },
              orderBy: { column: 'order', ascending: true },
              select: '*',
              accessToken: accessToken // Pass token
          }
      );

      const taskList = fetchedTasks || [];
      setTasks(taskList);

      // Organize tasks into columns based on status
      const newColumns: TaskColumns = { todo: [], in_progress: [], completed: [] };
      taskList.forEach(task => {
          // Ensure subtasks is always an array, even if null/undefined from DB
          const taskWithSubtasks = { ...task, subtasks: task.subtasks || [] };
          const statusKey = taskWithSubtasks.status as ColumnId;
          if (newColumns[statusKey]) {
              newColumns[statusKey].push(taskWithSubtasks);
          } else {
               console.warn(`Task ${taskWithSubtasks.id} has unknown status: ${taskWithSubtasks.status}. Placing in todo.`);
               newColumns.todo.push({ ...taskWithSubtasks, status: 'todo'}); // Fallback to todo
          }
      });

      // Ensure columns are sorted by order
      Object.keys(newColumns).forEach(key => {
          newColumns[key as ColumnId].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
          // Ensure subtasks within each task are sorted by order
          newColumns[key as ColumnId].forEach(task => {
              task.subtasks?.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
          });
      });

      setColumns(newColumns);

    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError('Failed to load tasks. Please try again.');
      toast({ title: 'Error Loading Tasks', description: err.message, variant: 'destructive' });
      setTasks([]); // Clear tasks on error
      setColumns({ todo: [], in_progress: [], completed: [] }); // Clear columns on error
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, accessToken, toast]); // Add accessToken to dependency array

  useEffect(() => {
    if (!authLoading) {
        console.log(`useTasks useEffect: Auth loading finished (User ID: ${user?.id}, Token: ${accessToken ? 'Exists' : 'Missing'}). Calling fetchTasks.`);
        fetchTasks();
    } else {
        console.log("useTasks useEffect: Auth still loading...");
        setIsLoading(true);
    }
    // Depend on authLoading, fetchTasks callback, and potentially user/token changes
  }, [authLoading, fetchTasks, user?.id, accessToken]); // Add accessToken dependency

  // Add Task
  const addTask = useCallback(async (title: string, columnId: ColumnId): Promise<Task | null> => {
      if (!user?.id || !title.trim() || !accessToken) return null; // Check token

      const targetColumn = columns[columnId];
      if (!targetColumn) return null; // Invalid column

      const tempId = `temp-${Date.now()}`;
      const highestOrder = targetColumn.reduce((max, task) => Math.max(max, task.order ?? -1), -1);
      
      // Basic new task data
      const newTaskData: Partial<Task> = {
         title: title.trim(),
         status: columnId,
         user_id: user.id,
         priority: 'medium',
         importance: 5 as ImportanceLevel,
         urgency: 5 as ImportanceLevel,
         order: highestOrder + 1,
      };

      // Optimistic Update
      const newTaskOptimistic: Task = {
          id: tempId,
          user_id: user.id,
          title: newTaskData.title!,
          status: columnId,
          priority: newTaskData.priority,
          importance: newTaskData.importance,
          urgency: newTaskData.urgency,
          order: newTaskData.order!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          description: null,
          cognitive_load_estimate: null,
          energy_level_required: null,
          due_date: null,
          scheduled_start_time: null,
          scheduled_end_time: null,
          subtasks: [],
          tags: [],
          completed_at: null,
      };

      // Add to the correct column optimistically
      setColumns(prev => ({
         ...prev,
         [columnId]: [...prev[columnId], newTaskOptimistic].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
       }));
       setTasks(prev => [...prev, newTaskOptimistic]);

      try {
          const savedTask = await supabaseRequest<Task>(
              'focus_tasks',
              'POST',
              {
                 data: newTaskData,
                 select: '*,' +
                         'subtasks(*)',
                 accessToken: accessToken // Pass token
              }
          );
           // Ensure subtasks is an array
           const finalSavedTask = { ...savedTask, subtasks: savedTask.subtasks || [] };
          
          // Replace temp task with saved task in the correct column
          setColumns(prev => ({
              ...prev,
              [columnId]: prev[columnId].map(task => task.id === tempId ? finalSavedTask : task)
                                         .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
          }));
           setTasks(prev => prev.map(task => task.id === tempId ? finalSavedTask as Task : task));
          const colTitle = columnTitles[columnId] || columnId;
          toast({ title: 'Task Added', description: `"${finalSavedTask.title}" added to ${colTitle}.` });

          // Return the newly created task (useful if the caller needs the ID)
          return finalSavedTask;

      } catch (err: any) {
          console.error('Error adding task:', err);
          setError('Failed to add task.');
          toast({ title: 'Error Adding Task', description: err.message, variant: 'destructive' });
          // Rollback optimistic update
          setColumns(prev => ({
              ...prev,
              [columnId]: prev[columnId].filter(task => task.id !== tempId)
          }));
          setTasks(prev => prev.filter(task => task.id !== tempId));
          return null; // Indicate failure
      }
  }, [user?.id, accessToken, toast, columns]); // Add accessToken dependency

  // Update Task
  const updateTask = useCallback(async (updatedTaskData: Task) => {
       if (!user?.id || !accessToken) return; // Check token

       const originalTask = tasks.find(t => t.id === updatedTaskData.id);
       if (!originalTask) return;

       const wasCompleted = originalTask.status === 'completed';
       const isNowCompleted = updatedTaskData.status === 'completed';
       const completed_at = isNowCompleted && !wasCompleted ? new Date().toISOString() : originalTask.completed_at;

        // Ensure subtasks are always an array and sorted
        const sortedSubtasks = (updatedTaskData.subtasks || []).sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
        const taskToUpdateOptimistically = { ...updatedTaskData, subtasks: sortedSubtasks, completed_at };

       // Optimistic Update
       setTasks(prev => prev.map(t => t.id === updatedTaskData.id ? taskToUpdateOptimistically : t));
       // Update columns requires finding the task and potentially moving it
       setColumns(prev => {
           const newCols = { ...prev };
           const oldStatus = originalTask.status as ColumnId;
           const newStatus = updatedTaskData.status as ColumnId;

           // Remove from old column
           if (newCols[oldStatus]) {
               newCols[oldStatus] = newCols[oldStatus].filter(t => t.id !== updatedTaskData.id);
           }
           // Add to new column (or update in place)
           if (newCols[newStatus]) {
                // Check if it already exists (e.g., only content changed, not status)
                const exists = newCols[newStatus].some(t => t.id === updatedTaskData.id);
                if (!exists) {
                     newCols[newStatus].push(taskToUpdateOptimistically);
                } else {
                     newCols[newStatus] = newCols[newStatus].map(t =>
                         t.id === updatedTaskData.id ? taskToUpdateOptimistically : t
                     );
                }
                // Re-sort the column after adding/updating
                newCols[newStatus].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
           } else {
               console.warn(`Task ${updatedTaskData.id} has unknown status: ${newStatus}. Placing in todo.`);
               const fallbackTask = { ...taskToUpdateOptimistically, status: 'todo' as ColumnId };
               newCols.todo.push(fallbackTask);
               newCols.todo.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
           }
           return newCols;
       });

       try {
           // Prepare data for PATCH (exclude fields managed by DB like created_at, user_id)
           const { created_at, user_id, ...patchData } = { ...taskToUpdateOptimistically };
           const finalPatchData = { ...patchData, completed_at };

            await supabaseRequest<Task>(
               'focus_tasks',
               'PATCH',
               {
                   id: updatedTaskData.id,
                   data: finalPatchData,
                   select: '*,' +
                           'subtasks(*)',
                   accessToken: accessToken // Pass token
               }
           );
           // No need to update state again, optimistic update is done
           toast({ title: 'Task Updated', description: `"${updatedTaskData.title}" saved.` });

           // --- Check achievements AFTER successful update ---
           if (!wasCompleted && isNowCompleted) {
               console.log(`Task ${updatedTaskData.id} marked complete, checking achievements...`);
                try {
                     // Fetch total completed tasks count
                     const completedTasksCountResponse = await supabaseRequest<any>(
                         'focus_tasks',
                         'GET',
                         {
                             filters: { user_id: user.id, status: 'completed' },
                             select: 'count'
                         }
                     );
                     // Supabase count returns an object like { count: number } or an array with it
                     const totalCompletedCount = completedTasksCountResponse?.count ?? 
                                                 (Array.isArray(completedTasksCountResponse) ? completedTasksCountResponse[0]?.count : 0) ?? 
                                                 0;

                     // Check achievements
                     const newAchievements = await checkAndAwardAchievements(
                         user.id,
                         'tasks_completed',
                         totalCompletedCount
                     );

                     // Show notifications
                     newAchievements.forEach((ach: Achievement) => {
                         toast({
                            title: `🏆 Achievement Unlocked!`,
                            description: ach.name,
                            variant: 'default'
                         });
                     });
                } catch (achError: any) {
                     console.error("Error checking task achievements:", achError);
                     // Don't rollback the task update just because achievement check failed
                }
           }

       } catch (err: any) {
            console.error('Error updating task:', err);
            setError('Failed to update task.');
            toast({ title: 'Error Saving Task', description: err.message, variant: 'destructive' });
            // Rollback optimistic update by refetching (simplest way to ensure consistency)
            fetchTasks();
       }
  }, [user?.id, accessToken, toast, tasks, fetchTasks]); // Add accessToken dependency

  // Delete Task
  const deleteTask = useCallback(async (taskId: string) => {
      if (!user?.id || !taskId || !accessToken) return; // Check token

      const taskToDelete = tasks.find(t => t.id === taskId);
      if (!taskToDelete) return;

      // Optimistic Update
      const originalTasks = tasks;
      const originalColumns = columns;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setColumns(prev => {
           const newCols = { ...prev };
           const statusKey = taskToDelete.status as ColumnId;
           if (newCols[statusKey]) {
               newCols[statusKey] = newCols[statusKey].filter(t => t.id !== taskId);
           }
           return newCols;
      });
      toast({ title: 'Task Deleted', description: `"${taskToDelete.title}" removed.` });

      try {
          await supabaseRequest<null>(
              'focus_tasks',
              'DELETE',
              {
                  id: taskId,
                  accessToken: accessToken // Pass token
              }
          );
      } catch (err: any) {
           console.error('Error deleting task:', err);
           setError('Failed to delete task.');
           toast({ title: 'Error Deleting Task', description: err.message, variant: 'destructive' });
           // Rollback optimistic update
           setTasks(originalTasks);
           setColumns(originalColumns);
      }
  }, [user?.id, accessToken, toast, tasks, columns]); // Add accessToken dependency

  // Move Task (Drag and Drop Handler)
   const moveTask = useCallback(async (result: DropResult) => {
       const { source, destination, draggableId } = result;

       if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
           return;
       }

       const startColId = source.droppableId as ColumnId;
       const endColId = destination.droppableId as ColumnId;
       const startCol = columns[startColId];
       const endCol = columns[endColId];

       if (!startCol || !endCol) return; // Invalid columns

       const taskToMoveIndex = startCol.findIndex(task => task.id === draggableId);
       if (taskToMoveIndex === -1) return; // Task not found
       const taskToMove = { ...startCol[taskToMoveIndex] }; // Clone the task
       
       // --- Optimistic State Update --- 
       const newColumnsState = { ...columns };
       // Remove from source column
       newColumnsState[startColId] = startCol.filter(t => t.id !== draggableId);
       // Add to destination column at the correct index
       newColumnsState[endColId] = [...endCol];
       newColumnsState[endColId].splice(destination.index, 0, { ...taskToMove, status: endColId }); // Update status immediately

       // Update order for both columns
       const updateOrders = (tasks: Task[]) => tasks.map((task, index) => ({ ...task, order: index }));
       newColumnsState[startColId] = updateOrders(newColumnsState[startColId]);
       newColumnsState[endColId] = updateOrders(newColumnsState[endColId]);

       setColumns(newColumnsState);
       setTasks(Object.values(newColumnsState).flat()); // Update raw task list as well
       
       // --- Backend Update --- 
       if (!user?.id || !accessToken) {
           toast({ title: 'Error Moving Task', description: 'Authentication required.', variant: 'destructive' });
           fetchTasks(); // Revert by refetching
           return;
       }
       
       // Prepare data for bulk update (upsert)
       const updates: Partial<Task>[] = [
            // Collect tasks from the destination column with updated order and potentially status
            ...newColumnsState[endColId].map(task => ({ 
                id: task.id, 
                order: task.order, 
                status: task.status
            })),
            // Collect tasks from the source column if it's different
            ...(startColId !== endColId ? newColumnsState[startColId].map(task => ({ 
                id: task.id, 
                order: task.order 
            })) : [])
       ];

       // Identify the task that actually moved
       const movedTaskData = updates.find(u => u.id === draggableId);
       const wasCompleted = taskToMove.status === 'completed';
       const isNowCompleted = endColId === 'completed';
       const completed_at = isNowCompleted && !wasCompleted ? new Date().toISOString() : taskToMove.completed_at;

       // Add completed_at timestamp if the moved task is now completed
        if (movedTaskData && isNowCompleted && !wasCompleted) {
            movedTaskData.completed_at = completed_at;
        }

       try {
            await supabaseRequest<Task[]>(
               'focus_tasks',
               'PATCH',
               {
                   data: updates,
                   preferReturn: 'minimal',
                   accessToken: accessToken // Pass token
               }
           );

            // Achievement check after successful move
            if (isNowCompleted && !wasCompleted) {
                 console.log(`Task ${draggableId} moved to complete, checking achievements...`);
                 try {
                     const completedTasksCountResponse = await supabaseRequest<any>('focus_tasks', 'GET', {
                        filters: { user_id: user.id, status: 'completed' }, 
                        select: 'count'
                     });
                     const totalCompletedCount = completedTasksCountResponse?.count ?? 
                                                  (Array.isArray(completedTasksCountResponse) ? completedTasksCountResponse[0]?.count : 0) ?? 
                                                  0;
                     const newAchievements = await checkAndAwardAchievements(user.id, 'tasks_completed', totalCompletedCount);
                     newAchievements.forEach((ach: Achievement) => {
                         toast({ title: `🏆 Achievement Unlocked!`, description: ach.name });
                     });
                 } catch (achError: any) { console.error("Error checking task achievements after move:", achError); }
             }
       } catch (err: any) {
           console.error('Error moving task:', err);
           setError('Failed to move task.');
           toast({ title: 'Error Moving Task', description: err.message, variant: 'destructive' });
           fetchTasks(); // Revert by refetching
       }
   }, [columns, toast, user?.id, accessToken, fetchTasks]); // Add accessToken dependency

  // Toggle Subtask Completion
  const toggleSubtaskCompletion = useCallback(async (taskId: string, subtaskId: string, isCompleted: boolean): Promise<Subtask | null> => {
      if (!user?.id || !subtaskId || !taskId || !accessToken) return null; // Check token

      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate || !taskToUpdate.subtasks) return null;

      const subtaskIndex = taskToUpdate.subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex === -1) return null;

      // Create the updated subtasks array for the specific task
      const updatedSubtasks = taskToUpdate.subtasks.map((st, index) =>
          index === subtaskIndex ? { ...st, isCompleted: isCompleted } : st
      );

      const updatedTask = { ...taskToUpdate, subtasks: updatedSubtasks };

      // Optimistic Update
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
      setColumns(prevCols => {
          const newCols = { ...prevCols };
          const status = taskToUpdate.status as ColumnId;
          if (newCols[status]) {
              newCols[status] = newCols[status].map(t => t.id === taskId ? updatedTask : t);
          }
          return newCols;
      });

      try {
          // Persist only the subtasks array change to the backend
          const updatedSubtask = await supabaseRequest<Subtask>(
              'subtasks',
              'PATCH',
              {
                  id: subtaskId,
                  data: { isCompleted: !taskToUpdate.subtasks[subtaskIndex].isCompleted },
                  select: '*',
                  accessToken: accessToken // Pass token
              }
          );
          // Success
          return updatedSubtask;
      } catch (err: any) {
          console.error('Error toggling subtask:', err);
          toast({ title: 'Error Updating Subtask', description: err.message, variant: 'destructive' });
          // Rollback optimistic update on error
          const originalSubtask = taskToUpdate.subtasks[subtaskIndex];
          const rolledBackSubtasks = taskToUpdate.subtasks.map((st, index) =>
             index === subtaskIndex ? originalSubtask : st
          );
          const originalTask = { ...taskToUpdate, subtasks: rolledBackSubtasks };
           setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? originalTask : t));
           setColumns(prevCols => {
              const newCols = { ...prevCols };
              const status = taskToUpdate.status as ColumnId;
              if (newCols[status]) {
                  newCols[status] = newCols[status].map(t => t.id === taskId ? originalTask : t);
              }
              return newCols;
            });
          return null;
      }

  }, [user?.id, accessToken, toast, tasks]); // Add accessToken dependency

  // Add Subtask
  const addSubtask = useCallback(async (taskId: string, subtaskTitle: string): Promise<Subtask | null> => {
      if (!user?.id || !taskId || !subtaskTitle.trim() || !accessToken) return null; // Check token

      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return null;

      const originalTask = tasks[taskIndex];
      const existingSubtasks = originalTask.subtasks || [];

      const newSubtask: Subtask = {
          id: uuidv4(),
          title: subtaskTitle.trim(),
          isCompleted: false,
          order: existingSubtasks.length,
      };

      const updatedSubtasks = [...existingSubtasks, newSubtask].sort((a,b) => (a.order ?? Infinity) - (b.order ?? Infinity));
      const updatedTask = { ...originalTask, subtasks: updatedSubtasks };

      // --- Optimistic Update ---
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
      setColumns(prevCols => {
          const newCols = { ...prevCols };
          const status = originalTask.status as ColumnId;
          if (newCols[status]) {
              newCols[status] = newCols[status].map(t => t.id === taskId ? updatedTask : t);
          }
          return newCols;
      });

      // --- Backend Update ---
      try {
          const savedSubtask = await supabaseRequest<Subtask>(
              'subtasks',
              'POST',
              {
                  data: newSubtask,
                  select: '*',
                  accessToken: accessToken // Pass token
              }
          );
          toast({ title: 'Subtask Added', description: `"${newSubtask.title}" added to "${originalTask.title}".` });
          return savedSubtask;
      } catch (err: any) {
          console.error('Error adding subtask:', err);
          toast({ title: 'Error Adding Subtask', description: err.message, variant: 'destructive' });
          // Rollback optimistic update
          const rolledBackTask = { ...originalTask, subtasks: existingSubtasks };
           setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? rolledBackTask : t));
           setColumns(prevCols => {
              const newCols = { ...prevCols };
              const status = originalTask.status as ColumnId;
              if (newCols[status]) {
                  newCols[status] = newCols[status].map(t => t.id === taskId ? rolledBackTask : t);
              }
              return newCols;
           });
          return null;
      }
  }, [user?.id, accessToken, toast, tasks]); // Add accessToken dependency

  // --- ADDED: Log before return ---
   console.log(`useTasks: Returning state - isLoading=${isLoading || authLoading}, error=${error}, tasks=${tasks?.length ?? 0}`);
  // --- END ADDITION ---

  return {
    tasks,
    columns,
    isLoading: isLoading || authLoading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleSubtaskCompletion,
    addSubtask
  };
}; 