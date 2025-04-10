import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/supabase-client';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Ban, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define structure for user settings data from Supabase
interface UserSettings {
    user_id: string;
    blocker_enabled?: boolean;
    blocked_sites?: string[];
    // Add other settings fields here if they exist
}

const DistractionBlockerSettings = () => {
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [blockedSites, setBlockedSites] = useState<string[]>([]); // Start empty, fetch from DB
    const [newSite, setNewSite] = useState('');
    const [isBlockerEnabled, setIsBlockerEnabled] = useState(false); // Start false, fetch from DB

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }: { data: { user: User | null } }) => {
            setUserId(user?.id);
            if (user?.id) {
                // --- Fetch user's actual settings from Supabase ---
                try {
                    const { data, error } = await supabase
                        .from('user_settings') // Assumed table name
                        .select('blocker_enabled, blocked_sites')
                        .eq('user_id', user.id)
                        .maybeSingle(); // Use maybeSingle() in case settings don't exist yet

                    if (error) throw error;

                    if (data) {
                        console.log('Fetched settings:', data);
                        setIsBlockerEnabled(data.blocker_enabled ?? false);
                        setBlockedSites(data.blocked_sites || []);
                    } else {
                         console.log('No existing settings found for user, using defaults.');
                         // Optionally insert default settings row here if needed
                    }
                } catch (fetchError: any) {
                    console.error("Error fetching user settings:", fetchError);
                    toast.error("Failed to load settings", { description: fetchError.message });
                }
                // --- End Fetch --- 
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        }).catch((err: any) => {
            console.error("Error fetching user:", err);
            setIsLoading(false);
        });
    }, []);

    // Helper function to save settings (upsert)
    const saveSettings = async (settings: Partial<Omit<UserSettings, 'user_id'>>) => {
        if (!userId) return { error: { message: 'User not logged in' } };
        
        console.log('Saving settings:', settings);
        const { data, error } = await supabase
            .from('user_settings')
            .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' })
            .select()
            .single(); // Get the updated row back
            
        return { data, error };
    };

    const handleAddSite = async () => {
        const siteToAdd = newSite.trim().toLowerCase();
        if (!siteToAdd || !siteToAdd.includes('.')) {
            toast.error('Invalid Site', { description: 'Please enter a valid domain name (e.g., example.com)' });
            return;
        }
        if (blockedSites.includes(siteToAdd)) {
            toast.warning('Site Already Blocked', { description: `${siteToAdd} is already in the list.` });
            setNewSite('');
            return;
        }

        const updatedSites = [...blockedSites, siteToAdd];
        const originalSites = blockedSites; // For revert
        setBlockedSites(updatedSites); // Optimistic UI update
        setNewSite('');

        // --- Persist changes to Supabase ---
        const { error } = await saveSettings({ blocked_sites: updatedSites });
        
        if (error) {
             toast.error('Failed to Add Site', { description: error.message }); 
             setBlockedSites(originalSites); // Revert UI
        } else {
             toast.success('Site Added', { description: `${siteToAdd} added to blocked list.` });
        }
        // --- End Persist ---
    };

    const handleRemoveSite = async (siteToRemove: string) => {
        const updatedSites = blockedSites.filter(site => site !== siteToRemove);
        const originalSites = blockedSites; // For revert
        setBlockedSites(updatedSites); // Optimistic UI update

        // --- Persist changes to Supabase ---
        const { error } = await saveSettings({ blocked_sites: updatedSites });

        if (error) { 
             toast.error('Failed to Remove Site', { description: error.message }); 
             setBlockedSites(originalSites); // Revert UI
        } else {
             toast.success('Site Removed', { description: `${siteToRemove} removed from blocked list.` });
        }
        // --- End Persist ---
    };

    const handleToggleBlocker = async (enabled: boolean) => {
        const originalState = isBlockerEnabled; // For revert
        setIsBlockerEnabled(enabled); // Optimistic UI update

        // --- Persist changes to Supabase ---
        const { error } = await saveSettings({ blocker_enabled: enabled });
        
        if (error) { 
             toast.error(`Failed to ${enabled ? 'Enable' : 'Disable'} Blocker`, { description: error.message }); 
             setIsBlockerEnabled(originalState); // Revert UI
        } else {
             toast.success(`Blocker ${enabled ? 'Enabled' : 'Disabled'}`);
        }
        // --- End Persist ---
    };

    if (isLoading) {
        return <div className="container mx-auto py-8 px-4 text-center"><p>Loading settings...</p></div>;
    }

    if (!userId) {
        // Or redirect to login
        return <div className="container mx-auto py-8 px-4 text-center"><p>Please log in to manage settings.</p></div>; 
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Distraction Blocker Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage websites to block during focus sessions. Requires the EasierFocus browser extension or desktop app.
                </p>
            </div>

            <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
              <Info className="h-4 w-4" />
              <AlertTitle>External Tool Required</AlertTitle>
              <AlertDescription>
                Website blocking requires the installation of the companion EasierFocus browser extension or desktop application. These settings configure that tool.
              </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Enable Blocker</CardTitle>
                     <CardDescription>Toggle the distraction blocker on or off for your focus sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Switch 
                            id="enable-blocker"
                            checked={isBlockerEnabled}
                            onCheckedChange={handleToggleBlocker}
                         />
                        <Label htmlFor="enable-blocker" className="cursor-pointer">
                            {isBlockerEnabled ? 'Blocker is Active' : 'Blocker is Inactive'}
                         </Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Blocked Websites</CardTitle>
                    <CardDescription>Add or remove websites (domains) to be blocked when the blocker is active.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            type="text"
                            placeholder="e.g., distracting.com"
                            value={newSite}
                            onChange={(e) => setNewSite(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
                        />
                        <Button onClick={handleAddSite} aria-label="Add website to blocklist">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {blockedSites.length > 0 ? (
                        <div className="space-y-2 pt-4 border-t">
                             <Label>Current Blocklist:</Label>
                             <div className="flex flex-wrap gap-2">
                                {blockedSites.map((site) => (
                                    <Badge key={site} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-0.5">
                                        <Ban className="h-3 w-3 mr-1 text-muted-foreground" />
                                        <span>{site}</span>
                                        <Button 
                                            variant="ghost"
                                            className="h-5 w-5 p-0.5 rounded-full ml-1 hover:bg-destructive/20"
                                            onClick={() => handleRemoveSite(site)}
                                            aria-label={`Remove ${site} from blocklist`}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center pt-4 border-t">
                            No websites added to the blocklist yet.
                        </p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
};

export default DistractionBlockerSettings; 