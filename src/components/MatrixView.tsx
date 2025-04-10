import React, { useCallback } from 'react';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, UpdateTaskDto } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, BatteryWarning, MoreHorizontal, StickyNote, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO, isValid, isPast } from 'date-fns';
import { produce } from 'immer';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const ItemTypes = { TASK: 'task' };

// Define Quadrant types
type Urgency = 'urgent' | 'not_urgent';
type Importance = 'important' | 'not_important';

interface Quadrant {
  id: string;
  title: string;
  description: string;
  urgency: Urgency;
  importance: Importance;
  colorClass: string;
}

const quadrants: Quadrant[] = [
  { id: 'urgent-important', title: 'Do First', description: 'Urgent & Important', urgency: 'urgent', importance: 'important', colorClass: 'border-red-500 bg-red-500/5' },
  { id: 'not_urgent-important', title: 'Schedule', description: 'Important, Not Urgent', urgency: 'not_urgent', importance: 'important', colorClass: 'border-blue-500 bg-blue-500/5' },
  { id: 'urgent-not_important', title: 'Delegate', description: 'Urgent, Not Important', urgency: 'urgent', importance: 'not_important', colorClass: 'border-yellow-500 bg-yellow-500/5' },
  { id: 'not_urgent-not_important', title: 'Eliminate', description: 'Not Urgent, Not Important', urgency: 'not_urgent', importance: 'not_important', colorClass: 'border-gray-500 bg-gray-500/5' },
];

const getTaskQuadrantId = (task: Task): string => {
    const taskUrgency = task.urgency || 'normal';
    const taskImportance = task.importance || 'medium';
    const isUrgent: boolean = taskUrgency === 'urgent';
    const isImportant: boolean = taskImportance === 'high';
    if (isUrgent && isImportant) return 'urgent-important';
    if (!isUrgent && isImportant) return 'not_urgent-important';
    if (isUrgent && !isImportant) return 'urgent-not_important';
    return 'not_urgent-not_important';
};

interface MatrixTaskCardProps {
  task: Task;
  energyLevel?: 'low' | 'medium' | 'high';
  useVisualCues?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const MatrixTaskCard: React.FC<MatrixTaskCardProps> = ({ task, energyLevel, useVisualCues, onEdit, onDelete }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TASK,
        item: { id: task.id, quadrantId: getTaskQuadrantId(task) },
        collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }), [task.id, task.urgency, task.importance]);
    drag(ref);

    const isOverdue = useVisualCues && task.due_date && isValid(parseISO(task.due_date)) && isPast(parseISO(task.due_date)) && task.status !== 'completed';
    const needsAttention = useVisualCues && (isOverdue || task.priority === 'high');
    const isHighLoadLowEnergy = useVisualCues && energyLevel === 'low' && (task.estimated_load ?? 0) >= 4;

    return (
        <TooltipProvider delayDuration={100}>
            <motion.div
                ref={ref}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.03, zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', transition: { duration: 0.1 } }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                    'group p-2 bg-card text-card-foreground rounded-md border cursor-grab text-xs shadow-sm transition-all relative overflow-hidden',
                    isDragging ? 'opacity-50 ring-1 ring-primary ring-offset-1 shadow-md scale-105 z-20' : 'border-border hover:border-foreground/20',
                    needsAttention && 'border-yellow-400 dark:border-yellow-600 bg-yellow-50/10 dark:bg-yellow-900/10',
                    isOverdue && 'border-red-400 dark:border-red-600 bg-red-50/10 dark:bg-red-900/10'
                )}
            >
                <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
                        aria-label="Edit Task"
                    >
                        <Pencil className="h-3 w-3" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
                        aria-label="Delete Task"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>

                <div className='flex justify-between items-start gap-1'>
                    <p className="font-medium line-clamp-2 leading-snug flex-1 mr-1 pt-px text-[13px] group-hover:text-primary transition-colors">{task.title}</p>
                    <div className='flex items-center flex-shrink-0 gap-1 mt-0.5'>
                         {isHighLoadLowEnergy && (
                             <Tooltip>
                                 <TooltipTrigger><BatteryWarning className="h-3.5 w-3.5 text-orange-500"/></TooltipTrigger>
                                 <TooltipContent><p className="text-xs">High load for current energy level.</p></TooltipContent>
                             </Tooltip>
                         )}
                         {task.notes && (
                           <Popover>
                             <PopoverTrigger asChild>
                               <button className='text-muted-foreground hover:text-foreground p-0.5'><StickyNote className='h-3.5 w-3.5'/></button>
                             </PopoverTrigger>
                             <PopoverContent className="w-64">
                               <div className="prose prose-sm dark:prose-invert max-w-none">
                                 <h4 className="font-medium leading-none mb-2 text-foreground">Notes / Sub-steps</h4>
                                 <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                   p: ({node, ...props}) => <p className="mb-1 text-sm" {...props} />,
                                   ul: ({node, ...props}) => <ul className="list-disc list-inside my-1 space-y-0.5 pl-4" {...props} />,
                                   ol: ({node, ...props}) => <ol className="list-decimal list-inside my-1 space-y-0.5 pl-4" {...props} />,
                                   li: ({node, ...props}) => <li className="mb-0.5 text-sm" {...props} />,
                                   strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                                   code: ({node, ...props}) => <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono" {...props} />,
                                 }}>
                                     {task.notes}
                                 </ReactMarkdown>
                               </div>
                             </PopoverContent>
                           </Popover>
                         )}
                    </div>
                </div>
                <div className="flex items-center justify-between text-muted-foreground mt-1.5 text-[11px]">
                     {task.due_date && isValid(parseISO(task.due_date)) && (
                         <Tooltip>
                             <TooltipTrigger className={cn('flex items-center gap-1', isOverdue && 'text-red-600 dark:text-red-400 font-medium')}>
                                 <Calendar className="h-3 w-3"/> {format(parseISO(task.due_date), 'MMM d')}
                             </TooltipTrigger>
                             <TooltipContent><p className='text-xs'>Due: {format(parseISO(task.due_date), 'PP')}</p></TooltipContent>
                         </Tooltip>
                     )}
                     {task.priority && <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="capitalize text-[10px] px-1 py-0 leading-tight h-[14px]">{task.priority}</Badge>}
                </div>
            </motion.div>
        </TooltipProvider>
    );
};

