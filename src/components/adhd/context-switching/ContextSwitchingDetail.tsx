import type { ContextSwitchTemplate } from '@/types/contextSwitching';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, ListChecks, Tag, ArrowLeft } from 'lucide-react'; // Icons

interface ContextSwitchingDetailProps {
  template: ContextSwitchTemplate;
  onBack: () => void; // Function to go back to the list
  onStartSwitch: (template: ContextSwitchTemplate) => void; // Function to initiate a switch
}

// Helper to format seconds into minutes/seconds
const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m${secs > 0 ? ` ${secs}s` : ''}`;
};

export const ContextSwitchingDetail = ({ template, onBack, onStartSwitch }: ContextSwitchingDetailProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>{template.description || 'No description provided.'}</CardDescription>
        </div>
        <Button onClick={() => onStartSwitch(template)}>
          Start Switch
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="flex items-center justify-around p-3 bg-muted rounded-lg text-sm">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatTime(template.estimated_time_seconds)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span>Complexity: {template.complexity}/5</span>
          </div>
          <div className="flex items-center space-x-1">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <span>{template.steps.length} Steps</span>
          </div>
        </div>

        {/* Steps List */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Steps</h3>
          <ol className="list-decimal list-inside space-y-3">
            {template.steps
              .sort((a, b) => a.order - b.order) // Ensure steps are ordered
              .map((step) => (
                <li key={step.id} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{step.description}</span>
                      <Badge variant="outline" className="ml-2 capitalize text-xs">{step.type}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
                      ~{formatTime(step.estimated_time_seconds)}
                    </span>
                  </div>
                </li>
              ))}
          </ol>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 