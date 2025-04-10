import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/AuthProvider";

// Types
interface DistractionPattern {
  id: string;
  type: string;
  url: string;
  timeSpent: number;
  visits: number;
  lastVisit: string;
  timeOfDay: string[];
}

interface TimeDistribution {
  hour: string;
  count: number;
}

interface DistractionPatternRecognitionProps {
  onPatternIdentified?: (patterns: DistractionPattern[]) => void;
}

export const DistractionPatternRecognition: React.FC<DistractionPatternRecognitionProps> = ({
  onPatternIdentified
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("patterns");
  const [recognizedPatterns, setRecognizedPatterns] = useState<DistractionPattern[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Generate sample data for visualization purposes
  useEffect(() => {
    // This would normally come from the user's browsing history through an API
    // For now we're using sample data for demonstration
    const samplePatterns: DistractionPattern[] = [
      {
        id: "1",
        type: "Social Media",
        url: "facebook.com",
        timeSpent: 127,
        visits: 42,
        lastVisit: "Today",
        timeOfDay: ["Morning", "Evening"]
      },
      {
        id: "2",
        type: "Video Streaming",
        url: "youtube.com",
        timeSpent: 210,
        visits: 28,
        lastVisit: "Today",
        timeOfDay: ["Afternoon", "Evening"]
      },
      {
        id: "3",
        type: "News",
        url: "cnn.com",
        timeSpent: 45,
        visits: 15,
        lastVisit: "Yesterday",
        timeOfDay: ["Morning"]
      },
      {
        id: "4",
        type: "Shopping",
        url: "amazon.com",
        timeSpent: 64,
        visits: 12,
        lastVisit: "Today",
        timeOfDay: ["Evening"]
      },
      {
        id: "5",
        type: "Social Media",
        url: "twitter.com",
        timeSpent: 92,
        visits: 31,
        lastVisit: "Today",
        timeOfDay: ["Morning", "Afternoon"]
      }
    ];
    
    // Generate time distribution data
    const timeData: TimeDistribution[] = Array.from({ length: 24 }, (_, i) => {
      // More visits during work hours and evenings
      let count = 0;
      
      // Early morning (low)
      if (i >= 0 && i < 6) {
        count = Math.floor(Math.random() * 5);
      }
      // Morning work hours (medium-high)
      else if (i >= 9 && i < 12) {
        count = Math.floor(Math.random() * 15) + 10;
      }
      // Lunch break (high)
      else if (i >= 12 && i < 14) {
        count = Math.floor(Math.random() * 20) + 15;
      }
      // Afternoon work hours (medium-high)
      else if (i >= 14 && i < 17) {
        count = Math.floor(Math.random() * 15) + 5;
      }
      // Evening leisure (highest)
      else if (i >= 19 && i < 23) {
        count = Math.floor(Math.random() * 25) + 15;
      }
      // Late night (low)
      else {
        count = Math.floor(Math.random() * 10);
      }
      
      return {
        hour: `${i}:00`,
        count
      };
    });
    
    setRecognizedPatterns(samplePatterns);
    setTimeDistribution(timeData);
    
    // If there's a callback, provide the recognized patterns
    if (onPatternIdentified) {
      onPatternIdentified(samplePatterns);
    }
  }, [onPatternIdentified]);
  
  // Function to analyze patterns (would normally connect to an API)
  const analyzePatterns = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false);
      // In a real app, this would update with fresh data
    }, 1500);
  };

  // Get color based on visit count
  const getBarColor = (count: number) => {
    if (count > 20) return "#ef4444"; // High - red
    if (count > 10) return "#f59e0b"; // Medium - amber
    return "#10b981"; // Low - green
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Distraction Pattern Recognition
        </CardTitle>
        <CardDescription>
          Analyze your browsing habits to identify distracting patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="patterns">Top Distractions</TabsTrigger>
            <TabsTrigger value="time">Time Analysis</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <div className="space-y-4">
              {recognizedPatterns.slice(0, 4).map((pattern) => (
                <div key={pattern.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <AlertCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{pattern.url}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{pattern.type}</span>
                        <span>•</span>
                        <span>{pattern.visits} visits</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{pattern.timeSpent} minutes</div>
                    <div className="text-xs text-muted-foreground">{pattern.lastVisit}</div>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 flex flex-wrap gap-2">
                <h4 className="text-sm font-medium w-full mb-1">Peak Distraction Times:</h4>
                <Badge variant="outline" className="bg-primary/5">
                  <Clock className="h-3 w-3 mr-1" /> Morning (9-11 AM)
                </Badge>
                <Badge variant="outline" className="bg-primary/5">
                  <Clock className="h-3 w-3 mr-1" /> After Lunch (1-3 PM)
                </Badge>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">
                  <Clock className="h-3 w-3 mr-1" /> Evening (7-10 PM)
                </Badge>
              </div>
              
              <Button 
                onClick={analyzePatterns}
                className="w-full mt-4"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing Patterns..." : "Analyze Recent Patterns"}
              </Button>
            </div>
          </TabsContent>
          
          {/* Time Analysis Tab */}
          <TabsContent value="time">
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <h3 className="text-sm font-medium mb-3">Distraction Activity by Hour</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 10 }}
                      interval={1}
                      tickFormatter={(value) => {
                        const hour = parseInt(value.split(':')[0]);
                        return hour % 3 === 0 ? `${hour}:00` : '';
                      }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value) => [`${value} visits`, 'Distractions']}
                      labelFormatter={(hour) => `Time: ${hour}`}
                    />
                    <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {timeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium">Key Insights:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    <span>Highest distraction periods are between 7-10 PM</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    <span>Moderate distractions occur during lunch (12-2 PM)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Deep work is most effective early morning (6-9 AM)</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Insights Tab */}
          <TabsContent value="insights">
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-primary/5">
                <h3 className="font-medium mb-2">Personalized Recommendations</h3>
                <ul className="text-sm space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full bg-primary/20 p-1">
                      <Clock className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <strong>Schedule focus blocks</strong> in the morning (6-9 AM) when distractions are minimal
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full bg-primary/20 p-1">
                      <AlertCircle className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <strong>Block social media sites</strong> during peak productivity hours (10 AM-2 PM)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full bg-primary/20 p-1">
                      <TrendingUp className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <strong>Set time limits</strong> for YouTube and Twitter, your highest time-consuming sites
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Distraction Triggers</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Stress/Anxiety</span>
                      <span className="text-xs">75%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Boredom</span>
                      <span className="text-xs">60%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Task Difficulty</span>
                      <span className="text-xs">45%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Social Notifications</span>
                      <span className="text-xs">40%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DistractionPatternRecognition;