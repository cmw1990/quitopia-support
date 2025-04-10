import React, { useState } from 'react';
import { 
  Brain, 
  ListChecks, 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause,
  ArrowRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const ExecutiveFunction: React.FC = () => {
  // Working Memory Support state
  const [memoryItems, setMemoryItems] = useState<string[]>([]);
  const [newMemoryItem, setNewMemoryItem] = useState<string>('');
  
  // Task Initiation state
  const [currentTask, setCurrentTask] = useState<string>('');
  const [taskSteps, setTaskSteps] = useState<{step: string; completed: boolean}[]>([]);
  const [newTaskStep, setNewTaskStep] = useState<string>('');
  const [countdownMinutes, setCountdownMinutes] = useState<number>(5);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300); // 5 minutes in seconds
  
  // Planning Support state
  const [goal, setGoal] = useState<string>('');
  const [obstacles, setObstacles] = useState<string>('');
  const [implementation, setImplementation] = useState<string>('');
  
  // Working Memory methods
  const addMemoryItem = () => {
    if (newMemoryItem.trim()) {
      setMemoryItems([...memoryItems, newMemoryItem.trim()]);
      setNewMemoryItem('');
    }
  };
  
  const removeMemoryItem = (index: number) => {
    const newItems = [...memoryItems];
    newItems.splice(index, 1);
    setMemoryItems(newItems);
  };
  
  // Task Initiation methods
  const addTaskStep = () => {
    if (newTaskStep.trim()) {
      setTaskSteps([...taskSteps, { step: newTaskStep.trim(), completed: false }]);
      setNewTaskStep('');
    }
  };
  
  const toggleStepCompletion = (index: number) => {
    const newSteps = [...taskSteps];
    newSteps[index].completed = !newSteps[index].completed;
    setTaskSteps(newSteps);
  };
  
  const startCountdown = () => {
    setRemainingSeconds(countdownMinutes * 60);
    setIsCountdownActive(true);
    
    // Start the countdown timer
    const intervalId = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setIsCountdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up the interval when component unmounts or when countdown is stopped
    return () => clearInterval(intervalId);
  };
  
  const pauseCountdown = () => {
    setIsCountdownActive(false);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Planning Support methods
  const handleClearPlan = () => {
    setGoal('');
    setObstacles('');
    setImplementation('');
  };
  
  const handleSavePlan = () => {
    // In a real app, this would save the plan to a database or local storage
    console.log('Saving plan:', { goal, obstacles, implementation });
    // Placeholder for saving functionality
    alert('Plan saved successfully!');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Executive Function Support</h1>
        <p className="text-muted-foreground">Tools to help with working memory, task initiation, and planning</p>
      </div>
      
      <Tabs defaultValue="working-memory">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="working-memory">
            <Brain className="h-4 w-4 mr-2" />
            Working Memory
          </TabsTrigger>
          <TabsTrigger value="task-initiation">
            <Play className="h-4 w-4 mr-2" />
            Task Initiation
          </TabsTrigger>
          <TabsTrigger value="planning">
            <ListChecks className="h-4 w-4 mr-2" />
            Planning
          </TabsTrigger>
        </TabsList>
        
        {/* Working Memory Tab */}
        <TabsContent value="working-memory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Working Memory Support
              </CardTitle>
              <CardDescription>
                A temporary space to store important information while you work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter something to remember..."
                  value={newMemoryItem}
                  onChange={(e) => setNewMemoryItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMemoryItem()}
                />
                <Button onClick={addMemoryItem}>Add</Button>
              </div>
              
              {memoryItems.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Your memory bank is empty</p>
                  <p className="text-sm">Add items to keep track of important information</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memoryItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-md border bg-card"
                    >
                      <span>{item}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMemoryItem(index)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Items will persist during your session but are not permanently saved
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Task Initiation Tab */}
        <TabsContent value="task-initiation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Task Initiation Support
              </CardTitle>
              <CardDescription>
                Break down tasks and use time-boxing to overcome startup resistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">What task are you working on?</label>
                <Input
                  placeholder="Enter your task..."
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Break it down into small steps:</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a small step..."
                    value={newTaskStep}
                    onChange={(e) => setNewTaskStep(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTaskStep()}
                  />
                  <Button onClick={addTaskStep}>Add</Button>
                </div>
                
                <div className="space-y-2 mt-4">
                  {taskSteps.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No steps added yet. Break your task into tiny, manageable pieces.
                    </p>
                  ) : (
                    taskSteps.map((step, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-md border ${
                          step.completed ? 'bg-primary/10 border-primary/20' : 'bg-card'
                        }`}
                      >
                        <span className={step.completed ? 'line-through text-muted-foreground' : ''}>
                          {index + 1}. {step.step}
                        </span>
                        <Button 
                          variant={step.completed ? "default" : "outline"} 
                          size="sm" 
                          onClick={() => toggleStepCompletion(index)}
                        >
                          {step.completed ? (
                            <><CheckCircle2 className="h-4 w-4 mr-1" /> Done</>
                          ) : (
                            <>Complete</>
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Time-boxing (minutes):</label>
                  <div className="flex gap-2 items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCountdownMinutes(Math.max(1, countdownMinutes - 1))}
                    >
                      -
                    </Button>
                    <span className="w-10 text-center">{countdownMinutes}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCountdownMinutes(countdownMinutes + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg">
                  <div className="text-center mb-2">
                    <span className="text-3xl font-mono">{formatTime(remainingSeconds)}</span>
                  </div>
                  <Progress value={(remainingSeconds / (countdownMinutes * 60)) * 100} className="h-2 mb-4" />
                  <div className="flex justify-center gap-2">
                    {isCountdownActive ? (
                      <Button 
                        variant="outline" 
                        onClick={pauseCountdown}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button 
                        onClick={startCountdown}
                        disabled={taskSteps.length === 0}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Just {countdownMinutes} Minutes
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Tip: Commit to working for just {countdownMinutes} minutes. Often, that's enough to overcome the initial resistance.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Planning Tab */}
        <TabsContent value="planning" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListChecks className="h-5 w-5 mr-2" />
                Implementation Intentions
              </CardTitle>
              <CardDescription>
                Create structured "if-then" plans to overcome obstacles and achieve your goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">I will achieve this goal:</label>
                <Textarea
                  placeholder="What specific goal do you want to accomplish?"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Potential obstacles:</label>
                <Textarea
                  placeholder="What might prevent you from reaching this goal?"
                  value={obstacles}
                  onChange={(e) => setObstacles(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Implementation plan (if-then):</label>
                <Textarea
                  placeholder="If [obstacle happens], then I will [specific action to take]"
                  value={implementation}
                  onChange={(e) => setImplementation(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mt-4">
                <h3 className="font-medium mb-2">Your Complete Plan:</h3>
                <div className="space-y-4">
                  <div className="flex gap-2 items-start">
                    <Badge className="mt-0.5">Goal</Badge>
                    <p>{goal || "Not specified yet"}</p>
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <Badge variant="outline" className="mt-0.5">If</Badge>
                    <p>{obstacles || "No obstacles identified yet"}</p>
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex gap-2 items-start">
                    <Badge variant="outline" className="mt-0.5">Then</Badge>
                    <p>{implementation || "No implementation plan specified yet"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClearPlan}>
                Clear
              </Button>
              <Button onClick={handleSavePlan} disabled={!goal || !obstacles || !implementation}>
                Save Plan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveFunction; 