import React, { useState, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { nanoid } from 'nanoid';
import * as Tabs from '@radix-ui/react-tabs';
import { WireframePage, WireframeComponent } from './types';
import { Canvas } from './components/Canvas';
import { ComponentPanel } from './components/ComponentPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { NavigatorPanel } from './components/NavigatorPanel';
import { CodePanel } from './components/CodePanel';
import { Toolbar } from './components/Toolbar';
import { useDevStudio } from './hooks/useDevStudio';
import { Button } from '@/components/ui/button';
import {
  Laptop,
  Smartphone,
  Tablet,
  Code2,
  Save,
  Play,
  FileCode,
  Settings,
  Layout,
  Eye
} from 'lucide-react';

const DevStudio = () => {
  const {
    pages,
    activePage,
    selectedComponent,
    viewport,
    setViewport,
    addComponent,
    updateComponent,
    deleteComponent,
    savePage,
    generateCode,
    previewPage,
  } = useDevStudio();

  const [activeTab, setActiveTab] = useState('components');
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((item: any, position: { x: number; y: number }) => {
    const id = nanoid();
    addComponent({
      id,
      type: item.type,
      name: item.name,
      props: {
        style: {
          position: 'absolute',
          left: position.x,
          top: position.y,
          ...item.defaultProps?.style
        },
        ...item.defaultProps
      }
    });
  }, [addComponent]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen w-full flex flex-col bg-background">
        {/* Toolbar */}
        <div className="h-12 border-b flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">DevStudio</h1>
            <div className="flex items-center space-x-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewport('desktop')}
                className={viewport === 'desktop' ? 'bg-accent' : ''}
              >
                <Laptop className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewport('tablet')}
                className={viewport === 'tablet' ? 'bg-accent' : ''}
              >
                <Tablet className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewport('mobile')}
                className={viewport === 'mobile' ? 'bg-accent' : ''}
              >
                <Smartphone className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={generateCode}>
              <Code2 className="size-4 mr-2" />
              Generate Code
            </Button>
            <Button variant="outline" size="sm" onClick={savePage}>
              <Save className="size-4 mr-2" />
              Save
            </Button>
            <Button variant="default" size="sm" onClick={previewPage}>
              <Play className="size-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Sidebar */}
          <div className="w-64 border-r bg-background">
            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
              <Tabs.List className="flex border-b">
                <Tabs.Trigger
                  value="components"
                  className="flex-1 px-4 py-2 text-sm hover:bg-accent"
                >
                  Components
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="navigator"
                  className="flex-1 px-4 py-2 text-sm hover:bg-accent"
                >
                  Navigator
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="components" className="p-4">
                <ComponentPanel onDrop={handleDrop} />
              </Tabs.Content>
              <Tabs.Content value="navigator" className="p-4">
                <NavigatorPanel
                  pages={pages}
                  activePage={activePage}
                  selectedComponent={selectedComponent}
                />
              </Tabs.Content>
            </Tabs.Root>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-accent/10 overflow-auto" ref={canvasRef}>
            <Canvas
              viewport={viewport}
              components={activePage?.components || []}
              selectedComponent={selectedComponent}
              onSelect={updateComponent}
              onDelete={deleteComponent}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l bg-background">
            <Tabs.Root defaultValue="properties">
              <Tabs.List className="flex border-b">
                <Tabs.Trigger
                  value="properties"
                  className="flex-1 px-4 py-2 text-sm hover:bg-accent"
                >
                  Properties
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="code"
                  className="flex-1 px-4 py-2 text-sm hover:bg-accent"
                >
                  Code
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="properties" className="p-4">
                <PropertiesPanel
                  component={selectedComponent}
                  onUpdate={updateComponent}
                />
              </Tabs.Content>
              <Tabs.Content value="code" className="p-4">
                <CodePanel
                  component={selectedComponent}
                  page={activePage}
                />
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default DevStudio;
