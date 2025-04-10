
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CampaignPerformanceChartProps {
  analytics: any[] // Replace with proper type
}

export function CampaignPerformanceChart({ analytics }: CampaignPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Over Time</CardTitle>
        <CardDescription>View your campaign metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="impressed_at" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#8884d8"
                name="Cost"
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#82ca9d"
                name="Clicks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
