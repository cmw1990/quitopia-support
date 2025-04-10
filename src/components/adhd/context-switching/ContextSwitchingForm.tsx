import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { ContextSwitchTemplate, ContextSwitchStep } from '@/types/contextSwitching'; // Adjust path if needed
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, PlusCircle } from "lucide-react";

// Define the schema for a single step
const stepSchema = z.object({
  description: z.string().min(1, { message: "Step description is required." }),
  estimated_time_seconds: z.coerce.number().positive({ message: "Estimated time must be positive." }),
  type: z.enum(['preparation', 'action', 'break', 'planning'], { required_error: "Step type is required." }),
});

// Update the main form schema to include an array of steps
const formSchema = z.object({
  name: z.string().min(3, { message: "Template name must be at least 3 characters." }),
  description: z.string().optional(),
  steps: z.array(stepSchema).min(1, { message: "At least one step is required." }), // Require at least one step
  complexity: z.coerce.number().min(1).max(5, { message: "Complexity must be between 1 and 5." }), // Add complexity
  tags: z.string().optional(), // Add tags as optional string (comma-separated)
});

// Export the type
export type ContextSwitchFormValues = z.infer<typeof formSchema>;

interface ContextSwitchingFormProps {
  initialData?: ContextSwitchTemplate; // Optional initial data for editing
  onSubmit: (data: ContextSwitchFormValues) => Promise<void>; // Function to handle form submission
  onCancel: () => void; // Function to handle cancellation
  isSubmitting: boolean; // Flag to disable button during submission
}

export const ContextSwitchingForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ContextSwitchingFormProps) => {
  const { toast } = useToast();

  const form = useForm<ContextSwitchFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      steps: initialData?.steps || [{ description: "", estimated_time_seconds: 60, type: 'action' }], // Default with one empty step
      complexity: initialData?.complexity || 1, // Default complexity to 1
      tags: initialData?.tags?.join(', ') || "", // Join tags array for input
    },
  });

  // Setup useFieldArray for managing steps
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  const handleFormSubmit = async (values: ContextSwitchFormValues) => {
    try {
      await onSubmit(values);
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to save the template.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning Code Focus" {...field} />
              </FormControl>
              <FormDescription>
A short, descriptive name for this template.
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe when and why you might use this template..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Steps Field Array Section */}
        <div>
          <FormLabel className="text-lg font-semibold">Steps</FormLabel>
          <FormDescription className="mb-4">
            Define the sequence of actions for this context switch.
          </FormDescription>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start space-x-3 p-4 border rounded-md mb-4 relative">
              <div className="flex-grow space-y-3">
                <FormField
                  control={form.control}
                  name={`steps.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step {index + 1} Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Close Slack" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-3">
                  <FormField
                    control={form.control}
                    name={`steps.${index}.estimated_time_seconds`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Est. Time (s)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`steps.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="preparation">Preparation</SelectItem>
                            <SelectItem value="action">Action</SelectItem>
                            <SelectItem value="break">Break</SelectItem>
                            <SelectItem value="planning">Planning</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {fields.length > 1 && ( // Only show remove button if more than one step
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                  aria-label="Remove step"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ description: "", estimated_time_seconds: 60, type: 'action' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Step
          </Button>
          <FormField
              control={form.control}
              name="steps"
              render={() => <FormMessage />}
            />
        </div>

        {/* Complexity Field */}
        <FormField
          control={form.control}
          name="complexity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complexity (1-5)</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(level => (
                    <SelectItem key={level} value={String(level)}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                How mentally demanding is switching using this template? (1=Low, 5=High)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags Field */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., work, coding, urgent, quick" {...field} />
              </FormControl>
              <FormDescription>
                Comma-separated tags to help categorize this template.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 