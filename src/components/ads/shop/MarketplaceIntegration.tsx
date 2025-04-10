
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketplaceMetrics } from "@/types/insurance";

export function MarketplaceIntegration() {
  const { data: metrics } = useQuery({
    queryKey: ['marketplace-metrics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('marketplace_platform_metrics')
        .select('*')
        .single();

      if (!data) return null;
      
      return {
        ...data,
        metrics_data: data.metrics_data as MarketplaceMetrics['metrics_data']
      } as MarketplaceMetrics;
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics?.metrics_data?.total_revenue || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.metrics_data?.total_orders || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics?.metrics_data?.conversion_rate || 0}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
