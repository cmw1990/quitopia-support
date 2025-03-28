import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReportTemplate, ReportSection } from '@/lib/reports/types';
import { Check, Edit, Move, X } from 'lucide-react';

interface CustomizeReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: ReportTemplate;
  onUpdateTemplate: (template: ReportTemplate) => void;
}

export const CustomizeReportDialog: React.FC<CustomizeReportDialogProps> = ({
  isOpen,
  onClose,
  template,
  onUpdateTemplate
}) => {
  const [workingTemplate, setWorkingTemplate] = useState<ReportTemplate>({ ...template });
  
  const toggleSection = (sectionId: string) => {
    setWorkingTemplate(prev => {
      const updatedSections = prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, selected: !section.selected }
          : section
      );
      
      return { ...prev, sections: updatedSections };
    });
  };
  
  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    
    setWorkingTemplate(prev => {
      const updatedSections = [...prev.sections];
      const temp = updatedSections[index];
      updatedSections[index] = updatedSections[index - 1];
      updatedSections[index - 1] = temp;
      
      return { ...prev, sections: updatedSections };
    });
  };
  
  const moveSectionDown = (index: number) => {
    if (index === workingTemplate.sections.length - 1) return;
    
    setWorkingTemplate(prev => {
      const updatedSections = [...prev.sections];
      const temp = updatedSections[index];
      updatedSections[index] = updatedSections[index + 1];
      updatedSections[index + 1] = temp;
      
      return { ...prev, sections: updatedSections };
    });
  };
  
  const saveChanges = () => {
    onUpdateTemplate(workingTemplate);
    onClose();
  };
  
  const cancelChanges = () => {
    setWorkingTemplate({ ...template });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={cancelChanges}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Report Template</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Select the sections you want to include in your report and arrange them in the desired order.
              </p>
            </div>
            
            <div className="space-y-2">
              {workingTemplate.sections.map((section, index) => (
                <div 
                  key={section.id}
                  className={`flex items-start space-x-2 p-2 rounded-md ${
                    section.selected ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30'
                  }`}
                >
                  <Checkbox
                    id={section.id}
                    checked={section.selected}
                    onCheckedChange={() => toggleSection(section.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={section.id}
                      className="font-medium"
                    >
                      {section.title}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-up"
                      >
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => moveSectionDown(index)}
                      disabled={index === workingTemplate.sections.length - 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-down"
                      >
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button variant="outline" onClick={cancelChanges}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={saveChanges}>
            <Check className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 