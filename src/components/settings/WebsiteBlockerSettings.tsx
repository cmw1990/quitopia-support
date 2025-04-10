import React, { useState, useEffect, useCallback } from 'react';
import { WebsiteBlockerServiceInstance, BlockedWebsite } from '@/services/WebsiteBlockerService';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Trash2, PlusCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export const WebsiteBlockerSettings: React.FC = () => {
  const [blockedWebsites, setBlockedWebsites] = useState<BlockedWebsite[]>([]);
  const [newPattern, setNewPattern] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBlockedWebsites = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await WebsiteBlockerServiceInstance.getBlockedWebsites(user.id);
      setBlockedWebsites(data);
    } catch (err: any) {
      console.error('Failed to fetch blocked websites:', err);
      setError('Could not load blocked websites. Please try refreshing.');
      toast({ title: 'Error', description: err.message || 'Failed to fetch blocklist', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchBlockedWebsites();
  }, [fetchBlockedWebsites]);

  const handleAddPattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newPattern.trim()) return;

    setIsAdding(true);
    const patternToAdd = newPattern.trim();
    
    try {
      const addedWebsite = await WebsiteBlockerServiceInstance.addBlockedWebsite(user.id, patternToAdd);
      setBlockedWebsites(prev => [...prev, addedWebsite].sort((a, b) => a.pattern.localeCompare(b.pattern)));
      setNewPattern('');
      toast({ title: 'Success', description: `'${patternToAdd}' added to blocklist.` });
    } catch (err: any) {
      console.error('Failed to add blocked website:', err);
      toast({ title: 'Error Adding Pattern', description: err.message || 'Could not add pattern.', variant: 'destructive' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!user?.id) return;

    // Optimistic update
    setBlockedWebsites(prev => 
        prev.map(site => site.id === id ? { ...site, is_enabled: !currentStatus } : site)
    );

    try {
      await WebsiteBlockerServiceInstance.updateBlockedWebsiteStatus(id, user.id, !currentStatus);
      // No need to refetch, optimistic update handled it
      toast({ title: 'Status Updated', description: `Block status changed.` });
    } catch (err: any) {
      console.error('Failed to update status:', err);
      // Revert optimistic update on error
      setBlockedWebsites(prev => 
        prev.map(site => site.id === id ? { ...site, is_enabled: currentStatus } : site)
      );
      toast({ title: 'Error Updating Status', description: err.message || 'Could not update status.', variant: 'destructive' });
    }
  };

  const handleRemovePattern = async (id: string, pattern: string) => {
    if (!user?.id) return;
    
    // Optimistic removal
    const originalList = [...blockedWebsites];
    setBlockedWebsites(prev => prev.filter(site => site.id !== id));
    
    try {
      await WebsiteBlockerServiceInstance.removeBlockedWebsite(id, user.id);
      toast({ title: 'Success', description: `'${pattern}' removed from blocklist.` });
    } catch (err: any) {
      console.error('Failed to remove blocked website:', err);
       // Revert optimistic removal on error
       setBlockedWebsites(originalList);
      toast({ title: 'Error Removing Pattern', description: err.message || 'Could not remove pattern.', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Blocker Settings</CardTitle>
        <CardDescription>
          Manage website patterns to block during focus sessions. 
          Requires a compatible browser extension (not included) to function.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-300">Browser Extension Required</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            This list defines websites to block. Actual blocking requires installing and connecting the Easier Focus browser extension (coming soon).
          </AlertDescription>
        </Alert>

        <form onSubmit={handleAddPattern} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="e.g., facebook.com, *.reddit.com"
            value={newPattern}
            onChange={(e) => setNewPattern(e.target.value)}
            disabled={isAdding}
            className="flex-grow"
          />
          <Button type="submit" disabled={isAdding || !newPattern.trim()}>
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-1" />} 
            Add
          </Button>
        </form>

        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading blocklist...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && blockedWebsites.length === 0 && (
          <p className="text-center text-muted-foreground py-4">Your blocklist is empty. Add patterns above.</p>
        )}

        {!isLoading && !error && blockedWebsites.length > 0 && (
          <div className="space-y-3">
            {blockedWebsites.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <span className={`flex-grow mr-4 ${!site.is_enabled ? 'text-muted-foreground line-through' : ''}`}>
                  {site.pattern}
                </span>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={site.is_enabled}
                    onCheckedChange={() => handleToggleStatus(site.id!, site.is_enabled)}
                    aria-label={`Toggle blocking for ${site.pattern}`}
                  />
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePattern(site.id!, site.pattern)}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                    aria-label={`Remove ${site.pattern} from blocklist`}
                    title="Remove pattern"
                    >
                      <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 