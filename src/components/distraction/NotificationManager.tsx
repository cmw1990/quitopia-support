import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { 
  BellOff, 
  BellRing, 
  Clock, 
  LayoutGrid, 
  Settings, 
  Smartphone, 
  Laptop, 
  Globe, 
  MessageSquare,
  Mail,
  Calendar,
  AlertTriangle,
  Info,
  Check,
  X,
  Filter
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

interface NotificationRule {
  id: string;
  name: string;
  app_name: string;
  active: boolean;
  schedule_active: boolean;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  notification_type: 'all' | 'important' | 'none';
  keywords: string[];
  contacts: string[];
  counter: number;
}

interface NotificationStat {
  app_name: string;
  count: number;
  percentage: number;
}

// Mock default notification rules
const defaultRules: NotificationRule[] = [
  {
    id: '1',
    name: 'Work Focus Time',
    app_name: 'Slack',
    active: true,
    schedule_active: true,
    start_time: '09:00',
    end_time: '12:00',
    days_of_week: [1, 2, 3, 4, 5],
    notification_type: 'important',
    keywords: ['urgent', 'important', 'deadline'],
    contacts: ['boss', 'team-lead'],
    counter: 245
  },
  {
    id: '2',
    name: 'Deep Work',
    app_name: 'Email',
    active: true,
    schedule_active: false,
    start_time: '14:00',
    end_time: '17:00',
    days_of_week: [1, 2, 3, 4, 5],
    notification_type: 'none',
    keywords: [],
    contacts: [],
    counter: 389
  },
  {
    id: '3',
    name: 'Night Mode',
    app_name: 'All',
    active: true,
    schedule_active: true,
    start_time: '22:00',
    end_time: '07:00',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    notification_type: 'none',
    keywords: [],
    contacts: ['family'],
    counter: 1253
  }
];

// Mock notification stats
const defaultStats: NotificationStat[] = [
  { app_name: 'Email', count: 543, percentage: 32 },
  { app_name: 'Slack', count: 412, percentage: 24 },
  { app_name: 'Social Media', count: 387, percentage: 23 },
  { app_name: 'Calendar', count: 218, percentage: 13 },
  { app_name: 'Other', count: 134, percentage: 8 }
];

const NotificationManager: React.FC = () => {
  const session = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(defaultRules);
  const [notificationStats, setNotificationStats] = useState<NotificationStat[]>(defaultStats);
  const [focusModeActive, setFocusModeActive] = useState<boolean>(false);
  const [focusModeDuration, setFocusModeDuration] = useState<number>(60); // minutes
  const [focusModeRemaining, setFocusModeRemaining] = useState<number | null>(null);
  const [allowedApps, setAllowedApps] = useState<string[]>(['Calendar']);
  const [allowedContacts, setAllowedContacts] = useState<string[]>(['family']);
  
  // New rule form state
  const [newRule, setNewRule] = useState<Partial<NotificationRule>>({
    name: '',
    app_name: 'All',
    active: true,
    schedule_active: false,
    start_time: '09:00',
    end_time: '17:00',
    days_of_week: [1, 2, 3, 4, 5],
    notification_type: 'important',
    keywords: [],
    contacts: []
  });
  
  // Focus mode timer effect
  useEffect(() => {
    let timerInterval: number;
    
    if (focusModeActive && focusModeRemaining !== null && focusModeRemaining > 0) {
      timerInterval = window.setInterval(() => {
        setFocusModeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timerInterval);
            setFocusModeActive(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [focusModeActive, focusModeRemaining]);
  
  const toggleFocusMode = () => {
    if (focusModeActive) {
      setFocusModeActive(false);
      setFocusModeRemaining(null);
      toast.success('Focus mode deactivated');
    } else {
      setFocusModeActive(true);
      setFocusModeRemaining(focusModeDuration * 60);
      toast.success(`Focus mode activated for ${focusModeDuration} minutes`);
    }
  };
  
  const updateRule = (id: string, updates: Partial<NotificationRule>) => {
    setNotificationRules(prevRules => 
      prevRules.map(rule => 
        rule.id === id ? { ...rule, ...updates } : rule
      )
    );
  };
  
  const deleteRule = (id: string) => {
    setNotificationRules(prevRules => prevRules.filter(rule => rule.id !== id));
    toast.success('Rule deleted');
  };
  
  const addNewRule = () => {
    if (!newRule.name || !newRule.app_name) {
      toast.error('Please provide a name and select an app');
      return;
    }
    
    const rule: NotificationRule = {
      id: `${Date.now()}`,
      name: newRule.name || 'New Rule',
      app_name: newRule.app_name || 'All',
      active: newRule.active !== undefined ? newRule.active : true,
      schedule_active: newRule.schedule_active !== undefined ? newRule.schedule_active : false,
      start_time: newRule.start_time || '09:00',
      end_time: newRule.end_time || '17:00',
      days_of_week: newRule.days_of_week || [1, 2, 3, 4, 5],
      notification_type: newRule.notification_type || 'important',
      keywords: newRule.keywords || [],
      contacts: newRule.contacts || [],
      counter: 0
    };
    
    setNotificationRules(prevRules => [...prevRules, rule]);
    
    // Reset form
    setNewRule({
      name: '',
      app_name: 'All',
      active: true,
      schedule_active: false,
      start_time: '09:00',
      end_time: '17:00',
      days_of_week: [1, 2, 3, 4, 5],
      notification_type: 'important',
      keywords: [],
      contacts: []
    });
    
    toast.success('New notification rule added');
  };
  
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  const getAppIcon = (appName: string) => {
    switch (appName.toLowerCase()) {
      case 'slack':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'social media':
        return <Globe className="h-4 w-4" />;
      case 'all':
        return <LayoutGrid className="h-4 w-4" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };
  
  const getDayName = (day: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notification Manager</h1>
          <p className="text-muted-foreground">Control digital distractions and create focus time</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Quick Focus:
          </span>
          <Select
            value={focusModeDuration.toString()}
            onValueChange={(value) => setFocusModeDuration(parseInt(value))}
            disabled={focusModeActive}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant={focusModeActive ? "destructive" : "default"}
            onClick={toggleFocusMode}
          >
            {focusModeActive ? (
              <><BellRing className="h-4 w-4 mr-2" /> Stop</>
            ) : (
              <><BellOff className="h-4 w-4 mr-2" /> Start</>
            )}
          </Button>
        </div>
      </div>
      
      {focusModeActive && (
        <Alert variant="default" className="bg-primary/10 border-primary/20">
          <BellOff className="h-4 w-4" />
          <AlertTitle>Focus Mode Active</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>All non-essential notifications are blocked</span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatTime(focusModeRemaining)}</span>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">
            <Filter className="h-4 w-4 mr-2" />
            Notification Rules
          </TabsTrigger>
          <TabsTrigger value="focus-settings">
            <Settings className="h-4 w-4 mr-2" />
            Focus Settings
          </TabsTrigger>
          <TabsTrigger value="stats">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Notification Stats
          </TabsTrigger>
        </TabsList>
        
        {/* Notification Rules Tab */}
        <TabsContent value="rules" className="mt-6 space-y-6">
          {notificationRules.map(rule => (
            <Card key={rule.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getAppIcon(rule.app_name)}
                    {rule.name}
                  </CardTitle>
                  <Switch
                    checked={rule.active}
                    onCheckedChange={(checked) => updateRule(rule.id, { active: checked })}
                  />
                </div>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline">{rule.app_name}</Badge>
                  {rule.schedule_active && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Clock className="h-3 w-3 mr-1" />
                      {rule.start_time} - {rule.end_time}
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`schedule-${rule.id}`} className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </Label>
                      <Switch
                        id={`schedule-${rule.id}`}
                        checked={rule.schedule_active}
                        onCheckedChange={(checked) => updateRule(rule.id, { schedule_active: checked })}
                      />
                    </div>
                    
                    {rule.schedule_active && (
                      <div className="pl-6 pt-2 space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Start Time</Label>
                            <Input
                              type="time"
                              value={rule.start_time}
                              onChange={(e) => updateRule(rule.id, { start_time: e.target.value })}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">End Time</Label>
                            <Input
                              type="time"
                              value={rule.end_time}
                              onChange={(e) => updateRule(rule.id, { end_time: e.target.value })}
                              className="h-8"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Days</Label>
                          <div className="flex gap-1 flex-wrap">
                            {[0, 1, 2, 3, 4, 5, 6].map(day => (
                              <Badge
                                key={day}
                                variant={rule.days_of_week.includes(day) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  const newDays = rule.days_of_week.includes(day)
                                    ? rule.days_of_week.filter(d => d !== day)
                                    : [...rule.days_of_week, day];
                                  updateRule(rule.id, { days_of_week: newDays });
                                }}
                              >
                                {getDayName(day)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter Settings
                    </Label>
                    
                    <div className="pl-6 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Allow Notifications</Label>
                        <Select
                          value={rule.notification_type}
                          onValueChange={(value: 'all' | 'important' | 'none') => 
                            updateRule(rule.id, { notification_type: value })
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All notifications</SelectItem>
                            <SelectItem value="important">Only important</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {rule.notification_type === 'important' && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <Label className="text-xs">Blocked Notifications</Label>
                            <Badge variant="outline">{rule.counter}</Badge>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => deleteRule(rule.id)}
                >
                  Delete
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  {rule.active ? (
                    rule.schedule_active ? (
                      <span className="flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        Active during scheduled hours
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                        Always active
                      </span>
                    )
                  ) : (
                    <span className="flex items-center">
                      <X className="h-3 w-3 mr-1 text-red-500" />
                      Not active
                    </span>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
          
          <Card>
            <CardHeader>
              <CardTitle>Create New Rule</CardTitle>
              <CardDescription>
                Add a new notification management rule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    placeholder="e.g., Deep Work Focus"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="app-name">Application</Label>
                  <Select
                    value={newRule.app_name}
                    onValueChange={(value) => setNewRule({ ...newRule, app_name: value })}
                  >
                    <SelectTrigger id="app-name">
                      <SelectValue placeholder="Select app" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Applications</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Slack">Slack</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Calendar">Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule-active"
                  checked={newRule.schedule_active}
                  onCheckedChange={(checked) => 
                    setNewRule({ ...newRule, schedule_active: checked === true })
                  }
                />
                <Label htmlFor="schedule-active">Use Time Schedule</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notification-type">Notification Handling</Label>
                <Select
                  value={newRule.notification_type}
                  onValueChange={(value: 'all' | 'important' | 'none') => 
                    setNewRule({ ...newRule, notification_type: value })
                  }
                >
                  <SelectTrigger id="notification-type">
                    <SelectValue placeholder="How to handle notifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Allow all notifications</SelectItem>
                    <SelectItem value="important">Only show important notifications</SelectItem>
                    <SelectItem value="none">Block all notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={addNewRule}>Add Rule</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Focus Settings Tab */}
        <TabsContent value="focus-settings" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Focus Mode Settings</CardTitle>
              <CardDescription>
                Configure what's allowed during focus mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Allowed Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Calendar', 'Notes', 'Focus Timer', 'Slack', 'Email', 'Browser', 'Phone'].map(app => (
                    <Badge
                      key={app}
                      variant={allowedApps.includes(app) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setAllowedApps(prev => 
                          prev.includes(app) 
                            ? prev.filter(a => a !== app) 
                            : [...prev, app]
                        );
                      }}
                    >
                      {allowedApps.includes(app) ? <Check className="h-3 w-3 mr-1" /> : null}
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Allowed Contacts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['family', 'boss', 'team-lead', 'partner', 'doctor'].map(contact => (
                    <Badge
                      key={contact}
                      variant={allowedContacts.includes(contact) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setAllowedContacts(prev => 
                          prev.includes(contact) 
                            ? prev.filter(c => c !== contact) 
                            : [...prev, contact]
                        );
                      }}
                    >
                      {allowedContacts.includes(contact) ? <Check className="h-3 w-3 mr-1" /> : null}
                      {contact}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Input placeholder="Add custom contact group..." className="h-8" />
                  <Button variant="outline" size="sm">Add</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Focus Mode Behavior
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="collect-notifications" className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Collect blocked notifications
                      </Label>
                      <Switch id="collect-notifications" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-reply" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        Send auto-replies
                      </Label>
                      <Switch id="auto-reply" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-summary" className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                        Show summary after focus session
                      </Label>
                      <Switch id="show-summary" defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-enable" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Auto-enable during calendar events
                      </Label>
                      <Switch id="auto-enable" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="do-not-disturb" className="flex items-center gap-2">
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                        Sync with device Do Not Disturb
                      </Label>
                      <Switch id="do-not-disturb" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emergency-bypass" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        Allow emergency notifications
                      </Label>
                      <Switch id="emergency-bypass" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notification Stats Tab */}
        <TabsContent value="stats" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Statistics</CardTitle>
              <CardDescription>
                Understand your digital interruption patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/40 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-bold">1,694</h3>
                  <p className="text-sm text-muted-foreground">Total notifications</p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-bold">86%</h3>
                  <p className="text-sm text-muted-foreground">Successfully blocked</p>
                </div>
                
                <div className="bg-muted/40 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-bold">12.4 hrs</h3>
                  <p className="text-sm text-muted-foreground">Focus time saved</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notifications by Source</h3>
                
                <div className="space-y-3">
                  {notificationStats.map(stat => (
                    <div key={stat.app_name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getAppIcon(stat.app_name)}
                          <span>{stat.app_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{stat.count}</span>
                          <span className="text-xs text-muted-foreground">
                            ({stat.percentage}%)
                          </span>
                        </div>
                      </div>
                      <Progress value={stat.percentage} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Focus Mode Usage</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last 7 days</span>
                      <Badge variant="outline">12 sessions</Badge>
                    </div>
                    <div className="h-24 flex items-end gap-1">
                      {[35, 65, 20, 80, 45, 90, 30].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/60 rounded-t-sm"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Average Focus Session</h4>
                      <Badge>52 minutes</Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Morning</span>
                        <span className="text-muted-foreground">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Afternoon</span>
                        <span className="text-muted-foreground">35%</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Evening</span>
                        <span className="text-muted-foreground">20%</span>
                      </div>
                      <Progress value={20} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <span className="text-sm text-muted-foreground">
                Data from the last 30 days
              </span>
              <Button variant="outline" size="sm">
                Export Stats
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManager; 