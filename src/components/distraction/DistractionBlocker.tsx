import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthProvider";
import {
 CheckCheck, Shield, Trash2, Plus, Clock, AlertTriangle, Calendar, Bell,
 Sun, Moon, Monitor, Smartphone, X, ExternalLink, Save, Globe, BarChart, Ban, Loader2, Settings2, TimerOff, Info, CalendarDays, Siren,
 Headphones, Lightbulb, Sparkles, Hourglass
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Debounce function defined inline below
import { distractionRulesApi, settingsApi } from "@/api/supabase-rest";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import DistractionStatsDashboard from './DistractionStatsDashboard';
import DigitalMinimalismGuide from './DigitalMinimalismGuide';
import { cn } from '@/lib/utils'; // Make sure cn is imported

// --- Type Definitions ---

// Settings Type
interface UserSettings {
  id?: string;
  user_id?: string;
  allowlist_websites?: string[] | null;
  // Add other settings fields as needed
  created_at?: string;
  updated_at?: string | null;
}

// Block Rule Type
interface BlockRule {
 id: string;
 user_id: string;
 name?: string | null;
 type: 'website' | 'app';
 target: string;
 schedule_type?: 'always' | 'custom' | 'during_focus' | null;
 schedule_start?: string | null;
 schedule_end?: string | null;
 days?: string[] | null;
 is_active: boolean;
 created_at: string;
 updated_at?: string | null;
 time_limit_minutes?: number | null;
}

// --- Constants ---
const weekDays = [
  { value: 'mon', label: 'Monday' }, { value: 'tue', label: 'Tuesday' }, { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' }, { value: 'fri', label: 'Friday' }, { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' }
];

// Static Environmental Tips (Restored)
const environmentalTips = [
  { icon: Headphones, text: "Use noise-canceling headphones or play focus sounds." },
  { icon: Lightbulb, text: "Adjust lighting to be comfortable." },
  { icon: Sparkles, text: "Keep your workspace tidy." },
  { icon: TimerOff, text: "Put your phone on silent or 'Do Not Disturb'." },
];

// --- Component ---
export function DistractionBlocker() {
 const { toast } = useToast();
 const { user } = useAuth();
 const userId = user?.id;

 // --- State ---
 const [isLoadingRules, setIsLoadingRules] = useState(true);
 const [isLoadingSettings, setIsLoadingSettings] = useState(true);
 const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
 const [blockRules, setBlockRules] = useState<BlockRule[]>([]);
 const [activeTab, setActiveTab] = useState("websites");
 const [newUrl, setNewUrl] = useState<string>('');
 const [newUrlTimeLimit, setNewUrlTimeLimit] = useState<string>('');
 const [newApp, setNewApp] = useState("");
 const [allowlistUrls, setAllowlistUrls] = useState<string[]>([]);
 const [newAllowedUrl, setNewAllowedUrl] = useState<string>('');
 const [showOverrideDialog, setShowOverrideDialog] = useState(false);
 const [overrideReason, setOverrideReason] = useState("");
 const [isOverriding, setIsOverriding] = useState(false);
 const [editingRuleSchedule, setEditingRuleSchedule] = useState<BlockRule | null>(null); // For commented-out schedule dialog
 const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri']); // For commented-out schedule dialog
 const [startTime, setStartTime] = useState("09:00"); // For commented-out schedule dialog
 const [endTime, setEndTime] = useState("17:00"); // For commented-out schedule dialog

 // --- Data Loading ---
 const loadRules = async () => {
   if (!userId) return;
   setIsLoadingRules(true);
   try {
     const fetchedRules: BlockRule[] = await distractionRulesApi.getRules(userId);
     setBlockRules(fetchedRules);
   } catch (error) {
     console.error("Error loading distraction rules:", error);
     toast({ title: "Error Loading Rules", description: `Could not fetch block list: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive"});
     setBlockRules([]);
   } finally {
     setIsLoadingRules(false);
   }
 };

 const loadSettings = async () => {
     if (!userId) return;
     setIsLoadingSettings(true);
     try {
         const fetchedSettings = await settingsApi.getSettings(userId);
         setUserSettings(fetchedSettings);
         setAllowlistUrls(fetchedSettings?.allowlist_websites || []);
     } catch (error) {
         console.error("Error loading settings:", error);
         toast({ title: "Error Loading Settings", description: `Could not fetch settings: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive"});
         setAllowlistUrls([]);
         setUserSettings(null);
     } finally {
         setIsLoadingSettings(false);
     }
 };

 useEffect(() => {
   if (userId) {
     loadRules();
     loadSettings();
   } else {
     setIsLoadingRules(false);
     setIsLoadingSettings(false);
     setBlockRules([]);
     setAllowlistUrls([]);
     setUserSettings(null);
   }
 }, [userId]);

  // --- Inline Debounce Function ---
  function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      return function(this: ThisParameterType<F>, ...args: Parameters<F>) {
          const context = this;
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
              func.apply(context, args);
          }, wait);
      };
  }

  // --- Debounced Settings Save ---
  const saveAllowlistDebounced = useCallback(
      debounce(async (newAllowlist: string[]) => {
          if (!userId) return;
          const currentSettingsData = userSettings || {};
          const settingsPayload = {
              ...currentSettingsData,
              allowlist_websites: newAllowlist,
          };
          // Remove fields managed by DB or upsert logic
          delete settingsPayload.id;
          delete settingsPayload.user_id;
          delete settingsPayload.created_at;
          delete settingsPayload.updated_at;

          try {
              await settingsApi.upsertSettings(userId, { settings: settingsPayload });
              // Maybe a subtle confirmation instead of toast: console.log("Allowlist autosaved");
          } catch (error) {
              console.error("Error saving allowlist:", error);
              toast({ title: "Error Saving Allowlist", description: `Could not save changes: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive"});
          }
      }, 1500),
      [userId, userSettings, toast]
  );

 // --- Blocklist Handlers ---
 const handleAddWebsite = async () => {
   if (!newUrl || !userId) return;
   let domain = newUrl.trim();
   try {
     if (domain.includes('://')) domain = new URL(domain).hostname;
     if (!domain.match(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i)) throw new Error("Invalid domain format");
     domain = domain.replace(/^www\./i, '');
   } catch (error) {
     toast({ title: "Invalid Website URL", description: "Please enter a valid domain name (e.g., example.com)", variant: "destructive"});
     return;
   }
   if (blockRules.some(rule => rule.type === 'website' && rule.target === domain)) {
     toast({ title: "Duplicate Website", description: `${domain} is already in the block list.`, variant: "destructive"});
     return;
   }
   const timeLimit = newUrlTimeLimit ? parseInt(newUrlTimeLimit, 10) : null;
   const newRulePayload = { user_id: userId, name: domain, type: 'website' as const, target: domain, is_active: true, time_limit_minutes: (timeLimit && !isNaN(timeLimit) && timeLimit > 0) ? timeLimit : null };
   const originalUrl = newUrl; const originalTimeLimit = newUrlTimeLimit;
   setNewUrl(""); setNewUrlTimeLimit("");
   try {
     const createdRule = await distractionRulesApi.createRule(newRulePayload);
     if (createdRule && createdRule.length > 0) {
         setBlockRules(prev => [...prev, createdRule[0]]);
         toast({ title: "Website Added", description: `${domain} is now blocked.` });
     } else throw new Error("Failed to get created rule data back from API.");
   } catch (error: any) {
     console.error("Error adding website rule:", error);
     toast({ title: "Error Adding Website", description: `Could not block ${domain}: ${error.message}`, variant: "destructive"});
     setNewUrl(originalUrl); setNewUrlTimeLimit(originalTimeLimit);
   }
 };

 const handleRemoveRule = async (ruleId: string) => {
   const rule = blockRules.find(r => r.id === ruleId); if (!rule) return;
   const originalRules = [...blockRules];
   setBlockRules(currentRules => currentRules.filter(r => r.id !== ruleId));
   try {
     await distractionRulesApi.deleteRule(ruleId);
     toast({ title: `${rule.type === 'website' ? 'Website' : 'App'} Removed`, description: `"${rule.target}" is no longer blocked.` });
   } catch (error: any) {
     console.error(`Error removing ${rule.type} rule:`, error);
     toast({ title: `Error Removing ${rule.type === 'website' ? 'Website' : 'App'}`, description: `Could not remove block for "${rule.target}": ${error.message}`, variant: "destructive"});
     setBlockRules(originalRules);
   }
 };

 const handleToggleRuleActive = async (ruleId: string) => {
   const rule = blockRules.find(r => r.id === ruleId); if (!rule) return;
   const newActiveState = !rule.is_active;
   const originalRules = [...blockRules];
   setBlockRules(currentRules => currentRules.map(r => r.id === ruleId ? { ...r, is_active: newActiveState } : r));
   try {
     await distractionRulesApi.updateRule(ruleId, { is_active: newActiveState });
   } catch (error: any) {
     console.error(`Error toggling ${rule.type} rule:`, error);
     toast({ title: "Error Updating Status", description: `Could not toggle blocking for "${rule.target}": ${error.message}`, variant: "destructive"});
     setBlockRules(originalRules);
   }
 };

 const handleAddApp = async () => {
   if (!newApp || !userId) return;
   const appName = newApp.trim();
   if (blockRules.some(rule => rule.type === 'app' && rule.target.toLowerCase() === appName.toLowerCase())) {
     toast({ title: "Duplicate App", description: `${appName} is already in the block list.`, variant: "destructive"});
     return;
   }
   const newRulePayload = { user_id: userId, name: appName, type: 'app' as const, target: appName, is_active: true };
   const originalAppName = newApp; setNewApp("");
   try {
      const createdRule = await distractionRulesApi.createRule(newRulePayload);
      if (createdRule && createdRule.length > 0) {
          setBlockRules(prev => [...prev, createdRule[0]]);
          toast({ title: "App Added", description: `${appName} is now blocked.` });
      } else throw new Error("Failed to get created rule data back from API.");
   } catch (error: any) {
     console.error("Error adding app rule:", error);
     toast({ title: "Error Adding App", description: `Could not block ${appName}: ${error.message}`, variant: "destructive"});
     setNewApp(originalAppName);
   }
 };

 // --- Allowlist Handlers ---
 const handleAddAllowedWebsite = () => {
     if (!newAllowedUrl) return;
     const domain = newAllowedUrl.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
     if (!domain || allowlistUrls.includes(domain)) {
         toast({ title: "Invalid or Duplicate", description: `${domain} is invalid or already on the allowlist.`, variant: "destructive" });
         return;
     }
     const newAllowlist = [...allowlistUrls, domain].sort();
     setAllowlistUrls(newAllowlist); // Optimistic UI update
     setNewAllowedUrl('');
     toast({ title: "Allowlist Updated", description: `${domain} added.` });
     saveAllowlistDebounced(newAllowlist); // Save debounced
 };

 const handleRemoveAllowedWebsite = (urlToRemove: string) => {
     const newAllowlist = allowlistUrls.filter(url => url !== urlToRemove);
     setAllowlistUrls(newAllowlist); // Optimistic UI update
     toast({ title: "Allowlist Updated", description: `${urlToRemove} removed.` });
     saveAllowlistDebounced(newAllowlist); // Save debounced
 };

 // --- Emergency Override Handler ---
 const handleEmergencyOverride = async () => {
     if (!overrideReason.trim()) {
         toast({title: "Reason Required", description: "Please provide a reason for overriding.", variant: "destructive"});
         return;
     }
     setIsOverriding(true);
     console.log("Emergency Override Triggered. Reason:", overrideReason);
     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate
     toast({ title: "Blocker Temporarily Disabled", description: "Remember to re-enable it later."});
     setShowOverrideDialog(false);
     setOverrideReason("");
     setIsOverriding(false);
     // TODO: Implement actual blocking pause logic
 };

  // --- Filtered Rules Logic (defined before return) ---
  const filteredRules = blockRules?.filter(rule =>
    (activeTab === 'websites' && rule.type === 'website') ||
    (activeTab === 'apps' && rule.type === 'app')
  ) || [];

 // --- Auth Check ---
 if (!userId && !(isLoadingRules || isLoadingSettings)) {
   return (
     <Card className="w-full max-w-2xl mx-auto my-8">
       <CardHeader className="pb-2"><CardTitle className="text-2xl font-bold">Distraction Blocker</CardTitle></CardHeader>
       <CardContent>
         <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
           <Shield className="h-12 w-12 text-muted-foreground" />
           <h3 className="text-lg font-medium">Sign in to Manage Block List</h3>
           <p className="text-sm text-muted-foreground">Please sign in to view and manage your blocked websites and apps.</p>
         </div>
       </CardContent>
     </Card>
   );
 }

 // --- Main Return ---
 return (
    <div className="max-w-6xl mx-auto p-4">
     <div className="space-y-8">
       <div className="flex justify-between items-center">
         <div>
           <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Distraction Blocker</h1>
           <p className="text-muted-foreground">Manage rules to block websites and apps that steal your focus.</p>
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 space-y-6">
           <Tabs value={activeTab} onValueChange={setActiveTab}>
             <TabsList className="grid grid-cols-4">
               <TabsTrigger value="websites" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Websites</TabsTrigger>
               <TabsTrigger value="apps" className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Apps</TabsTrigger>
               <TabsTrigger value="stats" className="flex items-center gap-2"><BarChart className="h-4 w-4" /> Stats</TabsTrigger>
               <TabsTrigger value="notifications" className="flex items-center gap-2" disabled><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
             </TabsList>

             {/* Website Blocker Tab */}
             <TabsContent value="websites" className="space-y-6">
               <Card>
                 <CardHeader className="pb-3"><CardTitle>Add Website to Block</CardTitle><CardDescription>Enter the domain name (e.g., example.com).</CardDescription></CardHeader>
                 <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="block-url">Website Domain</Label>
                         <form onSubmit={(e) => { e.preventDefault(); handleAddWebsite(); }} className="flex gap-2">
                           <Input id="block-url" placeholder="e.g., example.com" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} aria-label="Website domain to block" className="flex-grow"/>
                           <Input id="block-url-limit" type="number" placeholder="Limit (min)" value={newUrlTimeLimit} onChange={(e) => setNewUrlTimeLimit(e.target.value)} className="w-28" min="0" step="5" aria-label="Daily time limit in minutes"/>
                           <Button type="submit" disabled={!newUrl.trim()} aria-label="Add website"><Plus className="h-4 w-4" /></Button>
                         </form>
                       </div>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                 <CardHeader className="pb-3"><CardTitle>Blocked Websites</CardTitle><CardDescription>Toggle the switch to temporarily allow access.</CardDescription></CardHeader>
                 <CardContent>
                   {(isLoadingRules || isLoadingSettings) ? (
                     <div className="space-y-3 py-4">
                       <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" />
                     </div>
                   ) : filteredRules.length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground">
                       <Ban className="h-10 w-10 mx-auto mb-2 opacity-25" /><p className="font-medium">No Websites Blocked</p><p className="text-sm">Add website domains above to start blocking.</p>
                     </div>
                   ) : (
                      <ScrollArea className="h-[300px] -mr-3 pr-3">
                        <div className="space-y-2">
                          {filteredRules.map((rule: BlockRule) => ( // Added type
                            <motion.div key={rule.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${rule.is_active ? 'border-border/80 bg-background hover:bg-muted/50' : 'border-border/40 bg-muted/30 opacity-60 hover:opacity-100'}`}
                            >
                             <div className="flex items-center gap-3 flex-grow overflow-hidden mr-2">
                                <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="font-medium truncate" title={rule.target}>{rule.target}</p>
                                  {/* Display basic schedule info - still uses potentially non-existent fields */}
                                  {(rule.days && rule.days.length > 0 && rule.schedule_start && rule.schedule_end) && (
                                     <p className="text-xs text-muted-foreground truncate">{rule.days.join(', ')} | {rule.schedule_start} - {rule.schedule_end}</p>
                                  )}
                                </div>
                                {rule.time_limit_minutes && (<Badge variant="outline" className="text-xs mt-1" title={`Daily Limit: ${rule.time_limit_minutes} min`}><Hourglass className="h-3 w-3 mr-1"/> {rule.time_limit_minutes} min/day</Badge>)}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0"> {/* Reduced gap */}
                                <Switch checked={rule.is_active} onCheckedChange={() => handleToggleRuleActive(rule.id)} aria-label={`Toggle blocking for ${rule.target}`}/>
                                {/* Schedule Button Commented Out */}
                                {/* <Button size="icon" variant="ghost" onClick={() => openScheduleDialog(rule)} aria-label={`Edit schedule for ${rule.target}`} className="text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 h-8 w-8"><CalendarDays className="h-4 w-4"/></Button> */}
                                <Button size="icon" variant="ghost" onClick={() => handleRemoveRule(rule.id)} aria-label={`Remove block for ${rule.target}`} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                 </CardContent>
               </Card>

               {/* Allowlist Card */}
                <Card className="mt-6">
                    <CardHeader className="pb-3"><CardTitle>Allowlist Websites</CardTitle><CardDescription>Websites added here will *always* be accessible.</CardDescription></CardHeader>
                    <CardContent>
                         <form onSubmit={(e) => { e.preventDefault(); handleAddAllowedWebsite(); }} className="flex gap-2 mb-4">
                            <Input id="allow-url" placeholder="e.g., trusted-tool.com" value={newAllowedUrl} onChange={(e) => setNewAllowedUrl(e.target.value)} aria-label="Website domain to allowlist" className="flex-grow"/>
                            <Button type="submit" disabled={!newAllowedUrl.trim()} aria-label="Add website to allowlist"><Plus className="h-4 w-4" /> Add</Button>
                        </form>
                         {allowlistUrls.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Allowlist is empty.</p>
                         ) : (
                            <ScrollArea className="h-[150px] -mr-3 pr-3">
                                <div className="space-y-2">
                                    {allowlistUrls.map((url, index) => (
                                        <motion.div key={url + index} layout initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                                            className="flex items-center justify-between p-2 rounded-md border bg-green-50 border-green-200 text-sm"
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                <CheckCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                <span className="truncate text-green-800 font-medium" title={url}>{url}</span>
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => handleRemoveAllowedWebsite(url)} aria-label={`Remove ${url} from allowlist`} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            </ScrollArea>
                         )}
                    </CardContent>
                </Card>

             </TabsContent>

             {/* App Blocker Tab */}
             <TabsContent value="apps" className="space-y-6">
               <Card>
                 <CardHeader className="pb-3"><CardTitle>Add App to Block</CardTitle><CardDescription>Enter the name of the application (e.g., Slack, Discord).</CardDescription></CardHeader>
                 <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="block-app">App Name</Label>
                         <form onSubmit={(e) => { e.preventDefault(); handleAddApp(); }} className="flex gap-2">
                           <Input id="block-app" placeholder="e.g., Slack, Discord" value={newApp} onChange={(e) => setNewApp(e.target.value)} aria-label="Application name to block" className="flex-grow"/>
                           <Button type="submit" disabled={!newApp.trim()} aria-label="Add application"><Plus className="h-4 w-4" /></Button>
                         </form>
                       </div>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                 <CardHeader className="pb-3"><CardTitle>Blocked Apps</CardTitle><CardDescription>Note: App blocking requires system integration (not implemented).</CardDescription></CardHeader>
                 <CardContent>
                   {(isLoadingRules || isLoadingSettings) ? (
                      <div className="space-y-3 py-4">
                        <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
                      </div>
                   ) : filteredRules.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Monitor className="h-10 w-10 mx-auto mb-2 opacity-25" /><p className="font-medium">No Apps Blocked</p><p className="text-sm">Add app names above.</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px] -mr-3 pr-3">
                        <div className="space-y-2">
                          {filteredRules.map((rule: BlockRule) => ( // Added type
                            <motion.div key={rule.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${rule.is_active ? 'border-border/80 bg-background hover:bg-muted/50' : 'border-border/40 bg-muted/30 opacity-60 hover:opacity-100'}`}
                            >
                              <div className="flex items-center gap-3 flex-grow overflow-hidden mr-2">
                                <Smartphone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="font-medium truncate" title={rule.target}>{rule.target}</p>
                                  {(rule.days && rule.days.length > 0 && rule.schedule_start && rule.schedule_end) && (
                                     <p className="text-xs text-muted-foreground truncate">{rule.days.join(', ')} | {rule.schedule_start} - {rule.schedule_end}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0"> {/* Reduced gap */}
                                <Switch checked={rule.is_active} onCheckedChange={() => handleToggleRuleActive(rule.id)} aria-label={`Toggle blocking for ${rule.target}`}/>
                                {/* Schedule Button Commented Out */}
                                {/* <Button size="icon" variant="ghost" onClick={() => openScheduleDialog(rule)} aria-label={`Edit schedule for ${rule.target}`} className="text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 h-8 w-8"><CalendarDays className="h-4 w-4"/></Button> */}
                                <Button size="icon" variant="ghost" onClick={() => handleRemoveRule(rule.id)} aria-label={`Remove block for ${rule.target}`} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                 </CardContent>
               </Card>
             </TabsContent>

             {/* Notification Blocker Tab */}
             <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Notification Management</CardTitle><CardDescription>Control which notifications can interrupt you.</CardDescription></CardHeader>
                  <CardContent className="text-center text-muted-foreground py-8">
                     <Bell className="h-10 w-10 mx-auto mb-2 opacity-25"/><p className="font-medium">Coming Soon</p><p className="text-sm">Fine-grained notification controls are planned.</p>
                  </CardContent>
                </Card>
             </TabsContent>

            {/* Stats Dashboard Tab */}
            <TabsContent value="stats">
               <DistractionStatsDashboard />
            </TabsContent>
           </Tabs>

          {/* Digital Minimalism Guide - Rendered below tabs in the same column */}
          <div className="mt-6">
             <DigitalMinimalismGuide />
          </div>

         </div>

         {/* Side Panel (Placeholder) */}
          <div className="space-y-6">
              <Card className="bg-muted/30 border-dashed border-border/50">
                <CardHeader className="pb-2 pt-4"><CardTitle className="text-lg flex items-center gap-2"><Info className="h-4 w-4" /> Info & Tips</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground pt-3">
                    <p className="text-xs flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-yellow-600"/>Actual blocking requires browser extension or system integration (not implemented).</p>
                    <h4 className="font-medium text-foreground pt-2">Environmental Tips:</h4>
                    <ul className="list-none space-y-2 pl-2">
                        {environmentalTips.map((tip, index) => (
                             <li key={index} className="flex items-start gap-2 text-xs">
                                <tip.icon className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0"/>
                                <span>{tip.text}</span>
                             </li>
                         ))}
                     </ul>
                      <div className="pt-3 border-t">
                         <Button variant="outline" size="sm" className="w-full" onClick={() => setShowOverrideDialog(true)}>
                             <Siren className="h-4 w-4 mr-2"/> Emergency Override
                         </Button>
                     </div>
                </CardContent>
              </Card>
          </div>
       </div> {/* Closing grid div */}
     </div> {/* Closing space-y-8 div */}

      {/* Dialogs */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
            <DialogHeader><DialogTitle>Emergency Override</DialogTitle><DialogDescription>Briefly reflect before temporarily disabling the blocker.</DialogDescription></DialogHeader>
            <div className="py-4 space-y-4">
                 <div>
                     <Label htmlFor="override-reflection">Why do you need to override the blocker right now?</Label>
                     <Textarea id="override-reflection" value={overrideReason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOverrideReason(e.target.value)} placeholder="Take a breath. Is this truly necessary...?" className="mt-1" rows={3}/>
                 </div>
                 <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" /><AlertTitle className="text-yellow-800">Pause & Reflect</AlertTitle><AlertDescription className="text-yellow-700">Consider if this aligns with your focus goals. Could it wait?</AlertDescription>
                 </Alert>
            </div>
            <DialogFooter>
                 <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>Cancel</Button>
                 <Button onClick={handleEmergencyOverride} disabled={!overrideReason.trim() || isOverriding}>{isOverriding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Confirm Override </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

     {/* Schedule Edit Dialog Invocation (Remains Commented Out) */}
     {/* <ScheduleEditDialog ... /> */}

   </div> // Closing div for max-w-6xl container
  ); // Closing parenthesis for return statement
} // Closing brace for DistractionBlocker function

// --- Schedule Edit Dialog (Commented out until fully implemented) ---
/*
function ScheduleEditDialog({ rule, isOpen, onClose, onSave, selectedDays, setSelectedDays, startTime, setStartTime, endTime, setEndTime }: {
    rule: BlockRule | null; isOpen: boolean; onClose: () => void; onSave: () => void; selectedDays: string[]; setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>; startTime: string; setStartTime: React.Dispatch<React.SetStateAction<string>>; endTime: string; setEndTime: React.Dispatch<React.SetStateAction<string>>;
}) {
   if (!isOpen || !rule) return null;
   const handleDayToggle = (dayValue: string) => { setSelectedDays(prev => prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]); };
   return (
     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
       <DialogContent className="sm:max-w-[480px]">
         <DialogHeader><DialogTitle>Edit Schedule for "{rule.target}"</DialogTitle><DialogDescription>Set the days and times this rule should be active.</DialogDescription></DialogHeader>
         <div className="grid gap-6 py-4">
            // Days Selection
            <div>
                <Label className="text-sm font-medium mb-2 block">Active Days</Label>
                <div className="flex flex-wrap gap-2"> {weekDays.map(day => (<Button key={day.value} variant={selectedDays.includes(day.value) ? "default" : "outline"} size="sm" onClick={() => handleDayToggle(day.value)} className="capitalize w-16">{day.value}</Button>))} </div>
                 <div className="flex gap-2 mt-2"> <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setSelectedDays(weekDays.map(d=>d.value))}>All</Button> <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setSelectedDays(weekDays.slice(0,5).map(d=>d.value))}>Weekdays</Button> <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setSelectedDays([])}>None</Button> </div>
            </div>
            // Time Selection
            <div className="grid grid-cols-2 gap-4"> <div> <Label htmlFor="start-time" className="text-sm font-medium">Start Time</Label> <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" /> </div> <div> <Label htmlFor="end-time" className="text-sm font-medium">End Time</Label> <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" /> </div> </div>
            // TODO: Add option to switch between 'custom' and 'always'/'during_focus'
         </div>
         <DialogFooter> <Button variant="outline" onClick={onClose}>Cancel</Button> <Button onClick={onSave}>Save Schedule</Button> </DialogFooter>
       </DialogContent>
     </Dialog>
   );
}
*/
