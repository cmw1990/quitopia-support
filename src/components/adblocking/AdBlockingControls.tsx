
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";

export function AdBlockingControls() {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: options, refetch } = useQuery({
    queryKey: ['ad-blocking-options', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_blocking_options')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  useEffect(() => {
    if (session?.user?.id && !options) {
      initializeOptions();
    }
  }, [session?.user?.id, options]);

  const initializeOptions = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('ad_blocking_options')
        .insert({
          user_id: session.user.id,
          is_premium: false
        });

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error initializing options:', error);
    }
  };

  const updateOption = async (field: string, value: boolean) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('ad_blocking_options')
        .update({ [field]: value })
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your ad blocking settings have been updated."
      });

      refetch();
    } catch (error) {
      console.error('Error updating option:', error);
      toast({
        title: "Error updating settings",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleClearStats = () => {
    toast({
      title: "Stats cleared",
      description: "Your ad blocking statistics have been reset."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Blocking Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Network Filtering</Label>
                <p className="text-sm text-muted-foreground">Block ads before they load</p>
              </div>
              <Switch
                checked={options?.network_filtering}
                onCheckedChange={(checked) => updateOption('network_filtering', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cosmetic Filtering</Label>
                <p className="text-sm text-muted-foreground">Remove ad containers and placeholders</p>
              </div>
              <Switch
                checked={options?.cosmetic_filtering}
                onCheckedChange={(checked) => updateOption('cosmetic_filtering', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Element Hiding</Label>
                <p className="text-sm text-muted-foreground">Hide elements that match ad patterns</p>
              </div>
              <Switch
                checked={options?.element_hiding}
                onCheckedChange={(checked) => updateOption('element_hiding', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Script Injection</Label>
                <p className="text-sm text-muted-foreground">Block script-based ads and trackers</p>
              </div>
              <Switch
                checked={options?.script_injection}
                onCheckedChange={(checked) => updateOption('script_injection', checked)}
              />
            </div>

            {options?.is_premium && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stealth Mode</Label>
                    <p className="text-sm text-muted-foreground">Hide your ad blocking activity</p>
                  </div>
                  <Switch
                    checked={options?.stealth_mode}
                    onCheckedChange={(checked) => updateOption('stealth_mode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Whitelist Social</Label>
                    <p className="text-sm text-muted-foreground">Allow social media widgets</p>
                  </div>
                  <Switch
                    checked={options?.whitelist_social}
                    onCheckedChange={(checked) => updateOption('whitelist_social', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Whitelist Search</Label>
                    <p className="text-sm text-muted-foreground">Allow search engine ads</p>
                  </div>
                  <Switch
                    checked={options?.whitelist_search}
                    onCheckedChange={(checked) => updateOption('whitelist_search', checked)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClearStats}>
              Clear Statistics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
