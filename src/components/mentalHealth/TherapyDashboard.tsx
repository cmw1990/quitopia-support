
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Brain, Calendar, ClipboardCheck, Activity, MessageCircle, FileText, Target, Trophy, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { InsuranceManager } from "../insurance/InsuranceManager";

export function TherapyDashboard() {
  const { session } = useAuth();

  const { data: upcomingSessions } = useQuery({
    queryKey: ['upcoming-sessions', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultation_sessions')
        .select(`
          *,
          mental_health_professionals (
            full_name,
            title
          )
        `)
        .eq('client_id', session?.user?.id)
        .gte('session_date', new Date().toISOString())
        .order('session_date')
        .limit(3);
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: progress } = useQuery({
    queryKey: ['client-progress', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_progress_tracking')
        .select('*')
        .eq('client_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: latestMessages } = useQuery({
    queryKey: ['latest-messages', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultation_messages')
        .select(`
          *,
          sender:sender_id(full_name)
        `)
        .or(`sender_id.eq.${session?.user?.id},receiver_id.eq.${session?.user?.id}`)
        .order('created_at', { ascending: false })
        .limit(5);
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: insuranceInfo } = useQuery({
    queryKey: ['client-insurance', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_insurance')
        .select(`
          id,
          insurance_providers (
            name,
            verification_method
          ),
          insurance_eligibility_checks (
            status,
            verification_date
          )
        `)
        .eq('client_id', session?.user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id
  });

  return (
    <div className="space-y-6">
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
                  {new Date(upcomingSessions[0].session_date).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No upcoming sessions</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progress?.milestone_achievements?.length || 0} Goals
            </div>
            <Progress 
              value={progress?.milestone_achievements?.length ? 
                (progress.milestone_achievements.length / (progress.treatment_goals?.length || 1)) * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMessages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insuranceInfo?.insurance_providers?.name || 'Not Set'}
            </div>
            <p className="text-xs text-muted-foreground">
              {insuranceInfo?.insurance_eligibility_checks?.[0]?.status === 'verified' 
                ? 'Coverage Verified' 
                : 'Verification Needed'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insurance Manager Integration */}
      {session?.user?.id && upcomingSessions?.[0] && insuranceInfo && (
        <InsuranceManager
          sessionId={upcomingSessions[0].id}
          clientId={session.user.id}
          professionalId={upcomingSessions[0].professional_id}
          clientInsuranceId={insuranceInfo.id}
        />
      )}

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
                      {session.mental_health_professionals?.full_name}
                    </p>
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
              <Target className="h-5 w-5" />
              Treatment Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress?.treatment_goals?.length ? (
              progress.treatment_goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={progress.milestone_achievements?.includes(goal)}
                      readOnly
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className={progress.milestone_achievements?.includes(goal) ? 
                      "line-through text-muted-foreground" : ""}>
                      {goal}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No goals set</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Recent Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {latestMessages?.map((message) => (
              <div key={message.id} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {message.sender?.full_name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium">{message.sender?.full_name}</p>
                    <span className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{message.message_text}</p>
                </div>
              </div>
            ))}
            {!latestMessages?.length && (
              <p className="text-muted-foreground">No messages</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
