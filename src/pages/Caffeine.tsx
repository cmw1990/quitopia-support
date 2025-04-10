import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CaffeineIntakeForm } from "@/components/caffeine/CaffeineIntakeForm";
import { CaffeineHistory } from "@/components/caffeine/CaffeineHistory";
import { CaffeineChart } from "@/components/caffeine/CaffeineChart";

const Caffeine = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caffeineHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["caffeineHistory"],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/energy_focus_logs?user_id=eq.${session?.user?.id}&activity_type=eq.caffeine&order=created_at.desc&limit=10`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    },
    enabled: !!session?.user?.id,
  });

  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ["caffeineChartData"],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/energy_focus_logs?user_id=eq.${session?.user?.id}&activity_type=eq.caffeine&order=created_at.asc&created_at=gte.${sevenDaysAgo}&limit=50`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      const data = await response.json();
      const processedData = data.map(log => ({
        date: new Date(log.created_at).toLocaleDateString(),
        amount: parseInt(log.activity_name.split(":")[1]),
        energy: log.energy_rating
      }));

      return processedData;
    },
    enabled: !!session?.user?.id,
  });

  const logCaffeineMutation = useMutation({
    mutationFn: async (values: { amount: string; energyRating: string; consumedAt: string }) => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/energy_focus_logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
          activity_type: "caffeine",
          activity_name: `Caffeine Intake: ${values.amount}mg`,
          energy_rating: parseInt(values.energyRating),
          created_at: values.consumedAt,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caffeineHistory"] });
      queryClient.invalidateQueries({ queryKey: ["caffeineChartData"] });
      toast({
        title: "Success",
        description: "Caffeine intake logged successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log caffeine intake",
        variant: "destructive",
      });
      console.error("Error logging caffeine:", error);
    },
  });

  const handleSubmit = (values: { amount: string; energyRating: string; consumedAt: string }) => {
    if (!values.amount || !values.energyRating) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    logCaffeineMutation.mutate(values);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Caffeine Tracker</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log Caffeine Intake</CardTitle>
          </CardHeader>
          <CardContent>
            <CaffeineIntakeForm onSubmit={handleSubmit} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <CaffeineHistory history={caffeineHistory || []} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Caffeine Intake Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <CaffeineChart data={chartData || []} isLoading={isChartLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Caffeine;