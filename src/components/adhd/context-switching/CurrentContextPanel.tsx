import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRightLeft, 
  Brain, 
  Edit, 
  FileBox, 
  ListChecks, 
  Plus, 
  Sparkles,
  TimerReset
} from 'lucide-react';

import * as contextSwitchingService from '@/services/contextSwitchingService';
import { SavedContext, SwitchingTemplate } from './types';
import NewContextForm from './forms/NewContextForm';
import EditContextForm from './forms/EditContextForm';

interface CurrentContextPanelProps {
  currentContext: SavedContext | null;
  templates: SwitchingTemplate[];
  savedContexts: SavedContext[];
  onSwitchContext: (from: SavedContext | null, to: SavedContext) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

const CurrentContextPanel: React.FC<CurrentContextPanelProps> = ({
  currentContext,
  templates,
  savedContexts,
  onSwitchContext,
  onRefreshData
}) => {
  const { toast } = useToast();
  const [showNewContextDialog, setShowNewContextDialog] = useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedContextId, setSelectedContextId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const handleCreateNewContext = async (context: SavedContext) => {
    try {
      const newContext = await contextSwitchingService.createSavedContext(context);
      setShowNewContextDialog(false);
      await onRefreshData();
      
      // Switch to the new context
      onSwitchContext(currentContext, newContext);
      
      toast({
        title: 'Success',
        description: `Created new context: ${newContext.name}`,
      });
    } catch (error) {
      console.error('Error creating context:', error);
      toast({
        title: 'Error',
        description: 'Failed to create context. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSwitchContext = async () => {
    if (!selectedContextId) {
      toast({
        title: 'Error',
        description: 'Please select a context to switch to.',
        variant: 'destructive',
      });
      return;
    }
    
    const targetContext = savedContexts.find(ctx => ctx.id === selectedContextId);
    if (!targetContext) {
      toast({
        title: 'Error',
        description: 'Selected context not found.',
        variant: 'destructive',
      });
      return;
    }
    
    await onSwitchContext(currentContext, targetContext);
    setShowSwitchDialog(false);
    setSelectedContextId('');
    setSelectedTemplateId('');
  };

  const handleUpdateContext = async (context: SavedContext) => {
    if (!context.id) return;
    
    try {
      const updatedContext = await contextSwitchingService.updateSavedContext(context.id, context);
      setShowEditDialog(false);
      
      await onRefreshData();
      
      toast({
        title: 'Context Updated',
        description: `The context "${context.name}" has been updated.`,
      });
    } catch (error) {
      console.error('Error updating context:', error);
      toast({
        title: 'Error',
        description: 'Failed to update context. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getCognitiveLoadColor = (load: string) => {
    switch (load) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredContexts = savedContexts.filter(ctx => 
    !currentContext || ctx.id !== currentContext.id
  );

  return (
    <div className="space-y-4">
      {currentContext ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{currentContext.name}</CardTitle>
                <CardDescription>{currentContext.task}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Brain className="h-3 w-3" />
                  <span>
                    Complexity: {currentContext.complexity}/10
                  </span>
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`flex items-center space-x-1 ${getCognitiveLoadColor(currentContext.cognitive_load)} text-white`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>
                    {currentContext.cognitive_load.charAt(0).toUpperCase() + currentContext.cognitive_load.slice(1)} Load
                  </span>
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentContext.notes && (
              <div>
                <h3 className="text-sm font-medium mb-1">Notes:</h3>
                <p className="text-sm text-gray-500">{currentContext.notes}</p>
              </div>
            )}
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{currentContext.progress}%</span>
              </div>
              <Progress value={currentContext.progress} className="h-2" />
            </div>
            
            {currentContext.resources && currentContext.resources.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-1">Resources:</h3>
                <ul className="text-sm space-y-1">
                  {currentContext.resources.map(resource => (
                    <li key={resource.id} className="flex items-center">
                      {resource.type === 'link' && resource.url ? (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {resource.title}
                        </a>
                      ) : (
                        <span>{resource.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSwitchDialog(true)}
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Switch Context
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Context
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Context</CardTitle>
            <CardDescription>
              You don't have an active context. Create a new one or switch to an existing context.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileBox className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-center text-sm text-gray-500 mb-4">
              Creating a context helps you keep track of your current task and all related resources.
              It also makes it easier to switch between different tasks with less cognitive overhead.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowNewContextDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Context
              </Button>
              {savedContexts.length > 0 && (
                <Button
                  variant="default"
                  onClick={() => setShowSwitchDialog(true)}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Switch to Existing
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* New Context Dialog */}
      <Dialog open={showNewContextDialog} onOpenChange={setShowNewContextDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Context</DialogTitle>
            <DialogDescription>
              Define your new context with a name, task, and related information.
            </DialogDescription>
          </DialogHeader>
          <NewContextForm onSubmit={handleCreateNewContext} onCancel={() => setShowNewContextDialog(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Switch Context Dialog */}
      <Dialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch Context</DialogTitle>
            <DialogDescription>
              Select a context to switch to and optionally use a switching template.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="context" className="text-sm font-medium">
                Target Context
              </label>
              <Select
                value={selectedContextId}
                onValueChange={setSelectedContextId}
              >
                <SelectTrigger id="context">
                  <SelectValue placeholder="Select a context" />
                </SelectTrigger>
                <SelectContent>
                  {filteredContexts.map(context => (
                    <SelectItem key={context.id} value={context.id || ''}>
                      {context.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {templates.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="template" className="text-sm font-medium">
                  Switching Template (Optional)
                </label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No template</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id || ''}>
                        {template.name} ({template.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSwitchDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSwitchContext}>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Switch Context
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Context Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Context</DialogTitle>
            <DialogDescription>
              Update the details for this context.
            </DialogDescription>
          </DialogHeader>
          
          {currentContext && (
            <EditContextForm 
              context={currentContext}
              onSubmit={handleUpdateContext}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CurrentContextPanel; 