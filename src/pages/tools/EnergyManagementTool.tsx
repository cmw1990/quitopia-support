import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart, 
  Area
} from 'recharts';

import {
  Battery,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Clock,
  ArrowRight,
  Plus,
  Sun,
  Moon,
  Coffee,
  Apple,
  Moon as MoonIcon,
  Utensils,
  Dumbbell,
  Brain,
  Heart,
  Activity,
  Droplet,
  Timer,
  Info,
  AlertCircle
} from 'lucide-react';

const mockEnergyData = [
  { time: '08:00', level: 80, activity: 'Morning Routine', date: format(subDays(new Date(), 6), 'yyyy-MM-dd') },
  { time: '10:00', level: 90, activity: 'Deep Work', date: format(subDays(new Date(), 6), 'yyyy-MM-dd') },
  { time: '12:00', level: 70, activity: 'Lunch', date: format(subDays(new Date(), 6), 'yyyy-MM-dd') },
  { time: '14:00', level: 60, activity: 'Meetings', date: format(subDays(new Date(), 6), 'yyyy-MM-dd') },
  { time: '16:00', level: 40, activity: 'Email', date: format(subDays(new Date(), 6), 'yyyy-MM-dd') },
  { time: '18:00', level: 30, activity: 'Commute', date: format(subDays(new Date(), 6), 'yyyy-MM-dd') },
  
  { time: '08:00', level: 75, activity: 'Breakfast', date: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
  { time: '10:00', level: 85, activity: 'Work', date: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
  { time: '12:00', level: 65, activity: 'Lunch', date: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
  { time: '14:00', level: 55, activity: 'Meetings', date: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
  { time: '16:00', level: 45, activity: 'Work', date: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
  { time: '18:00', level: 35, activity: 'Gym', date: format(subDays(new Date(), 5), 'yyyy-MM-dd') },
  
  { time: '08:00', level: 85, activity: 'Exercise', date: format(subDays(new Date(), 4), 'yyyy-MM-dd') },
  { time: '10:00', level: 95, activity: 'Work', date: format(subDays(new Date(), 4), 'yyyy-MM-dd') },
  { time: '12:00', level: 80, activity: 'Lunch', date: format(subDays(new Date(), 4), 'yyyy-MM-dd') },
  { time: '14:00', level: 75, activity: 'Work', date: format(subDays(new Date(), 4), 'yyyy-MM-dd') },
  { time: '16:00', level: 60, activity: 'Meetings', date: format(subDays(new Date(), 4), 'yyyy-MM-dd') },
  { time: '18:00', level: 50, activity: 'Dinner', date: format(subDays(new Date(), 4), 'yyyy-MM-dd') },
  
  { time: '08:00', level: 70, activity: 'Breakfast', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  { time: '10:00', level: 80, activity: 'Work', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  { time: '12:00', level: 65, activity: 'Lunch', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  { time: '14:00', level: 55, activity: 'Meetings', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  { time: '16:00', level: 40, activity: 'Work', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  { time: '18:00', level: 30, activity: 'Commute', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  
  { time: '08:00', level: 90, activity: 'Exercise', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
  { time: '10:00', level: 95, activity: 'Work', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
  { time: '12:00', level: 85, activity: 'Lunch', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
  { time: '14:00', level: 75, activity: 'Meetings', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
  { time: '16:00', level: 60, activity: 'Work', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
  { time: '18:00', level: 50, activity: 'Dinner', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
  
  { time: '08:00', level: 75, activity: 'Breakfast', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  { time: '10:00', level: 85, activity: 'Work', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  { time: '12:00', level: 70, activity: 'Lunch', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  { time: '14:00', level: 60, activity: 'Meetings', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  { time: '16:00', level: 50, activity: 'Work', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  { time: '18:00', level: 40, activity: 'Gym', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
  
  { time: '08:00', level: 80, activity: 'Breakfast', date: format(new Date(), 'yyyy-MM-dd') },
  { time: '10:00', level: 90, activity: 'Work', date: format(new Date(), 'yyyy-MM-dd') },
  { time: '12:00', level: 75, activity: 'Lunch', date: format(new Date(), 'yyyy-MM-dd') },
  { time: '14:00', level: 65, activity: 'Meetings', date: format(new Date(), 'yyyy-MM-dd') },
  { time: '16:00', level: 50, activity: 'Work', date: format(new Date(), 'yyyy-MM-dd') },
  { time: '18:00', level: 40, activity: 'Commute', date: format(new Date(), 'yyyy-MM-dd') },
];

const energyFactors = [
  { id: 'sleep', name: 'Sleep Quality', icon: <MoonIcon className="h-5 w-5" /> },
  { id: 'nutrition', name: 'Nutrition', icon: <Apple className="h-5 w-5" /> },
  { id: 'exercise', name: 'Exercise', icon: <Dumbbell className="h-5 w-5" /> },
  { id: 'hydration', name: 'Hydration', icon: <Droplet className="h-5 w-5" /> },
  { id: 'stress', name: 'Stress Level', icon: <Brain className="h-5 w-5" /> },
  { id: 'caffeine', name: 'Caffeine Intake', icon: <Coffee className="h-5 w-5" /> },
  { id: 'meals', name: 'Meal Timing', icon: <Utensils className="h-5 w-5" /> },
  { id: 'screen', name: 'Screen Time', icon: <AlertCircle className="h-5 w-5" /> },
  { id: 'breaks', name: 'Break Frequency', icon: <Timer className="h-5 w-5" /> },
];

const EnergyBatteryIcon = ({ level }: { level: number }) => {
  if (level >= 75) {
    return <BatteryFull className="h-6 w-6 text-green-500" />;
  } else if (level >= 40) {
    return <BatteryMedium className="h-6 w-6 text-amber-500" />;
  } else {
    return <BatteryLow className="h-6 w-6 text-red-500" />;
  }
};

// Format mock data for charts
const formatChartData = (data: any[], date: string) => {
  return data
    .filter((entry) => entry.date === date)
    .map((entry) => ({
      ...entry,
      timestamp: entry.time,
    }));
};

// Get average energy level for a day
const getDayAverage = (data: any[], date: string) => {
  const dayData = data.filter((entry) => entry.date === date);
  if (dayData.length === 0) return 0;
  
  const sum = dayData.reduce((acc, entry) => acc + entry.level, 0);
  return Math.round(sum / dayData.length);
};

// Get unique dates from the data
const getUniqueDates = (data: any[]) => {
  const dates = [...new Set(data.map((entry) => entry.date))];
  return dates.sort(); // Sort chronologically
};

const EnergyManagementTool = () => {
  const [activeTab, setActiveTab] = useState('track');
  const [currentEnergyLevel, setCurrentEnergyLevel] = useState(75);
  const [currentActivity, setCurrentActivity] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [factorRatings, setFactorRatings] = useState<Record<string, number>>(
    energyFactors.reduce((acc, factor) => ({
      ...acc,
      [factor.id]: 5
    }), {})
  );
  const { toast } = useToast();
  
  const dates = getUniqueDates(mockEnergyData);
  const chartData = formatChartData(mockEnergyData, selectedDate);
  
  const submitEnergyEntry = () => {
    if (!currentActivity) {
      toast({
        title: "Missing information",
        description: "Please specify your current activity.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Energy level recorded!",
      description: "Create an account to track your energy patterns over time.",
    });
    
    // Reset form
    setCurrentActivity('');
    setCurrentNotes('');
    
    // Show signup prompt
    setShowSignupPrompt(true);
  };

  const handleFactorChange = (factorId: string, value: number[]) => {
    setFactorRatings(prev => ({
      ...prev,
      [factorId]: value[0]
    }));
  };
  
  const calculateEnergyCorrelations = () => {
    // In a real app, this would analyze actual data to find correlations
    // Here we just return sample insights
    return [
      { factor: "Sleep Quality", impact: "high", description: "You tend to have 30% more energy on days following 7+ hours of quality sleep." },
      { factor: "Exercise", impact: "medium", description: "Morning exercise appears to boost your energy levels for the following 4-5 hours." },
      { factor: "Caffeine", impact: "medium", description: "Your energy drops significantly 3-4 hours after caffeine consumption." },
      { factor: "Meal Timing", impact: "high", description: "Smaller, more frequent meals help you maintain steadier energy throughout the day." },
      { factor: "Hydration", impact: "medium", description: "Days with consistent water intake show fewer energy crashes." }
    ];
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Energy Management Tool</h1>
        <p className="text-muted-foreground">
          Track, analyze, and optimize your energy levels throughout the day.
        </p>
      </div>

      {showSignupPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center space-x-3">
            <Info className="h-6 w-6 text-primary flex-shrink-0" />
            <p className="font-medium">Create an account to track your energy patterns over time and receive personalized recommendations.</p>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setShowSignupPrompt(false)}>
              Later
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up Free</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="track">Track Energy</TabsTrigger>
          <TabsTrigger value="analyze">Analyze Patterns</TabsTrigger>
          <TabsTrigger value="insights">Get Insights</TabsTrigger>
        </TabsList>
        
        {/* Track Tab */}
        <TabsContent value="track" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>How's Your Energy Right Now?</CardTitle>
                <CardDescription>
                  Track your current energy level to identify patterns and optimize your daily routine.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Current Energy Level: {currentEnergyLevel}%</Label>
                    <EnergyBatteryIcon level={currentEnergyLevel} />
                  </div>
                  <Slider
                    value={[currentEnergyLevel]}
                    max={100}
                    step={5}
                    onValueChange={(value) => setCurrentEnergyLevel(value[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Low Energy</span>
                    <span>Medium Energy</span>
                    <span>High Energy</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="current-activity">What are you doing right now?</Label>
                  <Input
                    id="current-activity"
                    placeholder="Working, Meeting, Exercise, etc."
                    value={currentActivity}
                    onChange={(e) => setCurrentActivity(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any factors affecting your energy level?"
                    rows={3}
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={submitEnergyEntry} className="w-full">
                  Record Energy Level
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Energy Factors</CardTitle>
                <CardDescription>
                  Rate factors that may be influencing your energy today
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {energyFactors.slice(0, 5).map((factor) => (
                  <div key={factor.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        {factor.icon} {factor.name}
                      </Label>
                      <span className="text-sm font-medium">
                        {factorRatings[factor.id]}/10
                      </span>
                    </div>
                    <Slider
                      value={[factorRatings[factor.id]]}
                      max={10}
                      step={1}
                      onValueChange={(value) => handleFactorChange(factor.id, value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>More Factors</CardTitle>
                <CardDescription>
                  Additional elements that may impact your energy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {energyFactors.slice(5).map((factor) => (
                  <div key={factor.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        {factor.icon} {factor.name}
                      </Label>
                      <span className="text-sm font-medium">
                        {factorRatings[factor.id]}/10
                      </span>
                    </div>
                    <Slider
                      value={[factorRatings[factor.id]]}
                      max={10}
                      step={1}
                      onValueChange={(value) => handleFactorChange(factor.id, value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daily Energy Patterns</CardTitle>
                  <CardDescription>
                    View how your energy fluctuates throughout the day
                  </CardDescription>
                </div>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    {dates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {format(new Date(date), 'MMM d, yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background/95 border p-2 rounded-md shadow-md">
                              <p className="font-medium">{data.time}</p>
                              <p className="text-sm">Energy: {data.level}%</p>
                              <p className="text-sm text-muted-foreground">{data.activity}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="level" 
                      stroke="#6366f1" 
                      fillOpacity={1} 
                      fill="url(#colorEnergy)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold">Activities on {format(new Date(selectedDate), 'MMMM d')}</h3>
                <div className="space-y-2">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline">{entry.time}</Badge>
                      <span className="font-medium">{entry.activity}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            entry.level >= 75 ? 'bg-green-500' : 
                            entry.level >= 40 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${entry.level}%` }}
                        />
                      </div>
                      <span>{entry.level}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dates.map((date) => {
              const avgEnergy = getDayAverage(mockEnergyData, date);
              return (
                <Card key={date} className={`cursor-pointer transition-all ${selectedDate === date ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedDate(date)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{format(new Date(date), 'EEEE')}</CardTitle>
                    <CardDescription>{format(new Date(date), 'MMMM d, yyyy')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <EnergyBatteryIcon level={avgEnergy} />
                        <span className="font-medium">{avgEnergy}%</span>
                      </div>
                      <Badge variant={selectedDate === date ? 'default' : 'outline'}>
                        {avgEnergy >= 75 ? 'High' : avgEnergy >= 50 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center pt-4">
            <Button variant="outline" asChild>
              <Link to="/register">Sign Up for Full History & Advanced Analytics</Link>
            </Button>
          </div>
        </TabsContent>
        
        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Energy Insights</CardTitle>
              <CardDescription>
                Discover patterns and factors affecting your energy levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Peak Energy Times</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Morning</CardTitle>
                        <Sun className="h-5 w-5 text-amber-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center text-center space-y-1">
                        <span className="text-2xl font-bold">10:00 AM</span>
                        <Badge variant="secondary">Peak Productivity</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Afternoon</CardTitle>
                        <Sun className="h-5 w-5 text-orange-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center text-center space-y-1">
                        <span className="text-2xl font-bold">2:00 PM</span>
                        <Badge variant="secondary">Secondary Peak</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Low Point</CardTitle>
                        <Moon className="h-5 w-5 text-indigo-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center text-center space-y-1">
                        <span className="text-2xl font-bold">4:00 PM</span>
                        <Badge variant="secondary">Avoid Deep Work</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Energy Correlations</h3>
                <div className="space-y-2">
                  {calculateEnergyCorrelations().map((correlation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                      <Badge variant={
                        correlation.impact === 'high' ? 'default' : 
                        correlation.impact === 'medium' ? 'secondary' : 
                        'outline'
                      } className="mt-0.5">
                        {correlation.impact}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{correlation.factor}</h4>
                        <p className="text-sm text-muted-foreground">{correlation.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recommendations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Schedule Deep Work at 10 AM</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Your most cognitively demanding tasks should be scheduled when your energy peaks.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Coffee className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Limit Caffeine After 2 PM</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Late caffeine intake appears to disrupt sleep quality, affecting next-day energy.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Utensils className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Smaller, More Frequent Meals</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Your data shows fewer energy crashes when spacing smaller meals throughout the day.</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Brief Activity at 4 PM</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">A short walk or stretch break during your afternoon slump can boost energy.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button asChild>
                <Link to="/register">Sign Up for Personalized Energy Recommendations</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Want More Comprehensive Energy Management?</h2>
        <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
          Get access to detailed analytics, personalized recommendations, and integration with other focus tools.
        </p>
        <Button size="lg" asChild>
          <Link to="/register">Create Free Account</Link>
        </Button>
      </div>
    </div>
  );
};

export default EnergyManagementTool; 