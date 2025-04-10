import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { NicotineIntakeForm } from "@/components/nicotine/NicotineIntakeForm";
import { NicotineHistory } from "@/components/nicotine/NicotineHistory";
import { NicotineChart } from "@/components/nicotine/NicotineChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const Nicotine = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["nicotineHistory"],
    queryFn: async () => {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/energy_focus_logs8?user_id=eq.${session?.user?.id}&activity_type=eq.nicotine&order=created_at.desc&limit=10`,
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
    queryKey: ["nicotineChartData"],
    queryFn: async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/energy_focus_logs8?user_id=eq.${session?.user?.id}&activity_type=eq.nicotine&order=created_at.asc&created_at=gte.${sevenDaysAgo}&limit=50`,
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

  const logNicotineIntake = useMutation({
    mutationFn: async (values: { amount: string; energyRating: string; consumedAt: string; type: string }) => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/energy_focus_logs8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${session?.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: session?.user?.id,
          activity_type: "nicotine",
          activity_name: `Nicotine Intake: ${values.amount}mg (${values.type})`,
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
      queryClient.invalidateQueries({ queryKey: ["nicotineHistory"] });
      queryClient.invalidateQueries({ queryKey: ["nicotineChartData"] });
      toast({
        title: "Success",
        description: "Nicotine intake logged successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log nicotine intake",
        variant: "destructive",
      });
      console.error("Error logging nicotine:", error);
    },
  });

  const isLogging = logNicotineIntake.isPending;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nicotine Tracking</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/cravings')}>
            Manage Cravings
          </Button>
          <Button variant="outline" onClick={() => navigate('/sobriety')}>
            Quit Journey
          </Button>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Health Advisory</AlertTitle>
        <AlertDescription>
          While we understand nicotine use is personal choice, we recommend considering safer alternatives or gradual reduction. 
          Oral nicotine products are generally safer than smoking. Consider speaking with a healthcare provider about nicotine replacement therapy.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <NicotineIntakeForm onSubmit={(values) => logNicotineIntake.mutate(values)} />
        
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Health Advisor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Experiencing cravings? Track them in our <Link to="/cravings" className="font-medium underline">Cravings Manager</Link> to identify patterns and get personalized strategies.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Nicotine can affect your heart rate, blood pressure, and energy levels. Monitor your intake closely.
              </p>
            </CardContent>
          </Card>
          
          <NicotineHistory history={historyData || []} />
        </div>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Nicotine Intake Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <NicotineChart data={chartData || []} isLoading={isChartLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Nicotine;