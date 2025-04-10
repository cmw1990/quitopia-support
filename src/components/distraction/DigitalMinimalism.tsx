import React, { useState } from 'react';
import { 
  Smartphone, 
  Trash2, 
  CheckCircle2, 
  LayoutGrid, 
  Clock, 
  Settings, 
  Ban, 
  TimerReset,
  Trash,
  ListFilter,
  Clock4,
  Activity,
  BarChart4,
  Calendar,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

// Mock app data
interface AppItem {
  id: string;
  name: string;
  category: string;
  lastUsed: string;
  usageTime: number; // minutes per day
  notifications: number;
  isDistraction: boolean;
  timeLimits: boolean;
  installDate: string;
}

// Mock data for screen time analysis
interface UsageData {
  day: string;
  minutes: number;
  distractionMinutes: number;
}

const mockApps: AppItem[] = [
  {
    id: '1',
    name: 'Instagram',
    category: 'Social Media',
    lastUsed: '10 minutes ago',
    usageTime: 72,
    notifications: 38,
    isDistraction: true,
    timeLimits: true,
    installDate: '2019-05-12'
  },
  {
    id: '2',
    name: 'Slack',
    category: 'Productivity',
    lastUsed: '2 hours ago',
    usageTime: 124,
    notifications: 57,
    isDistraction: false,
    timeLimits: false,
    installDate: '2018-11-03'
  },
  {
    id: '3',
    name: 'YouTube',
    category: 'Entertainment',
    lastUsed: '1 day ago',
    usageTime: 103,
    notifications: 12,
    isDistraction: true,
    timeLimits: true,
    installDate: '2017-08-22'
  },
  {
    id: '4',
    name: 'Gmail',
    category: 'Productivity',
    lastUsed: '3 hours ago',
    usageTime: 45,
    notifications: 29,
    isDistraction: false,
    timeLimits: false,
    installDate: '2015-01-15'
  },
  {
    id: '5',
    name: 'Twitter',
    category: 'Social Media',
    lastUsed: '5 hours ago',
    usageTime: 58,
    notifications: 24,
    isDistraction: true,
    timeLimits: true,
    installDate: '2016-09-30'
  },
  {
    id: '6',
    name: 'Netflix',
    category: 'Entertainment',
    lastUsed: '2 days ago',
    usageTime: 95,
    notifications: 5,
    isDistraction: true,
    timeLimits: false,
    installDate: '2018-03-17'
  }
];

const weeklyUsage: UsageData[] = [
  { day: 'Mon', minutes: 185, distractionMinutes: 95 },
  { day: 'Tue', minutes: 210, distractionMinutes: 110 },
  { day: 'Wed', minutes: 175, distractionMinutes: 70 },
  { day: 'Thu', minutes: 250, distractionMinutes: 130 },
  { day: 'Fri', minutes: 310, distractionMinutes: 150 },
  { day: 'Sat', minutes: 385, distractionMinutes: 220 },
  { day: 'Sun', minutes: 330, distractionMinutes: 180 }
];

const DigitalMinimalism: React.FC = () => {
  const [apps, setApps] = useState<AppItem[]>(mockApps);
  const [filter, setFilter] = useState<string>('all');
  const [digitalDetoxActive, setDigitalDetoxActive] = useState<boolean>(false);
  const [detoxDuration, setDetoxDuration] = useState<string>('24h');
  const [detoxExceptions, setDetoxExceptions] = useState<string[]>(['Slack', 'Gmail']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUninstallUnused, setShowUninstallUnused] = useState<boolean>(false);
  const [unusedDays, setUnusedDays] = useState<number>(30);
  const [detoxMode, setDetoxMode] = useState(false);
  const [detoxStart, setDetoxStart] = useState<Date | undefined>(undefined);
  const [detoxEnd, setDetoxEnd] = useState<Date | undefined>(undefined);
  const [detoxApps, setDetoxApps] = useState<string[]>([]);
  
  const filteredApps = apps.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'distractions') return app.isDistraction;
    if (filter === 'productive') return !app.isDistraction;
    if (filter === 'time-limits') return app.timeLimits;
    return true;
  }).filter(app => {
    if (selectedCategory === 'all') return true;
    return app.category === selectedCategory;
  });
  
  const toggleDistraction = (id: string) => {
    setApps(apps.map(app => 
      app.id === id ? { ...app, isDistraction: !app.isDistraction } : app
    ));
  };
  
  const toggleTimeLimit = (id: string) => {
    setApps(apps.map(app => 
      app.id === id ? { ...app, timeLimits: !app.timeLimits } : app
    ));
  };
  
  const handleDigitalDetox = () => {
    if (!detoxStart || !detoxEnd) {
      toast.error('Please select start and end dates for your digital detox');
      return;
    }
    
    if (detoxApps.length === 0) {
      toast.error('Please select at least one app to block during detox');
      return;
    }
    
    setDetoxMode(true);
    toast.success(`Digital detox scheduled from ${format(detoxStart, 'PPP')} to ${format(detoxEnd, 'PPP')}`);
    
    // In a real app, we would store this in the database and implement blocking functionality
  };
  
  const totalScreenTime = weeklyUsage.reduce((acc, day) => acc + day.minutes, 0);
  const totalDistractionTime = weeklyUsage.reduce((acc, day) => acc + day.distractionMinutes, 0);
  const averageDailyScreenTime = Math.round(totalScreenTime / 7);
  const averageDailyDistractionTime = Math.round(totalDistractionTime / 7);
  
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Digital Minimalism</h1>
          <p className="text-muted-foreground">Reduce digital clutter and reclaim your attention</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={detoxDuration}
            onValueChange={setDetoxDuration}
            disabled={digitalDetoxActive}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="3h">3 hours</SelectItem>
              <SelectItem value="12h">12 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="48h">48 hours</SelectItem>
              <SelectItem value="week">1 week</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant={digitalDetoxActive ? "destructive" : "default"}
            onClick={handleDigitalDetox}
          >
            {digitalDetoxActive ? "End Digital Detox" : "Start Digital Detox"}
          </Button>
        </div>
      </div>
      
      {digitalDetoxActive && (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Ban className="h-5 w-5 text-primary" />
                  Digital Detox Active
                </h3>
                <p className="text-muted-foreground">
                  All distracting apps and websites are currently blocked
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock4 className="h-5 w-5 text-primary" />
                <span className="font-medium">23:45:12 remaining</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Allowed exceptions:</h4>
              <div className="flex flex-wrap gap-2">
                {detoxExceptions.map(app => (
                  <Badge key={app} variant="outline" className="bg-background">
                    {app}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="app-inventory">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="app-inventory">
            <LayoutGrid className="h-4 w-4 mr-2" />
            App Inventory
          </TabsTrigger>
          <TabsTrigger value="screen-time">
            <Clock className="h-4 w-4 mr-2" />
            Screen Time
          </TabsTrigger>
          <TabsTrigger value="clean-up">
            <Trash className="h-4 w-4 mr-2" />
            Digital Clean-up
          </TabsTrigger>
        </TabsList>
        
        {/* App Inventory Tab */}
        <TabsContent value="app-inventory" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Your Digital Environment</CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={filter}
                    onValueChange={setFilter}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Apps</SelectItem>
                      <SelectItem value="distractions">Distractions</SelectItem>
                      <SelectItem value="productive">Productive</SelectItem>
                      <SelectItem value="time-limits">Time Limits</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px] pr-4">
                <div className="space-y-4">
                  {filteredApps.map(app => (
                    <div 
                      key={app.id} 
                      className={`p-4 rounded-lg border ${
                        app.isDistraction ? 'bg-destructive/5 border-destructive/20' : 'bg-card'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{app.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{app.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Last used: {app.lastUsed}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">{formatMinutes(app.usageTime)}</span>
                            <span className="text-xs text-muted-foreground">daily average</span>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`distraction-${app.id}`}
                                checked={app.isDistraction}
                                onCheckedChange={() => toggleDistraction(app.id)}
                              />
                              <Label htmlFor={`distraction-${app.id}`} className="text-xs cursor-pointer">
                                Mark as distraction
                              </Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`time-limit-${app.id}`}
                                checked={app.timeLimits}
                                onCheckedChange={() => toggleTimeLimit(app.id)}
                              />
                              <Label htmlFor={`time-limit-${app.id}`} className="text-xs cursor-pointer">
                                Set time limits
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {app.timeLimits && (
                        <div className="mt-4 bg-background p-3 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Daily limit: 30 minutes</span>
                            <span className="text-sm">{formatMinutes(app.usageTime)} used today</span>
                          </div>
                          <Progress 
                            value={(app.usageTime / 30) * 100} 
                            className={`h-2 ${app.usageTime > 30 ? "bg-destructive" : ""}`}
                          />
                          {app.usageTime > 30 && (
                            <p className="text-xs text-destructive mt-1">
                              Exceeded daily limit by {formatMinutes(app.usageTime - 30)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredApps.length} apps shown
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure Time Limits
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Screen Time Tab */}
        <TabsContent value="screen-time" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Screen Time Analysis</CardTitle>
              <CardDescription>
                Track your digital consumption and identify patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/40 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-bold">{formatMinutes(totalScreenTime)}</h3>
                  <p className="text-sm text-muted-foreground">Weekly screen time</p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-bold">{formatMinutes(averageDailyScreenTime)}</h3>
                  <p className="text-sm text-muted-foreground">Daily average</p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-bold">{Math.round((totalDistractionTime / totalScreenTime) * 100)}%</h3>
                  <p className="text-sm text-muted-foreground">On distractions</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Weekly Breakdown</h3>
                <div className="h-60 flex items-end gap-1">
                  {weeklyUsage.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full">
                        <div 
                          className="bg-primary/20 rounded-t-sm w-full"
                          style={{ height: `${(day.minutes - day.distractionMinutes) / 4}px` }}
                        />
                        <div 
                          className="bg-destructive/60 rounded-t-sm w-full absolute bottom-0"
                          style={{ height: `${day.distractionMinutes / 4}px` }}
                        />
                      </div>
                      <span className="text-xs mt-2">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/20 rounded-sm" />
                    <span>Productive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive/60 rounded-sm" />
                    <span>Distractions</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Top Time Consumers</h3>
                
                <div className="space-y-3">
                  {apps
                    .sort((a, b) => b.usageTime - a.usageTime)
                    .slice(0, 5)
                    .map(app => (
                    <div key={app.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span>{app.name}</span>
                          {app.isDistraction && (
                            <Badge variant="outline" className="text-destructive border-destructive/30">
                              Distraction
                            </Badge>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{formatMinutes(app.usageTime)}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({Math.round((app.usageTime / averageDailyScreenTime) * 100)}%)
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={(app.usageTime / apps[0].usageTime) * 100} 
                        className={`h-1 ${app.isDistraction ? "bg-destructive/70" : ""}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Insights</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>You spend <strong>{Math.round((totalDistractionTime / totalScreenTime) * 100)}%</strong> of your screen time on distracting apps.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Your screen time is <strong>{averageDailyScreenTime > 240 ? 'higher' : 'lower'}</strong> than the average user.</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Weekend usage is <strong>{Math.round(((weeklyUsage[5].minutes + weeklyUsage[6].minutes) / (averageDailyScreenTime * 2)) * 100)}%</strong> higher than weekday usage.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Data from the last 7 days
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <TimerReset className="h-4 w-4 mr-2" />
                  Set Reduction Goal
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  View Full Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Digital Clean-up Tab */}
        <TabsContent value="clean-up" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Digital Decluttering</CardTitle>
              <CardDescription>
                Simplify your digital environment by removing unused apps and clearing digital clutter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="show-unused" 
                    checked={showUninstallUnused}
                    onCheckedChange={(checked) => setShowUninstallUnused(checked === true)}
                  />
                  <Label htmlFor="show-unused">
                    Show apps unused for more than
                  </Label>
                  <Select
                    value={unusedDays.toString()}
                    onValueChange={(value) => setUnusedDays(parseInt(value))}
                    disabled={!showUninstallUnused}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Button variant="outline" size="sm">
                    <ListFilter className="h-4 w-4 mr-2" />
                    Sort by Last Used
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                    Uninstall Candidates
                  </h3>
                  <Badge variant="outline">{showUninstallUnused ? 2 : 0} apps</Badge>
                </div>
                
                {!showUninstallUnused ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Enable the option above to see apps you haven't used recently
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-background rounded-md flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Twitter</h4>
                        <p className="text-xs text-muted-foreground">Last used 42 days ago</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Uninstall
                      </Button>
                    </div>
                    
                    <div className="p-3 bg-background rounded-md flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Netflix</h4>
                        <p className="text-xs text-muted-foreground">Last used 36 days ago</p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Uninstall
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Digital Decluttering Checklist</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="task-1" />
                    <Label 
                      htmlFor="task-1" 
                      className="text-sm cursor-pointer"
                    >
                      Remove apps you haven't used in the last month
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="task-2" />
                    <Label 
                      htmlFor="task-2" 
                      className="text-sm cursor-pointer"
                    >
                      Disable non-essential notifications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="task-3" />
                    <Label 
                      htmlFor="task-3" 
                      className="text-sm cursor-pointer"
                    >
                      Set up time limits for distracting apps
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="task-4" />
                    <Label 
                      htmlFor="task-4" 
                      className="text-sm cursor-pointer"
                    >
                      Hide or delete distracting social media apps
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="task-5" />
                    <Label 
                      htmlFor="task-5" 
                      className="text-sm cursor-pointer"
                    >
                      Schedule a weekly digital decluttering session
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="task-6" />
                    <Label 
                      htmlFor="task-6" 
                      className="text-sm cursor-pointer"
                    >
                      Organize apps into folders by purpose
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h3 className="font-medium mb-2">Digital Minimalism Tips</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Keep only the essential apps on your home screen</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Use time-blocking to batch similar tasks instead of constant app-switching</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Set up a "focus environment" with only the apps you need for deep work</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Generate Digital Decluttering Plan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Digital Detox
          </CardTitle>
          <CardDescription>
            Schedule times to disconnect from specific apps and websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detoxMode ? (
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <h3 className="font-medium text-primary mb-2">Digital Detox Active</h3>
                <p className="text-sm mb-2">
                  Your digital detox is scheduled from <span className="font-medium">{format(detoxStart!, 'PPP')}</span> to <span className="font-medium">{format(detoxEnd!, 'PPP')}</span>.
                </p>
                <p className="text-sm">
                  During this period, you will not have access to: <span className="font-medium">{detoxApps.join(', ')}</span>
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setDetoxMode(false)}
              >
                Cancel Digital Detox
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="detox-start">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="detox-start"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {detoxStart ? format(detoxStart, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={detoxStart}
                        onSelect={setDetoxStart}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="detox-end">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="detox-end"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {detoxEnd ? format(detoxEnd, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={detoxEnd}
                        onSelect={setDetoxEnd}
                        initialFocus
                        disabled={(date) => date < (detoxStart || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Select Apps to Block</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {apps.slice(0, 9).map((app) => (
                    <div 
                      key={app.id}
                      className={`flex items-center space-x-2 rounded border p-2 cursor-pointer ${
                        detoxApps.includes(app.id) ? 'border-primary bg-primary/10' : ''
                      }`}
                      onClick={() => {
                        if (detoxApps.includes(app.id)) {
                          setDetoxApps(detoxApps.filter(id => id !== app.id));
                        } else {
                          setDetoxApps([...detoxApps, app.id]);
                        }
                      }}
                    >
                      <Checkbox 
                        checked={detoxApps.includes(app.id)} 
                        onCheckedChange={() => {}}
                      />
                      <span>{app.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full"
                onClick={handleDigitalDetox}
              >
                Schedule Digital Detox
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalMinimalism; 