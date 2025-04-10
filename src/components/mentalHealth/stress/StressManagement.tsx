import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Coffee, Lotus, Sun, Battery } from 'lucide-react';

export default function StressManagement() {
  const [stressLevel, setStressLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(0);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Stress Management</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stress Monitoring Card */}
        <Card>
          <CardHeader>
            <CardTitle>Stress Monitor</CardTitle>
            <CardDescription>Track your stress and energy levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Stress Level</span>
                  <span>{stressLevel}%</span>
                </div>
                <Progress value={stressLevel} />
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[0, 25, 50, 75, 100].map((level) => (
                    <Button
                      key={level}
                      variant={stressLevel === level ? "default" : "outline"}
                      onClick={() => setStressLevel(level)}
                      className="w-full"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Energy Level</span>
                  <span>{energyLevel}%</span>
                </div>
                <Progress value={energyLevel} />
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[0, 25, 50, 75, 100].map((level) => (
                    <Button
                      key={level}
                      variant={energyLevel === level ? "default" : "outline"}
                      onClick={() => setEnergyLevel(level)}
                      className="w-full"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Relief Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Relief</CardTitle>
            <CardDescription>Instant stress relief techniques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Lotus className="h-6 w-6" />
                <span>Meditation</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Activity className="h-6 w-6" />
                <span>Exercise</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Coffee className="h-6 w-6" />
                <span>Break Time</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Sun className="h-6 w-6" />
                <span>Nature Walk</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <div className="mt-6">
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily Plan</TabsTrigger>
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Daily Stress Management</CardTitle>
                <CardDescription>Your personalized stress management plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {/* Add daily plan content here */}
                    <p className="text-muted-foreground">Coming soon: Personalized daily stress management plans.</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="techniques">
            <Card>
              <CardHeader>
                <CardTitle>Stress Relief Techniques</CardTitle>
                <CardDescription>Evidence-based methods for stress management</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {/* Add techniques content here */}
                    <p className="text-muted-foreground">Coming soon: Library of stress relief techniques and exercises.</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Stress Insights</CardTitle>
                <CardDescription>Understand your stress patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {/* Add insights content here */}
                    <p className="text-muted-foreground">Coming soon: Data-driven insights about your stress patterns.</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
