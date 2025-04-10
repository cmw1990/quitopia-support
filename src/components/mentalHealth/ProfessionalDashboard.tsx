
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Users, Calendar, Package, Star, Activity, MessageCircle } from "lucide-react";
import { AvailabilityManager } from "./AvailabilityManager";

export function ProfessionalDashboard() {
  const { session } = useAuth();

  const { data: analytics } = useQuery({
    queryKey: ['professional-analytics', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('professional_analytics')
        .select('*')
        .eq('professional_id', session?.user?.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: upcomingSessions } = useQuery({
    queryKey: ['professional-upcoming-sessions', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultation_sessions')
        .select(`
          *,
          client:client_id(full_name)
        `)
        .eq('professional_id', session?.user?.id)
        .gte('session_date', new Date().toISOString())
        .order('session_date')
        .limit(5);
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: clientProgress } = useQuery({
    queryKey: ['client-progress-overview', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_progress_tracking')
        .select(`
          *,
          client:client_id(full_name)
        `)
        .eq('professional_id', session?.user?.id)
        .order('updated_at', { ascending: false })
        .limit(5);
      return data;
    },
    enabled: !!session?.user?.id
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_clients || 0}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">Total sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.total_revenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.average_rating?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">Average client rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions?.map((session) => (
              <div key={session.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{session.client?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(session.session_date).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Join
                </Button>
              </div>
            ))}
            {!upcomingSessions?.length && (
              <p className="text-muted-foreground">No upcoming sessions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Client Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {clientProgress?.map((progress) => (
              <div key={progress.id} className="space-y-2">
                <div className="flex justify-between">
                  <p className="font-medium">{progress.client?.full_name}</p>
                  <span className="text-sm text-muted-foreground">
                    {progress.milestone_achievements?.length || 0}/{progress.treatment_goals?.length || 0} Goals
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ 
                      width: `${progress.milestone_achievements?.length && progress.treatment_goals?.length ? 
                        (progress.milestone_achievements.length / progress.treatment_goals.length) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
            {!clientProgress?.length && (
              <p className="text-muted-foreground">No client progress data</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <AvailabilityManager />
        </CardContent>
      </Card>
    </div>
  );
}
