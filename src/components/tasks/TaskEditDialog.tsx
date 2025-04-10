import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskFormData, Subtask, ImportanceLevel, TaskStatus, TaskPriority, EnergyLevel } from '@/types/tasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from '@/components/ui/use-toast';
import { BrainCircuit, PlusCircle, Trash2, CheckSquare, Square, GripVertical, Star as ImportanceIcon, Tag, BatteryMedium, Save, Loader2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => Promise<void>;
  onDelete?: (taskToDelete: Task) => Promise<void>;
}

const parseTags = (tagsString: string): string[] => {
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
};

const formatTags = (tagsArray?: string[] | null): string => {
    return (tagsArray || []).join(', ');
};

const DEFAULT_TASK_FORM: Partial<TaskFormData> = {
    title: '', 
    description: '',
    status: 'todo', 
    priority: 'medium',
    importance: 5 as ImportanceLevel,
    urgency: 5 as ImportanceLevel,
    cognitive_load_estimate: 5,
    energy_level_required: 'medium',
    due_date: null,
    scheduled_start_time: null,
    scheduled_end_time: null,
    tagsString: '',
};

export const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ task: initialTask, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<TaskFormData>>(DEFAULT_TASK_FORM);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        if (initialTask && initialTask.id === 'NEW_TASK') {
             setFormData(DEFAULT_TASK_FORM);
             setSubtasks([]);
        } else if (initialTask) {
            const initialFormData: Partial<TaskFormData> = {
                title: initialTask.title,
                description: initialTask.description,
                status: initialTask.status,
                priority: initialTask.priority,
                importance: initialTask.importance,
                urgency: initialTask.urgency,
                cognitive_load_estimate: initialTask.cognitive_load_estimate,
                energy_level_required: initialTask.energy_level_required,
                due_date: initialTask.due_date ? initialTask.due_date : null,
                scheduled_start_time: initialTask.scheduled_start_time,
                scheduled_end_time: initialTask.scheduled_end_time,
                tagsString: formatTags(initialTask.tags),
            };
            setFormData(initialFormData);
            const sortedSubtasks = (initialTask.subtasks || []).sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
            setSubtasks(sortedSubtasks.map((st, index) => ({ 
                ...st, 
                id: st.id || `temp-${uuidv4()}-${index}`, 
            })));
        } else {
            setFormData(DEFAULT_TASK_FORM);
            setSubtasks([]);
        }
        setNewSubtaskTitle('');
        setEditingSubtaskId(null);
        setIsSaving(false);
        setIsDeleting(false);
    }
  }, [initialTask, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof TaskFormData, value: string | null) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: 'importance' | 'urgency' | 'cognitive_load_estimate', value: number[]) => {
      setFormData(prev => ({ ...prev, [name]: value[0] }));
  };

  const handleDueDateChange = (date: Date | undefined) => {
      setFormData(prev => ({ ...prev, due_date: date ? date.toISOString() : null }));
  };

   const handleScheduleTimeChange = (type: 'scheduled_start_time' | 'scheduled_end_time', value: string) => {
        try {
            setFormData(prev => ({ ...prev, [type]: value ? new Date(value).toISOString() : null }));
        } catch (e) {
            console.error("Invalid date time format", value, e);
            toast({ title: 'Invalid Date/Time', description: 'Please use a valid date and time format.', variant: 'destructive' });
        }
   };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setFormData(prev => ({ ...prev, tagsString: e.target.value }));
   };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: `temp-${uuidv4()}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
      order: subtasks.length,
    };
    setSubtasks(prev => [...prev, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleSubtaskTitleChange = (id: string, newTitle: string) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, title: newTitle } : st));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, isCompleted: !st.isCompleted } : st));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const onSubtaskDragEnd = (result: DropResult) => {
      const { destination, source } = result;
      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
          return;
      }
      const newSubtasks = Array.from(subtasks);
      const [reorderedItem] = newSubtasks.splice(source.index, 1);
      newSubtasks.splice(destination.index, 0, reorderedItem);
      setSubtasks(newSubtasks.map((st, index) => ({ ...st, order: index })));
  };

  const handleSave = async () => {
    if (!initialTask || isSaving || isDeleting) return;
    if (!formData.title?.trim()) {
        toast({ title: 'Validation Error', description: 'Task title cannot be empty.', variant: 'destructive' });
        return;
    }

    setIsSaving(true);
    const processedSubtasks = subtasks
        .filter(st => st.title.trim() !== '')
        .map((st, index) => {
            const finalId = st.id.startsWith('temp-') ? uuidv4() : st.id;
            return { ...st, id: finalId, order: index };
        });

    const updatedTaskData: Task = {
        ...initialTask,
        title: formData.title.trim(),
        description: formData.description || null,
        status: formData.status || initialTask.status,
        priority: formData.priority || null,
        importance: formData.importance || null,
        urgency: formData.urgency || null,
        cognitive_load_estimate: formData.cognitive_load_estimate || null,
        energy_level_required: formData.energy_level_required || null,
        due_date: formData.due_date || null,
        scheduled_start_time: formData.scheduled_start_time || null,
        scheduled_end_time: formData.scheduled_end_time || null,
        subtasks: processedSubtasks,
        tags: parseTags(formData.tagsString || ''),
        order: initialTask.order,
        user_id: initialTask.user_id,
        created_at: initialTask.created_at,
        updated_at: new Date().toISOString(),
        completed_at: formData.status === 'completed' && initialTask.status !== 'completed' ? new Date().toISOString() : initialTask.completed_at,
    };

    try {
        await onSave(updatedTaskData);
        toast({ title: 'Task Saved', description: `"${updatedTaskData.title}" ${initialTask.id ? 'updated' : 'created'} successfully.` });
        onClose();
    } catch (error: any) {
        console.error("Error saving task (from dialog):", error);
        toast({ title: 'Error Saving Task', description: error.message || 'Could not save changes.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
      if (!initialTask || !onDelete || isSaving || isDeleting) return;

      setIsDeleting(true);
      try {
          await onDelete(initialTask);
          toast({ title: 'Task Deleted', description: `"${initialTask.title}" was deleted.` });
          onClose();
      } catch (error: any) {
           console.error("Error deleting task (from dialog):", error);
           toast({ title: 'Error Deleting Task', description: error.message || 'Could not delete task.', variant: 'destructive' });
      } finally {
          setIsDeleting(false);
      }
  }

  if (!isOpen) return null;
  const isCreateMode = initialTask?.id === 'NEW_TASK';

  const renderSubtask = (subtask: Subtask, index: number) => (
        <Draggable key={subtask.id} draggableId={subtask.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="flex items-center gap-2 py-1.5 px-2 rounded bg-muted/50 group"
                >
                    <span {...provided.dragHandleProps} className="cursor-grab text-muted-foreground/50 group-hover:text-muted-foreground">
                        <GripVertical size={16} />
                    </span>
                    <Checkbox
                        id={`subtask-check-dialog-${subtask.id}`}
                        checked={subtask.isCompleted}
                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                        className="h-4 w-4"
                        aria-label="Toggle subtask completion"
                    />
                     <Input
                        type="text"
                        value={subtask.title}
                        onChange={(e) => handleSubtaskTitleChange(subtask.id, e.target.value)}
                        className={cn(
                            "h-7 text-sm flex-grow bg-transparent border-none focus:ring-0 focus:border-b focus:border-primary rounded-none px-1",
                            subtask.isCompleted ? "line-through text-muted-foreground italic" : "text-foreground"
                        )}
                        placeholder="Subtask title..."
                        disabled={isSaving || isDeleting}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSubtask(subtask.id)} aria-label="Delete subtask" disabled={isSaving || isDeleting}>
                        <Trash2 size={14} />
                    </Button>
                </div>
            )}
        </Draggable>
    );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isCreateMode ? 'Create New Task' : 'Edit Task'}: {formData.title || ''}</DialogTitle>
          {!isCreateMode && initialTask?.updated_at && (
              <DialogDescription>
                  Last updated: {format(parseISO(initialTask.updated_at), 'PPp')} 
              </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-3 pl-1 py-4 grid gap-5 scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent">
          <div className="grid gap-3">
             <div className="grid grid-cols-6 items-center gap-x-4 gap-y-2">
                <Label htmlFor="title-dialog" className="text-right col-span-1">Title <span className="text-destructive">*</span></Label>
                <Input id="title-dialog" name="title" value={formData.title || ''} onChange={handleChange} className="col-span-5 h-9" required disabled={isSaving || isDeleting} />
             </div>
              <div className="grid grid-cols-6 items-start gap-x-4 gap-y-2">
                  <Label htmlFor="description-dialog" className="text-right pt-2 col-span-1">Description</Label>
                  <Textarea id="description-dialog" name="description" value={formData.description || ''} onChange={handleChange} className="col-span-5 min-h-[70px]" placeholder="Add more details..." disabled={isSaving || isDeleting} />
              </div>
          </div>

          <Separator />

           <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                   <Label htmlFor="status-dialog">Status</Label>
                   <Select
                      name="status"
                      value={formData.status || ''}
                      onValueChange={(value) => handleSelectChange('status', value)}
                      disabled={isSaving || isDeleting}
                   >
                       <SelectTrigger id="status-dialog" className="h-9">
                           <SelectValue placeholder="Select status" />
                       </SelectTrigger>
                       <SelectContent>
                           <SelectItem value="todo">To Do</SelectItem>
                           <SelectItem value="in_progress">In Progress</SelectItem>
                           <SelectItem value="completed">Completed</SelectItem>
                       </SelectContent>
                   </Select>
                </div>
                <div>
                   <Label htmlFor="due-date-dialog">Due Date</Label>
                   <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="due-date-dialog"
                            variant={"outline"}
                            className={cn(
                            "h-9 w-full justify-start text-left font-normal",
                            !formData.due_date && "text-muted-foreground"
                            )}
                            disabled={isSaving || isDeleting}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.due_date && isValid(parseISO(formData.due_date)) ? format(parseISO(formData.due_date), "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={formData.due_date && isValid(parseISO(formData.due_date)) ? parseISO(formData.due_date) : undefined}
                            onSelect={handleDueDateChange}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div>
                    <Label htmlFor="priority-dialog">Priority</Label>
                    <Select
                      name="priority"
                      value={formData.priority || ''}
                      onValueChange={(value) => handleSelectChange('priority', value)}
                      disabled={isSaving || isDeleting}
                   >
                       <SelectTrigger id="priority-dialog" className="h-9">
                           <SelectValue placeholder="Select priority" />
                       </SelectTrigger>
                       <SelectContent>
                           <SelectItem value="low">Low</SelectItem>
                           <SelectItem value="medium">Medium</SelectItem>
                           <SelectItem value="high">High</SelectItem>
                       </SelectContent>
                   </Select>
                 </div>
                  <div>
                    <Label htmlFor="tags-dialog" className="flex items-center gap-1"><Tag size={14}/> Tags</Label>
                    <Input
                       id="tags-dialog"
                       name="tagsString"
                       value={formData.tagsString || ''}
                       onChange={handleTagsChange}
                       className="h-9 text-sm"
                       placeholder="Comma-separated tags..."
                       disabled={isSaving || isDeleting}
                   />
                </div>
           </div>

            <Separator />

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                 <div>
                    <Label htmlFor="scheduled_start_time">Scheduled Start</Label>
                    <Input 
                        id="scheduled_start_time" 
                        type="datetime-local" 
                        name="scheduled_start_time"
                        value={formData.scheduled_start_time ? format(parseISO(formData.scheduled_start_time), 'yyyy-MM-dd\'T\'HH:mm') : ''}
                        onChange={(e) => handleScheduleTimeChange('scheduled_start_time', e.target.value)}
                        className="h-9"
                        disabled={isSaving || isDeleting}
                    />
                 </div>
                 <div>
                    <Label htmlFor="scheduled_end_time">Scheduled End</Label>
                     <Input 
                        id="scheduled_end_time" 
                        type="datetime-local" 
                        name="scheduled_end_time"
                        value={formData.scheduled_end_time ? format(parseISO(formData.scheduled_end_time), 'yyyy-MM-dd\'T\'HH:mm') : ''}
                        onChange={(e) => handleScheduleTimeChange('scheduled_end_time', e.target.value)}
                        className="h-9"
                        disabled={isSaving || isDeleting}
                     />
                 </div>
             </div>

            <Separator />

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="importance-dialog" className="text-xs flex items-center gap-1"><ImportanceIcon size={12}/> Importance</Label>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">{formData.importance || '-'}/10</Badge>
                    </div>
                    <Slider
                        id="importance-dialog"
                        name="importance"
                        min={1} max={10} step={1}
                        value={[formData.importance || 5]}
                        onValueChange={(val) => handleSliderChange('importance', val)}
                        className="my-2"
                        disabled={isSaving || isDeleting}
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="urgency-dialog" className="text-xs">Urgency</Label>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">{formData.urgency || '-'}/10</Badge>
                    </div>
                    <Slider
                        id="urgency-dialog"
                        name="urgency"
                        min={1} max={10} step={1}
                        value={[formData.urgency || 5]}
                        onValueChange={(val) => handleSliderChange('urgency', val)}
                        className="my-2"
                        disabled={isSaving || isDeleting}
                    />
                </div>
                 <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                         <Label htmlFor="cognitive_load_estimate" className="text-xs flex items-center gap-1"><BrainCircuit size={12}/> Cognitive Load</Label>
                         <Badge variant="outline" className="text-xs px-1.5 py-0.5">{formData.cognitive_load_estimate || '-'}/10</Badge>
                     </div>
                    <Slider
                        id="cognitive_load_estimate"
                        name="cognitive_load_estimate"
                        min={1} max={10} step={1}
                        value={[formData.cognitive_load_estimate || 5]}
                        onValueChange={(val) => handleSliderChange('cognitive_load_estimate', val)}
                        className="my-2"
                        disabled={isSaving || isDeleting}
                    />
                 </div>
                 <div>
                     <Label htmlFor="energy_level_required" className="text-xs flex items-center gap-1"><BatteryMedium size={12}/> Energy Required</Label>
                     <Select
                        name="energy_level_required"
                        value={formData.energy_level_required || ''}
                        onValueChange={(value) => handleSelectChange('energy_level_required', value)}
                        disabled={isSaving || isDeleting}
                     >
                         <SelectTrigger id="energy_level_required" className="h-9 mt-2">
                             <SelectValue placeholder="Select energy level" />
                         </SelectTrigger>
                         <SelectContent>
                             <SelectItem value="low">Low</SelectItem>
                             <SelectItem value="medium">Medium</SelectItem>
                             <SelectItem value="high">High</SelectItem>
                         </SelectContent>
                     </Select>
                 </div>
            </div>

          <Separator />

          <div className="grid gap-3">
            <Label className="flex items-center gap-1"><CheckSquare size={14}/> Subtasks</Label>
            {subtasks.length > 0 && (
              <DragDropContext onDragEnd={onSubtaskDragEnd}>
                  <Droppable droppableId="subtasks-dialog">
                      {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                              {subtasks.map((subtask, index) => renderSubtask(subtask, index))}
                              {provided.placeholder}
                          </div>
                      )}
                  </Droppable>
              </DragDropContext>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="text"
                placeholder="Add new subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="h-8 text-sm flex-grow"
                disabled={isSaving || isDeleting}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddSubtask} className="h-8" disabled={!newSubtaskTitle.trim() || isSaving || isDeleting}>
                 <PlusCircle size={14} className="mr-1.5"/> Add
              </Button>
            </div>
          </div>

        </div>
        <DialogFooter className="flex sm:justify-between items-center pt-4 border-t mt-auto">
           <div className="flex-grow">
                {onDelete && !isCreateMode && initialTask && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm" disabled={isSaving || isDeleting}>
                                 {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 size={14} className="mr-2" />} 
                                 Delete Task
                             </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                             <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the task
                                    "<span className="font-medium">{initialTask?.title || 'this task'}</span>" and all its subtasks.
                                </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                     {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <AlertTriangle size={14} className="mr-2"/>} 
                                     Yes, delete task
                                </AlertDialogAction>
                             </AlertDialogFooter>
                         </AlertDialogContent>
                     </AlertDialog>
                 )}
             </div>
             <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving || isDeleting || !formData.title?.trim()}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save size={14} className="mr-2" />} 
                  {isCreateMode ? 'Create Task' : 'Save Changes'}
                 </Button>
             </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 