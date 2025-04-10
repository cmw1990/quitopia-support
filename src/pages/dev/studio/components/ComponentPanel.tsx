import React from 'react';
import { useDrag } from 'react-dnd';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search } from 'lucide-react';

const componentLibrary = {
  'Basic Elements': [
    {
      type: 'text',
      name: 'Text',
      icon: '¶',
      defaultProps: {
        children: 'Text content',
        className: 'text-base'
      }
    },
    {
      type: 'button',
      name: 'Button',
      icon: '⚡',
      defaultProps: {
        children: 'Button',
        className: 'px-4 py-2 bg-primary text-white rounded-md'
      }
    },
    {
      type: 'input',
      name: 'Input',
      icon: '✏️',
      defaultProps: {
        type: 'text',
        placeholder: 'Enter text...',
        className: 'px-3 py-2 border rounded-md'
      }
    }
  ],
  'Layout': [
    {
      type: 'container',
      name: 'Container',
      icon: '□',
      defaultProps: {
        className: 'p-4 border rounded-md'
      }
    },
    {
      type: 'card',
      name: 'Card',
      icon: '▤',
      defaultProps: {
        className: 'p-6 bg-white shadow-md rounded-lg'
      }
    }
  ],
  'Media': [
    {
      type: 'image',
      name: 'Image',
      icon: '🖼️',
      defaultProps: {
        src: 'https://via.placeholder.com/150',
        alt: 'Placeholder image',
        className: 'rounded-md'
      }
    }
  ],
  'Custom Components': [
    {
      type: 'custom',
      name: 'TopNav',
      icon: '🎯',
      defaultProps: {
        className: ''
      },
      sourceCode: {
        component: '<TopNav />',
        imports: ["import { TopNav } from '@/components/layout/TopNav';"]
      }
    },
    {
      type: 'custom',
      name: 'ActivityTracker',
      icon: '📊',
      defaultProps: {
        className: ''
      },
      sourceCode: {
        component: '<ActivityTracker />',
        imports: ["import { ActivityTracker } from '@/components/health/ActivityTracker';"]
      }
    }
  ]
};

interface DraggableComponentProps {
  type: string;
  name: string;
  icon: string;
  defaultProps: Record<string, any>;
  sourceCode?: {
    component: string;
    imports: string[];
  };
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({
  type,
  name,
  icon,
  defaultProps,
  sourceCode
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type, name, defaultProps, sourceCode },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{name}</span>
    </div>
  );
};

export const ComponentPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLibrary = useMemo(() => {
    if (!searchQuery) return componentLibrary;

    const filtered: typeof componentLibrary = {};
    Object.entries(componentLibrary).forEach(([category, components]) => {
      const matchingComponents = components.filter(comp =>
        comp.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingComponents.length > 0) {
        filtered[category] = matchingComponents;
      }
    });
    return filtered;
  }, [searchQuery]);

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search components..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <Accordion type="multiple" className="w-full">
          {Object.entries(filteredLibrary).map(([category, components]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-sm">{category}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1">
                  {components.map((component) => (
                    <DraggableComponent
                      key={component.name}
                      {...component}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default ComponentPanel;
