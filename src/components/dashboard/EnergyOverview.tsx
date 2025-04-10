import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Battery, BatteryCharging, Clock, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface EnergyData {
  currentEnergy: number;
  averageEnergy: number;
  fatigueScore: number;
  lastUpdated: string;
  todayEntries: number;
}

export function EnergyOverview() {
  const [data, setData] = useState<EnergyData>({
    currentEnergy: 0,
    averageEnergy: 0,
    fatigueScore: 0,
    lastUpdated: '',
    todayEntries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      setLoading(true);
      
      try {
        // Get energy entries
        const energyEntries = localStorage.getItem('energyEntries');
        const fatigueEntries = localStorage.getItem('fatigueEntries');
        
        const today = format(new Date(), 'yyyy-MM-dd');
        let currentEnergy = 0;
        let averageEnergy = 0;
        let fatigueScore = 0;
        let lastUpdated = '';
        let todayEntries = 0;
        
        if (energyEntries) {
          const entries = JSON.parse(energyEntries);
          const todayData = entries.filter((entry: any) => 
            entry.date.startsWith(today)
          );
          
          todayEntries = todayData.length;
          
          if (todayData.length > 0) {
            // Sort by time to get most recent
            todayData.sort((a: any, b: any) => 
              b.time.localeCompare(a.time)
            );
            
            // Get current energy (most recent)
            currentEnergy = todayData[0].level;
            lastUpdated = `${todayData[0].time}`;
            
            // Calculate average energy
            averageEnergy = todayData.reduce(
              (sum: number, entry: any) => sum + entry.level, 
              0
            ) / todayData.length;
          }
        }
        
        if (fatigueEntries) {
          const entries = JSON.parse(fatigueEntries);
          const todayData = entries.filter((entry: any) => 
            entry.date.startsWith(today)
          );
          
          if (todayData.length > 0) {
            // Sort by time to get most recent
            todayData.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            
            // Get most recent fatigue score
            const latestEntry = todayData[0];
            
            // Calculate average fatigue score
            const mentalScore = latestEntry.mental || 0;
            const physicalScore = latestEntry.physical || 0;
            const emotionalScore = latestEntry.emotional || 0;
            
            fatigueScore = (mentalScore + physicalScore + emotionalScore) / 3;
            
            // Update last updated if more recent
            if (!lastUpdated) {
              const entryDate = new Date(latestEntry.date);
              lastUpdated = format(entryDate, 'HH:mm');
            }
          }
        }
        
        setData({
          currentEnergy,
          averageEnergy,
          fatigueScore,
          lastUpdated,
          todayEntries
        });
      } catch (error) {
        console.error('Error loading energy data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Get energy level text and color
  const getEnergyLevel = (energy: number) => {
    if (energy <= 3) return { text: 'Low', color: 'text-red-500' };
    if (energy <= 6) return { text: 'Moderate', color: 'text-amber-500' };
    return { text: 'High', color: 'text-green-500' };
  };

  // Get fatigue level text and color
  const getFatigueLevel = (fatigue: number) => {
    if (fatigue >= 7) return { text: 'High', color: 'text-red-500' };
    if (fatigue >= 4) return { text: 'Moderate', color: 'text-amber-500' };
    return { text: 'Low', color: 'text-green-500' };
  };

  // Get recommendation based on energy and fatigue
  const getRecommendation = () => {
    const { currentEnergy, fatigueScore } = data;
    
    if (currentEnergy <= 3 && fatigueScore >= 7) {
      return "Take a longer break and consider some recovery activities";
    }
    
    if (currentEnergy <= 3) {
      return "Your energy is low. Consider a short break or a light snack";
    }
    
    if (fatigueScore >= 7) {
      return "You're experiencing fatigue. Schedule restorative activities";
    }
    
    if (currentEnergy >= 7 && fatigueScore <= 3) {
      return "Great energy levels! This is a good time for focused work";
    }
    
    return "Your energy levels are moderate. Monitor how you feel as you work";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <BatteryCharging className="h-4 w-4 mr-2 text-primary" />
          Energy & Fatigue Status
        </CardTitle>
        <CardDescription>
          {data.lastUpdated 
            ? `Last updated at ${data.lastUpdated}` 
            : "No data recorded today"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
          </div>
        ) : data.todayEntries > 0 || data.fatigueScore > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Energy</span>
                <span className={getEnergyLevel(data.currentEnergy).color}>
                  {getEnergyLevel(data.currentEnergy).text} ({Math.round(data.currentEnergy)}/10)
                </span>
              </div>
              <Progress 
                value={data.currentEnergy * 10} 
                className="h-2"
              />
            </div>
            
            {data.fatigueScore > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fatigue Level</span>
                  <span className={getFatigueLevel(data.fatigueScore).color}>
                    {getFatigueLevel(data.fatigueScore).text} ({Math.round(data.fatigueScore)}/10)
                  </span>
                </div>
                <Progress 
                  value={data.fatigueScore * 10} 
                  className="h-2" 
                />
              </div>
            )}
            
            <div className="text-sm mt-2 p-3 bg-muted/50 rounded-md">
              <p className="font-medium flex items-center mb-1">
                <Zap className="h-3.5 w-3.5 mr-1 text-amber-500" />
                Recommendation
              </p>
              <p className="text-muted-foreground">
                {getRecommendation()}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center">
            <Battery className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-sm font-medium mb-1">No energy data yet</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Log your energy levels to see insights
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/energy">
                Track Energy
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
      {(data.todayEntries > 0 || data.fatigueScore > 0) && (
        <CardFooter className="pt-2">
          <div className="flex justify-between w-full text-xs">
            <Button variant="link" size="sm" className="px-0 h-auto" asChild>
              <Link to="/energy" className="flex items-center text-primary">
                Energy Details
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
            <Button variant="link" size="sm" className="px-0 h-auto" asChild>
              <Link to="/anti-fatigue" className="flex items-center text-primary">
                Fatigue Tools
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 