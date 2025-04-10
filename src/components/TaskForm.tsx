import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO, isValid } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, PlusCircle, X, CalendarIcon } from 'lucide-react';
import { FocusTask, CreateFocusTaskDto, UpdateFocusTaskDto } from '@/types/task';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

// Validation schema
const focusTaskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']).optional().nullable(),
  due_date: z.string().optional().nullable(),
  estimated_minutes: z.coerce.number().int().positive().optional().nullable(),
  cognitive_load_estimate: z.coerce.number().int().min(1).max(10).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
});

type FocusTaskFormValues = z.infer<typeof focusTaskFormSchema>;

interface TaskFormProps {
  initialData?: FocusTask | null;
  onSubmit: (data: CreateFocusTaskDto | UpdateFocusTaskDto) => Promise<void>;
  onCancel: () => void;
  isMutating: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel, isMutating }) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.due_date ? parseISO(initialData.due_date) : undefined
  );

  const form = useForm<FocusTaskFormValues>({
    resolver: zodResolver(focusTaskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || null,
      status: initialData?.status || 'todo',
      priority: initialData?.priority || null,
      due_date: initialData?.due_date || null,
      estimated_minutes: initialData?.estimated_minutes || null,
      cognitive_load_estimate: initialData?.cognitive_load_estimate || null,
      tags: initialData?.tags || null,
    },
  });

  useEffect(() => {
    form.setValue('due_date', dueDate ? format(dueDate, 'yyyy-MM-dd') : null);
  }, [dueDate, form]);

  const handleFormSubmit = async (values: FocusTaskFormValues) => {
    const submissionData: CreateFocusTaskDto | Omit<UpdateFocusTaskDto, 'id'> = {
      ...values,
      due_date: dueDate ? dueDate.toISOString() : null,
      tags: tags.length > 0 ? tags : null,
    };

    if (initialData?.id) {
      await onSubmit({ ...submissionData, id: initialData.id } as UpdateFocusTaskDto & { id: string });
    } else {
      await onSubmit(submissionData as CreateFocusTaskDto);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setDueDate(date);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Card className="w-full z-50 shadow-xl overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <CardHeader className="relative border-b">
                <CardTitle>{initialData ? 'Edit Task' : 'Add New Task'}</CardTitle>
                <CardDescription>{initialData ? 'Update the details of your task.' : 'Fill in the details for your new task.'}</CardDescription>
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" 
                  onClick={onCancel}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-5 pt-6 pb-6 max-h-[70vh] overflow-y-auto">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add more details... (Optional)" 
                        {...field} 
                        value={field.value ?? ''}
                        rows={3} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority (Optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="due_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !dueDate && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dueDate ? format(dueDate, 'PPP') : <span>Pick a date (Optional)</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <FormField control={form.control} name="estimated_minutes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Minutes</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 30 (Optional)" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} 
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="cognitive_load_estimate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognitive Load <span className="text-muted-foreground text-xs">(1-10, Optional)</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="10" 
                          placeholder="1-10" 
                          {...field} 
                          onChange={e => field.onChange(e.target.value === '' ? null : +e.target.value)} 
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div>
                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <>
                          <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
                            {tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleRemoveTag(tag)}
                              >
                                {tag}
                                <X className="ml-1 h-3 w-3" />
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a tag (Optional)"
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            />
                            <Button type="button" onClick={handleAddTag} size="sm">
                              Add
                            </Button>
                          </div>
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 pt-4 pb-4 border-t bg-muted/30">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isMutating}>Cancel</Button>
                <Button type="submit" disabled={isMutating}>
                  {isMutating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (initialData ? <Save className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />)}
                  {initialData ? 'Save Changes' : 'Add Task'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default TaskForm; 