import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertCircle,
  Bell,
  BellOff, 
  Instagram,
  Youtube,
  Plus,
  X,
  Calendar,
  Check,
  Trash2,
  Clock,
  Lock,
  Settings,
  Save,
  Monitor,
  AlertTriangle,
  PieChart,
  Coffee,
  Zap,
  ShieldCheck,
  Info,
  Power,
  PowerOff,
  Timer,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger, 
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  getUserDistractionSettings, 
  updateUserDistractionSettings, 
  DistractionSettings
} from '@/api/supabaseClient';

// Interface for props, kept empty for now as no props are passed
interface DistractionBlockerProps {}

interface DistractionCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  sites: string[];
  enabled: boolean;
}

interface Schedule {
  id: string;
  name: string;
  days: string[];
  startTime: string;
  endTime: string;
  enabled: boolean;
}

// Helper function to check if current time falls within a schedule
const isTimeWithinSchedule = (schedule: Schedule): boolean => {
  if (!schedule.enabled) return false;

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes since midnight

  if (!schedule.days.includes(currentDay)) return false;

  const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
  const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
  const startTimeMinutes = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;

  // Handle overnight schedules (e.g., 22:00 - 06:00)
  if (endTimeMinutes < startTimeMinutes) {
    return currentTime >= startTimeMinutes || currentTime < endTimeMinutes;
  } else {
    return currentTime >= startTimeMinutes && currentTime < endTimeMinutes;
  }
};

