import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addMinutes, differenceInSeconds } from 'date-fns';
import { Link } from 'react-router-dom';
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  CircleSlash,
  X,
  Clock,
  ShieldAlert,
  Globe,
  Smartphone,
  Bell,
  Plus,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  ChevronDown,
  Lock,
  Unlock,
  Timer,
  ChevronsDown,
  Gauge,
  Shield,
  ShieldCheck,
  ShieldX,
  Hourglass,
  Settings,
  Info,
  RefreshCw,
  BarChart,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  BarChart as ReBarChart,
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

// Mock data for blocked sites and statistics
const mockBlockedWebsites = [
  { id: '1', url: 'facebook.com', category: 'social', blockCount: 34, lastAttempt: new Date(Date.now() - 3600000) },
  { id: '2', url: 'twitter.com', category: 'social', blockCount: 28, lastAttempt: new Date(Date.now() - 7200000) },
  { id: '3', url: 'instagram.com', category: 'social', blockCount: 42, lastAttempt: new Date(Date.now() - 86400000) },
  { id: '4', url: 'youtube.com', category: 'entertainment', blockCount: 56, lastAttempt: new Date(Date.now() - 43200000) },
  { id: '5', url: 'reddit.com', category: 'social', blockCount: 47, lastAttempt: new Date(Date.now() - 14400000) },
  { id: '6', url: 'netflix.com', category: 'entertainment', blockCount: 18, lastAttempt: new Date(Date.now() - 259200000) },
];

const mockBlockedApps = [
  { id: '1', name: 'TikTok', category: 'social', blockCount: 39, lastAttempt: new Date(Date.now() - 5400000) },
  { id: '2', name: 'Messages', category: 'communication', blockCount: 76, lastAttempt: new Date(Date.now() - 1800000) },
  { id: '3', name: 'Gmail', category: 'communication', blockCount: 21, lastAttempt: new Date(Date.now() - 28800000) },
];

const mockRecentAttempts = [
  { id: '1', target: 'facebook.com', timestamp: new Date(Date.now() - 1200000), type: 'website' },
  { id: '2', target: 'Messages', timestamp: new Date(Date.now() - 1800000), type: 'app' },
  { id: '3', target: 'twitter.com', timestamp: new Date(Date.now() - 3600000), type: 'website' },
  { id: '4', target: 'TikTok', timestamp: new Date(Date.now() - 5400000), type: 'app' },
  { id: '5', target: 'reddit.com', timestamp: new Date(Date.now() - 7200000), type: 'website' },
];

