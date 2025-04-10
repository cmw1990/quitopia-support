import React from 'react';
import { WireframeComponent } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  component: WireframeComponent | null;
  onUpdate: (component: WireframeComponent) => void;
  onDelete?: (id: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  component,
  onUpdate,
  onDelete
}) => {
  if (!component) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Select a component to edit its properties
      </div>
    );
  }

  const handleStyleChange = (property: string, value: string) => {
    onUpdate({
      ...component,
      props: {
        ...component.props,
        style: {
          ...component.props.style,
          [property]: value
        }
      }
    });
  };

  const handleClassChange = (value: string) => {
    onUpdate({
      ...component,
      props: {
        ...component.props,
        className: value
      }
    });
  };

  const handleContentChange = (value: string) => {
    onUpdate({
      ...component,
      props: {
        ...component.props,
        children: value
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-medium">{component.name}</h3>
          <p className="text-sm text-muted-foreground">{component.type}</p>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(component.id)}
            className="text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
            <TabsTrigger value="layout" className="flex-1">Layout</TabsTrigger>
            <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Names</Label>
              <Input
                id="className"
                value={component.props.className || ''}
                onChange={(e) => handleClassChange(e.target.value)}
                placeholder="Enter class names..."
              />
            </div>
            <div className="space-y-2">
              <Label>Colors</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="backgroundColor" className="text-xs">Background</Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={component.props.style?.backgroundColor || '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="color" className="text-xs">Text</Label>
                  <Input
                    id="color"
                    type="color"
                    value={component.props.style?.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Border</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Width (px)"
                  type="number"
                  value={parseInt(component.props.style?.borderWidth || '0')}
                  onChange={(e) => handleStyleChange('borderWidth', `${e.target.value}px`)}
                />
                <Input
                  placeholder="Radius (px)"
                  type="number"
                  value={parseInt(component.props.style?.borderRadius || '0')}
                  onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="X (px)"
                  type="number"
                  value={parseInt(component.props.style?.left || '0')}
                  onChange={(e) => handleStyleChange('left', `${e.target.value}px`)}
                />
                <Input
                  placeholder="Y (px)"
                  type="number"
                  value={parseInt(component.props.style?.top || '0')}
                  onChange={(e) => handleStyleChange('top', `${e.target.value}px`)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Width (px)"
                  type="number"
                  value={parseInt(component.props.style?.width || '0')}
                  onChange={(e) => handleStyleChange('width', `${e.target.value}px`)}
                />
                <Input
                  placeholder="Height (px)"
                  type="number"
                  value={parseInt(component.props.style?.height || '0')}
                  onChange={(e) => handleStyleChange('height', `${e.target.value}px`)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Margin</Label>
              <div className="grid grid-cols-4 gap-2">
                {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                  <Input
                    key={side}
                    placeholder={side}
                    type="number"
                    value={parseInt(component.props.style?.[`margin${side}`] || '0')}
                    onChange={(e) => handleStyleChange(`margin${side}`, `${e.target.value}px`)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Padding</Label>
              <div className="grid grid-cols-4 gap-2">
                {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                  <Input
                    key={side}
                    placeholder={side}
                    type="number"
                    value={parseInt(component.props.style?.[`padding${side}`] || '0')}
                    onChange={(e) => handleStyleChange(`padding${side}`, `${e.target.value}px`)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="p-4 space-y-4">
            {(component.type === 'text' || component.type === 'button') && (
              <div className="space-y-2">
                <Label htmlFor="content">Text Content</Label>
                <Input
                  id="content"
                  value={component.props.children || ''}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Enter text content..."
                />
              </div>
            )}
            {component.type === 'input' && (
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  value={component.props.placeholder || ''}
                  onChange={(e) => handleStyleChange('placeholder', e.target.value)}
                  placeholder="Enter placeholder text..."
                />
              </div>
            )}
            {component.type === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="src">Image Source</Label>
                <Input
                  id="src"
                  value={component.props.src || ''}
                  onChange={(e) => handleStyleChange('src', e.target.value)}
                  placeholder="Enter image URL..."
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};

export default PropertiesPanel;
