import React, { useState } from 'react';
import { Todo as TodoComponent } from '@/components/Todo';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, LayoutGrid, Battery, MapPin } from 'lucide-react';

const Todo: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'matrix' | 'energy' | 'context'>('list');
  
  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Task Management | Easier Focus</title>
        <meta name="description" content="Manage your tasks with ADHD-friendly tools designed for better focus and productivity" />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground mt-2">
          Organize your tasks with our ADHD-friendly task management system
        </p>
      </div>
      
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="list">
            <ListChecks className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="matrix">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Priority Matrix
          </TabsTrigger>
          <TabsTrigger value="energy">
            <Battery className="h-4 w-4 mr-2" />
            Energy View
          </TabsTrigger>
          <TabsTrigger value="context">
            <MapPin className="h-4 w-4 mr-2" />
            Context View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <TodoComponent 
                showHeader={false}
                title="Tasks"
                description="Organize your tasks and to-dos"
                adhd={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="matrix" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <TodoComponent 
                showHeader={false}
                title="Priority Matrix"
                description="Organize tasks by urgency and importance"
                adhd={true}
                showPriorityMatrix={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="energy" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <TodoComponent 
                showHeader={false}
                title="Energy-Based Tasks"
                description="Organize tasks by energy level required"
                adhd={true}
                energyView={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="context" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <TodoComponent 
                showHeader={false}
                title="Context-Based Tasks"
                description="Organize tasks by location or context"
                adhd={true}
                contextView={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Todo; 