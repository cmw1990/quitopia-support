
import React from 'react'
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { DemographicData, CampaignStat, AdImpression } from '@/types/supabase'
import { CampaignMetrics } from './CampaignMetrics'
import { CampaignPerformanceChart } from './CampaignPerformanceChart'
import { DemographicsChart } from './DemographicsChart'
import { ROIAnalysis } from './ROIAnalysis'

export function AdAnalytics() {
  const { session } = useAuth()
  
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sponsored_products')
        .select('*')
        .eq('sponsor_id', session?.user?.id)
        
      if (error) throw error
      return data || []
    },
    enabled: !!session?.user?.id
  })

  const { data: analytics, isLoading } = useQuery<AdImpression[]>({
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
          sponsored_products!inner(
            id,
            placement_type,
            budget,
            spent,
            tier
          )
        `)
        .in('sponsored_product_id', campaigns.map(c => c.id))
        .order('impressed_at', { ascending: true })
      
      if (error) throw error
      return data as AdImpression[]
    },
    enabled: !!campaigns?.length
  })

  const { data: campaignStats } = useQuery<CampaignStat[]>({
    queryKey: ['campaign-stats', campaigns?.map(c => c.id)],
    queryFn: async () => {
      if (!campaigns?.length) return []
      
      const { data, error } = await supabase
        .from('ad_campaign_stats')
        .select('*')
        .in('campaign_id', campaigns.map(c => c.id))
      
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
      return data || []
    },
    enabled: !!analytics?.length
  })

  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  // Calculate total revenue and ROI
  const totalSpent = analytics?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0
  const totalRevenue = campaignStats?.reduce((sum, s) => sum + (s.conversion_count * 50), 0) || 0 // Assuming $50 per conversion
  const targetRevenue = campaigns?.reduce((sum, c) => sum + (c.budget * 2), 0) || 0 // Target 2x ROI

  return (
    <div className="space-y-6">
      <CampaignMetrics analytics={analytics || []} />
      
      <div className="grid gap-4 md:grid-cols-2">
        <CampaignPerformanceChart analytics={analytics || []} />
        <DemographicsChart demographics={demographics || []} />
      </div>

      <ROIAnalysis 
        spent={totalSpent}
        revenue={totalRevenue}
        target={targetRevenue}
      />
    </div>
  )
}
