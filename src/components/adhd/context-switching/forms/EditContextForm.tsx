import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SavedContext } from '../types';
import { Brain, Energy, Focus, MoveHorizontal, Smile } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Context name is required' }),
  description: z.string().optional(),
  mental_state: z.string().optional(),
  focus_level: z.enum(['low', 'medium', 'high']),
  energy_required: z.enum(['low', 'medium', 'high']),
  complexity: z.coerce.number().min(1).max(10),
  cognitive_load: z.enum(['low', 'medium', 'high']),
  emoji: z.string().optional(),
  color: z.string().optional(),
  task: z.string().optional(),
  notes: z.string().optional(),
  progress: z.coerce.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface EditContextFormProps {
  context: SavedContext;
  onSubmit: (context: SavedContext) => Promise<void>;
  onCancel: () => void;
}

const EMOJI_OPTIONS = [
  '🧠', '💡', '📚', '✏️', '💻', '🎯', '🏆', '📈', 
  '📝', '🎨', '🔬', '⚙️', '📱', '🗂️', '📊', '🛠️',
  '🧩', '🎓', '📅', '🔔', '🧮', '🎬', '👥', '🏢'
];

const EditContextForm: React.FC<EditContextFormProps> = ({ context, onSubmit, onCancel }) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: context.name || '',
      description: context.description || '',
      mental_state: context.mental_state || '',
      focus_level: context.focus_level || 'medium',
      energy_required: context.energy_required || 'medium',
      complexity: context.complexity || 5,
      cognitive_load: context.cognitive_load || 'medium',
      emoji: context.emoji || '🧠',
      color: context.color || '#4f46e5', // indigo-600
      task: context.task || '',
      notes: context.notes || '',
      progress: context.progress || 0,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    const updatedContext: SavedContext = {
      ...context,
      ...values,
    };
    
    await onSubmit(updatedContext);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-4">
            {/* Basic Information */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Project X Development" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Task</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Implement feature Y" {...field} />
                  </FormControl>
                  <FormDescription>
                    The primary task associated with this context
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the context and its purpose"
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex-1 space-y-4">
            {/* Mental State and Cognitive Load */}
            <FormField
              control={form.control}
              name="mental_state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mental State</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Focused, Creative, Analytical" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The mental state required for this context
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="focus_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Focus className="h-4 w-4" />
                      Focus Level
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select focus level" />
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
                )}
              />
              
              <FormField
                control={form.control}
                name="energy_required"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Energy className="h-4 w-4" />
                      Energy Required
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select energy level" />
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
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Brain className="h-4 w-4" />
                      Complexity (1-10)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cognitive_load"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MoveHorizontal className="h-4 w-4" />
                      Cognitive Load
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cognitive load" />
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
                )}
              />
            </div>
          </div>
        </div>

        {/* Progress */}
        <FormField
          control={form.control}
          name="progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Progress ({field.value}%)</FormLabel>
              <FormControl>
                <Input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  {...field} 
                  className="w-full"
                />
              </FormControl>
              <FormDescription>
                Current progress on this context's task
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Appearance and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="emoji"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Smile className="h-4 w-4" />
                  Emoji Icon
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an emoji" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJI_OPTIONS.map(emoji => (
                        <SelectItem 
                          key={emoji} 
                          value={emoji}
                          className="cursor-pointer text-center text-lg"
                        >
                          {emoji}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer">
                        <div 
                          className="w-full h-full rounded"
                          style={{ backgroundColor: field.value }}
                        />
                      </div>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <HexColorPicker 
                      color={field.value} 
                      onChange={field.onChange} 
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any other details about this context"
                    className="resize-none h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">Update Context</Button>
        </div>
      </form>
    </Form>
  );
};

export default EditContextForm; 