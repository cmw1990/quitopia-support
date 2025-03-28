import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Activity, 
  Users, 
  Coffee, 
  Utensils, 
  Phone, 
  MessageSquare, 
  Calculator,
  ChevronDown,
  ChevronUp,
  ArrowRight 
} from 'lucide-react';
import { Button } from './ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { getCravingEntries } from "../api/apiCompatibility";

// Types
interface TriggerAnalysisProps {
  session: Session | null;
}

interface CravingEntry {
  id: string;
  user_id: string;
  timestamp: string;
  intensity: number;
  trigger: string;
  location: string;
  duration: number;
  coping_strategy: string;
  success: boolean;
  notes: string;
}

interface TriggerCategory {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  strategies: string[];
}

interface TriggerPattern {
  type: 'time' | 'location' | 'social' | 'emotional';
  description: string;
  confidence: number;  // 0-100
  recommendation: string;
  timing?: string;     // For time-based patterns
  location?: string;   // For location-based patterns
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Trigger categories
const TRIGGER_CATEGORIES: TriggerCategory[] = [
  {
    id: 'stress',
    name: 'Stress',
    color: '#FF6B6B',
    icon: <Activity size={20} />,
    description: 'Cravings triggered by stressful situations, work pressure, or anxiety.',
    strategies: [
      'Practice deep breathing exercises',
      'Try progressive muscle relaxation',
      'Take a short walk',
      'Use stress-relief apps',
      'Write down your thoughts'
    ]
  },
  {
    id: 'social',
    name: 'Social Situations',
    color: '#4ECDC4',
    icon: <Users size={20} />,
    description: 'Cravings that occur during social gatherings, parties, or when with friends who smoke.',
    strategies: [
      'Communicate your quitting goals with friends',
      'Have a substitute (gum, toothpick) ready',
      'Step away briefly if urges are strong',
      'Practice saying "no thanks"',
      'Spend time with non-smoking friends'
    ]
  },
  {
    id: 'food',
    name: 'After Meals',
    color: '#FFD166',
    icon: <Utensils size={20} />,
    description: 'Cravings that appear after finishing a meal, often a strongly conditioned response.',
    strategies: [
      'Brush teeth immediately after eating',
      'Go for a walk after meals',
      'Drink water or herbal tea',
      'Keep your hands busy with another activity',
      'Chew sugar-free gum'
    ]
  },
  {
    id: 'coffee',
    name: 'With Caffeine',
    color: '#F78C6C',
    icon: <Coffee size={20} />,
    description: 'Cravings associated with coffee or caffeine consumption.',
    strategies: [
      'Consider reducing caffeine temporarily',
      'Switch to a different beverage',
      'Change your routine order',
      'Hold your cup in the hand you usually hold a cigarette',
      'Try drinking tea instead'
    ]
  },
  {
    id: 'boredom',
    name: 'Boredom',
    color: '#C5A3FF',
    icon: <Clock size={20} />,
    description: 'Cravings that arise during periods of inactivity or boredom.',
    strategies: [
      'Keep your hands busy with a fidget toy',
      'Start a new hobby',
      'Download games on your phone',
      'Exercise when bored',
      'Call a friend for a chat'
    ]
  },
  {
    id: 'emotional',
    name: 'Emotional Triggers',
    color: '#F8A5C2',
    icon: <AlertTriangle size={20} />,
    description: 'Cravings triggered by emotional states like anger, sadness, or even happiness.',
    strategies: [
      'Practice mindfulness meditation',
      'Journal about your emotions',
      'Use the RAIN technique (Recognize, Allow, Investigate, Non-identification)',
      'Talk to someone you trust',
      'Use mood-tracking apps'
    ]
  },
  {
    id: 'location',
    name: 'Specific Locations',
    color: '#50C4ED',
    icon: <MapPin size={20} />,
    description: 'Cravings that occur in specific places like your car, outside buildings, or certain rooms.',
    strategies: [
      'Rearrange furniture to break associations',
      'Clean your car thoroughly to remove smoke smell',
      'Find new routes or places to break habits',
      'Create no-smoking zones',
      'Associate locations with new healthy habits'
    ]
  },
  {
    id: 'communication',
    name: 'Phone/Text',
    color: '#96E6B3',
    icon: <Phone size={20} />,
    description: 'Cravings associated with talking on the phone or texting.',
    strategies: [
      'Hold something else during calls',
      'Take calls in places where you couldn\'t smoke before',
      'Use a headset to keep hands busy',
      'Stand or walk during calls',
      'Doodle or fidget during longer calls'
    ]
  }
];

// TriggerAnalysis Component
const TriggerAnalysis: React.FC<TriggerAnalysisProps> = ({ session }) => {
  const [cravingData, setCravingData] = useState<CravingEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90'>('30');
  const [triggerPatterns, setTriggerPatterns] = useState<TriggerPattern[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('insights');

  // Fetch craving data
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        const days = parseInt(timeframe);
        const endDate = format(new Date(), 'yyyy-MM-dd');
        const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
        
        const data = await getCravingEntries(
          session.user.id,
          startDate,
          endDate,
          session
        );
        
        setCravingData(data as unknown as CravingEntry[]);
        analyzePatterns(data as unknown as CravingEntry[]);
      } catch (err) {
        console.error('Error fetching craving data:', err);
        setError('Failed to load craving data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [session, timeframe]);

  // Analyze craving patterns
  const analyzePatterns = (data: CravingEntry[]) => {
    if (!data || data.length === 0) {
      setTriggerPatterns([]);
      return;
    }
    
    // Detected patterns
    const patterns: TriggerPattern[] = [];
    
    // Time pattern analysis
    const timeMap: Record<string, number> = {};
    data.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      timeMap[timeSlot] = (timeMap[timeSlot] || 0) + 1;
    });
    
    const maxTimeSlot = Object.entries(timeMap).reduce(
      (max, [slot, count]) => count > (max.count || 0) ? {slot, count} : max, 
      {slot: '', count: 0}
    );
    
    if (maxTimeSlot.count > data.length / 3) {
      const timeLabels = {
        'morning': '6am-12pm',
        'afternoon': '12pm-6pm',
        'evening': '6pm-12am'
      };
      patterns.push({
        type: 'time',
        confidence: Math.round((maxTimeSlot.count / data.length) * 100),
        description: `Regular cravings during the ${maxTimeSlot.slot}`,
        timing: timeLabels[maxTimeSlot.slot as keyof typeof timeLabels],
        recommendation: `Prepare alternative activities during ${maxTimeSlot.slot} hours`
      });
    }
    
    // Location pattern analysis
    const locationMap: Record<string, number> = {};
    data.forEach(entry => {
      if (entry.location) {
        locationMap[entry.location] = (locationMap[entry.location] || 0) + 1;
      }
    });
    
    const maxLocation = Object.entries(locationMap).reduce(
      (max, [loc, count]) => count > (max.count || 0) ? {loc, count} : max, 
      {loc: '', count: 0}
    );
    
    if (maxLocation.count > data.length / 4) {
      patterns.push({
        type: 'location',
        location: maxLocation.loc,
        confidence: Math.round((maxLocation.count / data.length) * 100),
        description: `Frequent cravings when at "${maxLocation.loc}"`,
        recommendation: `Create a new routine for when you're at ${maxLocation.loc}`
      });
    }
    
    // Trigger type analysis
    const triggerMap: Record<string, number> = {};
    data.forEach(entry => {
      if (entry.trigger) {
        triggerMap[entry.trigger] = (triggerMap[entry.trigger] || 0) + 1;
      }
    });
    
    const maxTrigger = Object.entries(triggerMap).reduce(
      (max, [trigger, count]) => count > (max.count || 0) ? {trigger, count} : max,
      {trigger: '', count: 0}
    );
    
    // Social pattern
    if (maxTrigger.trigger === 'social' && maxTrigger.count > data.length / 5) {
      patterns.push({
        type: 'social',
        confidence: Math.round((maxTrigger.count / data.length) * 100),
        description: 'Social situations are a major trigger',
        recommendation: 'Prepare specific strategies for social events'
      });
    }
    
    // Emotional pattern
    const emotionalTriggers = ['stress', 'anxiety', 'sadness', 'anger', 'boredom'];
    const emotionalCount = emotionalTriggers.reduce(
      (sum, trigger) => sum + (triggerMap[trigger] || 0), 0
    );
    
    if (emotionalCount > data.length / 4) {
      patterns.push({
        type: 'emotional',
        confidence: Math.round((emotionalCount / data.length) * 100),
        description: 'Emotional states frequently trigger cravings',
        recommendation: 'Work on emotional regulation techniques'
      });
    }
    
    setTriggerPatterns(patterns);
  };

  // Toggle expanded category
  const toggleCategory = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  // Calculate trigger distribution for chart
  const getTriggerDistribution = () => {
    if (!cravingData || cravingData.length === 0) return [];
    
    const distribution: Record<string, number> = {};
    
    cravingData.forEach(entry => {
      if (entry.trigger) {
        distribution[entry.trigger] = (distribution[entry.trigger] || 0) + 1;
      }
    });
    
    return Object.entries(distribution).map(([trigger, count]) => ({
      name: trigger,
      value: count,
      percent: Math.round((count / cravingData.length) * 100)
    }));
  };

  // Calculate success rate by trigger
  const getSuccessRateByTrigger = () => {
    if (!cravingData || cravingData.length === 0) return [];
    
    const triggerSuccess: Record<string, {total: number, success: number}> = {};
    
    cravingData.forEach(entry => {
      if (entry.trigger) {
        if (!triggerSuccess[entry.trigger]) {
          triggerSuccess[entry.trigger] = {total: 0, success: 0};
        }
        
        triggerSuccess[entry.trigger].total += 1;
        if (entry.success) {
          triggerSuccess[entry.trigger].success += 1;
        }
      }
    });
    
    return Object.entries(triggerSuccess)
      .filter(([_, data]) => data.total >= 3) // Only show triggers with enough data
      .map(([trigger, data]) => ({
        name: trigger,
        successRate: Math.round((data.success / data.total) * 100)
      }))
      .sort((a, b) => b.successRate - a.successRate);
  };

  // Calculate time of day distribution
  const getTimeOfDayDistribution = () => {
    if (!cravingData || cravingData.length === 0) return [];
    
    const hourCounts = Array(24).fill(0);
    
    cravingData.forEach(entry => {
      const hour = new Date(entry.timestamp).getHours();
      hourCounts[hour] += 1;
    });
    
    return hourCounts.map((count, hour) => ({
      hour: hour,
      count: count,
      label: `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}`
    }));
  };

  // Find relevant trigger category
  const findRelevantCategory = (trigger: string) => {
    // Map trigger values to categories
    const mapping: Record<string, string> = {
      'stress': 'stress',
      'anxiety': 'stress',
      'work pressure': 'stress',
      'social': 'social',
      'friends': 'social',
      'party': 'social',
      'after meal': 'food',
      'food': 'food',
      'dinner': 'food',
      'lunch': 'food',
      'coffee': 'coffee',
      'caffeine': 'coffee',
      'boredom': 'boredom',
      'waiting': 'boredom',
      'idle': 'boredom',
      'anger': 'emotional',
      'sadness': 'emotional',
      'happiness': 'emotional',
      'celebration': 'emotional',
      'car': 'location',
      'home': 'location',
      'outside': 'location',
      'phone': 'communication',
      'call': 'communication',
      'text': 'communication'
    };
    
    return TRIGGER_CATEGORIES.find(cat => cat.id === (mapping[trigger.toLowerCase()] || 'stress'));
  };

  if (loading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Craving Triggers Analysis</span>
            <Select
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as '7' | '30' | '90')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
          <CardDescription>
            {cravingData.length === 0 
              ? "No craving data available for the selected period. Start logging your cravings to see insights."
              : `Analysis based on ${cravingData.length} craving entries over the last ${timeframe} days.`}
          </CardDescription>
        </CardHeader>
        
        {cravingData.length > 0 && (
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insights">Key Insights</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="strategies">Coping Strategies</TabsTrigger>
              </TabsList>
              
              <TabsContent value="insights" className="mt-4">
                {triggerPatterns.length === 0 ? (
                  <div className="text-center py-6">
                    <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Not Enough Data</h3>
                    <p className="text-gray-500 mt-2">
                      Continue logging your cravings to reveal patterns and receive personalized insights.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Detected Patterns</h3>
                    
                    {triggerPatterns.map((pattern, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-start">
                          {pattern.type === 'time' && <Clock className="h-5 w-5 text-blue-500 mr-3 mt-1" />}
                          {pattern.type === 'location' && <MapPin className="h-5 w-5 text-green-500 mr-3 mt-1" />}
                          {pattern.type === 'social' && <Users className="h-5 w-5 text-purple-500 mr-3 mt-1" />}
                          {pattern.type === 'emotional' && <Activity className="h-5 w-5 text-red-500 mr-3 mt-1" />}
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{pattern.description}</h4>
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                {pattern.confidence}% confidence
                              </span>
                            </div>
                            
                            {pattern.timing && (
                              <p className="text-sm text-gray-500 mt-1">
                                Time: {pattern.timing}
                              </p>
                            )}
                            
                            {pattern.location && (
                              <p className="text-sm text-gray-500 mt-1">
                                Location: {pattern.location}
                              </p>
                            )}
                            
                            <div className="mt-3 flex items-center">
                              <ArrowRight className="h-4 w-4 text-indigo-500 mr-2" />
                              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                {pattern.recommendation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {cravingData.length < 10 && (
                      <div className="text-sm text-gray-500 mt-6 italic">
                        Continue logging cravings to improve pattern detection accuracy.
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="charts" className="mt-4">
                <div className="space-y-8">
                  {/* Trigger Distribution Chart */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Trigger Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getTriggerDistribution()}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({name, percent}) => `${name}: ${percent}%`}
                          >
                            {getTriggerDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} times`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Success Rate By Trigger */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Success Rate By Trigger</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getSuccessRateByTrigger()}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis label={{ value: 'Success %', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                          <Legend />
                          <Bar dataKey="successRate" name="Success Rate" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Time of Day Distribution */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Time of Day Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getTimeOfDayDistribution().filter(item => item.count > 0)}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Cravings" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="strategies" className="mt-4">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Effective Coping Strategies</h3>
                  
                  <div className="grid gap-4">
                    {TRIGGER_CATEGORIES.map((category) => (
                      <Card key={category.id} className="overflow-hidden">
                        <div
                          className="cursor-pointer"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: category.color + '33' }}
                              >
                                <div style={{ color: category.color }}>{category.icon}</div>
                              </div>
                              <h4 className="font-medium">{category.name}</h4>
                            </div>
                            {expandedCategory === category.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedCategory === category.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="p-4">
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                  {category.description}
                                </p>
                                <h5 className="font-medium mb-2">Recommended Strategies:</h5>
                                <ul className="space-y-2">
                                  {category.strategies.map((strategy, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 rounded-full text-xs mr-2 mt-0.5">
                                        {index + 1}
                                      </span>
                                      <span>{strategy}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
        
        {cravingData.length === 0 && (
          <CardContent>
            <div className="text-center py-10">
              <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Craving Data Available</h3>
              <p className="text-gray-500 mt-2 mb-6">
                Start logging your cravings to receive personalized insights and coping strategies.
              </p>
              <Button variant="outline">Go to Craving Logger</Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default TriggerAnalysis;
