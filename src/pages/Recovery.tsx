import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar, Heart, DollarSign } from "lucide-react";

export default function Recovery() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: milestones } = useQuery({
    queryKey: ['recovery-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recovery_milestones')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: quitAttempt } = useQuery({
    queryKey: ['current-quit-attempt'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quit_attempts')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const daysSince = quitAttempt
    ? Math.floor((new Date().getTime() - new Date(quitAttempt.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recovery Journey</h1>
        <Button variant="outline" onClick={() => navigate('/sobriety')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Days Smoke-Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{daysSince}</p>
            <p className="text-sm text-muted-foreground">Keep going!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{milestones?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Achievements unlocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {Math.min(100, Math.floor(daysSince * 1.5))}%
            </p>
            <p className="text-sm text-muted-foreground">Improving daily</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Money Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${(daysSince * 10).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Since quitting</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recovery Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {milestones?.map((milestone) => (
              <div key={milestone.id} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="font-medium">{milestone.milestone_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(milestone.achieved_at).toLocaleDateString()}
                  </p>
                  {milestone.health_improvements && (
                    <ul className="mt-2 list-disc list-inside text-sm">
                      {milestone.health_improvements.map((improvement, i) => (
                        <li key={i}>{improvement}</li>
                      ))}
                    </ul>
                  )}
                  {milestone.celebration_notes && (
                    <p className="mt-2 text-sm italic">
                      "{milestone.celebration_notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}