interface QuadrantColumnProps {
  quadrant: Quadrant;
  tasks: Task[];
  moveTaskToQuadrant: (taskId: string, targetQuadrantId: string) => void;
  energyLevel?: 'low' | 'medium' | 'high';
  useVisualCues?: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const QuadrantColumn: React.FC<QuadrantColumnProps> = ({ quadrant, tasks, moveTaskToQuadrant, energyLevel, useVisualCues, onEditTask, onDeleteTask }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.TASK,
        drop: (item: { id: string, quadrantId: string }) => {
            if (item.quadrantId !== quadrant.id) {
                moveTaskToQuadrant(item.id, quadrant.id);
            }
        },
        canDrop: (item: { id: string, quadrantId: string }) => item.quadrantId !== quadrant.id,
        collect: (monitor) => ({ isOver: !!monitor.isOver(), canDrop: !!monitor.canDrop() }),
    }), [quadrant.id, moveTaskToQuadrant]);
    drop(ref);

    return (
        <div
            ref={ref}
            className={cn(
                `border rounded-lg p-3 min-h-[200px] transition-colors duration-150 flex flex-col`,
                quadrant.colorClass,
                isOver && canDrop ? 'bg-primary/10 border-primary border-dashed shadow-inner' : 'bg-muted/20'
            )}
        >
            <div className="text-center mb-3 flex-shrink-0">
                <h3 className="font-semibold text-base mb-0.5">{quadrant.title}</h3>
                <p className="text-xs text-muted-foreground">{quadrant.description}</p>
            </div>
            <div className="space-y-1.5 flex-grow overflow-y-auto custom-scrollbar pr-1 -mr-1">
                {tasks.map(task => (
                    <MatrixTaskCard
                        key={task.id}
                        task={task}
                        energyLevel={energyLevel}
                        useVisualCues={useVisualCues}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                    />
                ))}
                 {isOver && canDrop && (
                    <div className="mt-1 p-3 border-2 border-dashed border-primary/50 rounded text-center text-primary/80 text-xs bg-primary/5">
                        Drop here
                    </div>
                )}
                 {tasks.length === 0 && !isOver && (
                    <p className="text-xs text-muted-foreground italic text-center py-4">Drop tasks here</p>
                )}
            </div>
        </div>
    );
};

interface MatrixViewProps {
  tasks: Task[];
  updateTask: (taskId: string, updates: Partial<UpdateTaskDto>) => Promise<Task | void>;
  energyLevel?: 'low' | 'medium' | 'high';
  useVisualCues?: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({ tasks, updateTask, energyLevel, useVisualCues, onEditTask, onDeleteTask }) => {
    const tasksByQuadrant = quadrants.reduce((acc, quadrant) => {
        acc[quadrant.id] = [];
        return acc;
    }, {} as Record<string, Task[]>);

    tasks.forEach(task => {
        const quadrantId = getTaskQuadrantId(task);
        if (tasksByQuadrant[quadrantId]) {
             tasksByQuadrant[quadrantId].push(task);
        } else {
            console.warn(`Task ${task.id} mapped to non-existent quadrant ${quadrantId}. Placing in default.`);
            tasksByQuadrant['not_urgent-not_important'].push(task);
        }
    });

    const moveTaskToQuadrant = useCallback(async (taskId: string, targetQuadrantId: string) => {
        const targetQuadrant = quadrants.find(q => q.id === targetQuadrantId);
        if (!targetQuadrant) {
            toast.error("Invalid target quadrant.");
            return;
        }
        const updates: Partial<UpdateTaskDto> = {
            urgency: targetQuadrant.urgency === 'urgent' ? 'urgent' : 'normal',
            importance: targetQuadrant.importance === 'important' ? 'high' : 'medium'
        };
        try {
            await updateTask(taskId, updates);
            toast.success("Task quadrant updated!");
        } catch (error) {
            console.error("Failed to update task quadrant:", error);
            toast.error("Failed to update task. Please try again.");
        }
    }, [updateTask]);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:h-[calc(100vh-200px)]">
                {quadrants.map(quadrant => (
                    <QuadrantColumn
                        key={quadrant.id}
                        quadrant={quadrant}
                        tasks={tasksByQuadrant[quadrant.id] || []}
                        moveTaskToQuadrant={moveTaskToQuadrant}
                        energyLevel={energyLevel}
                        useVisualCues={useVisualCues}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                    />
                ))}
            </div>
        </DndProvider>
    );
};