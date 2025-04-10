
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function VendorAnalytics() {
  const { session } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['vendor-metrics', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return [];

      const { data, error } = await supabase
        .from('vendor_daily_metrics')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('date', { ascending: true })
        .limit(30);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: todayMetrics } = useQuery({
    queryKey: ['vendor-today-metrics', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return null;

      const { data, error } = await supabase
        .from('vendor_daily_metrics')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayMetrics?.total_orders || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayMetrics?.total_revenue?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayMetrics?.average_order_value?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Customers Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayMetrics?.total_customers || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
          <CardDescription>Last 30 days of revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="total_revenue"
                  fill="#8884d8"
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
