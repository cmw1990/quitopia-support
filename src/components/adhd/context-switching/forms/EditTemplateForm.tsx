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
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { SwitchingStep, SwitchingTemplate } from '../types';
import { Clock, GripVertical, ListChecks, Plus, Timer, Trash } from 'lucide-react';
import { CheckIcon } from '@radix-ui/react-icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const stepSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, { message: 'Description is required' }),
  order: z.number(),
  type: z.enum(['task', 'preparation', 'cleanup', 'reminder']),
  estimated_time_seconds: z.number().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, { message: 'Template name is required' }),
  description: z.string().optional(),
  estimated_time_seconds: z.number().min(0),
  complexity: z.number().min(1).max(10),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditTemplateFormProps {
  template: SwitchingTemplate;
  onSubmit: (template: SwitchingTemplate) => Promise<void>;
  onCancel: () => void;
}

const EditTemplateForm: React.FC<EditTemplateFormProps> = ({ template, onSubmit, onCancel }) => {
  const [steps, setSteps] = useState<SwitchingStep[]>(template.steps || []);
  const [stepType, setStepType] = useState<'task' | 'preparation' | 'cleanup' | 'reminder'>('task');
  const [stepDescription, setStepDescription] = useState('');
  const [stepEstimatedTime, setStepEstimatedTime] = useState(0);
  const [tags, setTags] = useState<string[]>(template.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template.name || '',
      description: template.description || '',
      estimated_time_seconds: template.estimated_time_seconds || 0,
      complexity: template.complexity || 5,
      tags: template.tags || [],
    },
  });

  const addStep = () => {
    if (stepDescription.trim() === '') return;
    
    const newStep: SwitchingStep = {
      id: Date.now().toString(), // temporary ID
      description: stepDescription,
      order: steps.length,
      type: stepType,
      estimated_time_seconds: stepEstimatedTime,
    };
    
    setSteps([...steps, newStep]);
    setStepDescription('');
    setStepEstimatedTime(0);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }
    
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the steps
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Update the order property
    newSteps.forEach((step, idx) => {
      step.order = idx;
    });
    
    setSteps(newSteps);
  };

  const addTag = () => {
    if (!tagInput.trim() || tags.includes(tagInput.trim())) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (steps.length === 0) {
      form.setError('name', { 
        type: 'manual', 
        message: 'At least one step is required' 
      });
      return;
    }
    
    const updatedTemplate: SwitchingTemplate = {
      ...template,
      ...values,
      steps: steps.map((step, index) => ({ ...step, order: index })),
      tags,
    };
    
    await onSubmit(updatedTemplate);
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'preparation': return 'bg-green-100 text-green-800';
      case 'cleanup': return 'bg-purple-100 text-purple-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalTime = () => {
    return steps.reduce((sum, step) => sum + (step.estimated_time_seconds || 0), 0);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Morning Development Routine" {...field} />
                  </FormControl>
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
                      placeholder="Describe what this template is for"
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 rounded-full"
                    onClick={() => removeTag(tag)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-32 h-8"
                />
                <Button 
                  type="button" 
                  size="sm"
                  variant="outline"
                  onClick={addTag}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      Complexity (1-10)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="10" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimated_time_seconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Total Time (seconds)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        value={calculateTotalTime()}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      {formatTime(calculateTotalTime())}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <FormLabel>Template Steps</FormLabel>
              <FormDescription>
                Add steps to guide the context switching process
              </FormDescription>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex gap-2">
                <Select
                  value={stepType}
                  onValueChange={(value: 'task' | 'preparation' | 'cleanup' | 'reminder') => 
                    setStepType(value)
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Step Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preparation">Preparation</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="cleanup">Cleanup</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Step description"
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  className="flex-1"
                />
                
                <div className="flex items-center gap-1 w-32">
                  <Timer className="h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="Time (s)"
                    min="0"
                    value={stepEstimatedTime || ''}
                    onChange={(e) => setStepEstimatedTime(parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                
                <Button 
                  type="button" 
                  onClick={addStep}
                  disabled={!stepDescription.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {steps.length > 0 ? (
                <ScrollArea className="h-[250px] border rounded-md p-2">
                  <div className="space-y-2">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50"
                      >
                        <div className="flex items-center mr-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(index, 'up')}
                            disabled={index === 0}
                            className="h-7 w-7 p-0"
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Badge 
                          variant="outline"
                          className={`${getStepTypeColor(step.type)} border-none px-2 py-0 text-xs`}
                        >
                          {step.type}
                        </Badge>
                        
                        <div className="flex-1">
                          <p className="text-sm">{step.description}</p>
                        </div>
                        
                        {step.estimated_time_seconds ? (
                          <Badge variant="outline" className="ml-auto flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(step.estimated_time_seconds)}
                          </Badge>
                        ) : null}
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(step.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-[250px] border rounded-md p-4">
                  <p className="text-gray-500 text-center">
                    No steps added yet. Add steps to create your template.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">Update Template</Button>
        </div>
      </form>
    </Form>
  );
};

export default EditTemplateForm; 