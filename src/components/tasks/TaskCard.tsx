import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Subtask, ImportanceLevel, EnergyLevel, TaskPriority } from '@/types/tasks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit2, Trash2, GripVertical, Clock, AlertTriangle, BrainCircuit,
  List, CheckSquare, Square, Plus, Star, Tag, BatteryMedium, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict, parseISO, isPast, isValid, format } from 'date-fns';
import { motion } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string, isCompleted: boolean) => void;
  onAddSubtask?: (taskId: string, subtaskTitle: string) => void;
}

// --- Styles & Helpers ---
const priorityStyles: Record<TaskPriority | 'default', { border: string; badge: string; iconColor: string }> = {
    high: { border: 'border-l-red-500', badge: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400', iconColor: 'text-red-500' },
    medium: { border: 'border-l-yellow-500', badge: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400', iconColor: 'text-yellow-500' },
    low: { border: 'border-l-blue-500', badge: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400', iconColor: 'text-blue-500' },
    default: { border: 'border-l-border', badge: 'border-border bg-muted/50 text-muted-foreground', iconColor: 'text-muted-foreground' },
};

const importanceStyles: Record<string, { badge: string; icon: React.ReactNode }> = {
    '10': { badge: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400', icon: <Star size={11} fill="currentColor" className="text-red-500"/> },
    '9': { badge: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400', icon: <Star size={11} fill="currentColor" className="text-red-500"/> },
    '8': { badge: 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400', icon: <Star size={11} fill="currentColor" className="text-orange-500"/> },
    '7': { badge: 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400', icon: <Star size={11} fill="currentColor" className="text-orange-500"/> },
    '6': { badge: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400', icon: <Star size={11} className="text-yellow-500"/> },
    '5': { badge: 'border-lime-500/50 bg-lime-500/10 text-lime-700 dark:text-lime-400', icon: <Star size={11} className="text-lime-500"/> },
    '4': { badge: 'border-lime-500/50 bg-lime-500/10 text-lime-700 dark:text-lime-400', icon: <Star size={11} className="text-lime-500"/> },
    '3': { badge: 'border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-400', icon: <Star size={11} strokeWidth={1.5} className="text-teal-500"/> },
    '2': { badge: 'border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-400', icon: <Star size={11} strokeWidth={1.5} className="text-teal-500"/> },
    '1': { badge: 'border-sky-500/50 bg-sky-500/10 text-sky-700 dark:text-sky-400', icon: <Star size={11} strokeWidth={1.5} className="text-sky-500"/> },
};

const energyStyles: Record<EnergyLevel, { badge: string; icon: React.ReactNode }> = {
    high: { badge: 'border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-500', icon: <BatteryMedium size={11} fill="currentColor" className="text-red-500"/> },
    medium: { badge: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600 dark:text-yellow-500', icon: <BatteryMedium size={11} className="text-yellow-500"/> },
    low: { badge: 'border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-500', icon: <BatteryMedium size={11} className="text-green-500"/> },
};

const getPriorityStyle = (priority?: TaskPriority | null) => {
    return priorityStyles[priority || 'default'] || priorityStyles.default;
};
const getImportanceStyle = (importance?: ImportanceLevel | null) => {
    return importance ? importanceStyles[String(importance)] : null;
};
const getEnergyStyle = (energy?: EnergyLevel | null) => {
    return energy ? energyStyles[energy] : null;
};

// --- Component ---
export const TaskCard: React.FC<TaskCardProps> = ({ 
    task, index, onEdit, onDelete, onToggleSubtask, onAddSubtask
}) => {
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const dueDate = task.due_date ? parseISO(task.due_date) : null;
  const isValidDueDate = dueDate && isValid(dueDate);
  const overdue = !!(isValidDueDate && isPast(dueDate) && task.status !== 'completed');

  const subtasks = (task.subtasks || []).sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  const completedSubtasks = subtasks.filter(st => st.isCompleted).length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const { border: priorityBorder, iconColor: priorityIconColor } = getPriorityStyle(task.priority);
  const importanceStyle = getImportanceStyle(task.importance);
  const energyStyle = getEnergyStyle(task.energy_level_required);

  const handleAddSubtaskConfirm = () => {
      const title = newSubtaskTitle.trim();
      if (title && onAddSubtask) {
          onAddSubtask(task.id, title);
          setNewSubtaskTitle('');
          setShowAddSubtask(false);
      }
  };

  const cardVariants = {
      initial: { opacity: 0, y: 15, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.6, 0.01, -0.05, 0.95] } },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
      hover: { scale: 1.02, boxShadow: 'var(--tw-shadow-md)', transition: { duration: 0.15, ease: "easeOut" } },
      drag: { scale: 1.03, boxShadow: 'var(--tw-shadow-lg)' }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <TooltipProvider delayDuration={300}>
          <motion.div
            ref={provided.innerRef}
            {...provided.draggableProps}
            layout
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            whileHover="hover"
            whileTap={!snapshot.isDragging ? "drag" : undefined}
            style={{ position: 'static' }}
            className={cn(
                `select-none rounded-lg border bg-card text-card-foreground overflow-hidden group relative transition-shadow duration-150 ease-out`,
                priorityBorder,
                `border-l-[5px]`,
                snapshot.isDragging ? 'shadow-xl ring-2 ring-primary/70 opacity-95 z-50' : 'shadow-sm'
            )}
          >
            {/* Drag Handle */}
            <div
                {...provided.dragHandleProps}
                className="absolute top-0 left-0 bottom-0 w-5 flex items-center justify-center cursor-grab text-muted-foreground/20 group-hover:text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out z-10"
                title="Drag to reorder task"
            >
                <GripVertical size={16} />
            </div>

            {/* Card Content Area */}
            <div className="pl-7 pr-3 py-3 space-y-2">
                {/* Title & Priority/Importance Icons */}
                 <div className="flex items-start justify-between gap-2">
                     <h4 className="text-sm font-medium leading-snug flex-1 mr-10" title={task.title}>{task.title}</h4>
                     {task.priority && task.priority !== 'medium' && (
                         <Tooltip>
                             <TooltipTrigger className="flex-shrink-0">
                                 <Flag size={14} className={cn(priorityIconColor, 'mt-px')} />
                             </TooltipTrigger>
                             <TooltipContent>Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</TooltipContent>
                         </Tooltip>
                     )}
                 </div>

                {/* Description */}
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}

                 {/* Tags */}
                 {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {task.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-xs font-normal bg-muted/70 border-transparent">
                                 {tag}
                            </Badge>
                        ))}
                    </div>
                 )}

                {/* Subtasks Section */}
                {totalSubtasks > 0 && (
                  <div className="pt-2 space-y-2">
                      <Separator className="bg-border/50"/>
                      <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                               <List size={12} /> Subtasks
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                              {completedSubtasks}/{totalSubtasks}
                          </span>
                      </div>
                      <ul className="space-y-1 text-sm max-h-[7rem] overflow-y-auto scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent pr-1">
                          {subtasks.map((subtask) => (
                              <li key={subtask.id} className="flex items-center gap-2 py-0.5 group/subtask">
                                  <Checkbox
                                      id={`subtask-check-${task.id}-${subtask.id}`}
                                      checked={subtask.isCompleted}
                                      onCheckedChange={(checked) => onToggleSubtask?.(task.id, subtask.id, Boolean(checked))}
                                      className="h-4 w-4 rounded border-muted-foreground/50 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-primary-foreground transition-all"
                                      aria-label={`Mark subtask ${subtask.title} as ${subtask.isCompleted ? 'incomplete' : 'complete'}`}
                                  />
                                  <label
                                     htmlFor={`subtask-check-${task.id}-${subtask.id}`}
                                     className={cn("flex-1 truncate cursor-pointer transition-colors text-foreground/90 group-hover/subtask:text-foreground", subtask.isCompleted && "line-through text-muted-foreground/70 italic")}
                                     title={subtask.title}
                                  >
                                      {subtask.title}
                                  </label>
                              </li>
                          ))}
                      </ul>
                      {showAddSubtask ? (
                          <div className="flex items-center gap-1.5 pl-6 pt-1">
                               <Input
                                    type="text"
                                    placeholder="New subtask..."
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtaskConfirm(); if (e.key === 'Escape') setShowAddSubtask(false); }}
                                    className="h-7 text-xs flex-grow mr-1"
                                    autoFocus
                                />
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleAddSubtaskConfirm} aria-label="Confirm add subtask"><CheckSquare size={14}/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setShowAddSubtask(false)} aria-label="Cancel add subtask"><Square size={14}/></Button>
                          </div>
                      ) : (
                          <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-7 pl-6 gap-1.5"
                              onClick={() => setShowAddSubtask(true)}
                          >
                               <Plus size={12} /> Add Subtask
                          </Button>
                      )}
                      <Progress value={subtaskProgress} className="h-1.5 mt-2 [&>div]:bg-green-500 rounded-full" aria-label={`Subtask progress ${subtaskProgress}%`} />
                  </div>
                )}

                {((isValidDueDate || task.cognitive_load_estimate != null || importanceStyle || energyStyle) || (totalSubtasks > 0)) && <Separator className="mt-2 mb-1.5 bg-border/50" />} 

                <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground min-h-[20px]">
                    {isValidDueDate && (
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <span className={cn(
                                "flex items-center gap-1 cursor-default",
                                overdue && "text-destructive font-medium"
                            )}>
                            <Clock size={12} />
                            <span suppressHydrationWarning>
                                {formatDistanceToNowStrict(dueDate, { addSuffix: true })}
                            </span>
                            {overdue && <AlertTriangle size={12} className="ml-0.5" />}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>{overdue ? 'Overdue:' : 'Due:'} {format(dueDate, 'PPP')}</TooltipContent>
                        </Tooltip>
                    )}
                     {importanceStyle && task.importance && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className={cn("flex items-center gap-1 px-1.5 py-0 font-normal cursor-help", importanceStyle.badge)}>
                                    {importanceStyle.icon}
                                    <span>{task.importance}/10</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Importance: {task.importance}/10</TooltipContent>
                        </Tooltip>
                    )}
                    {task.cognitive_load_estimate != null && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <Badge variant="outline" className="flex items-center gap-1 px-1.5 py-0 font-normal border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400 cursor-help">
                                <BrainCircuit size={11} />
                                <span>{task.cognitive_load_estimate}/10</span>
                            </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Cognitive Load Estimate: {task.cognitive_load_estimate}/10</TooltipContent>
                        </Tooltip>
                    )}
                    {energyStyle && task.energy_level_required && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge variant="outline" className={cn("flex items-center gap-1 px-1.5 py-0 font-normal cursor-help", energyStyle.badge)}>
                                    {energyStyle.icon}
                                    <span>{task.energy_level_required}</span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                Estimated Energy Required: {task.energy_level_required.charAt(0).toUpperCase() + task.energy_level_required.slice(1)}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>

            {/* Action Buttons (Hover) */}
            <div className="absolute top-2 right-2 flex items-center space-x-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 z-20">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button aria-label="Edit Task" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => onEdit(task)}>
                    <Edit2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Edit</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button aria-label="Delete Task" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => onDelete(task)}>
                    <Trash2 className="h-4 w-4 text-destructive/70 group-hover:text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Delete</TooltipContent>
              </Tooltip>
            </div>

          </motion.div>
        </TooltipProvider>
      )}
    </Draggable>
  );
};
