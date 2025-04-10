
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DemographicData } from '@/types/supabase'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

interface DemographicsChartProps {
  demographics: DemographicData[]
}

export function DemographicsChart({ demographics }: DemographicsChartProps) {
  const ageDistribution = demographics?.reduce((acc, curr) => {
    acc[curr.age_range] = (acc[curr.age_range] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const ageData = Object.entries(ageDistribution).map(([range, count]) => ({
    name: range,
    value: count
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audience Demographics</CardTitle>
        <CardDescription>Age distribution of ad viewers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
