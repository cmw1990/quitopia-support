import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function MoneySaved() {
  const { session } = useAuth();

  const { data: savings } = useQuery({
    queryKey: ['money-saved'],
    queryFn: async () => {
      const { data: quitAttempts, error: quitError } = await supabase
        .from('quit_attempts')
        .select('start_date')
        .eq('user_id', session?.user?.id)
        .order('start_date', { ascending: false })
        .limit(1);

      if (quitError) throw quitError;

      const { data: logs, error: logsError } = await supabase
        .from('substance_logs')
        .select('cost')
        .eq('user_id', session?.user?.id)
        .gte('created_at', quitAttempts?.[0]?.start_date || new Date().toISOString());

      if (logsError) throw logsError;

      const totalSaved = logs?.reduce((acc, log) => acc + (log.cost || 0), 0) || 0;
      return totalSaved;
    },
    enabled: !!session?.user?.id,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Money Saved</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-3xl font-bold">${savings?.toFixed(2) || "0.00"}</div>
          <Progress value={Math.min((savings || 0) / 100, 100)} />
          <p className="text-sm text-muted-foreground">
            Keep going! You're making great financial progress.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}