import React from 'react';
import { Task, ImportanceLevel, TaskPriority } from '@/types/tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, AlertOctagon, CalendarClock, UserCheck, Trash2 } from 'lucide-react'; // Added icons

interface PriorityMatrixViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddSubtask?: (taskId: string, subtaskTitle: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
}

type Quadrant = 'do' | 'schedule' | 'delegate' | 'eliminate';

const quadrantConfig: Record<Quadrant, { 
    title: string; 
    description: string; 
    icon: React.ReactNode;
    bgColor: string; 
    borderColor: string;
    textColor: string; 
    labelColor: string;
}> = {
  do: {
    title: 'Urgent & Important',
    description: 'Do First',
    icon: <AlertOctagon size={18} className="text-red-500" />,
    bgColor: 'bg-red-500/5 dark:bg-red-900/20',
    borderColor: 'border-red-500/40',
    textColor: 'text-red-800 dark:text-red-200',
    labelColor: 'text-red-600 dark:text-red-400'
  },
  schedule: {
    title: 'Not Urgent & Important',
    description: 'Schedule',
    icon: <CalendarClock size={18} className="text-blue-500" />,
    bgColor: 'bg-blue-500/5 dark:bg-blue-900/20',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-800 dark:text-blue-200',
    labelColor: 'text-blue-600 dark:text-blue-400'
  },
  delegate: {
    title: 'Urgent & Not Important',
    description: 'Delegate',
    icon: <UserCheck size={18} className="text-yellow-500" />,
    bgColor: 'bg-yellow-500/5 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-500/40',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    labelColor: 'text-yellow-600 dark:text-yellow-400'
  },
  eliminate: {
    title: 'Not Urgent & Not Important',
    description: 'Eliminate',
    icon: <Trash2 size={18} className="text-slate-500" />,
    bgColor: 'bg-slate-500/5 dark:bg-slate-800/20',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-600 dark:text-slate-400',
    labelColor: 'text-slate-500 dark:text-slate-500'
  }
};

const quadrantOrder: Quadrant[] = ['do', 'schedule', 'delegate', 'eliminate'];

// Define thresholds for categorization
const URGENT_THRESHOLD: TaskPriority = 'high';
const IMPORTANT_THRESHOLD: ImportanceLevel = 7;

export const PriorityMatrixView: React.FC<PriorityMatrixViewProps> = ({ 
    tasks, 
    onEditTask, 
    onDeleteTask,
    onAddSubtask, 
    onToggleSubtask 
}) => {

  const categorizeTask = (task: Task): Quadrant => {
    // Use thresholds for urgency (priority) and importance
    const isUrgent = task.priority === URGENT_THRESHOLD;
    // Importance: Check if importance score meets or exceeds the threshold
    const isImportant = (task.importance ?? 0) >= IMPORTANT_THRESHOLD;

    if (isUrgent && isImportant) return 'do';       // Q1: Urgent, Important
    if (!isUrgent && isImportant) return 'schedule'; // Q2: Not Urgent, Important
    if (isUrgent && !isImportant) return 'delegate'; // Q3: Urgent, Not Important
    return 'eliminate';                              // Q4: Not Urgent, Not Important
  };

  // Categorize and sort tasks (memoized)
  const categorizedTasks = React.useMemo(() => {
      const initial: Record<Quadrant, Task[]> = { do: [], schedule: [], delegate: [], eliminate: [] };
      const categorized = tasks.reduce((acc, task) => {
          // Filter out completed tasks before categorizing
          if (task.status !== 'completed') { 
             const quadrant = categorizeTask(task);
             acc[quadrant].push(task);
          }
          return acc;
      }, initial);
      // Sort tasks within each quadrant by their board order (using task.order)
       Object.values(categorized).forEach(quadrantTaskList => {
          quadrantTaskList.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Use task.order
      });
      return categorized;
  }, [tasks]);

  const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
          opacity: 1,
          transition: { staggerChildren: 0.08, delayChildren: 0.1 }
      }
  };

  const quadrantVariants = {
      hidden: { opacity: 0, scale: 0.95, y: 10 },
      visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.6, 0.01, -0.05, 0.95] } }
  };

  return (
    <div className="relative pt-10 pb-12"> {/* Increased top padding */}
        {/* Axis Labels - Enhanced */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Urgent</span>
            <ArrowRight size={14} />
            <span>Not Urgent</span>
        </div>
        <div className="absolute left-1 top-[50px] -translate-y-1/2 -rotate-90 flex items-center gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wider origin-top-left -ml-8">
            <span className="whitespace-nowrap">Important</span>
            <ArrowDown size={14} />
            <span className="whitespace-nowrap">Not Important</span>
        </div>
        
        {/* Grid - Adjusted for better spacing and sizing */} 
        <motion.div 
           className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
           variants={containerVariants}
           initial="hidden"
           animate="visible"
        >
          {quadrantOrder.map((quadrant) => {
            const config = quadrantConfig[quadrant];
            const quadrantTasks = categorizedTasks[quadrant];
            return (
                <motion.div key={quadrant} variants={quadrantVariants} className="flex flex-col"> {/* Ensure flex-col */} 
                    <Card className={cn(
                        "flex flex-col flex-grow border rounded-xl shadow-md overflow-hidden", // Use flex-grow
                        config.bgColor, 
                        config.borderColor,
                        "transition-all duration-200 ease-out hover:shadow-lg hover:border-primary/30"
                        )}>
                      <CardHeader className={cn(
                          "p-3 border-b flex-shrink-0 flex flex-row items-center justify-between gap-2", // Use flex-row
                          config.borderColor
                          )}>
                           <div className="flex items-center gap-2">
                               {config.icon}
                               <CardTitle className={cn("text-sm font-semibold leading-tight", config.textColor)}>{config.description}</CardTitle>
                           </div>
                          <p className={cn("text-xs font-medium uppercase tracking-wider", config.labelColor)}>{config.title}</p>
                      </CardHeader>
                      <CardContent className="p-0 flex-1 overflow-hidden relative"> {/* Ensure relative for absolute positioning of empty state */} 
                         <ScrollArea className="h-full">
                            <div className="p-3 space-y-2.5">
                                {quadrantTasks.length > 0 ? (
                                    quadrantTasks.map((task, index) => (
                                        <TaskCard
                                            key={task.id}
                                            task={task}
                                            index={index} // Index might not be meaningful here as it's not draggable
                                            onEdit={onEditTask}
                                            onDelete={onDeleteTask}
                                            onAddSubtask={onAddSubtask} 
                                            onToggleSubtask={onToggleSubtask}
                                        />
                                    ))
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-center px-4 select-none pointer-events-none">
                                         <p className={cn("text-sm italic", config.textColor, "opacity-60")}>
                                             No tasks here.
                                         </p>
                                    </div>
                                )}
                            </div>
                             <ScrollBar orientation="vertical" />
                        </ScrollArea>
                      </CardContent>
                    </Card>
                </motion.div>
            );
            })} 
        </motion.div>
    </div>
  );
};
