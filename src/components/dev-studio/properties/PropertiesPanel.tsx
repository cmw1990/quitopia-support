import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const PropertiesPanel: React.FC = () => {
  return (
    <div className="h-1/2 p-4 border-b border-border">
      <h2 className="text-sm font-semibold mb-4">Properties</h2>
      
      <Tabs defaultValue="style">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100%-5rem)]">
          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <Input type="color" className="h-8" />
            </div>
            
            <div className="space-y-2">
              <Label>Border Style</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Input type="number" placeholder="16" />
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Width</Label>
                <Input type="text" placeholder="100%" />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input type="text" placeholder="auto" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Padding</Label>
                <Input type="text" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Margin</Label>
                <Input type="text" placeholder="0" />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <div className="space-y-2">
              <Label>Data Source</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4">
            <div className="space-y-2">
              <Label>onClick</Label>
              <Input type="text" placeholder="Enter function name" />
            </div>
            <div className="space-y-2">
              <Label>onHover</Label>
              <Input type="text" placeholder="Enter function name" />
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
