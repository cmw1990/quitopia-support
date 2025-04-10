import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../AuthProvider";
import { Globe, Plus, Trash, Loader2, AlertCircle } from "lucide-react";

export const WebsiteBlocker = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<any[]>([]);
  const [newWebsite, setNewWebsite] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);

  useEffect(() => {
    loadWebsites();
  }, [session?.user?.id]);

  const loadWebsites = async () => {
    if (!session?.user?.id) {
      console.log('No user session found, cannot load websites');
      setError('Please log in to view your blocked websites');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setDebug(null);

    try {
      console.log('Loading websites for user:', session.user.id);
      const { data, error } = await supabase
        .from('distraction_blocking')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('block_type', 'website')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading websites:', error);
        setError('Failed to load your blocked websites. Please try again.');
        setDebug(`Error: ${error.code}, ${error.message}`);
        toast({
          title: "Error loading websites",
          description: "Please refresh the page or try again later",
          variant: "destructive"
        });
        return;
      }

      console.log('Websites loaded successfully:', data?.length || 0, 'items');
      setWebsites(data || []);
    } catch (err) {
      console.error('Error loading websites:', err);
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: "Error loading websites",
        description: "Please refresh the page or try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addWebsite = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to block websites",
        variant: "destructive"
      });
      return;
    }
    
    if (!newWebsite.trim()) {
      toast({
        title: "Website required",
        description: "Please enter a website URL to block",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    setError(null);
    setDebug(null);

    try {
      // Format the website URL properly if needed
      let websiteUrl = newWebsite.trim();
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://') && !websiteUrl.startsWith('www.')) {
        websiteUrl = 'www.' + websiteUrl;
      }

      console.log('Adding website to block list:', websiteUrl);
      const { data, error } = await supabase
        .from('distraction_blocking')
        .insert({
          user_id: session.user.id,
          block_type: 'website',
          target: websiteUrl,
          is_active: true
        })
        .select();

      if (error) {
        console.error('Error adding website:', error);
        setError('Failed to add website. Please try again.');
        setDebug(`Error: ${error.code}, ${error.message}`);
        toast({
          title: "Error adding website",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      console.log('Website added successfully:', data);
      toast({
        title: "Website blocked",
        description: `${websiteUrl} has been added to your block list`
      });

      setNewWebsite("");
      await loadWebsites();
    } catch (err) {
      console.error('Error adding website:', err);
      setError('An unexpected error occurred. Please try again.');
      if (err instanceof Error) {
        setDebug(`Error: ${err.name}, ${err.message}`);
      }
      toast({
        title: "Error adding website",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleWebsite = async (id: string, isActive: boolean) => {
    try {
      console.log('Toggling website active status:', id, 'from', isActive, 'to', !isActive);
      const { error } = await supabase
        .from('distraction_blocking')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) {
        console.error('Error toggling website:', error);
        toast({
          title: "Error updating website",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      // Update local state to reflect the change immediately
      setWebsites(websites.map(site => 
        site.id === id ? { ...site, is_active: !isActive } : site
      ));
      
      toast({
        title: isActive ? "Website unblocked" : "Website blocked",
        description: `Website has been ${isActive ? 'unblocked' : 'blocked'} successfully`
      });
    } catch (err) {
      console.error('Error toggling website:', err);
      toast({
        title: "Error updating website",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      console.log('Deleting website from block list:', id);
      const { error } = await supabase
        .from('distraction_blocking')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting website:', error);
        toast({
          title: "Error removing website",
          description: error.message || "Please try again later",
          variant: "destructive"
        });
        return;
      }

      // Update local state to reflect the deletion immediately
      setWebsites(websites.filter(site => site.id !== id));
      
      toast({
        title: "Website removed",
        description: "Website has been removed from your block list"
      });
    } catch (err) {
      console.error('Error deleting website:', err);
      toast({
        title: "Error removing website",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addWebsite();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Website Blocker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter website URL (e.g., facebook.com)"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isAdding}
          />
          <Button 
            onClick={addWebsite} 
            disabled={isAdding || !newWebsite.trim()}
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
          ) : websites.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No websites in your block list.</p>
              <p className="text-sm">Add websites above to block them from distracting you.</p>
            </div>
          ) : (
            websites.map((website) => (
              <div key={website.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={website.is_active}
                    onCheckedChange={() => toggleWebsite(website.id, website.is_active)}
                  />
                  <Label className={`${!website.is_active ? 'line-through text-muted-foreground' : ''}`}>
                    {website.target}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteWebsite(website.id)}
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