export const DistractionBlocker: React.FC<DistractionBlockerProps> = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("blocker");
  const [customUrl, setCustomUrl] = useState("");
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  
  // State managed via DistractionSettings interface
  const [settings, setSettings] = useState<DistractionSettings>({
      blocked_sites_categories: { social: true, video: false, news: false, shopping: false }, // Initial defaults
      custom_blocked_sites: [],
      schedules: [], // Start empty, load from API
      notifications_blocked: false,
      strict_mode: false
  });
  
  // Predefined categories (UI only, state is in settings.blocked_sites_categories)
  const distractionCategoriesConfig: Omit<DistractionCategory, 'enabled'>[] = [
    { id: "social", name: "Social Media", icon: <Instagram className="h-5 w-5 text-pink-500" />, sites: ["facebook.com", "twitter.com", "instagram.com", "tiktok.com", "reddit.com", "pinterest.com"] },
    { id: "video", name: "Video Streaming", icon: <Youtube className="h-5 w-5 text-red-500" />, sites: ["youtube.com", "netflix.com", "hulu.com", "disneyplus.com", "twitch.tv", "vimeo.com"] },
    { id: "news", name: "News & Media", icon: <AlertCircle className="h-5 w-5 text-blue-500" />, sites: ["cnn.com", "nytimes.com", "bbc.com", "huffpost.com", "foxnews.com", "theguardian.com"] },
    { id: "shopping", name: "Shopping", icon: <AlertCircle className="h-5 w-5 text-green-500" />, sites: ["amazon.com", "ebay.com", "etsy.com", "walmart.com", "target.com", "aliexpress.com"] }
  ];
  
  // State for loading and derived blocking status
  const [isLoading, setIsLoading] = useState(true);
  const [isBlockingActive, setIsBlockingActive] = useState(false); // Derived from schedules
  const [isOverrideActive, setIsOverrideActive] = useState(false);
  const overrideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Days of the week
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  // Save settings function (debounced or throttled in real app)
  const saveSettings = useCallback(async (newSettings: Partial<DistractionSettings>) => {
    if (!user) return;
    try {
      // Merge with existing settings before saving
      const settingsToSave = { ...settings, ...newSettings };
      // Remove potentially undefined fields if needed by API
      delete settingsToSave.id;
      delete settingsToSave.user_id;
      delete settingsToSave.updated_at;
      
      const updated = await updateUserDistractionSettings(user.id, settingsToSave);
      // Update local state with the potentially modified/timestamped data from API
      setSettings(prev => ({ ...prev, ...updated })); 
      console.log("Settings saved (simulated)", updated);
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings.");
    }
  }, [user, settings]); // Include settings in dependencies

  // Load settings on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const loadedSettings = await getUserDistractionSettings(user.id);
        if (loadedSettings) {
          setSettings(loadedSettings);
        } else {
          // If no settings found, maybe save the initial defaults?
          // saveSettings(settings); // Or just use the defaults already in state
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load distraction settings.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]); // Removed saveSettings dependency to prevent loop on init

  // Check schedule periodically
  useEffect(() => {
    const checkSchedules = () => {
      const activeSchedule = settings.schedules.find(isTimeWithinSchedule);
      setIsBlockingActive(!!activeSchedule);
    };

    checkSchedules(); // Check immediately
    const intervalId = setInterval(checkSchedules, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [settings.schedules]);

  // Determine if UI should be locked based on strict mode, schedule, and override
  const isUiLocked = settings.strict_mode && isBlockingActive && !isOverrideActive;

  // Event Handlers (Modified to use settings state and save)

  const toggleCategory = (categoryId: string) => {
    if (isUiLocked) {
       toast.warning("Strict Mode Active: Cannot change block list during scheduled block.");
       return;
    }
    const currentCategories = settings.blocked_sites_categories || {};
    const newCategories = {
      ...currentCategories,
      [categoryId]: !currentCategories[categoryId]
    };
    setSettings(prev => ({ ...prev, blocked_sites_categories: newCategories }));
    saveSettings({ blocked_sites_categories: newCategories });
    
    const categoryConfig = distractionCategoriesConfig.find(c => c.id === categoryId);
    if (categoryConfig) {
      if (newCategories[categoryId]) {
        toast.success(`Blocked ${categoryConfig.name} websites`);
      } else {
        toast.info(`Unblocked ${categoryConfig.name} websites`);
      }
    }
  };
  
  const addCustomUrl = () => {
    if (isUiLocked) {
       toast.warning("Strict Mode Active: Cannot change block list during scheduled block.");
       return;
    }
    if (!customUrl) {
      toast.error("Please enter a URL");
      return;
    }
    let url = customUrl.trim().replace(/^(https?:\/\/)?(www\.)?/,''); // Clean URL
    if (!url.includes('.')) {
      toast.error("Please enter a valid domain (e.g., example.com)");
      return;
    }
    if (settings.custom_blocked_sites.includes(url)) {
      toast.warning("This site is already blocked");
      return;
    }
    const newSites = [...settings.custom_blocked_sites, url];
    setSettings(prev => ({ ...prev, custom_blocked_sites: newSites }));
    saveSettings({ custom_blocked_sites: newSites });
    setCustomUrl('');
    toast.success(`Blocked ${url}`);
  };
  
  const removeCustomUrl = (url: string) => {
    if (isUiLocked) {
       toast.warning("Strict Mode Active: Cannot change block list during scheduled block.");
       return;
    }
    const newSites = settings.custom_blocked_sites.filter(site => site !== url);
    setSettings(prev => ({ ...prev, custom_blocked_sites: newSites }));
    saveSettings({ custom_blocked_sites: newSites });
    toast.info(`Unblocked ${url}`);
  };
  
  const toggleNotifications = () => {
    const newValue = !settings.notifications_blocked;
    setSettings(prev => ({ ...prev, notifications_blocked: newValue }));
    saveSettings({ notifications_blocked: newValue });
    toast.info(`Notifications ${newValue ? 'blocked' : 'enabled'} during focus time`);
  };
  
  const toggleStrictMode = () => {
     if (isOverrideActive) {
        toast.warning("Override is active. End override before changing Strict Mode.");
        return;
     }
    const newValue = !settings.strict_mode;
    setSettings(prev => ({ ...prev, strict_mode: newValue }));
    saveSettings({ strict_mode: newValue });
    toast.info(`Strict mode ${newValue ? 'enabled' : 'disabled'}`);
  };

  const toggleDay = (day: string) => {
    if (isUiLocked) return; // Prevent changing schedules during lock
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  
  const addSchedule = () => {
    if (isUiLocked) {
       toast.warning("Strict Mode Active: Cannot add schedules during scheduled block.");
       return;
    }
    if (!scheduleName || selectedDays.length === 0) {
      toast.error("Please provide a name and select days for the schedule.");
      return;
    }
    const newSchedule: Schedule = {
      id: Date.now().toString(), // Use timestamp as temp ID
      name: scheduleName, days: selectedDays, startTime, endTime, enabled: true
    };
    const newSchedules = [...settings.schedules, newSchedule];
    setSettings(prev => ({ ...prev, schedules: newSchedules }));
    saveSettings({ schedules: newSchedules });
    setScheduleName(''); setSelectedDays([]); setStartTime('09:00'); setEndTime('17:00');
    toast.success(`Added "${scheduleName}" schedule`);
  };
  
  const toggleSchedule = (scheduleId: string) => {
    if (isUiLocked) {
       toast.warning("Strict Mode Active: Cannot toggle schedules during scheduled block.");
       return;
    }
    const newSchedules = settings.schedules.map(s => 
      s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
    );
    setSettings(prev => ({ ...prev, schedules: newSchedules }));
    saveSettings({ schedules: newSchedules });
    const toggled = newSchedules.find(s => s.id === scheduleId);
    if (toggled) toast.info(`Schedule "${toggled.name}" ${toggled.enabled ? 'enabled' : 'disabled'}`);
  };
  
  const deleteSchedule = (scheduleId: string) => {
    if (isUiLocked) {
       toast.warning("Strict Mode Active: Cannot delete schedules during scheduled block.");
       return;
    }
    const scheduleToDelete = settings.schedules.find(s => s.id === scheduleId);
    const newSchedules = settings.schedules.filter(s => s.id !== scheduleId);
    setSettings(prev => ({ ...prev, schedules: newSchedules }));
    saveSettings({ schedules: newSchedules });
    if (scheduleToDelete) toast.info(`Deleted "${scheduleToDelete.name}" schedule`);
  };

  // Emergency Override

  const handleEmergencyOverride = (reason: string) => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the override.");
      return;
    }
    setIsOverrideActive(true);
    toast.success("Emergency override activated for 15 minutes.", { 
        description: `Reason: ${reason}`,
        action: { label: 'End Now', onClick: () => endEmergencyOverride(true) }
    });

    // Clear previous timeout if any
    if (overrideTimeoutRef.current) clearTimeout(overrideTimeoutRef.current);
    
    // Automatically end override after 15 minutes (adjust as needed)
    overrideTimeoutRef.current = setTimeout(() => {
        endEmergencyOverride(false); // Pass false to avoid duplicate toast
    }, 15 * 60 * 1000); 
  };

  const endEmergencyOverride = (showToast: boolean | React.MouseEvent = true) => {
      // Determine actual showToast value (true if boolean or event)
      const displayToast = typeof showToast === 'boolean' ? showToast : true; 

      setIsOverrideActive(false);
      if (overrideTimeoutRef.current) {
          clearTimeout(overrideTimeoutRef.current);
          overrideTimeoutRef.current = null;
      }
      if (displayToast) toast.info("Emergency override ended.");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (overrideTimeoutRef.current) clearTimeout(overrideTimeoutRef.current);
    };
  }, []);

  // Loading State
  if (isLoading) {
     return <div className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground"/></div>;
  }

  // Render
  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto">
        <AnimatePresence>
          {isBlockingActive && !isOverrideActive && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center gap-2 text-sm font-medium text-primary"
            >
              <PowerOff className="h-4 w-4" />
              Blocking is currently ACTIVE based on your schedule.
              {settings.strict_mode && <Badge variant="destructive" className="ml-2">Strict Mode ON</Badge>}
            </motion.div>
          )}
          {isOverrideActive && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-md flex items-center justify-between gap-2 text-sm font-medium text-amber-800"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Emergency Override is ACTIVE.
              </div>
              <Button size="sm" variant="ghost" onClick={endEmergencyOverride} className="text-amber-800 hover:bg-amber-200">
                 <Power className="h-4 w-4 mr-1" /> End Override
               </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="blocker">Blocker Settings</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="insights">Insights & Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blocker">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Website Blocker Card */} 
              <Card className={isUiLocked ? 'opacity-60 pointer-events-none' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5" /> Website Blocker</CardTitle>
                  <CardDescription>Choose which websites to block during focus time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Common Distractions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {distractionCategoriesConfig.map((categoryConfig) => (
                        <div 
                          key={categoryConfig.id} 
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${ 
                            settings.blocked_sites_categories[categoryConfig.id] ? 'bg-primary/5 border-primary/20' : '' 
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {categoryConfig.icon}
                            <div>
                              <div className="font-medium text-sm">{categoryConfig.name}</div>
                              <div className="text-xs text-muted-foreground">{categoryConfig.sites.length} sites</div>
                            </div>
                          </div>
                          <Switch 
                            checked={settings.blocked_sites_categories[categoryConfig.id] || false}
                            onCheckedChange={() => toggleCategory(categoryConfig.id)}
                            disabled={isUiLocked}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-sm font-medium">Add Custom Website</h3>
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="example.com" value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCustomUrl()}
                        disabled={isUiLocked}
                      />
                      <Button onClick={addCustomUrl} disabled={isUiLocked}><Plus className="h-4 w-4" /> </Button>
                    </div>
                    {settings.custom_blocked_sites.length > 0 && (
                      <div className="pt-2">
                        <h3 className="text-sm font-medium mb-2">Custom Blocked Sites</h3>
                        <div className="flex flex-wrap gap-1">
                          {settings.custom_blocked_sites.map((site) => (
                            <motion.div key={site} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
                              <Badge variant="secondary" className="group relative pr-6">
                                {site}
                                <button 
                                  onClick={() => removeCustomUrl(site)}
                                  disabled={isUiLocked}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground opacity-50 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-opacity disabled:opacity-20 disabled:pointer-events-none"
                                >
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BellOff className="h-5 w-5"/> Notification Controls</CardTitle>
                    <CardDescription>Manage system notifications during focus.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="block-notifications" className="cursor-pointer">Block All System Notifications</Label>
                        <p className="text-xs text-muted-foreground">Silence notifications during active blocking periods.</p>
                      </div>
                      <Switch 
                        id="block-notifications"
                        checked={settings.notifications_blocked}
                        onCheckedChange={toggleNotifications}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className={isOverrideActive ? 'border-amber-400' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" /> Modes & Overrides
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground/70 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs">Strict Mode prevents changing block lists or schedules during active block times.</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                    <CardDescription>Configure blocking strictness.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="strict-mode" className="cursor-pointer">Enable Strict Mode</Label>
                        <p className="text-xs text-muted-foreground">Prevents bypass during active blocks.</p>
                      </div>
                      <Switch 
                        id="strict-mode" checked={settings.strict_mode}
                        onCheckedChange={toggleStrictMode}
                        disabled={isOverrideActive}
                      />
                    </div>
                    <div className="pt-4 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full" disabled={!settings.strict_mode || isOverrideActive || !isBlockingActive}>
                            <AlertTriangle className="h-4 w-4 mr-2" /> Emergency Override
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Emergency Override</AlertDialogTitle>
                            <AlertDialogDescription>
                              Temporarily disable Strict Mode for 15 mins. Provide a brief reason.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Textarea id="override-reason" placeholder="Reason for overriding..." rows={3}/>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                              const reasonInput = document.getElementById('override-reason') as HTMLTextAreaElement;
                              handleEmergencyOverride(reasonInput?.value || '');
                            }}>Confirm Override</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                         Only usable during an active block with Strict Mode ON. Disables strictness for 15 min.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedules">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className={isUiLocked ? 'opacity-60 pointer-events-none' : ''}>
                <CardHeader>
                  <CardTitle>Add New Schedule</CardTitle>
                  <CardDescription>Create a recurring blocking schedule.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-name">Schedule Name</Label>
                    <Input id="schedule-name" placeholder="e.g., Work Hours" value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} disabled={isUiLocked}/>
                  </div>
                  <div className="space-y-2">
                    <Label>Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <Button
                          key={day}
                          variant={selectedDays.includes(day) ? "default" : "outline"}
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => toggleDay(day)}
                          disabled={isUiLocked}
                        >
                          {day.substring(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isUiLocked}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={isUiLocked}/>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={addSchedule} className="w-full" disabled={isUiLocked}> <Plus className="h-4 w-4 mr-2" /> Add Schedule </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Schedules</CardTitle>
                  <CardDescription>Manage your existing block schedules.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {settings.schedules.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No schedules created yet.</p>
                  ) : (
                    settings.schedules.map((schedule) => (
                      <motion.div 
                        key={schedule.id} 
                        layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`p-3 rounded-lg border transition-colors ${ 
                          schedule.enabled ? (isUiLocked ? 'border-primary/10 bg-primary/5' : 'border-primary/30 bg-primary/10') : (isUiLocked ? 'border-muted/30' : 'border-border') 
                        } ${isUiLocked ? 'opacity-70' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-medium text-sm">{schedule.name}</h3>
                          <div className="flex items-center gap-1">
                            <Switch 
                              checked={schedule.enabled} 
                              onCheckedChange={() => toggleSchedule(schedule.id)}
                              disabled={isUiLocked}
                            />
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSchedule(schedule.id)} disabled={isUiLocked}>
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {schedule.days.map((day: string) => (
                            <Badge key={day} variant="secondary" className="text-xs font-normal">{day.substring(0, 3)}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" /> Distraction Analysis</CardTitle>
                  <CardDescription>Understand your common distractions (Coming Soon)</CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                  <p className="italic text-sm">(Analytics visualization placeholder)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Coffee className="h-5 w-5" /> Environment Tips</CardTitle>
                  <CardDescription>Optimize your physical space for focus (Coming Soon)</CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                  <p className="italic text-sm">(Recommendations placeholder)</p>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Digital Minimalism</CardTitle>
                  <CardDescription>Tools and guides for reducing digital noise (Coming Soon)</CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                  <p className="italic text-sm">(Tools and guides placeholder)</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default DistractionBlocker; 