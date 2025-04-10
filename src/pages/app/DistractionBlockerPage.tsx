import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ShieldAlert, Info, Construction, Loader2, ListFilter } from 'lucide-react'; // Added Loader2, ListFilter
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils'; // Import cn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";


// Assume type for blocklist items
interface BlockItem {
  id: string; // Use DB id as required key
  user_id: string;
  type: 'website' | 'keyword';
  value: string;
  enabled: boolean;
  created_at?: string;
}

// Assume type for user blocker settings
interface BlockerSettings {
    id?: string; // Only if settings have their own ID in the table
    user_id?: string;
    master_enabled: boolean;
    block_during_focus: boolean;
    // Add schedule settings later if needed
}

const DEFAULT_BLOCKER_SETTINGS: BlockerSettings = {
    master_enabled: false,
    block_during_focus: true,
};

const DistractionBlockerPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blocklist, setBlocklist] = useState<BlockItem[]>([]);
  const [settings, setSettings] = useState<BlockerSettings | null>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemType, setNewItemType] = useState<'website' | 'keyword'>('website');
  const [filterType, setFilterType] = useState<'all' | 'website' | 'keyword'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // For add/settings operations

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      let fetchedSettings: BlockerSettings | null = null;
      try {
        // Fetch blocker settings first
        const settingsData = await supabaseRequest<BlockerSettings[]>(
            'blocker_settings', // Replace with actual table name
            'GET',
            { filters: { user_id: user.id } }
        );
        if (settingsData && settingsData.length > 0) {
             fetchedSettings = settingsData[0];
             setSettings(settingsData[0]);
        } else {
             fetchedSettings = DEFAULT_BLOCKER_SETTINGS;
             setSettings(DEFAULT_BLOCKER_SETTINGS); // Default if none found
        }

         // Fetch blocklist items
         const listData = await supabaseRequest<BlockItem[]>(
             'blocklist_items', // Replace with actual table name
             'GET',
             { filters: { user_id: user.id } }
         );
         setBlocklist(listData || []);

      } catch (error: any) {
        console.error('Error fetching blocker data:', error);
        toast({ title: 'Error Loading Data', description: error.message, variant: 'destructive' });
        if (!fetchedSettings) setSettings(DEFAULT_BLOCKER_SETTINGS); // Ensure settings default on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, toast]);

  // Add new item to blocklist
  const handleAddItem = async () => {
    if (!newItemValue.trim() || !user?.id) return;

    const newItem: Partial<BlockItem> = {
        user_id: user.id,
        type: newItemType,
        value: newItemValue.trim(),
        enabled: true, // Default to enabled
    };

    setIsSaving(true);
    try {
        const savedItem = await supabaseRequest<BlockItem>(
            'blocklist_items',
            'POST',
            { data: newItem }
        );
        setBlocklist(prev => [savedItem, ...prev]); // Add to top for visibility
        setNewItemValue('');
        toast({ title: 'Item Added', description: `"${savedItem.value}" added to blocklist.` });
    } catch (error: any) {
        console.error('Error adding blocklist item:', error);
        toast({ title: 'Error Adding Item', description: error.message, variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };

  // Delete item from blocklist
  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = blocklist.find(item => item.id === itemId);
    if (!itemToDelete) return;

    // Optimistic UI update
    const originalBlocklist = blocklist;
    setBlocklist(prev => prev.filter(item => item.id !== itemId));

    try {
        await supabaseRequest<null>(
            'blocklist_items',
            'DELETE',
            { id: itemId }
        );
        toast({ title: 'Item Removed', description: `"${itemToDelete.value}" removed.` });
    } catch (error: any) {
        console.error('Error deleting blocklist item:', error);
        toast({ title: 'Error Removing Item', description: error.message, variant: 'destructive' });
        // Rollback UI on error
        setBlocklist(originalBlocklist);
    }
  };

  // Toggle item enabled state
  const handleToggleItemEnabled = async (itemToToggle: BlockItem) => {
    const newEnabledState = !itemToToggle.enabled;

    // Optimistic UI update
    const originalBlocklist = blocklist;
    setBlocklist(prev => prev.map(item => item.id === itemToToggle.id ? { ...item, enabled: newEnabledState } : item));

    try {
        await supabaseRequest<BlockItem>(
            'blocklist_items',
            'PATCH',
            { id: itemToToggle.id, data: { enabled: newEnabledState } }
        );
        // Toast might be too noisy here
    } catch (error: any) {
        console.error('Error toggling item enabled state:', error);
        toast({ title: 'Error Updating Item', description: error.message, variant: 'destructive' });
        // Rollback UI
         setBlocklist(originalBlocklist);
    }
  };

  // Save overall settings
  const handleSaveSettings = async (key: keyof BlockerSettings, value: boolean) => {
      if (!user?.id || !settings) return;
      const updatedSettings = { ...settings, [key]: value };
      const originalSettings = settings;

      // Optimistic UI
      setSettings(updatedSettings);
      setIsSaving(true); // Use isSaving state

      try {
          await supabaseRequest<BlockerSettings>(
              'blocker_settings',
              'POST', // Use POST + upsert flag
              { data: { ...updatedSettings, user_id: user.id }, upsert: true }
          );
          toast({ title: 'Settings Updated' });
      } catch (error: any) {
          console.error('Error saving blocker settings:', error);
          toast({ title: 'Error Saving Settings', description: error.message, variant: 'destructive' });
          // Rollback UI
          setSettings(originalSettings);
      } finally {
          setIsSaving(false);
      }
  };

  const filteredBlocklist = blocklist.filter(item =>
     filterType === 'all' || item.type === filterType
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Distraction Blocker</h1>
            <p className="text-muted-foreground">
                Manage websites and keywords to block during focus sessions or scheduled times.
            </p>
        </div>

        <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800/30">
           <Construction className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
           <AlertTitle className="text-yellow-800 dark:text-yellow-300">Under Development</AlertTitle>
           <AlertDescription className="text-yellow-700 dark:text-yellow-300/90">
             Actual website/app blocking requires a browser extension or native integration (not implemented).
             This page currently manages the blocklist configuration only.
           </AlertDescription>
        </Alert>

        {/* Master Blocker Settings */}
        {isLoading ? (
            <Card className="animate-pulse">
                <CardHeader><div className="h-6 bg-muted rounded w-1/3"></div></CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-16 bg-muted rounded"></div>
                    <div className="h-16 bg-muted rounded"></div>
                </CardContent>
            </Card>
        ) : settings ? (
             <Card>
                <CardHeader>
                  <CardTitle>Blocker Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                        <Label htmlFor="master-enabled" className="flex flex-col space-y-1 cursor-pointer flex-1">
                            <span>Master Blocker Switch</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Enable or disable all blocking features.
                            </span>
                        </Label>
                        <Switch
                            id="master-enabled"
                            checked={settings.master_enabled}
                            onCheckedChange={(checked) => handleSaveSettings('master_enabled', checked)}
                            disabled={isSaving}
                        />
                    </div>
                     <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                         <Label htmlFor="block-during-focus" className="flex flex-col space-y-1 cursor-pointer flex-1">
                             <span>Block During Focus Sessions</span>
                             <span className="font-normal leading-snug text-muted-foreground">
                                 Automatically enable blocking when a Pomodoro focus session starts.
                             </span>
                         </Label>
                         <Switch
                             id="block-during-focus"
                             checked={settings.block_during_focus}
                             onCheckedChange={(checked) => handleSaveSettings('block_during_focus', checked)}
                             disabled={isSaving || !settings.master_enabled} // Also disable if master is off
                         />
                     </div>
                </CardContent>
             </Card>
        ) : (
            <Card><CardContent><p className="text-muted-foreground text-center py-4">Could not load settings.</p></CardContent></Card>
        )}

        {/* Blocklist Management */}
        <Card>
            <CardHeader>
                <CardTitle>Blocklist Items</CardTitle>
                <CardDescription>Add websites (e.g., youtube.com) or keywords to block.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Add New Item Form */}
                <div className="flex flex-col sm:flex-row gap-2 mb-6 pb-6 border-b">
                    <div className="flex-grow space-y-1.5">
                         <Label htmlFor="newItemValue" className="sr-only">Item Value</Label>
                         <Input
                            id="newItemValue"
                            placeholder="e.g., youtube.com or 'social media'"
                            value={newItemValue}
                            onChange={(e) => setNewItemValue(e.target.value)}
                            disabled={isLoading || isSaving}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} // Add on Enter
                        />
                    </div>
                     <div className="flex gap-2">
                         <Select value={newItemType} onValueChange={(v) => setNewItemType(v as any)} disabled={isLoading || isSaving}>
                             <SelectTrigger className="w-[120px]">
                                 <SelectValue placeholder="Type" />
                             </SelectTrigger>
                             <SelectContent>
                                 <SelectItem value="website">Website</SelectItem>
                                 <SelectItem value="keyword">Keyword</SelectItem>
                             </SelectContent>
                         </Select>
                         <Button onClick={handleAddItem} disabled={!newItemValue.trim() || isLoading || isSaving}>
                             {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Add
                         </Button>
                     </div>
                </div>

                {/* Filtering and List Items */}
                <div className="mb-4 flex justify-end">
                    <Select value={filterType} onValueChange={(v) => setFilterType(v as any)} disabled={isLoading}>
                        <SelectTrigger className="w-[180px]">
                            <ListFilter className="h-4 w-4 mr-2 opacity-50"/>
                            <SelectValue placeholder="Filter items..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Show All</SelectItem>
                            <SelectItem value="website">Websites Only</SelectItem>
                            <SelectItem value="keyword">Keywords Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {isLoading ? (
                    <div className="text-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground mt-2">Loading blocklist...</p>
                    </div>
                ) : filteredBlocklist.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">{filterType === 'all' ? 'Your blocklist is empty.' : 'No items match the current filter.'}</p>
                ) : (
                    <ScrollArea className="h-[400px] pr-3 -mr-3">
                         <ul className="space-y-3">
                             {filteredBlocklist.map((item) => (
                                 <li key={item.id} className="flex items-center justify-between gap-4 p-3 border rounded-md bg-background hover:bg-muted/50">
                                     <div className="flex items-center gap-3 flex-grow overflow-hidden">
                                         <Switch
                                             checked={item.enabled}
                                             onCheckedChange={() => handleToggleItemEnabled(item)}
                                             id={`item-${item.id}`}
                                             aria-label={`Toggle ${item.value}`}
                                         />
                                         <Label htmlFor={`item-${item.id}`} className="flex flex-col flex-grow truncate cursor-pointer">
                                             <span className="font-medium truncate" title={item.value}>{item.value}</span>
                                             <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
                                         </Label>
                                     </div>
                                     <Button
                                         variant="ghost"
                                         size="icon"
                                         className="text-muted-foreground hover:text-destructive flex-shrink-0"
                                         onClick={() => handleDeleteItem(item.id)}
                                     >
                                         <Trash2 className="h-4 w-4" />
                                         <span className="sr-only">Delete {item.value}</span>
                                     </Button>
                                 </li>
                             ))}
                         </ul>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>

         {/* Placeholder for other sections */}
         {/* <Card>
             <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
             <CardContent><p className="text-muted-foreground">Set specific times for blocking.</p></CardContent>
         </Card>
         <Card>
             <CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
             <CardContent><p className="text-muted-foreground">View distraction patterns (coming soon).</p></CardContent>
         </Card> */}

    </div>
  );
};

export default DistractionBlockerPage;