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
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Plus, 
  Trash2, 
  Clock, 
  ListChecks,
  Copy
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import * as contextSwitchingService from '@/services/contextSwitchingService';
import { SwitchingTemplate, SwitchingStep } from './types';
import NewTemplateForm from './forms/NewTemplateForm';
import EditTemplateForm from './forms/EditTemplateForm';

interface TemplatesPanelProps {
  templates: SwitchingTemplate[];
  onRefreshData: () => Promise<void>;
}

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  templates,
  onRefreshData
}) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<SwitchingTemplate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate?.id) return;
    
    try {
      await contextSwitchingService.deleteTemplate(selectedTemplate.id);
      setShowDeleteDialog(false);
      setSelectedTemplate(null);
      
      await onRefreshData();
      
      toast({
        title: 'Template Deleted',
        description: `The template "${selectedTemplate.name}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template. Please try again.',
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

  const handleDuplicateTemplate = async (template: SwitchingTemplate) => {
    try {
      // Create a copy of the template with a new name
      const newTemplate: SwitchingTemplate = {
        ...template,
        name: `Copy of ${template.name}`,
        is_default: false,
      };
      
      // Remove the id so a new one is generated
      delete newTemplate.id;
      delete newTemplate.created_at;
      delete newTemplate.updated_at;
      
      await contextSwitchingService.createTemplate(newTemplate);
      await onRefreshData();
      
      toast({
        title: 'Template Duplicated',
        description: `Created a copy of "${template.name}"`,
      });
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getFormattedDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
    }
  };

  const handleEditTemplate = async (template: SwitchingTemplate) => {
    if (!template.id) return;
    
    try {
      await contextSwitchingService.updateTemplate(template.id, template);
      setShowEditDialog(false);
      setSelectedTemplate(null);
      
      await onRefreshData();
      
      toast({
        title: 'Template Updated',
        description: `The template "${template.name}" has been updated.`,
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTemplate = async (template: SwitchingTemplate) => {
    try {
      await contextSwitchingService.createTemplate(template);
      setShowCreateDialog(false);
      
      await onRefreshData();
      
      toast({
        title: 'Template Created',
        description: `The template "${template.name}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Context Switching Templates</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Templates</CardTitle>
            <CardDescription>
              You don't have any context switching templates yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ListChecks className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-center text-sm text-gray-500 mb-4">
              Templates help you switch between contexts smoothly and reduce cognitive load.
              They provide a step-by-step process for closing one context and opening another.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{template.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`flex items-center space-x-1 ${getCognitiveLoadColor(template.cognitive_load)} text-white`}
                    >
                      {template.cognitive_load.charAt(0).toUpperCase() + template.cognitive_load.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {getFormattedDuration(template.duration)}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {template.steps.length} steps • {template.is_default ? 'Default Template' : 'Custom Template'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="steps">
                    <AccordionTrigger className="text-sm py-2">
                      View Steps
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-2 pl-5 list-decimal">
                        {template.steps.map((step, index) => (
                          <li key={step.id || index} className="text-sm">
                            <span className="font-medium">{step.title}</span>
                            {step.description && (
                              <p className="text-xs text-gray-500">{step.description}</p>
                            )}
                            {step.duration > 0 && (
                              <span className="text-xs text-gray-500 ml-1">
                                ({Math.floor(step.duration / 60)}:{String(step.duration % 60).padStart(2, '0')})
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the template "{selectedTemplate?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the template details and steps.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <EditTemplateForm 
              template={selectedTemplate}
              onSubmit={handleEditTemplate}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new template to help you switch between contexts.
            </DialogDescription>
          </DialogHeader>
          
          <NewTemplateForm 
            onSubmit={handleCreateTemplate}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesPanel; 