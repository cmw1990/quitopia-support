
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";

export function AdBlockingStats() {
  const { session } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['ad-blocking-stats', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_blocking_stats')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Today's Blocking Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ads Blocked</p>
            <p className="text-2xl font-bold">{stats?.ads_blocked || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Trackers Blocked</p>
            <p className="text-2xl font-bold">{stats?.trackers_blocked || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Bandwidth Saved</p>
            <p className="text-2xl font-bold">{Math.round((stats?.bandwidth_saved || 0) / 1024 / 1024)} MB</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Time Saved</p>
            <p className="text-2xl font-bold">{stats?.load_time_saved || 0}s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