const mockBlockingSchedule = [
  { id: '1', name: 'Morning Focus', startTime: '08:00', endTime: '10:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], active: true },
  { id: '2', name: 'Deep Work', startTime: '14:00', endTime: '16:00', days: ['Mon', 'Wed', 'Fri'], active: true },
  { id: '3', name: 'Evening Study', startTime: '19:00', endTime: '21:00', days: ['Mon', 'Tue', 'Thu'], active: false },
];

// Mock stats data
const mockWeeklyStats = [
  { name: 'Mon', blocks: 24 },
  { name: 'Tue', blocks: 19 },
  { name: 'Wed', blocks: 31 },
  { name: 'Thu', blocks: 28 },
  { name: 'Fri', blocks: 47 },
  { name: 'Sat', blocks: 15 },
  { name: 'Sun', blocks: 8 },
];

const mockCategoryData = [
  { name: 'Social', value: 151 },
  { name: 'Entertainment', value: 74 },
  { name: 'Communication', value: 97 },
  { name: 'News', value: 42 },
  { name: 'Shopping', value: 31 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Utility function to format time
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  
  parts.push(`${remainingSeconds}s`);
  
  return parts.join(' ');
};

const DistractionBlocker = () => {
  const [activeTab, setActiveTab] = useState('block');
  const [blockedWebsites, setBlockedWebsites] = useState(mockBlockedWebsites);
  const [blockedApps, setBlockedApps] = useState(mockBlockedApps);
  const [recentAttempts, setRecentAttempts] = useState(mockRecentAttempts);
  const [newSite, setNewSite] = useState('');
  const [isBlockingActive, setIsBlockingActive] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [focusTimerActive, setFocusTimerActive] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25 * 60); // 25 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [blockSchedules, setBlockSchedules] = useState(mockBlockingSchedule);
  const { toast } = useToast();
  
  // Focus timer countdown effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (focusTimerActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && focusTimerActive) {
      toast({
        title: "Focus time completed!",
        description: "Great job staying focused. Take a short break.",
      });
      setFocusTimerActive(false);
      setTimeRemaining(focusDuration);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTimerActive, timeRemaining, focusDuration, toast]);
  
  const handleToggleBlocking = () => {
    if (!isBlockingActive) {
      toast({
        title: "Distraction blocking activated",
        description: "We're now blocking distracting sites and apps based on your settings.",
      });
    } else {
      toast({
        title: "Distraction blocking deactivated",
        description: "Blocking has been turned off.",
      });
    }
    
    setIsBlockingActive(!isBlockingActive);
  };
  
  const handleAddWebsite = () => {
    if (!newSite) {
      toast({
        title: "Please enter a website",
        description: "You need to enter a URL to block.",
        variant: "destructive",
      });
      return;
    }
    
    // Simple URL validation
    const urlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
    if (!urlPattern.test(newSite)) {
      toast({
        title: "Invalid URL format",
        description: "Please enter a valid domain (e.g., example.com).",
        variant: "destructive",
      });
      return;
    }
    
    const newWebsite = {
      id: Date.now().toString(),
      url: newSite,
      category: 'uncategorized',
      blockCount: 0,
      lastAttempt: null,
    };
    
    setBlockedWebsites(prev => [newWebsite, ...prev]);
    setNewSite('');
    
    toast({
      title: "Website added to blocklist",
      description: `${newSite} will now be blocked during your focus sessions.`,
    });
    
    // Show signup prompt
    setShowSignupPrompt(true);
  };
  
  const removeWebsite = (id: string) => {
    setBlockedWebsites(prev => prev.filter(site => site.id !== id));
    
    toast({
      title: "Website removed from blocklist",
    });
  };
  
  const toggleFocusTimer = () => {
    if (!focusTimerActive) {
      toast({
        title: "Focus timer started",
        description: `Blocking enabled for ${formatTime(focusDuration)}. Stay focused!`,
      });
      setIsBlockingActive(true);
    } else {
      toast({
        title: "Focus timer paused",
        description: "You can resume anytime.",
      });
    }
    
    setFocusTimerActive(!focusTimerActive);
  };
  
  const handleFocusDurationChange = (value: number[]) => {
    const newDuration = value[0] * 60; // Convert minutes to seconds
    setFocusDuration(newDuration);
    setTimeRemaining(newDuration);
  };
  
  const toggleScheduleActive = (id: string) => {
    setBlockSchedules(prev => 
      prev.map(schedule => 
        schedule.id === id 
          ? { ...schedule, active: !schedule.active } 
          : schedule
      )
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Distraction Blocker</h1>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${isBlockingActive ? 'text-green-500' : 'text-muted-foreground'}`}>
              {isBlockingActive ? 'Blocking Active' : 'Blocking Inactive'}
            </span>
            <Switch 
              checked={isBlockingActive} 
              onCheckedChange={handleToggleBlocking} 
              className={isBlockingActive ? 'bg-green-500' : ''} 
            />
          </div>
        </div>
        <p className="text-muted-foreground">
          Block distracting websites and apps to stay focused on what matters.
        </p>
      </div>

      {/* Focus Timer Display */}
      {focusTimerActive && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center space-x-3">
            <Hourglass className="h-6 w-6 text-primary animate-pulse flex-shrink-0" />
            <div>
              <p className="font-medium">Focus Session Active</p>
              <p className="text-sm text-muted-foreground">Distractions blocked for {formatTime(timeRemaining)}</p>
            </div>
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <Button variant="outline" onClick={toggleFocusTimer}>
              <PauseCircle className="h-4 w-4 mr-2" /> Pause
            </Button>
          </div>
        </motion.div>
      )}
      
      {showSignupPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 rounded-lg p-4 border border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex items-center space-x-3">
            <Info className="h-6 w-6 text-primary flex-shrink-0" />
            <p className="font-medium">Create an account to sync your blocklist across devices and access advanced features.</p>
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
          <TabsTrigger value="block">Block Sites & Apps</TabsTrigger>
          <TabsTrigger value="schedule">Schedules</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        {/* Block Sites & Apps Tab */}
        <TabsContent value="block" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Focus Timer</CardTitle>
              <CardDescription>
                Set a time period for focused work with distractions blocked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Focus Duration: {Math.floor(focusDuration / 60)} minutes</Label>
                </div>
                <Slider
                  value={[focusDuration / 60]}
                  min={5}
                  max={120}
                  step={5}
                  onValueChange={handleFocusDurationChange}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 mins</span>
                  <span>1 hour</span>
                  <span>2 hours</span>
                </div>
              </div>
              
              <Button className="w-full" onClick={toggleFocusTimer}>
                {focusTimerActive ? (
                  <>
                    <PauseCircle className="h-4 w-4 mr-2" /> Pause Focus Session
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" /> Start Focus Session
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Blocked Websites</CardTitle>
              <CardDescription>
                Websites that will be blocked during your focus time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter website to block (e.g., facebook.com)"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                />
                <Button onClick={handleAddWebsite}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
              
              <div className="space-y-2 mt-4">
                {blockedWebsites.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No websites added to the blocklist yet. Add your first one above.
                  </p>
                ) : (
                  blockedWebsites.map((site) => (
                    <div key={site.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{site.url}</p>
                          <p className="text-xs text-muted-foreground">
                            {site.blockCount > 0 ? `Blocked ${site.blockCount} times` : 'Not blocked yet'}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeWebsite(site.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Blocked Applications</CardTitle>
              <CardDescription>
                Applications that will be blocked during your focus time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button className="w-full" asChild>
                  <Link to="/register">
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Apps (Premium Feature)
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-2 mt-4">
                {blockedApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {app.blockCount > 0 ? `Blocked ${app.blockCount} times` : 'Not blocked yet'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Premium</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {recentAttempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Distraction Attempts</CardTitle>
                <CardDescription>
                  Sites and apps recently blocked during your focus sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAttempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-md">
                      <div className="flex items-center space-x-3">
                        {attempt.type === 'website' ? (
                          <Globe className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Smartphone className="h-4 w-4 text-amber-500" />
                        )}
                        <div>
                          <p className="font-medium">{attempt.target}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(attempt.timestamp, 'h:mm a')} ({formatTime(differenceInSeconds(new Date(), attempt.timestamp))} ago)
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Blocked</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Schedules Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blocking Schedules</CardTitle>
              <CardDescription>
                Set up recurring times when distractions will be automatically blocked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button className="w-full mb-4" asChild>
                  <Link to="/register">
                    <PlusCircle className="h-4 w-4 mr-2" /> Create New Schedule (Premium Feature)
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-3">
                {blockSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="space-y-1">
                      <h4 className="font-medium">{schedule.name}</h4>
                      <div className="flex text-sm text-muted-foreground space-x-2">
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                        <span>•</span>
                        <span>{schedule.days.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={schedule.active ? "default" : "outline"}>
                        {schedule.active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch 
                        checked={schedule.active} 
                        onCheckedChange={() => toggleScheduleActive(schedule.id)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Time Limits</CardTitle>
              <CardDescription>
                Set daily time limits for distracting websites and apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Set daily time limits for specific sites and apps. When you reach your limit, 
                  they'll be blocked for the rest of the day.
                </p>
                <Button asChild>
                  <Link to="/register">Upgrade to Premium</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blocking Activity</CardTitle>
              <CardDescription>
                How many distractions have been blocked over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={mockWeeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="blocks" fill="#8884d8" name="Blocks" />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blocked by Category</CardTitle>
                <CardDescription>
                  Types of distractions blocked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {mockCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Focus Achievements</CardTitle>
                <CardDescription>
                  Your distraction-blocking accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Block Master</h4>
                      <p className="text-sm text-muted-foreground">Blocked 500+ distractions</p>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Timer className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Focus Streak</h4>
                      <p className="text-sm text-muted-foreground">5 consecutive days using Focus Timer</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/register">View All Achievements</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Productivity Insights</CardTitle>
              <CardDescription>
                Premium insights and recommendations based on your blocking patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Unlock Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-4">
                  Get AI-powered insights about your distraction patterns, peak productivity times,
                  and personalized recommendations to improve your focus.
                </p>
                <Button asChild>
                  <Link to="/register">Upgrade to Premium</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to eliminate distractions for good?</h2>
        <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
          Upgrade to Premium to unlock cross-device blocking, app blocking, 
          advanced schedules, time limits, and powerful analytics.
        </p>
        <Button size="lg" asChild>
          <Link to="/register">Get Premium Access</Link>
        </Button>
      </div>
    </div>
  );
};

export default DistractionBlocker; 