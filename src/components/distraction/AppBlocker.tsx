import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../AuthProvider";
import { Smartphone, Plus, Trash, Loader2, AlertCircle } from "lucide-react";
import { Capacitor } from '@capacitor/core';

export const AppBlocker = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [newApp, setNewApp] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const isMobile = Capacitor.isNativePlatform();

  useEffect(() => {
    if (session?.user?.id) {
      loadApps();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const loadApps = async () => {
    if (!session?.user?.id) {
      console.log('No user session found, cannot load apps');
      setError('Please log in to view your blocked apps');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDebug(null);

    try {
      console.log('Loading apps for user:', session.user.id);
      const { data, error } = await supabase
        .from('distraction_blocking')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('block_type', 'app')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading apps:', error);
        setError('Failed to load your blocked apps. Please try again.');
        setDebug(`Error: ${error.code}, ${error.message}`);
        toast({
          title: "Error loading apps",
          description: "Please refresh the page or try again later",
          variant: "destructive"
        });
        return;
      }

      console.log('Apps loaded successfully:', data?.length || 0, 'items');
      setApps(data || []);
    } catch (err) {
      console.error('Error loading apps:', err);
      setError('An unexpected error occurred. Please try again.');
      if (err instanceof Error) {
        setDebug(`Error: ${err.name}, ${err.message}`);
      }
      toast({
        title: "Error loading apps",
        description: "Please refresh the page or try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addApp = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to block apps",
        variant: "destructive"
      });
      return;
    }
    
    if (!newApp.trim()) {
      toast({
        title: "App name required",
        description: "Please enter an app name to block",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    setError(null);
    setDebug(null);

    try {
      console.log('Adding app to block list:', newApp.trim());
      const { data, error } = await supabase
        .from('distraction_blocking')
        .insert({
          user_id: session.user.id,
          block_type: 'app',
          target: newApp.trim(),
          is_active: true
        })
        .select();

      if (error) {
        console.error('Error adding app:', error);
        setError('Failed to add app. Please try again.');
        setDebug(`Error: ${error.code}, ${error.message}`);
        toast({
          title: "Error adding app",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      console.log('App added successfully:', data);
      toast({
        title: "App blocked",
        description: `${newApp} has been added to your block list`
      });

      setNewApp("");
      // Instead of optimistically adding, reload the full list
      await loadApps();
    } catch (err) {
      console.error('Error adding app:', err);
      setError('An unexpected error occurred. Please try again.');
      if (err instanceof Error) {
        setDebug(`Error: ${err.name}, ${err.message}`);
      }
      toast({
        title: "Error adding app",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleApp = async (id: string, isActive: boolean) => {
    try {
      console.log('Toggling app active status:', id, 'from', isActive, 'to', !isActive);
      const { error } = await supabase
        .from('distraction_blocking')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) {
        console.error('Error toggling app:', error);
        toast({
          title: "Error updating app",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      // Update local state to reflect the change immediately
      setApps(apps.map(app => 
        app.id === id ? { ...app, is_active: !isActive } : app
      ));
      
      toast({
        title: isActive ? "App unblocked" : "App blocked",
        description: `App has been ${isActive ? 'unblocked' : 'blocked'} successfully`
      });
    } catch (err) {
      console.error('Error toggling app:', err);
      toast({
        title: "Error updating app",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteApp = async (id: string) => {
    try {
      console.log('Deleting app from block list:', id);
      const { error } = await supabase
        .from('distraction_blocking')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting app:', error);
        toast({
          title: "Error removing app",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      // Update local state to reflect the deletion immediately
      setApps(apps.filter(app => app.id !== id));
      
      toast({
        title: "App removed",
        description: "App has been removed from your block list"
      });
    } catch (err) {
      console.error('Error deleting app:', err);
      toast({
        title: "Error removing app",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addApp();
    }
  };

  if (!isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Blocker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            App blocking is only available on mobile devices. Please install our mobile app
            to use this feature.
          </p>
          <Button 
            className="mt-4"
            variant="outline"
            onClick={() => window.open('https://apps.apple.com/app/well-charged/id1234567890', '_blank')}
          >
            Download Mobile App
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          App Blocker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter app name (e.g., TikTok)"
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isAdding}
          />
          <Button 
            onClick={addApp} 
            disabled={isAdding || !newApp.trim()}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {debug && process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded-md font-mono">
            {debug}
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No apps in your block list.</p>
              <p className="text-sm">Add apps above to block them from distracting you.</p>
            </div>
          ) : (
            apps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={app.is_active}
                    onCheckedChange={() => toggleApp(app.id, app.is_active)}
                  />
                  <Label className={`${!app.is_active ? 'line-through text-muted-foreground' : ''}`}>
                    {app.target}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteApp(app.id)}
                >
                  <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};