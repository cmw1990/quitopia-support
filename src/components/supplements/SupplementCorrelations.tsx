import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";

interface CorrelationData {
  supplement_name: string;
  correlation_type: string;
  correlation_score: number;
  analysis_period_days: number;
}

export function SupplementCorrelations() {
  const { session } = useAuth();

  const { data: correlations } = useQuery({
    queryKey: ['supplementCorrelations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_correlations')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('correlation_score', { ascending: false });
      
      if (error) throw error;
      return data as CorrelationData[];
    },
    enabled: !!session?.user?.id,
  });

  if (!correlations?.length) {
    return (
      <div className="text-center text-muted-foreground">
        No correlation data available yet. Continue logging your supplements to see patterns.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {correlations.map((correlation) => (
        <Card key={`${correlation.supplement_name}-${correlation.correlation_type}`} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{correlation.supplement_name}</h4>
              <p className="text-sm text-muted-foreground">
                {correlation.correlation_type} Impact
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {(correlation.correlation_score * 100).toFixed(1)}% correlation
              </p>
              <p className="text-sm text-muted-foreground">
                {correlation.analysis_period_days} day analysis
              </p>
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${Math.abs(correlation.correlation_score * 100)}%`,
                backgroundColor: correlation.correlation_score >= 0 ? '#0ea5e9' : '#ef4444',
              }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}