
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";

export function ProfessionalDashboard() {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: upcomingSessions } = useQuery({
    queryKey: ['upcoming-sessions', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultation_sessions')
        .select('*, professional:profiles(full_name)')
        .eq('professional_id', session?.user?.id)
        .gte('session_date', new Date().toISOString())
        .order('session_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Professional Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <h2>Upcoming Sessions</h2>
          {upcomingSessions?.map(session => (
            <div key={session.id} className="p-4 border rounded-lg mb-4">
              <p>Date: {new Date(session.session_date).toLocaleDateString()}</p>
              <p>Type: {session.session_type}</p>
              <p>Status: {session.status}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
