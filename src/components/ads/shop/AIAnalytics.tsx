
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export function AIAnalytics() {
  const { data: analyticsData } = useQuery({
    queryKey: ['product-analytics-ai'],
    queryFn: async () => {
      const { data } = await supabase
        .from('product_analytics_ai')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      return data
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium">Sales Prediction</h3>
              {analyticsData && (
                <LineChart width={800} height={300} data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="predicted_sales" stroke="#8884d8" />
                  <Line type="monotone" dataKey="actual_sales" stroke="#82ca9d" />
                </LineChart>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
