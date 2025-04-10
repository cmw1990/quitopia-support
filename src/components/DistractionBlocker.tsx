import React, { useState, useEffect, useCallback } from 'react'
import { supabaseRequest } from '@/utils/supabaseRequest'
import { supabase } from '@/integrations/supabase/supabase-client'
import type { User } from '@supabase/supabase-js'
import { Plus, Trash2, Power, PowerOff, ListFilter, Clock, Ban, ShieldCheck, BarChartHorizontal, Pencil, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface BlockedSite {
  id: string
  url: string
  name: string
  category: 'social' | 'entertainment' | 'news' | 'shopping' | 'custom'
  blockStrength: 'soft' | 'medium' | 'hard'
  isActive: boolean
  user_id: string
}

export interface AllowlistSite {
    id: string
    url: string
    user_id: string
    created_at?: string
}

export interface BlockingSchedule {
    id: string;
    user_id: string;
    days_of_week: number[]; // Array of numbers 0 (Sun) - 6 (Sat)
    start_time: string; // Format HH:MM (24-hour)
    end_time: string; // Format HH:MM (24-hour)
    is_active: boolean;
    created_at?: string;
}

export const DistractionBlocker: React.FC = () => {
  const [sites, setSites] = useState<BlockedSite[]>([])
  const [allowlistSites, setAllowlistSites] = useState<AllowlistSite[]>([])
  const [schedules, setSchedules] = useState<BlockingSchedule[]>([])
  const [newSiteUrl, setNewSiteUrl] = useState('')
  const [newSiteName, setNewSiteName] = useState('')
  const [newSiteCategory, setNewSiteCategory] = useState<BlockedSite['category']>('custom')
  const [newSiteBlockStrength, setNewSiteBlockStrength] = useState<BlockedSite['blockStrength']>('medium')
  const [newAllowlistUrl, setNewAllowlistUrl] = useState('')
  const [isLoadingBlocklist, setIsLoadingBlocklist] = useState(true)
  const [isLoadingAllowlist, setIsLoadingAllowlist] = useState(true)
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true)
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  
  const isLoading = isLoadingBlocklist || isLoadingAllowlist || isLoadingSchedules || isLoadingAnalytics

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      setUserId(user?.id);
      if (user?.id) {
        fetchBlockedSites(user.id);
        fetchAllowlistSites(user.id);
        fetchSchedules(user.id);
        fetchAnalyticsData(user.id);
      } else {
        setIsLoadingBlocklist(false);
        setIsLoadingAllowlist(false);
        setIsLoadingSchedules(false);
        setIsLoadingAnalytics(false);
      }
    });
  }, []);

  const fetchBlockedSites = async (currentUserId: string) => {
    setIsLoadingBlocklist(true);
    const { data, error } = await supabaseRequest<Omit<BlockedSite, 'user_id'>[]>(
      `/rest/v1/blocked_sites?user_id=eq.${currentUserId}&select=id,url,name,category,blockStrength,isActive`,
      { method: 'GET' }
    );
    if (data) {
      setSites(data.map(site => ({ ...site, user_id: currentUserId })));
    } else {
      console.error('Error fetching blocked sites:', error?.message);
    }
    setIsLoadingBlocklist(false);
  };
  
  const fetchAllowlistSites = async (currentUserId: string) => {
      setIsLoadingAllowlist(true);
      const { data, error } = await supabaseRequest<AllowlistSite[]>(
          `/rest/v1/allowlist_sites?user_id=eq.${currentUserId}&select=*`,
          { method: 'GET' }
      );
      if (data) {
          setAllowlistSites(data);
      } else {
          console.error('Error fetching allowlist sites:', error?.message);
      }
      setIsLoadingAllowlist(false);
  };

  const fetchSchedules = async (currentUserId: string) => {
      setIsLoadingSchedules(true);
      const { data, error } = await supabaseRequest<BlockingSchedule[]>(
          `/rest/v1/blocking_schedules?user_id=eq.${currentUserId}&select=*`,
          { method: 'GET' }
      );
      if (data) {
          setSchedules(data.map(schedule => ({ ...schedule, days_of_week: schedule.days_of_week || [] })));
      } else {
          console.error('Error fetching schedules:', error?.message);
      }
      setIsLoadingSchedules(false);
  };

  const fetchAnalyticsData = async (currentUserId: string) => {
      setIsLoadingAnalytics(true);
      console.log("Fetching analytics data for user:", currentUserId); 
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData({
          blockedAttempts: Math.floor(Math.random() * 100),
          topDistractingSites: [
              { name: 'Social Media Site', count: Math.floor(Math.random() * 50) },
              { name: 'News Site', count: Math.floor(Math.random() * 30) },
              { name: 'Shopping Site', count: Math.floor(Math.random() * 20) },
          ],
          focusTimeScheduledVsActual: {
              scheduled: Math.floor(Math.random() * 480),
              actual: Math.floor(Math.random() * 400),
          }
      }); 
      setIsLoadingAnalytics(false);
  };

  const handleAddSite = async () => {
    if (!newSiteUrl.trim() || !userId) return;

    const siteData: Omit<BlockedSite, 'id'> & { user_id: string } = {
      url: newSiteUrl.trim(),
      name: newSiteName.trim() || newSiteUrl.trim(),
      category: newSiteCategory,
      blockStrength: newSiteBlockStrength,
      isActive: true,
      user_id: userId,
    };

    const tempId = `temp-${Date.now()}`;
    const optimisticSite: BlockedSite = { ...siteData, id: tempId };
    setSites(prev => [...prev, optimisticSite]);
    setNewSiteUrl('');
    setNewSiteName('');

    const { data, error } = await supabaseRequest<BlockedSite[]>(
        '/rest/v1/blocked_sites',
        { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify(siteData)
        }
    );

    if (error || !data || data.length === 0) {
      console.error('Error adding site:', error?.message);
      setSites(prev => prev.filter(site => site.id !== tempId));
    } else {
        setSites(prev => prev.map(site => site.id === tempId ? data[0] : site));
        console.log('Site added successfully');
    }
  };

  const handleRemoveSite = async (siteId: string) => {
    const originalSites = sites;
    setSites(prev => prev.filter(site => site.id !== siteId));

    const { error } = await supabaseRequest(
        `/rest/v1/blocked_sites?id=eq.${siteId}`,
        { method: 'DELETE' }
    );

    if (error) {
      console.error('Error removing site:', error.message);
      setSites(originalSites);
    }
  };

  const handleToggleSite = async (siteId: string) => {
    const siteToUpdate = sites.find(site => site.id === siteId);
    if (!siteToUpdate) return;

    const originalSites = sites;
    const newIsActive = !siteToUpdate.isActive;
    
    setSites(prev => prev.map(site => 
        site.id === siteId ? { ...site, isActive: newIsActive } : site
    ));

    const { error } = await supabaseRequest(
        `/rest/v1/blocked_sites?id=eq.${siteId}`,
        { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ isActive: newIsActive })
        }
    );

    if (error) {
      console.error('Error updating site status:', error.message);
      setSites(originalSites);
    }
  };

  const handleAddAllowlistSite = async () => {
      if (!newAllowlistUrl.trim() || !userId) return;
      const urlToAdd = newAllowlistUrl.trim();
      
      if (allowlistSites.some(site => site.url === urlToAdd)) {
          console.warn('URL already in allowlist');
          setNewAllowlistUrl('');
          return;
      }
      
      const allowlistData = { url: urlToAdd, user_id: userId };
      const tempId = `temp-allow-${Date.now()}`;
      const optimisticSite: AllowlistSite = { ...allowlistData, id: tempId };
      setAllowlistSites(prev => [...prev, optimisticSite]);
      setNewAllowlistUrl('');
      
      const { data, error } = await supabaseRequest<AllowlistSite[]>(
          '/rest/v1/allowlist_sites',
          { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
              body: JSON.stringify(allowlistData)
          }
      );

      if (error || !data || data.length === 0) {
          console.error('Error adding allowlist site:', error?.message);
          setAllowlistSites(prev => prev.filter(site => site.id !== tempId));
      } else {
          setAllowlistSites(prev => prev.map(site => site.id === tempId ? data[0] : site));
      }
  };

  const handleRemoveAllowlistSite = async (siteId: string) => {
      const originalSites = allowlistSites;
      setAllowlistSites(prev => prev.filter(site => site.id !== siteId));

      const { error } = await supabaseRequest(
          `/rest/v1/allowlist_sites?id=eq.${siteId}`,
          { method: 'DELETE' }
      );

      if (error) {
          console.error('Error removing allowlist site:', error.message);
          setAllowlistSites(originalSites);
      }
  };

  const handleAddSchedule = async (newScheduleData: Omit<BlockingSchedule, 'id' | 'user_id' | 'created_at'>) => {
    if (!userId) return;
    
    const schedulePayload = { ...newScheduleData, user_id: userId };
    const tempId = `temp-schedule-${Date.now()}`;
    const optimisticSchedule: BlockingSchedule = { ...schedulePayload, id: tempId };

    setSchedules(prev => [...prev, optimisticSchedule].sort((a, b) => a.start_time.localeCompare(b.start_time)));

    const { data, error } = await supabaseRequest<BlockingSchedule[]>(
        '/rest/v1/blocking_schedules',
        { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
            body: JSON.stringify(schedulePayload)
        }
    );

    if (error || !data || data.length === 0) {
        console.error('Error adding schedule:', error?.message);
        setSchedules(prev => prev.filter(s => s.id !== tempId));
    } else {
        setSchedules(prev => prev.map(s => s.id === tempId ? data[0] : s)
                                 .sort((a, b) => a.start_time.localeCompare(b.start_time)));
    }
  };

  const handleUpdateSchedule = async (scheduleId: string, updatedData: Partial<Omit<BlockingSchedule, 'id' | 'user_id' | 'created_at'>>) => {
    if (!userId) return;
    
    const originalSchedules = schedules;
    const optimisticUpdate = (prev: BlockingSchedule[]) => 
        prev.map(s => s.id === scheduleId ? { ...s, ...updatedData } : s)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

    setSchedules(optimisticUpdate);

    const { error } = await supabaseRequest(
        `/rest/v1/blocking_schedules?id=eq.${scheduleId}`,
        { 
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify(updatedData)
        }
    );

    if (error) {
        console.error('Error updating schedule:', error?.message);
        setSchedules(originalSchedules);
    }
  };
  
  const handleToggleScheduleActive = async (scheduleId: string) => {
     const schedule = schedules.find(s => s.id === scheduleId);
     if (!schedule) return;
     await handleUpdateSchedule(scheduleId, { is_active: !schedule.is_active }); 
  };

  const handleRemoveSchedule = async (scheduleId: string) => {
    if (!userId) return;
    const originalSchedules = schedules;
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));

    const { error } = await supabaseRequest(
        `/rest/v1/blocking_schedules?id=eq.${scheduleId}`,
        { method: 'DELETE' }
    );

    if (error) {
        console.error('Error removing schedule:', error.message);
        setSchedules(originalSchedules);
    }
  };

  const formatDays = (days: number[]): string => {
    if (!days || days.length === 0) return 'No days selected';
    if (days.length === 7) return 'Every day';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.sort().map(d => dayNames[d]).join(', ');
  };

  const AddSiteForm = () => (
     <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Site to Blocklist</CardTitle>
          <CardDescription>Enter the URL and details of the site you want to block.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-site-url">Site URL</Label>
                <Input
                  id="new-site-url"
                  type="text"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  placeholder="e.g., youtube.com"
                />
              </div>
              <div className="space-y-1.5">
                 <Label htmlFor="new-site-name">Display Name (Optional)</Label>
                 <Input
                   id="new-site-name"
                   type="text"
                   value={newSiteName}
                   onChange={(e) => setNewSiteName(e.target.value)}
                   placeholder="e.g., YouTube"
                 />
               </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-site-category">Category</Label>
              <Select value={newSiteCategory} onValueChange={(value) => setNewSiteCategory(value as BlockedSite['category'])}>
                <SelectTrigger id="new-site-category"><SelectValue placeholder="Select category..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-site-strength">Block Strength</Label>
              <Select value={newSiteBlockStrength} onValueChange={(value) => setNewSiteBlockStrength(value as BlockedSite['blockStrength'])}>
                <SelectTrigger id="new-site-strength"><SelectValue placeholder="Select strength..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="soft">Soft (Warning)</SelectItem>
                  <SelectItem value="medium">Medium (Delay)</SelectItem>
                  <SelectItem value="hard">Hard (Block)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAddSite} disabled={!newSiteUrl.trim() || !userId || isLoading}>
            <Plus className="mr-2 h-4 w-4" /> Add Site
          </Button>
        </CardContent>
      </Card>
  );

  const SiteList = () => (
     <Card>
        <CardHeader>
          <CardTitle className="text-lg">Blocklist</CardTitle>
           <CardDescription>Sites currently being managed by the blocker.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading sites...</p>
          ) : sites.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No sites added to the blocklist yet.</p>
          ) : (
            <div className="space-y-3">
              {sites.map(site => (
                <div 
                  key={site.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                     <TooltipProvider delayDuration={200}>
                        <Tooltip>
                           <TooltipTrigger asChild>
                              <Switch
                                checked={site.isActive}
                                onCheckedChange={() => handleToggleSite(site.id)}
                                aria-label={`Toggle blocking for ${site.name || site.url}`}
                              />
                           </TooltipTrigger>
                           <TooltipContent>
                              <p>{site.isActive ? 'Disable' : 'Enable'} blocking for this site</p>
                           </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                     
                    <div className="flex-grow min-w-0">
                      <div className="font-medium truncate" title={site.name || site.url}>{site.name || site.url}</div>
                      <div className="text-sm text-muted-foreground truncate" title={site.url}>{site.url}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        <span className="capitalize">{site.category}</span> / <span className="capitalize">{site.blockStrength}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive flex-shrink-0 ml-2"
                    onClick={() => handleRemoveSite(site.id)}
                    aria-label={`Remove ${site.name || site.url}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
  );
  
  const AllowListTab = () => (
      <Card>
          <CardHeader>
              <CardTitle>Allowlist</CardTitle>
              <CardDescription>Sites added here will always be accessible, even during blocking periods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex gap-2 items-end">
                  <div className="flex-grow space-y-1.5">
                      <Label htmlFor="new-allowlist-url">Allow Site URL</Label>
                      <Input
                          id="new-allowlist-url"
                          type="text"
                          value={newAllowlistUrl}
                          onChange={(e) => setNewAllowlistUrl(e.target.value)}
                          placeholder="e.g., google.com"
                          disabled={!userId || isLoading}
                      />
                  </div>
                  <Button onClick={handleAddAllowlistSite} disabled={!newAllowlistUrl.trim() || !userId || isLoading}>
                      <Plus className="mr-2 h-4 w-4" /> Allow
                  </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                   <h3 className="text-sm font-medium text-muted-foreground">Allowed Sites</h3>
                   {isLoadingAllowlist ? (
                       <p className="text-center text-muted-foreground">Loading allowlist...</p>
                   ) : allowlistSites.length === 0 ? (
                       <p className="text-center text-muted-foreground py-4">No sites added to the allowlist yet.</p>
                   ) : (
                       allowlistSites.map(site => (
                           <div 
                             key={site.id} 
                             className="flex items-center justify-between p-3 border rounded-md bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                           >
                               <span className="font-mono text-sm truncate" title={site.url}>{site.url}</span>
                               <Button
                                 variant="ghost"
                                 size="icon"
                                 className="text-destructive hover:text-destructive flex-shrink-0 ml-2" 
                                 onClick={() => handleRemoveAllowlistSite(site.id)}
                                 aria-label={`Remove ${site.url} from allowlist`}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                           </div>
                       ))
                   )}
              </div>
          </CardContent>
      </Card>
  );
  
  interface ScheduleFormProps {
      schedule?: BlockingSchedule | null;
      onSave: (data: Omit<BlockingSchedule, 'id' | 'user_id' | 'created_at'>) => void;
      onUpdate: (id: string, data: Partial<Omit<BlockingSchedule, 'id' | 'user_id' | 'created_at'>>) => void;
      onCancel: () => void;
  }

  const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onSave, onUpdate, onCancel }) => {
      const [startTime, setStartTime] = useState(schedule?.start_time || '09:00');
      const [endTime, setEndTime] = useState(schedule?.end_time || '17:00');
      const [selectedDays, setSelectedDays] = useState<number[]>(schedule?.days_of_week || [1, 2, 3, 4, 5]);
      const [isActive, setIsActive] = useState(schedule?.is_active ?? true);
      
      const dayOptions = [
          { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' }, 
          { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' }, { id: 0, label: 'Sun' }
      ];
      
      const handleDayToggle = (dayId: number) => {
          setSelectedDays(prev => 
              prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
          );
      };
      
      const handleSave = () => {
          if (!startTime || !endTime || selectedDays.length === 0) {
              console.error("Invalid schedule data");
              return;
          }
          if (startTime >= endTime) {
               console.error("Start time must be before end time");
               return;
          }
          
          const scheduleData = { start_time: startTime, end_time: endTime, days_of_week: selectedDays.sort(), is_active: isActive };
          if (schedule) {
              onUpdate(schedule.id, scheduleData);
          } else {
              onSave(scheduleData);
          }
      };

      return (
          <div className="p-4 border rounded-md bg-muted/50 space-y-4 mb-4">
              <h4 className="font-semibold mb-3 text-center">{schedule ? 'Edit Schedule' : 'Add New Schedule'}</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
              </div>
              <div className="mb-4 space-y-1.5">
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-x-3 gap-y-2 pt-1">
                      {dayOptions.map(day => (
                          <div key={day.id} className="flex items-center space-x-2">
                              <Checkbox 
                                  id={`day-${day.id}`}
                                  checked={selectedDays.includes(day.id)}
                                  onCheckedChange={() => handleDayToggle(day.id)}
                              />
                              <Label htmlFor={`day-${day.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {day.label}
                              </Label>
                          </div>
                      ))}
                  </div>
              </div>
               <div className="flex items-center space-x-2 mb-4">
                    <Switch id="schedule-active" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="schedule-active">Enable this schedule</Label>
                </div>
              <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                  <Button type="submit" onClick={handleSave}><Save className="mr-2 h-4 w-4"/>{schedule ? 'Save Changes' : 'Add Schedule'}</Button>
              </div>
          </div>
      );
  };
  
  const ScheduleTab = () => {
      const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
      
      const handleEdit = (schedule: BlockingSchedule) => {
          setEditingScheduleId(schedule.id);
      };

      const handleSaveOrUpdate = (data: Omit<BlockingSchedule, 'id' | 'user_id' | 'created_at'>) => {
          handleAddSchedule(data);
          setEditingScheduleId(null);
      };
      
       const handleUpdateWrapper = (id: string, data: Partial<Omit<BlockingSchedule, 'id' | 'user_id' | 'created_at'>>) => {
          handleUpdateSchedule(id, data);
          setEditingScheduleId(null);
      };

      const handleCancel = () => {
          setEditingScheduleId(null);
      };

      return (
          <Card>
              <CardHeader>
                  <CardTitle>Blocking Schedule</CardTitle>
                  <CardDescription>Set specific times for automatic blocking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {editingScheduleId === 'new' && (
                       <ScheduleForm 
                          onSave={handleSaveOrUpdate} 
                          onUpdate={() => {}}
                          onCancel={handleCancel} 
                       />
                  )}
                  
                  <div>
                       <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium text-muted-foreground">Your Schedules</h3>
                          {editingScheduleId !== 'new' && (
                               <Button size="sm" variant="outline" onClick={() => setEditingScheduleId('new')}><Plus className="mr-2 h-4 w-4" /> Add New</Button>
                          )}
                       </div>
                       {isLoadingSchedules ? (
                           <p className="text-center text-muted-foreground">Loading schedules...</p>
                       ) : schedules.length === 0 && editingScheduleId !== 'new' ? (
                           <p className="text-center text-muted-foreground py-4">No schedules defined yet. Click 'Add New' to create one.</p>
                       ) : (
                           <div className="space-y-3">
                               {schedules.map(schedule => (
                                  editingScheduleId === schedule.id ? (
                                      <ScheduleForm 
                                          key={schedule.id} 
                                          schedule={schedule} 
                                          onSave={() => {}}
                                          onUpdate={handleUpdateWrapper} 
                                          onCancel={handleCancel} 
                                      />
                                  ) : (
                                      <div key={schedule.id} className={`flex items-center justify-between p-3 border rounded-md transition-colors ${schedule.is_active ? 'bg-background hover:bg-muted/50' : 'bg-muted/30 opacity-60 hover:opacity-80'}`}>
                                           <div className="flex items-center gap-3 flex-grow min-w-0">
                                               <Switch 
                                                 checked={schedule.is_active} 
                                                 onCheckedChange={() => handleToggleScheduleActive(schedule.id)}
                                                 aria-label={`Toggle schedule activity`}
                                               />
                                               <div className="flex-grow min-w-0">
                                                    <div className="font-mono text-sm font-semibold">{schedule.start_time} - {schedule.end_time}</div>
                                                    <div className="text-xs text-muted-foreground">{formatDays(schedule.days_of_week)}</div>
                                               </div>
                                           </div>
                                           <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)} className="text-muted-foreground"><Pencil className="h-4 w-4"/></Button> 
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveSchedule(schedule.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                           </div>
                                       </div>
                                   )
                               ))}
                           </div>
                       )}
                  </div>
              </CardContent>
          </Card>
      );
  };

  const AnalyticsTab = () => (
      <Card>
          <CardHeader>
              <CardTitle>Distraction Analytics</CardTitle>
              <CardDescription>Insights into your distraction patterns and blocking effectiveness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              {isLoadingAnalytics ? (
                  <p className="text-center text-muted-foreground">Loading analytics data...</p>
              ) : !analyticsData ? (
                  <p className="text-center text-muted-foreground">Analytics data not available yet.</p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-muted/50">
                          <CardHeader>
                              <CardTitle className="text-base font-medium">Blocked Site Attempts (Last 7 Days)</CardTitle>
                              <Ban className="h-5 w-5 text-muted-foreground"/>
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold text-destructive">{analyticsData.blockedAttempts}</div>
                              <p className="text-xs text-muted-foreground">Note: Requires Browser Extension</p>
                          </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/50">
                          <CardHeader>
                              <CardTitle className="text-base font-medium">Focus Time (Scheduled vs Actual)</CardTitle>
                               <Clock className="h-5 w-5 text-muted-foreground"/>
                          </CardHeader>
                           <CardContent>
                                <div className="text-2xl font-bold">{Math.floor(analyticsData.focusTimeScheduledVsActual.actual / 60)}h {analyticsData.focusTimeScheduledVsActual.actual % 60}m</div>
                                <p className="text-xs text-muted-foreground">Scheduled: {Math.floor(analyticsData.focusTimeScheduledVsActual.scheduled / 60)}h {analyticsData.focusTimeScheduledVsActual.scheduled % 60}m</p>
                           </CardContent>
                      </Card>

                      <Card className="md:col-span-2 bg-muted/50">
                           <CardHeader>
                                <CardTitle className="text-base font-medium">Top Distracting Sites Logged</CardTitle>
                           </CardHeader>
                           <CardContent>
                               {analyticsData.topDistractingSites.length > 0 ? (
                                   <ul className="space-y-2">
                                       {analyticsData.topDistractingSites.map((site: any, index: number) => (
                                           <li key={index} className="flex justify-between text-sm">
                                               <span>{site.name}</span>
                                               <span className="font-medium">{site.count} distractions</span>
                                           </li>
                                       ))}
                                   </ul>
                               ) : (
                                   <p className="text-sm text-muted-foreground">No distraction data logged yet.</p>
                               )}
                           </CardContent>
                      </Card>
                  </div>
              )}
               <p className="text-xs text-center text-muted-foreground pt-4">Full analytics require the Easier Focus browser extension and detailed logging.</p>
          </CardContent>
      </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Distraction Management</h1>
      
      {!userId && !isLoading && (
         <Card className="bg-yellow-50 border-yellow-200"><CardHeader><CardTitle>Please Log In</CardTitle><CardDescription>Log in or sign up to manage your distraction blocklist.</CardDescription></CardHeader></Card>
      )}
      
      {userId && (
         <Tabs defaultValue="blocklist" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="blocklist"><Ban className="mr-2 h-4 w-4"/>Blocklist</TabsTrigger>
              <TabsTrigger value="allowlist"><ShieldCheck className="mr-2 h-4 w-4"/>Allowlist</TabsTrigger>
              <TabsTrigger value="schedule"><Clock className="mr-2 h-4 w-4"/>Schedule</TabsTrigger>
              <TabsTrigger value="analytics"><BarChartHorizontal className="mr-2 h-4 w-4"/>Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="blocklist" className="space-y-6">
               <AddSiteForm />
               <SiteList />
            </TabsContent>
            <TabsContent value="allowlist">
               <AllowListTab />
            </TabsContent>
            <TabsContent value="schedule">
               <ScheduleTab />
            </TabsContent>
            <TabsContent value="analytics">
               <AnalyticsTab />
            </TabsContent>
          </Tabs>
      )}
    </div>
  );
}

export default DistractionBlocker; 