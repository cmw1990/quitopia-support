import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    PlusCircle,
    Trash2,
    CheckSquare,
    Square,
    X,
    Loader2, // Loading indicator
    AlertCircle, // Error icon
    BrainCircuit, // Added BrainCircuit
    CalendarIcon, // Added CalendarIcon
    Check, // Added Check
    ChevronsUpDown, // Added ChevronsUpDown
} from 'lucide-react';
import { Task, Subtask, TaskFormData, ImportanceLevel } from '@/types/tasks';
import { Input } from '../ui/input'; // Use Shadcn Input
import { Textarea } from '../ui/textarea'; // Use Shadcn Textarea
import { Button } from '../ui/button'; // Use Shadcn Button
import { Label } from '../ui/label'; // Use Shadcn Label
import { Checkbox } from '../ui/checkbox'; // Added Checkbox import
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"; // Use Shadcn Select
import { cn } from '@/lib/utils'; // For conditional classes
import { ScrollArea } from '../ui/scroll-area'; // Added ScrollArea for subtasks
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { produce } from 'immer';
import { TaskStatusSelector } from '@/components/TaskStatusSelector';

interface TaskFormProps {
    userId: string;
    taskToEdit?: Task | null;
    onSaveTask: (taskData: TaskFormData, taskId?: string) => Promise<void>;
    onClose: () => void;
    // Removed isSubmitting prop, handle internally
}

