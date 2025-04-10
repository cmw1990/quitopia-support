
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Activity, Lightbulb, Calendar } from 'lucide-react';
import { DistractionAnalytics, DigitalMinimalism, EnvironmentOptimizer, BlockingScheduler } from '@/components/focus/distraction';
import { toast } from '@/hooks/use-toast';

export default function DistractionBlockerPage() {
  const [isBlockingEnabled, setIsBlockingEnabled] = useState(false);
  
  const handleToggleBlocking = () => {
    const newState = !isBlockingEnabled;
    setIsBlockingEnabled(newState);
    
    toast({
      title: newState ? "Distraction Blocking Enabled" : "Distraction Blocking Disabled",
      description: newState 
        ? "You're now protected from distracting websites" 
        : "Distraction blocking has been turned off",
      variant: newState ? "success" : "default",
    });
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Distraction Blocker</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="blocking-toggle" className="cursor-pointer select-none">
            {isBlockingEnabled ? 'Blocking Active' : 'Blocking Disabled'}
          </Label>
          <Switch
            id="blocking-toggle"
            checked={isBlockingEnabled}
            onCheckedChange={handleToggleBlocking}
          />
        </div>
      </div>
      
      <Tabs defaultValue="scheduler" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Scheduler</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="environment" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden md:inline">Environment</span>
          </TabsTrigger>
          <TabsTrigger value="digital-minimalism" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Digital Minimalism</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="scheduler">
          <BlockingScheduler />
        </TabsContent>
        
        <TabsContent value="analytics">
          <DistractionAnalytics />
        </TabsContent>
        
        <TabsContent value="environment">
          <EnvironmentOptimizer />
        </TabsContent>
        
        <TabsContent value="digital-minimalism">
          <DigitalMinimalism />
        </TabsContent>
      </Tabs>
    </div>
  );
}
