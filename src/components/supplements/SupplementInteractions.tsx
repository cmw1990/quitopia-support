import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SupplementLog {
  supplement_name: string;
  interaction_notes: string;
  created_at: string;
}

export function SupplementInteractions() {
  const { session } = useAuth();

  const { data: interactions } = useQuery({
    queryKey: ['supplementInteractions', session?.user?.id],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('supplement_logs')
        .select('supplement_name, interaction_notes, created_at')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Group supplements taken together
      const today = new Date().toISOString().split('T')[0];
      const supplementsByDay = (logs as SupplementLog[]).reduce((acc: Record<string, Set<string>>, log) => {
        const day = log.created_at?.split('T')[0];
        if (!acc[day]) acc[day] = new Set();
        acc[day].add(log.supplement_name);
        return acc;
      }, {});

      // Find potential interactions
      const interactions = [];
      for (const [day, supplements] of Object.entries(supplementsByDay)) {
        if ((supplements as Set<string>).size > 1) {
          interactions.push({
            date: day,
            supplements: Array.from(supplements as Set<string>),
            warning: "These supplements were taken together. Consider spacing them out.",
          });
        }
      }

      return interactions;
    },
    enabled: !!session?.user?.id,
  });

  if (!interactions?.length) {
    return (
      <div className="text-center text-muted-foreground">
        No supplement interactions detected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction, index) => (
        <Alert key={index} variant="default" className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Potential Interaction Detected</AlertTitle>
          <AlertDescription>
            <p className="mt-2">
              Supplements taken together on {new Date(interaction.date).toLocaleDateString()}:
            </p>
            <ul className="list-disc list-inside mt-2">
              {interaction.supplements.map((supplement: string) => (
                <li key={supplement}>{supplement}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">{interaction.warning}</p>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}