const TaskForm: React.FC<TaskFormProps> = ({ userId, taskToEdit, onSaveTask, onClose }) => {
    const isEditing = !!taskToEdit;

    // Form state initialization
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Task['status']>('todo');
    const [priority, setPriority] = useState<Task['priority'] | null>(null); // Default to null
    const [dueDate, setDueDate] = useState('');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [importance, setImportance] = useState<ImportanceLevel>('medium');
    const [cognitiveLoadEstimate, setCognitiveLoadEstimate] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Populate form when taskToEdit changes
    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description || '');
            setStatus(taskToEdit.status);
            setPriority(taskToEdit.priority || null); // Handle null priority
            setDueDate(taskToEdit.due_date ? new Date(taskToEdit.due_date).toISOString().split('T')[0] : '');
            setImportance(taskToEdit.importance || 'medium');
            setCognitiveLoadEstimate(taskToEdit.cognitive_load_estimate || null);
            // Use task.subtasks based on updated Task type
            setSubtasks(taskToEdit.subtasks ?? []);
        } else {
            // Reset form for new task
            setTitle('');
            setDescription('');
            setStatus('todo');
            setPriority(null);
            setDueDate('');
            setImportance('medium');
            setCognitiveLoadEstimate(null);
            setSubtasks([]);
        }
        setNewSubtaskTitle('');
        setError(null); // Clear errors on task change
    }, [taskToEdit]);

    // --- Subtask Management Callbacks ---
    const handleAddSubtask = useCallback(() => {
        if (newSubtaskTitle.trim()) {
            const newSubtask: Subtask = {
                id: uuidv4(), // Generate client-side ID for now
                title: newSubtaskTitle.trim(),
                completed: false
            };
            setSubtasks(prev => [...prev, newSubtask]);
            setNewSubtaskTitle('');
        }
    }, [newSubtaskTitle]);

    const handleToggleSubtask = useCallback((subtaskId: string) => {
        setSubtasks(prev => prev.map(sub =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        ));
    }, []);

    const handleUpdateSubtaskTitle = useCallback((subtaskId: string, newTitle: string) => {
        setSubtasks(prev => prev.map(sub =>
            sub.id === subtaskId ? { ...sub, title: newTitle } : sub
        ));
    }, []);

    const handleDeleteSubtask = useCallback((subtaskId: string) => {
        setSubtasks(prev => prev.filter(sub => sub.id !== subtaskId));
    }, []);
    // --- End Subtask Management ---

    // Form Submission Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title cannot be empty.');
            return;
        }
        setError(null);
        setIsSubmitting(true);

        const taskData: TaskFormData = {
            title: title.trim(),
            description: description.trim() || null,
            status,
            priority,
            importance,
            due_date: dueDate || null,
            cognitive_load_estimate: cognitiveLoadEstimate,
            subtasks,
        };

        try {
            await onSaveTask(taskData, taskToEdit?.id);
            // No need to reset form here, parent closing dialog should trigger re-render or useEffect reset
            // onClose(); // Parent handles closing
        } catch (err: any) {
            console.error(`Error saving task:`, err);
            setError(`Save failed: ${err.message || 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Component Structure using Shadcn components
    return (
        <form onSubmit={handleSubmit} className="space-y-5 flex flex-col h-full">
            {/* Form Fields Area - Scrollable */}
            <ScrollArea className="flex-grow pr-6 -mr-6"> {/* Add padding for scrollbar */} 
                <div className="space-y-5">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title" className="mb-1.5 block text-sm font-medium">Title <span className="text-destructive">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Finalize project report"
                            required
                            className={cn(error && !title.trim() ? "border-destructive focus-visible:ring-destructive" : "")}
                            aria-invalid={error && !title.trim() ? "true" : "false"}
                        />
                        {error && !title.trim() && <p className="text-xs text-destructive mt-1.5">{error}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="mb-1.5 block text-sm font-medium">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details, context, or notes..."
                            rows={3}
                            className="min-h-[60px] resize-y"
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status" className="mb-1.5 block text-sm font-medium">Status</Label>
                            <TaskStatusSelector 
                                value={status} 
                                onChange={(status: Task['status']) => setStatus(status)} 
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="priority" className="mb-1.5 block text-sm font-medium">Priority</Label>
                            <Select value={priority ?? 'none'} onValueChange={(value) => setPriority(value === 'none' ? null : value as Task['priority'])}>
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Importance */}
                    <div>
                        <Label htmlFor="importance" className="mb-1.5 block text-sm font-medium">Importance</Label>
                        <Select value={importance} onValueChange={(value) => setImportance(value as ImportanceLevel)}>
                            <SelectTrigger id="importance">
                                <SelectValue placeholder="Select importance" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cognitive Load Estimate */}
                    <div>
                        <Label htmlFor="cognitive-load" className="mb-1.5 block text-sm font-medium">Cognitive Load (1-5)</Label>
                        <Select value={cognitiveLoadEstimate?.toString() || ''} onValueChange={(value) => setCognitiveLoadEstimate(value ? parseInt(value) : null)}>
                            <SelectTrigger id="cognitive-load">
                                <SelectValue placeholder="Select cognitive load" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">-- None --</SelectItem>
                                <SelectItem value="1">1 (Very Low)</SelectItem>
                                <SelectItem value="2">2 (Low)</SelectItem>
                                <SelectItem value="3">3 (Medium)</SelectItem>
                                <SelectItem value="4">4 (High)</SelectItem>
                                <SelectItem value="5">5 (Very High)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <Label htmlFor="due-date">Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="due-date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(parseISO(dueDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={dueDate ? parseISO(dueDate) : undefined}
                                    onSelect={(date) => {
                                        const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
                                        setDueDate(formattedDate ?? '');
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Subtasks Section */}
                    <div>
                        <Label className="mb-2 block text-sm font-medium">Subtasks</Label>
                        <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
                            <ScrollArea className="max-h-36 pr-3 -mr-3"> {/* Scroll within subtask area */} 
                                <div className="space-y-2">
                                     {subtasks.length === 0 && (
                                         <p className="text-xs text-muted-foreground text-center py-2 italic">No subtasks added yet.</p>
                                     )}
                                    {subtasks.map((st) => (
                                        <div key={st.id} className="flex items-center space-x-2 group bg-background/50 p-1.5 rounded">
                                            <Checkbox
                                                id={`subtask-${st.id}`}
                                                checked={st.completed}
                                                onCheckedChange={() => handleToggleSubtask(st.id)}
                                                className="h-4 w-4 border-muted-foreground/50 data-[state=checked]:bg-primary"
                                                aria-label={st.completed ? `Mark '${st.title}' incomplete` : `Mark '${st.title}' complete`}
                                            />
                                            <Input
                                                type="text"
                                                value={st.title}
                                                onChange={(e) => handleUpdateSubtaskTitle(st.id, e.target.value)}
                                                placeholder="Subtask description"
                                                className={cn(
                                                    "h-auto flex-grow bg-transparent border-0 shadow-none px-1 py-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
                                                    st.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteSubtask(st.id)}
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity shrink-0"
                                                aria-label={`Delete subtask '${st.title}'`}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                             </ScrollArea>
                            {/* Add Subtask Input */} 
                            <div className="flex items-center space-x-2 pt-2 border-t border-border/50">
                                <Input
                                    type="text"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    placeholder="Type a new subtask and press Enter"
                                    className="h-8 text-sm flex-grow"
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleAddSubtask}
                                    className="h-8 w-8 shrink-0"
                                    disabled={!newSubtaskTitle.trim()}
                                    aria-label="Add subtask"
                                >
                                    <PlusCircle size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                 </div>
            </ScrollArea>

            {/* Form Actions - Fixed at bottom */} 
            <div className="flex-shrink-0 pt-4 border-t border-border/50 flex justify-between items-center">
                {/* Display general form error */} 
                 {error && title.trim() && ( // Show non-title errors here
                    <div className="flex items-center text-sm text-destructive">
                         <AlertCircle className="h-4 w-4 mr-1.5"/> {error}
                    </div>
                 )}
                 <span className="flex-grow"></span> {/* Spacer */} 
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !title.trim()}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                        {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Task')}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default TaskForm;
