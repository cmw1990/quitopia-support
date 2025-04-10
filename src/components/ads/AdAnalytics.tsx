import React from 'react'
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { ChartBar, Users, Clock, Eye } from 'lucide-react'
import { DemographicData } from '@/types/supabase'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function AdAnalytics() {
  const { session } = useAuth()
  
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns', session?.user?.id],
    queryFn: async () => {
      const { data: campaigns, error: campaignsError } = await supabase
        .from('sponsored_products')
        .select('*')
        .eq('sponsor_id', session?.user?.id)
        
      if (campaignsError) throw campaignsError
      return campaigns
    },
    enabled: !!session?.user?.id
  })

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['ad-analytics', campaigns?.map(c => c.id)],
    queryFn: async () => {
      if (!campaigns?.length) return []
      
      const { data, error } = await supabase
        .from('ad_impressions')
        .select(`
          id,
          sponsored_product_id,
          impressed_at,
          clicked_at,
          cost,
          sponsored_products (
            placement_type,
            budget,
            spent,
            tier
          )
        `)
        .in('sponsored_product_id', campaigns.map(c => c.id))
        .order('impressed_at', { ascending: true })
      
      if (error) throw error
      return data || []
    },
    enabled: !!campaigns?.length
  })

  const { data: demographics } = useQuery<DemographicData[]>({
    queryKey: ['ad-demographics', analytics?.map(a => a.id)],
    queryFn: async () => {
      if (!analytics?.length) return []
      
      const { data, error } = await supabase
        .from('ad_viewer_demographics')
        .select('*')
        .in('impression_id', analytics.map(a => a.id))
      
      if (error) throw error
      return data as DemographicData[]
    },
    enabled: !!analytics?.length
  })

  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  // Calculate demographic distributions
  const ageDistribution = demographics?.reduce((acc, curr) => {
    acc[curr.age_range] = (acc[curr.age_range] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const ageData = Object.entries(ageDistribution).map(([range, count]) => ({
    name: range,
    value: count
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Impressions
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.length ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clicks
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.filter(a => a.clicked_at).length ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Click Rate
            </CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.length 
                ? `${((analytics.filter(a => a.clicked_at).length / analytics.length) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics?.reduce((sum, a) => sum + (a.cost || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
