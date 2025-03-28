import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "./card";
import { motion } from "framer-motion";

interface SmokeFreeCounterProps {
  quitDate: Date | null;
  className?: string;
}

interface TimeUnit {
  value: number;
  unit: string;
  label: string;
}

export const SmokeFreeCounter = ({ quitDate, className }: SmokeFreeCounterProps) => {
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([
    { value: 0, unit: "days", label: "Days" },
    { value: 0, unit: "hours", label: "Hours" },
    { value: 0, unit: "minutes", label: "Minutes" },
    { value: 0, unit: "seconds", label: "Seconds" }
  ]);

  useEffect(() => {
    if (!quitDate) return;

    const calculateTimeDifference = () => {
      const now = new Date();
      const timeDiff = now.getTime() - quitDate.getTime();
      
      // Convert to various time units
      const seconds = Math.floor(timeDiff / 1000) % 60;
      const minutes = Math.floor(timeDiff / (1000 * 60)) % 60;
      const hours = Math.floor(timeDiff / (1000 * 60 * 60)) % 24;
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      setTimeUnits([
        { value: days, unit: "days", label: "Days" },
        { value: hours, unit: "hours", label: "Hours" },
        { value: minutes, unit: "minutes", label: "Minutes" },
        { value: seconds, unit: "seconds", label: "Seconds" }
      ]);
    };

    calculateTimeDifference();
    const interval = setInterval(calculateTimeDifference, 1000);
    
    return () => clearInterval(interval);
  }, [quitDate]);

  const getMotivationalMessage = () => {
    const days = timeUnits[0].value;
    
    if (days === 0) return "Every minute counts!";
    if (days < 3) return "The first days are the hardest. You're doing great!";
    if (days < 7) return "Almost a week! Your body is healing.";
    if (days < 14) return "One week down! Cravings are getting weaker.";
    if (days < 30) return "Fantastic progress! Your lungs are recovering.";
    if (days < 90) return "Over a month smoke-free! You're a champion!";
    if (days < 180) return "Months of freedom! Your health is transforming.";
    if (days < 365) return "Incredible journey! You're inspiring others.";
    return "A year or more! You've reclaimed your health and life!";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-sm font-medium">Smoke-Free Time</h3>
          <p className="text-xs text-gray-500">{getMotivationalMessage()}</p>
        </div>
        
        <div className="flex justify-between mt-4">
          {timeUnits.map((unit, index) => (
            <div key={unit.unit} className="flex flex-col items-center">
              <motion.div 
                className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg w-16 h-16 flex items-center justify-center shadow-sm"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <motion.span 
                  key={`${unit.unit}-${unit.value}`}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-xl font-bold text-blue-700"
                >
                  {unit.value}
                </motion.span>
              </motion.div>
              <span className="text-xs text-gray-500 mt-1">{unit.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 