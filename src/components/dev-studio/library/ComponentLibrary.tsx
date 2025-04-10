import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

// Import our actual components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { EnergyChart } from '@/components/charts/EnergyChart';
import { SleepQualityCard } from '@/components/cards/SleepQualityCard';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { ExerciseTracker } from '@/components/exercise/ExerciseTracker';

// Define component categories
const componentCategories = [
  {
    name: 'Core UI',
    components: [
      { name: 'Button', component: Button },
      { name: 'Card', component: Card },
      { name: 'Input', component: Input },
      { name: 'Tabs', component: Tabs },
      { name: 'Calendar', component: Calendar },
      { name: 'Progress', component: Progress },
    ]
  },
  {
    name: 'Charts & Analytics',
    components: [
      { name: 'EnergyChart', component: EnergyChart },
    ]
  },
  {
    name: 'Feature Components',
    components: [
      { name: 'SleepQualityCard', component: SleepQualityCard },
      { name: 'FocusTimer', component: FocusTimer },
      { name: 'ExerciseTracker', component: ExerciseTracker },
    ]
  }
];

interface DraggableComponentProps {
  name: string;
  component: React.ComponentType<any>;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ name, component: Component }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `component-${name}`,
    data: {
      type: 'component',
      name,
      component: Component
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'p-2 mb-2 rounded-md border border-border cursor-move',
        'hover:bg-accent hover:text-accent-foreground',
        isDragging && 'opacity-50 border-primary'
      )}
    >
      <div className="text-sm font-medium">{name}</div>
      <div className="text-xs text-muted-foreground mt-1">Drag to canvas</div>
    </div>
  );
};

export const ComponentLibrary: React.FC = () => {
  return (
    <div className="h-1/2 p-4">
      <h2 className="text-lg font-semibold mb-4">Components</h2>
      
      <ScrollArea className="h-[calc(100%-2rem)]">
        <Accordion type="multiple" className="w-full">
          {componentCategories.map((category) => (
            <AccordionItem key={category.name} value={category.name}>
              <AccordionTrigger className="text-sm">
                {category.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-2">
                  {category.components.map((comp) => (
                    <DraggableComponent
                      key={comp.name}
                      name={comp.name}
                      component={comp.component}
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
