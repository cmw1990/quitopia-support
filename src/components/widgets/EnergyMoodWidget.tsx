import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { useMoodEnergy } from '../../contexts/MoodEnergyContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowUp, ArrowDown, Minus, TrendingUp, MessageCircle, Zap, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EnergyMoodWidget() {
  const navigate = useNavigate();
  const { 
    moodHistory, 
    weeklyAverages, 
    getTrendDirection, 
    getCommonFactors,
    isLoading 
  } = useMoodEnergy();
  const [activeTab, setActiveTab] = useState<'overview' | 'mood' | 'energy' | 'focus'>('overview');

  // Function to get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  // Format chart data from mood history
  const chartData = moodHistory?.map(entry => ({
    date: format(new Date(entry.timestamp), 'MM/dd'),
    mood: entry.mood_score,
    energy: entry.energy_level,
    focus: entry.focus_level
  })) || [];

  // Get the most significant factor based on metric
  const getMostSignificantFactor = (metric: 'mood' | 'energy' | 'focus') => {
    const type = metric === 'mood' ? 'factors' : 
                  metric === 'energy' ? 'drains' : 'enhancers';
    
    const factors = getCommonFactors(type);
    return factors.length > 0 ? factors[0].name : null;
  };

  // Handle navigation to full tracker
  const navigateToFullTracker = () => {
    navigate('/energy-mood-tracker');
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Energy & Mood</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
            <div className="h-32 w-full bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Energy, Mood & Focus</CardTitle>
          <Button variant="ghost" size="sm" onClick={navigateToFullTracker}>
            Full Tracker
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-4 grid grid-cols-4 h-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> Mood
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-1">
              <Zap className="h-3 w-3" /> Energy
            </TabsTrigger>
            <TabsTrigger value="focus" className="flex items-center gap-1">
              <Brain className="h-3 w-3" /> Focus
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {moodHistory && moodHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <div className="text-xs text-purple-800 mb-1">Mood</div>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">{weeklyAverages.mood}</span>
                      <span className="text-xs text-gray-500 ml-1">/10</span>
                      <span className="ml-auto">
                        {getTrendIcon(getTrendDirection('mood'))}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <div className="text-xs text-green-800 mb-1">Energy</div>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">{weeklyAverages.energy}</span>
                      <span className="text-xs text-gray-500 ml-1">/10</span>
                      <span className="ml-auto">
                        {getTrendIcon(getTrendDirection('energy'))}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <div className="text-xs text-amber-800 mb-1">Focus</div>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">{weeklyAverages.focus}</span>
                      <span className="text-xs text-gray-500 ml-1">/10</span>
                      <span className="ml-auto">
                        {getTrendIcon(getTrendDirection('focus'))}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.slice().reverse()}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 0 }}
                        activeDot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 0 }}
                        activeDot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="focus" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        dot={{ r: 0 }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[180px] space-y-3">
                <TrendingUp className="h-10 w-10 text-gray-300" />
                <div className="text-sm text-gray-500 text-center">
                  No data yet. Start tracking your energy and mood.
                </div>
                <Button size="sm" onClick={navigateToFullTracker}>
                  Track Now
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mood">
            {moodHistory && moodHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Weekly Average</div>
                    <div className="text-2xl font-bold flex items-center">
                      {weeklyAverages.mood}/10
                      <span className="ml-2">{getTrendIcon(getTrendDirection('mood'))}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Top Factor</div>
                    <div className="text-sm font-medium">
                      {getMostSignificantFactor('mood') || 'None recorded'}
                    </div>
                  </div>
                </div>
                
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.slice().reverse()}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[180px] space-y-3">
                <MessageCircle className="h-10 w-10 text-gray-300" />
                <div className="text-sm text-gray-500 text-center">
                  No mood data recorded yet.
                </div>
                <Button size="sm" onClick={navigateToFullTracker}>
                  Track Mood
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="energy">
            {moodHistory && moodHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Weekly Average</div>
                    <div className="text-2xl font-bold flex items-center">
                      {weeklyAverages.energy}/10
                      <span className="ml-2">{getTrendIcon(getTrendDirection('energy'))}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Top Drain</div>
                    <div className="text-sm font-medium">
                      {getMostSignificantFactor('energy') || 'None recorded'}
                    </div>
                  </div>
                </div>
                
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.slice().reverse()}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[180px] space-y-3">
                <Zap className="h-10 w-10 text-gray-300" />
                <div className="text-sm text-gray-500 text-center">
                  No energy data recorded yet.
                </div>
                <Button size="sm" onClick={navigateToFullTracker}>
                  Track Energy
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="focus">
            {moodHistory && moodHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">Weekly Average</div>
                    <div className="text-2xl font-bold flex items-center">
                      {weeklyAverages.focus}/10
                      <span className="ml-2">{getTrendIcon(getTrendDirection('focus'))}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Top Enhancer</div>
                    <div className="text-sm font-medium">
                      {getMostSignificantFactor('focus') || 'None recorded'}
                    </div>
                  </div>
                </div>
                
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.slice().reverse()}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="focus" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[180px] space-y-3">
                <Brain className="h-10 w-10 text-gray-300" />
                <div className="text-sm text-gray-500 text-center">
                  No focus data recorded yet.
                </div>
                <Button size="sm" onClick={navigateToFullTracker}>
                  Track Focus
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 