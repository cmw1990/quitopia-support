
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Loader2, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface WebhookSubscription {
  id: string;
  webhook_url: string;
  events: string[];
  created_at: string;
  last_triggered_at: string | null;
}

const AVAILABLE_EVENTS = [
  { id: 'new_order', label: 'New Order' },
  { id: 'order_status_change', label: 'Order Status Change' },
  { id: 'low_inventory', label: 'Low Inventory Alert' },
  { id: 'payment_received', label: 'Payment Received' }
]

export function WebhookManager() {
  const { session } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[]
  })

  const { data: webhooks, refetch } = useQuery({
    queryKey: ['webhook-subscriptions', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single()

      if (!vendorData) return []

      const { data, error } = await supabase
        .from('webhook_subscriptions')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as WebhookSubscription[]
    },
    enabled: !!session?.user?.id
  })

  const handleAddWebhook = async () => {
    if (!session?.user?.id || !newWebhook.url || newWebhook.events.length === 0) return

    setLoading(true)
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session.user.id)
        .single()

      if (!vendorData) throw new Error('Vendor not found')

      const { error } = await supabase
        .from('webhook_subscriptions')
        .insert({
          vendor_id: vendorData.id,
          webhook_url: newWebhook.url,
          events: newWebhook.events
        })

      if (error) throw error

      toast({
        title: "Webhook added",
        description: "Your webhook subscription has been added successfully"
      })

      setNewWebhook({
        url: '',
        events: []
      })
      refetch()
    } catch (error) {
      console.error('Error adding webhook:', error)
      toast({
        title: "Error",
        description: "Failed to add webhook subscription",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhook_subscriptions')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Webhook removed",
        description: "The webhook subscription has been removed successfully"
      })

      refetch()
    } catch (error) {
      console.error('Error removing webhook:', error)
      toast({
        title: "Error",
        description: "Failed to remove webhook subscription",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Subscriptions</CardTitle>
        <CardDescription>
          Manage webhook endpoints to receive notifications about orders and other events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://your-server.com/webhook"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid gap-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={event.id}
                      checked={newWebhook.events.includes(event.id)}
                      onCheckedChange={(checked) => {
                        setNewWebhook(prev => ({
                          ...prev,
                          events: checked
                            ? [...prev.events, event.id]
                            : prev.events.filter(e => e !== event.id)
                        }))
                      }}
                    />
                    <Label htmlFor={event.id}>{event.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleAddWebhook}
              disabled={loading || !newWebhook.url || newWebhook.events.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Webhook'
              )}
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-4">Active Webhooks</h3>
            <div className="space-y-4">
              {webhooks?.map((webhook) => (
                <Card key={webhook.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium break-all">{webhook.webhook_url}</p>
                      <div className="flex gap-2 mt-2">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                      {webhook.last_triggered_at && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
