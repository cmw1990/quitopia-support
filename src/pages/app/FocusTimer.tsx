
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const FocusTimer: React.FC = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTime(25 * 60);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-8">Focus Timer</h1>
      
      <div className="text-6xl font-mono mb-8">{formatTime(time)}</div>
      
      <div className="flex gap-4 justify-center">
        <Button onClick={toggleTimer} variant="default" size="lg">
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer} variant="outline" size="lg">
          Reset
        </Button>
      </div>
    </div>
  );
};

export default FocusTimer;
