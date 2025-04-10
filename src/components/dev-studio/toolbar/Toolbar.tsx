import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  MousePointer,
  Database,
  Code,
  Play,
  Eye
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  return (
    <div className="h-12 border-b border-border bg-card px-2 flex items-center space-x-2">
      <Button variant="ghost" size="icon">
        <Save className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button variant="ghost" size="icon">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Redo className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button variant="ghost" size="icon">
        <MousePointer className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Move className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button variant="ghost" size="icon">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      <Button variant="ghost" size="icon">
        <Database className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Code className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button variant="ghost" size="icon">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Play className="h-4 w-4" />
      </Button>
    </div>
  );
};
