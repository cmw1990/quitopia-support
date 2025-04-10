import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmergencyContacts } from "../emergency/EmergencyContacts";
import { 
  Calendar,
  Activity,
  ClipboardList,
  MessageSquare,
  Settings,
  AlertTriangle
} from "lucide-react";
import { ConsultationMessaging } from "../ConsultationMessaging";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ConsultationSession, PackagePurchase } from "@/types/ConsultationTypes";

export function ClientDashboard() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);

  const { data: upcomingSessions } = useQuery({
    queryKey: ['upcoming-sessions', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultation_sessions')
        .select(`
          *,
          professional:professional_id(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('client_id', session?.user?.id)
        .gte('session_date', new Date().toISOString())
        .order('session_date')
        .limit(5);

      if (error) throw error;
      return data as ConsultationSession[];
    },
    enabled: !!session?.user?.id
  });

const { data: activePurchases } = useQuery({
    queryKey: ['active-packages', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_purchases')
        .select(`
          *,
          package:consultation_packages (*),
          professional:profiles!package_purchases_professional_id_fkey (
            full_name
          )
        `)
        .eq('client_id', session?.user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(purchase => ({
        ...purchase,
        professional: {
          full_name: purchase.professional?.full_name || 'Unknown Professional'
        }
      }));
    },
    enabled: !!session?.user?.id
  });

  const { data: progress } = useQuery({
    queryKey: ['client-progress', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_progress_tracking')
        .select('*')
        .eq('client_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Session</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingSessions?.[0] ? (
              <div>
                <div className="text-2xl font-bold">
                  {new Date(upcomingSessions[0].session_date).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  with {upcomingSessions[0].professional?.full_name}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No upcoming sessions</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePurchases?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activePurchases?.[0]?.sessions_remaining || 0} sessions remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatment Goals</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress?.milestone_achievements?.length || 0}/{progress?.treatment_goals?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">goals completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Assessment</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {progress?.next_assessment_date ? (
              <div>
                <div className="text-2xl font-bold">
                  {new Date(progress.next_assessment_date).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">upcoming assessment</p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No assessment scheduled</div>
            )}
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
                    <p className="font-medium">
                      {session.professional?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.session_date).toLocaleString()}
                    </p>
                  </div>
                  {session.meeting_link && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        window.open(session.meeting_link, '_blank');
                      }}
                    >
                      Join
                    </Button>
                  )}
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
              Active Packages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePurchases?.length ? (
              activePurchases.map((purchase) => (
                <div key={purchase.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{purchase.package?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        with {purchase.professional?.full_name}
                      </p>
                    </div>
                    <div className="text-sm">
                      {purchase.sessions_remaining} sessions left
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(purchase.expires_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No active packages</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Emergency Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProfessional ? (
                <ConsultationMessaging 
                  recipientId={selectedProfessional}
                  recipientName={upcomingSessions?.find(s => s.professional_id === selectedProfessional)?.professional?.full_name || ''}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a professional from your upcoming sessions to start messaging
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyContacts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
