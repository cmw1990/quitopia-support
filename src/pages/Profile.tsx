import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Input 
} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Switch 
} from "@/components/ui/switch";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Separator 
} from "@/components/ui/separator";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Key, 
  CreditCard, 
  InfoIcon,
  Clock,
  Brain,
  Target,
  Upload
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // Mock user data - would come from API/state in real app
  const userData = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "https://ui.shadcn.com/avatars/01.png",
    plan: "Pro",
    joinDate: "Jan 2023",
    timezone: "America/New_York",
    focusPreferences: {
      defaultWorkDuration: 25,
      defaultBreakDuration: 5,
      dailyFocusGoal: 240, // minutes
      notifications: true,
      soundAlerts: true,
      autoStartBreaks: false,
      autoStartSessions: false
    },
    adhdSettings: {
      bodyDoublingEnabled: true,
      distractionBlockingLevel: "medium",
      visualTimerType: "circular",
      taskBreakdownReminders: true,
      positiveReinforcementFrequency: "medium"
    }
  };
  
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved."
    });
  };
  
  const handleSaveFocusSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Focus settings updated",
      description: "Your focus preferences have been saved."
    });
  };
  
  const handleSaveADHDSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "ADHD support settings updated",
      description: "Your ADHD support preferences have been saved."
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Badge variant="outline" className="font-semibold">
          {userData.plan} Plan
        </Badge>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>{userData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{userData.name}</h2>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Member since {userData.joinDate}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <nav className="space-y-1">
                <Button 
                  variant={activeTab === "general" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("general")}
                >
                  <User className="h-4 w-4 mr-2" />
                  General
                </Button>
                <Button 
                  variant={activeTab === "focus" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("focus")}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Focus Settings
                </Button>
                <Button 
                  variant={activeTab === "adhd" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("adhd")}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  ADHD Support
                </Button>
                <Button 
                  variant={activeTab === "notifications" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button 
                  variant={activeTab === "security" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("security")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </Button>
                <Button 
                  variant={activeTab === "billing" ? "default" : "ghost"} 
                  className="w-full justify-start" 
                  onClick={() => setActiveTab("billing")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Billing
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Content Area */}
        <div className="flex-1">
          <Card className="h-full">
            {activeTab === "general" && (
              <>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>Manage your account details and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveGeneral} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <FormLabel>Full Name</FormLabel>
                        <Input defaultValue={userData.name} />
                        <FormDescription>Your display name visible to other users</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Email</FormLabel>
                        <Input defaultValue={userData.email} />
                        <FormDescription>Your email for notifications and login</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Time Zone</FormLabel>
                        <Select defaultValue={userData.timezone}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Used for scheduling and time displays</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Language</FormLabel>
                        <Select defaultValue="en-US">
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Your preferred language for the interface</FormDescription>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Privacy Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Online Status</FormLabel>
                          <FormDescription>Allow others to see when you're active</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Public Profile</FormLabel>
                          <FormDescription>Make your profile visible to other users</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Share Focus Stats</FormLabel>
                          <FormDescription>Allow community features to use your focus data</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}
            
            {activeTab === "focus" && (
              <>
                <CardHeader>
                  <CardTitle>Focus Settings</CardTitle>
                  <CardDescription>Customize your focus session preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveFocusSettings} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <FormLabel>Default Work Duration (minutes)</FormLabel>
                        <Input 
                          type="number" 
                          defaultValue={userData.focusPreferences.defaultWorkDuration} 
                          min={1} 
                          max={120}
                        />
                        <FormDescription>Your preferred focus session length</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Default Break Duration (minutes)</FormLabel>
                        <Input 
                          type="number" 
                          defaultValue={userData.focusPreferences.defaultBreakDuration} 
                          min={1} 
                          max={30}
                        />
                        <FormDescription>Your preferred break duration between sessions</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Daily Focus Goal (minutes)</FormLabel>
                        <Input 
                          type="number" 
                          defaultValue={userData.focusPreferences.dailyFocusGoal} 
                          min={15} 
                          max={720}
                          step={15}
                        />
                        <FormDescription>Target amount of focus time each day</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Focus Timer Type</FormLabel>
                        <Select defaultValue="circular">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timer type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circular">Circular</SelectItem>
                            <SelectItem value="linear">Linear</SelectItem>
                            <SelectItem value="digital">Digital Only</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Visual style of your focus timer</FormDescription>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Timer Behavior</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Auto-start Breaks</FormLabel>
                          <FormDescription>Automatically start breaks after work sessions</FormDescription>
                        </div>
                        <Switch defaultChecked={userData.focusPreferences.autoStartBreaks} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Auto-start Work Sessions</FormLabel>
                          <FormDescription>Automatically start work sessions after breaks</FormDescription>
                        </div>
                        <Switch defaultChecked={userData.focusPreferences.autoStartSessions} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Sound Alerts</FormLabel>
                          <FormDescription>Play sound when sessions start and end</FormDescription>
                        </div>
                        <Switch defaultChecked={userData.focusPreferences.soundAlerts} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Desktop Notifications</FormLabel>
                          <FormDescription>Show notifications when sessions start and end</FormDescription>
                        </div>
                        <Switch defaultChecked={userData.focusPreferences.notifications} />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Reset to Defaults</Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}
            
            {activeTab === "adhd" && (
              <>
                <CardHeader>
                  <CardTitle>ADHD Support Settings</CardTitle>
                  <CardDescription>Customize features to help with focus and task management</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveADHDSettings} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Body Doubling Support</FormLabel>
                          <FormDescription>Enable community body doubling features</FormDescription>
                        </div>
                        <Switch defaultChecked={userData.adhdSettings.bodyDoublingEnabled} />
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Distraction Blocking Level</FormLabel>
                        <Select defaultValue={userData.adhdSettings.distractionBlockingLevel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blocking level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light - Block only the most distracting sites</SelectItem>
                            <SelectItem value="medium">Medium - Block most social media and entertainment</SelectItem>
                            <SelectItem value="strict">Strict - Block everything except essential tools</SelectItem>
                            <SelectItem value="custom">Custom - Use my blocklist only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How aggressively to block distracting websites</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Visual Timer Style</FormLabel>
                        <Select defaultValue={userData.adhdSettings.visualTimerType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timer style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circular">Circular Progress</SelectItem>
                            <SelectItem value="hourglass">Hourglass Animation</SelectItem>
                            <SelectItem value="liquidFill">Liquid Fill</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Choose a timer visualization that helps your focus</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Positive Reinforcement Frequency</FormLabel>
                        <Select defaultValue={userData.adhdSettings.positiveReinforcementFrequency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Occasional encouragement</SelectItem>
                            <SelectItem value="medium">Medium - Regular positive feedback</SelectItem>
                            <SelectItem value="high">High - Frequent dopamine boosts</SelectItem>
                            <SelectItem value="none">None - No extra feedback</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How often to provide positive reinforcement during tasks</FormDescription>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Additional Support Features</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Task Breakdown Reminders</FormLabel>
                          <FormDescription>Get reminders to break down complex tasks</FormDescription>
                        </div>
                        <Switch defaultChecked={userData.adhdSettings.taskBreakdownReminders} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Focus Breathing Exercises</FormLabel>
                          <FormDescription>Show breathing exercises before focus sessions</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Energy Level Tracking</FormLabel>
                          <FormDescription>Track energy levels to optimize task scheduling</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Anti-Procrastination Nudges</FormLabel>
                          <FormDescription>Get gentle nudges when you might be procrastinating</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Reset to Defaults</Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}
            
            {activeTab === "notifications" && (
              <>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Focus & Session Notifications</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Session Start</FormLabel>
                          <FormDescription>Notify when a focus session begins</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Session End</FormLabel>
                          <FormDescription>Notify when a focus session ends</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Break Reminders</FormLabel>
                          <FormDescription>Remind to take breaks during long sessions</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Daily Goal Updates</FormLabel>
                          <FormDescription>Notify about daily focus goal progress</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Task & Community Notifications</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Task Reminders</FormLabel>
                          <FormDescription>Get reminders for upcoming tasks</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Body Doubling Invites</FormLabel>
                          <FormDescription>Notify when invited to body doubling sessions</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Community Messages</FormLabel>
                          <FormDescription>Notify about new messages from the community</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>App Updates</FormLabel>
                          <FormDescription>Notify about new features and updates</FormDescription>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Delivery</h3>
                      
                      <div className="space-y-2">
                        <FormLabel>Delivery Method</FormLabel>
                        <Select defaultValue="all">
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Methods (Email, Browser, Mobile)</SelectItem>
                            <SelectItem value="app-only">App Only (Browser & Mobile)</SelectItem>
                            <SelectItem value="email-only">Email Only</SelectItem>
                            <SelectItem value="mobile-only">Mobile Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>How you want to receive notifications</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Quiet Hours</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <FormLabel className="text-xs">Start Time</FormLabel>
                            <Input type="time" defaultValue="22:00" />
                          </div>
                          <div>
                            <FormLabel className="text-xs">End Time</FormLabel>
                            <Input type="time" defaultValue="08:00" />
                          </div>
                        </div>
                        <FormDescription>Don't send notifications during these hours</FormDescription>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Reset to Defaults</Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            {activeTab === "security" && (
              <>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and privacy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Password</h3>
                      
                      <div className="space-y-2">
                        <FormLabel>Current Password</FormLabel>
                        <Input type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>New Password</FormLabel>
                        <Input type="password" />
                        <FormDescription>Must be at least 8 characters with numbers and symbols</FormDescription>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Confirm New Password</FormLabel>
                        <Input type="password" />
                      </div>
                      
                      <Button className="mt-2">Update Password</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <FormLabel>Enable 2FA</FormLabel>
                          <FormDescription>Add an extra layer of security to your account</FormDescription>
                        </div>
                        <Switch />
                      </div>
                      
                      <Button variant="outline" disabled className="mt-2">
                        <Key className="h-4 w-4 mr-2" />
                        Setup 2FA
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Sessions</h3>
                      
                      <div className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Current Session</h4>
                            <p className="text-sm text-muted-foreground">MacBook Pro - Chrome</p>
                            <p className="text-xs text-muted-foreground">Started 2 hours ago</p>
                          </div>
                          <Badge>Active</Badge>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="mt-2">
                        Sign Out of All Other Devices
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Account</h3>
                      
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            {activeTab === "billing" && (
              <>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                  <CardDescription>Manage your plan and payment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-md border p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-medium">Current Plan</h3>
                          <p className="text-muted-foreground">Manage your subscription</p>
                        </div>
                        <Badge>{userData.plan}</Badge>
                      </div>
                      
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between">
                          <span>Billing period</span>
                          <span className="font-medium">Monthly</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next payment</span>
                          <span className="font-medium">November 15, 2023</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount</span>
                          <span className="font-medium">$9.99/month</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline">Change Plan</Button>
                        <Button variant="outline">Cancel Subscription</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                      
                      <div className="rounded-md border p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-5 w-5" />
                            <div>
                              <h4 className="font-medium">Visa ending in 4242</h4>
                              <p className="text-sm text-muted-foreground">Expires 12/2024</p>
                            </div>
                          </div>
                          <Badge>Primary</Badge>
                        </div>
                      </div>
                      
                      <Button variant="outline">
                        Add Payment Method
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Billing History</h3>
                      
                      <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3">Date</th>
                              <th className="text-left p-3">Description</th>
                              <th className="text-left p-3">Amount</th>
                              <th className="text-left p-3">Status</th>
                              <th className="text-left p-3">Invoice</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            <tr>
                              <td className="p-3">Oct 15, 2023</td>
                              <td className="p-3">Pro Plan - Monthly</td>
                              <td className="p-3">$9.99</td>
                              <td className="p-3"><Badge variant="outline" className="text-green-500">Paid</Badge></td>
                              <td className="p-3"><Button variant="link" size="sm">PDF</Button></td>
                            </tr>
                            <tr>
                              <td className="p-3">Sep 15, 2023</td>
                              <td className="p-3">Pro Plan - Monthly</td>
                              <td className="p-3">$9.99</td>
                              <td className="p-3"><Badge variant="outline" className="text-green-500">Paid</Badge></td>
                              <td className="p-3"><Button variant="link" size="sm">PDF</Button></td>
                            </tr>
                            <tr>
                              <td className="p-3">Aug 15, 2023</td>
                              <td className="p-3">Pro Plan - Monthly</td>
                              <td className="p-3">$9.99</td>
                              <td className="p-3"><Badge variant="outline" className="text-green-500">Paid</Badge></td>
                              <td className="p-3"><Button variant="link" size="sm">PDF</Button></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
