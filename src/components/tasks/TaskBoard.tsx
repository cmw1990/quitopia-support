import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Task, ColumnId, TaskColumns } from '@/types/tasks';
import { PlusCircle, Loader2, AlertCircle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';

// Define titles locally, ensuring keys match ColumnId type
const columnTitles: Record<ColumnId, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    completed: 'Completed'
};

interface TaskBoardProps {
    columns: TaskColumns;
    onAddTask: (title: string, columnId: ColumnId) => Promise<Task | null>;
    onEditTask: (task: Task) => void;
    onDeleteTask: (taskToDelete: Task) => void;
    onMoveTask: (result: DropResult) => void;
    onToggleSubtask: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
    onAddSubtask: (taskId: string, subtaskTitle: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ 
    columns,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onMoveTask,
    onToggleSubtask,
    onAddSubtask
}) => {
    const [addingTaskId, setAddingTaskId] = useState<ColumnId | null>(null);
    // Initialize newTaskTitles directly using the columns prop keys
    const [newTaskTitles, setNewTaskTitles] = useState<Record<ColumnId, string>>(() => 
        (Object.keys(columns) as ColumnId[]).reduce((acc, columnId) => {
            acc[columnId] = '';
            return acc;
        }, {} as Record<ColumnId, string>)
    );
    const [isSubmitting, setIsSubmitting] = useState<ColumnId | null>(null);

    // Quick Add Handlers
    const handleNewTaskChange = (columnId: ColumnId, value: string) => {
        setNewTaskTitles(prev => ({ ...prev, [columnId]: value }));
    };
    
    const handleAddNewTask = async (columnId: ColumnId) => {
        const title = newTaskTitles[columnId]?.trim();
        if (!title || isSubmitting === columnId) return;
        
        setIsSubmitting(columnId);
        try {
            // Call the provided onAddTask handler from the parent
            const newTask = await onAddTask(title, columnId);
            if (newTask) { // Check if task creation was successful
                 setNewTaskTitles(prev => ({ ...prev, [columnId]: '' }));
                 setAddingTaskId(null);
                 // Optionally give feedback (parent might handle this via useTasks)
            } else {
                 // Handle potential creation failure (e.g., show error)
                 console.error("Failed to add task from board"); 
            }
        } catch (error) {
            console.error("Error adding task from board:", error);
             // Handle error (parent might show toast)
        } finally {
             setIsSubmitting(null);
        }
    };

    const orderedColumnIds = Object.keys(columns) as ColumnId[];

    return (
        <div className="flex-grow flex flex-col">
            <DragDropContext onDragEnd={onMoveTask}>
                <div className="flex gap-4 lg:gap-5 items-start overflow-x-auto pb-4 px-1 flex-grow min-h-0">
                    {orderedColumnIds.map((columnId) => { 
                        const columnTasks = columns[columnId] || []; 
                        const columnTitle = columnTitles[columnId] || columnId;
                        return (
                            <div key={columnId} className="flex-shrink-0 w-72 md:w-80 h-full flex flex-col">
                                <Droppable droppableId={columnId}>
                                    {(provided, snapshot) => (
                                        <motion.div
                                            layout
                                            className={cn(
                                                "flex flex-col h-full rounded-xl border overflow-hidden transition-all duration-200 ease-out",
                                                snapshot.isDraggingOver ? "bg-primary/5 shadow-lg" : "bg-muted/30 shadow-sm",
                                                columnId === 'todo' ? 'border-blue-500/20' :
                                                columnId === 'in_progress' ? 'border-yellow-500/20' :
                                                columnId === 'completed' ? 'border-green-500/20' : 'border-border/30'
                                            )}
                                        >
                                            <div className={cn(
                                                "sticky top-0 z-10 p-3 border-b flex justify-between items-center flex-shrink-0",
                                                "bg-gradient-to-b from-background/80 to-background/60 backdrop-blur-sm",
                                                columnId === 'todo' ? 'border-blue-500/20' :
                                                columnId === 'in_progress' ? 'border-yellow-500/20' :
                                                columnId === 'completed' ? 'border-green-500/20' : 'border-border/30'
                                            )}>
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground flex items-center gap-2">
                                                    {columnTitle}
                                                    <Badge variant="secondary" className="px-1.5 py-0.5 text-xs font-medium leading-none h-5">
                                                        {columnTasks.length}
                                                    </Badge>
                                                </h3>
                                                <TooltipProvider delayDuration={200}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-primary rounded-full"
                                                                onClick={() => setAddingTaskId(columnId)}
                                                                disabled={addingTaskId === columnId || isSubmitting !== null}
                                                            >
                                                                <PlusCircle size={16} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom"><p>Add task to {columnTitle}</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>

                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className={cn(
                                                    "p-2.5 pt-2 flex-grow overflow-y-auto space-y-2.5 transition-colors duration-200 ease-in-out min-h-[100px]",
                                                    "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent scrollbar-thumb-rounded-full"
                                                )}
                                            >
                                                <AnimatePresence>
                                                    {addingTaskId === columnId && (
                                                        <motion.div
                                                            layout
                                                            initial={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0 }}
                                                            animate={{ opacity: 1, height: 'auto', marginBottom: '0.625rem', marginTop: '0.125rem' }}
                                                            exit={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0 }}
                                                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-3 bg-card rounded-lg border border-border shadow-sm">
                                                                <Textarea
                                                                    autoFocus
                                                                    placeholder="Enter task title..."
                                                                    value={newTaskTitles[columnId] || ''}
                                                                    onChange={(e) => handleNewTaskChange(columnId, e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                                            e.preventDefault();
                                                                            handleAddNewTask(columnId);
                                                                        }
                                                                        if (e.key === 'Escape') setAddingTaskId(null);
                                                                    }}
                                                                    className="text-sm min-h-[40px] mb-2 border-border/70 focus:border-primary resize-none shadow-none p-2"
                                                                    disabled={isSubmitting === columnId}
                                                                    rows={1}
                                                                />
                                                                <div className="flex justify-end gap-2 mt-1">
                                                                    <Button variant="ghost" size="sm" onClick={() => setAddingTaskId(null)} disabled={isSubmitting === columnId} className="h-8">Cancel</Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleAddNewTask(columnId)}
                                                                        disabled={!newTaskTitles[columnId]?.trim() || isSubmitting === columnId}
                                                                        className="h-8"
                                                                    >
                                                                        {isSubmitting === columnId ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                                                                        <span className="ml-1.5">Add Task</span>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {columnTasks.length > 0 ? (
                                                    columnTasks.map((task, index) => (
                                                        <TaskCard
                                                            key={task.id}
                                                            task={task}
                                                            index={index}
                                                            onEdit={onEditTask}
                                                            onDelete={onDeleteTask}
                                                            onToggleSubtask={onToggleSubtask}
                                                            onAddSubtask={onAddSubtask}
                                                        />
                                                    ))
                                                ) : (
                                                    !snapshot.isDraggingOver && addingTaskId !== columnId && (
                                                        <div className="text-center text-xs text-muted-foreground py-6 px-3 italic select-none">
                                                            Drag tasks here or click <PlusCircle size={11} className="inline align-[-1px] mx-0.5"/> to add.
                                                        </div>
                                                    )
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        </motion.div>
                                    )}
                                </Droppable>
                            </div>
                        )}
                    )}
                </div>
            </DragDropContext>
        </div>
    );
};

export default TaskBoard;
