
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Package, Star, Activity, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ConsultationPackages } from "@/components/mentalHealth/packages/ConsultationPackages";

export function ProfessionalConsultationDashboard() {
  const { session } = useAuth();

  const { data: upcomingSessions } = useQuery({
    queryKey: ['upcoming-professional-sessions', session?.user?.id],
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
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">Sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.total_revenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.average_rating?.toFixed(1) || '0.0'}</div>
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
            {upcomingSessions?.length ? (
              upcomingSessions.map((session) => (
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
              ))
            ) : (
              <p className="text-muted-foreground">No upcoming sessions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Session Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="text-sm font-medium">90%</span>
              </div>
              <Progress value={90} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Client Satisfaction</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Consultation Packages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConsultationPackages />
        </CardContent>
      </Card>
    </div>
  );
}
