
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeaVendorList } from "./vendors/TeaVendorList"
import { TeaPriceComparison } from "./pricing/TeaPriceComparison"
import { TeaMetricsChart } from "./metrics/TeaMetricsChart"
import { TeaReviews } from "./reviews/TeaReviews"
import { TeaPriceAlerts } from "./pricing/TeaPriceAlerts"
import { TeaRecommendations } from "./recommendations/TeaRecommendations"
import { Button } from "@/components/ui/button"
import { 
  CupSoda, 
  Leaf, 
  LineChart, 
  ShoppingCart, 
  Star, 
  Bell,
  Brain,
  Battery,
  Heart
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function TeaTrackingDashboard() {
  const { data: recentMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['recent-tea-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tea_metrics')
        .select('*')
        .order('consumed_at', { ascending: false })
        .limit(1)
      
      if (error) throw error
      return data[0]
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tea Dashboard</h2>
          <p className="text-muted-foreground">
            Track your tea consumption and its effects on your well-being
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <CupSoda className="h-4 w-4" />
          Log Tea Intake
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mood Impact
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {recentMetrics?.mood_after ? `+${recentMetrics.mood_after - recentMetrics.mood_before}` : 'No data'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Latest mood change after tea
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Energy Level
            </CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {recentMetrics?.energy_after ? `+${recentMetrics.energy_after - recentMetrics.energy_before}` : 'No data'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Latest energy change after tea
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Focus
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">
                {recentMetrics?.focus_after ? `+${recentMetrics.focus_after - recentMetrics.focus_before}` : 'No data'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Latest focus change after tea
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Alerts
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Price alerts set
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Price Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <TeaMetricsChart />
          <TeaRecommendations />
        </TabsContent>

        <TabsContent value="vendors">
          <TeaVendorList />
        </TabsContent>

        <TabsContent value="reviews">
          <TeaReviews />
        </TabsContent>

        <TabsContent value="alerts">
          <TeaPriceAlerts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
