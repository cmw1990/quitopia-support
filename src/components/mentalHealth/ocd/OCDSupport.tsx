import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, CheckCircle, ListChecks, Shield } from 'lucide-react';

export default function OCDSupport() {
  const [obsessionLevel, setObsessionLevel] = useState(0);
  const [compulsionLevel, setCompulsionLevel] = useState(0);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">OCD Support</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Symptom Tracking Card */}
        <Card>
          <CardHeader>
            <CardTitle>Symptom Tracking</CardTitle>
            <CardDescription>Monitor your OCD symptoms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Obsession Intensity</span>
                  <span>{obsessionLevel}%</span>
                </div>
                <Progress value={obsessionLevel} />
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[0, 25, 50, 75, 100].map((level) => (
                    <Button
                      key={level}
                      variant={obsessionLevel === level ? "default" : "outline"}
                      onClick={() => setObsessionLevel(level)}
                      className="w-full"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Compulsion Frequency</span>
                  <span>{compulsionLevel}%</span>
                </div>
                <Progress value={compulsionLevel} />
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[0, 25, 50, 75, 100].map((level) => (
                    <Button
                      key={level}
                      variant={compulsionLevel === level ? "default" : "outline"}
                      onClick={() => setCompulsionLevel(level)}
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

        {/* Coping Tools Card */}
        <Card>
          <CardHeader>
            <CardTitle>Coping Tools</CardTitle>
            <CardDescription>Evidence-based OCD management techniques</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Brain className="h-6 w-6" />
                <span>ERP Exercises</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Shield className="h-6 w-6" />
                <span>Safety Scripts</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <ListChecks className="h-6 w-6" />
                <span>Habit Tracker</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <CheckCircle className="h-6 w-6" />
                <span>Success Log</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Resources */}
      <div className="mt-6">
        <Tabs defaultValue="techniques">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          <TabsContent value="techniques">
            <Card>
              <CardHeader>
                <CardTitle>OCD Management Techniques</CardTitle>
                <CardDescription>Evidence-based strategies for managing OCD</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {/* Add techniques here */}
                    <p className="text-muted-foreground">Coming soon: Detailed OCD management techniques and exercises.</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <CardTitle>Educational Resources</CardTitle>
                <CardDescription>Learn more about OCD and its management</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {/* Add educational content here */}
                    <p className="text-muted-foreground">Coming soon: Educational resources and articles about OCD.</p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="community">
            <Card>
              <CardHeader>
                <CardTitle>Community Support</CardTitle>
                <CardDescription>Connect with others on similar journeys</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {/* Add community features here */}
                    <p className="text-muted-foreground">Coming soon: Community support features and resources.</p>
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
