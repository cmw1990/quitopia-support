
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Loader2 } from "lucide-react"

export function NotificationPreferencesManager() {
  const { session } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [loading, setLoading] = React.useState(false)

  const { data: vendorId } = useQuery({
    queryKey: ['vendor-id', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single()
      return data?.id
    },
    enabled: !!session?.user?.id
  })

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_notification_preferences')
        .select('*')
        .eq('vendor_id', vendorId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!vendorId
  })

  const updatePreferences = useMutation({
    mutationFn: async (values: {
      order_notifications?: boolean
      inventory_alerts?: boolean
      low_stock_threshold?: number
    }) => {
      setLoading(true)
      const { error } = await supabase
        .from('vendor_notification_preferences')
        .upsert({
          vendor_id: vendorId,
          ...values
        })

      if (error) throw error
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification preferences updated successfully"
      })
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      })
      console.error('Error updating preferences:', error)
    },
    onSettled: () => {
      setLoading(false)
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications about your store
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="order_notifications">Order Notifications</Label>
            <Switch
              id="order_notifications"
              checked={preferences?.order_notifications}
              onCheckedChange={(checked) => 
                updatePreferences.mutate({ order_notifications: checked })
              }
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="inventory_alerts">Inventory Alerts</Label>
            <Switch
              id="inventory_alerts"
              checked={preferences?.inventory_alerts}
              onCheckedChange={(checked) => 
                updatePreferences.mutate({ inventory_alerts: checked })
              }
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="low_stock_threshold"
                type="number"
                min={0}
                value={preferences?.low_stock_threshold || 0}
                onChange={(e) => 
                  updatePreferences.mutate({ 
                    low_stock_threshold: parseInt(e.target.value) || 0 
                  })
                }
                disabled={loading}
                className="max-w-[120px]"
              />
              <span className="text-sm text-muted-foreground">items</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
