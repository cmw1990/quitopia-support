import { useState, useEffect } from 'react';
import { contextSwitchingService } from '@/services/context-switching/contextSwitchingService';
import type { ContextSwitchTemplate } from '@/types/contextSwitching';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ContextSwitchingListProps {
  onSelectTemplate: (template: ContextSwitchTemplate) => void; // Callback for when a template is selected
  onEditTemplate: (template: ContextSwitchTemplate) => void; // Callback for editing
  onDeleteTemplate: (templateId: string) => void; // Callback for deleting
}

export const ContextSwitchingList = ({ onSelectTemplate, onEditTemplate, onDeleteTemplate }: ContextSwitchingListProps) => {
  const [templates, setTemplates] = useState<ContextSwitchTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await contextSwitchingService.getTemplates();
        if (fetchError) {
          let errorMessage = 'Failed to fetch templates.';
          if (typeof fetchError === 'object' && fetchError !== null && 'message' in fetchError && typeof fetchError.message === 'string') {
            errorMessage = fetchError.message;
          }
          throw new Error(errorMessage);
        }
        setTemplates(data || []);
      } catch (err: any) {
        console.error('Failed to fetch context switching templates:', err);
        setError('Could not load templates. Please try refreshing.');
        toast({
          title: 'Error Loading Templates',
          description: err.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No context switching templates found.</p>
        <p>Create your first template to get started!</p>
        {/* Consider adding a button here to navigate to the creation form */}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Steps: {template.steps.length} | Est. Time: {Math.round(template.estimated_time_seconds / 60)} min | Complexity: {template.complexity}
            </p>
            {/* Optionally display tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => onSelectTemplate(template)}>
              View Details
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onEditTemplate(template)}>
              Edit
            </Button>
            {/* Add confirmation before deleting */}
            <Button variant="destructive" size="sm" onClick={() => onDeleteTemplate(template.id)}>
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}; 