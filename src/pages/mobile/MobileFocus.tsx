
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Settings, Zap, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { FocusMetrics } from '@/components/FocusMetrics';

const MobileFocus: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerType, setTimerType] = useState('pomodoro');
  const [showMetrics, setShowMetrics] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [focusLevel, setFocusLevel] = useState(5);

  const progress = (elapsedTime / time) * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handlePlayPause = () => {
    setIsRunning(!isRunning);
    if (!isRunning && elapsedTime === time) {
      // Reset if completed
      setElapsedTime(0);
    }
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
  };
  
  const handleComplete = () => {
    setIsRunning(false);
    setShowMetrics(true);
  };
  
  const handleSaveMetrics = () => {
    // Save metrics to the database
    setShowMetrics(false);
    setElapsedTime(0);
    // Would add API call here
  };
  
  const handleTimerTypeChange = (value: string) => {
    setTimerType(value);
    setIsRunning(false);
    setElapsedTime(0);
    
    switch (value) {
      case 'pomodoro':
        setTime(25 * 60);
        break;
      case 'short':
        setTime(5 * 60);
        break;
      case 'long':
        setTime(15 * 60);
        break;
      default:
        setTime(25 * 60);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Focus Timer</h1>
      
      <Tabs defaultValue="pomodoro" value={timerType} onValueChange={handleTimerTypeChange} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
          <TabsTrigger value="short">Short Break</TabsTrigger>
          <TabsTrigger value="long">Long Break</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card className="relative overflow-hidden">
        <CardContent className="pt-6 px-6 pb-8 flex flex-col items-center">
          <div className="mb-4 relative w-full max-w-[250px] aspect-square flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                className="text-primary transform -rotate-90 origin-center transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold font-mono">
                {formatTime(time - elapsedTime)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button
              variant="outline" 
              size="icon"
              onClick={handleReset}
              disabled={isRunning}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              size="lg"
              onClick={handlePlayPause}
              className="w-20 h-14 rounded-full"
            >
              {isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            
            <Button
              variant="outline" 
              size="icon"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
        
        <Progress value={progress} className="absolute bottom-0 left-0 right-0 h-1 rounded-none" />
      </Card>
      
      {showMetrics ? (
        <FocusMetrics
          energyLevel={energyLevel}
          focusLevel={focusLevel}
          onEnergyChange={setEnergyLevel}
          onFocusChange={setFocusLevel}
          onSave={handleSaveMetrics}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center"
          >
            <Zap className="h-5 w-5 mb-1" />
            <span>Energy Level</span>
          </Button>
          
          <Button
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center"
          >
            <Brain className="h-5 w-5 mb-1" />
            <span>ADHD Support</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileFocus;
