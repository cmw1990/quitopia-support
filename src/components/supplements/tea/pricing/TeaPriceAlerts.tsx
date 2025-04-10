
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Trash2, AlertTriangle } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface PriceAlert {
  id: string
  tea_id: string
  vendor_id: string
  target_price: number
  current_price: number
  alert_active: boolean
  alert_triggered: boolean
  tea: {
    name: string
    category: string
  }
  vendor: {
    name: string
  }
}

export function TeaPriceAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['tea-price-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tea_price_alerts')
        .select(`
          *,
          tea:herbal_teas(name, category),
          vendor:tea_vendors(name)
        `)
        .order('created_at', { ascending: false })
        .returns<PriceAlert[]>()
      
      if (error) throw error
      return data
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading price alerts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Price Alerts</CardTitle>
        <Button variant="outline" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Add Alert
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts?.map((alert) => (
            <div 
              key={alert.id} 
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{alert.tea?.name}</h3>
                  {alert.alert_triggered && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Price Drop!
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  from {alert.vendor?.name}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <div className="text-sm font-medium">Target</div>
                    <div className="text-2xl font-bold">
                      ${alert.target_price}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Current</div>
                    <div className="text-2xl font-bold">
                      ${alert.current_price}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Switch checked={alert.alert_active} />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
