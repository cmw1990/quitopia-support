
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function RewardThresholdsManager() {
  const { session } = useAuth()
  const { toast } = useToast()
  const [newThreshold, setNewThreshold] = useState({
    points_required: 1000,
    discount_percentage: 10,
    max_discount_amount: 50,
    is_active: true,
    valid_until: null as Date | null,
    terms_conditions: ""
  })

  const { data: thresholds, refetch } = useQuery({
    queryKey: ['reward-thresholds', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single()

      if (!vendorData) return []

      const { data, error } = await supabase
        .from('reward_thresholds')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('points_required', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  const handleAddThreshold = async () => {
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single()

      if (!vendorData) {
        toast({
          title: "Error",
          description: "Vendor not found",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('reward_thresholds')
        .insert({
          vendor_id: vendorData.id,
          points_required: newThreshold.points_required,
          discount_percentage: newThreshold.discount_percentage,
          max_discount_amount: newThreshold.max_discount_amount,
          is_active: newThreshold.is_active,
          valid_until: newThreshold.valid_until?.toISOString(),
          terms_conditions: newThreshold.terms_conditions
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Reward threshold added successfully"
      })

      refetch()
      setNewThreshold({
        points_required: 1000,
        discount_percentage: 10,
        max_discount_amount: 50,
        is_active: true,
        valid_until: null,
        terms_conditions: ""
      })
    } catch (error) {
      console.error('Error adding threshold:', error)
      toast({
        title: "Error",
        description: "Failed to add reward threshold",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('reward_thresholds')
        .update({ is_active: !currentState })
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: `Threshold ${currentState ? 'deactivated' : 'activated'} successfully`
      })

      refetch()
    } catch (error) {
      console.error('Error toggling threshold:', error)
      toast({
        title: "Error",
        description: "Failed to update threshold",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reward Thresholds</CardTitle>
        <CardDescription>
          Set up reward thresholds for customer points redemption
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Points Required</Label>
              <Input
                type="number"
                min="0"
                value={newThreshold.points_required}
                onChange={(e) => setNewThreshold(prev => ({
                  ...prev,
                  points_required: Number(e.target.value)
                }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Discount Percentage</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newThreshold.discount_percentage}
                onChange={(e) => setNewThreshold(prev => ({
                  ...prev,
                  discount_percentage: Number(e.target.value)
                }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Maximum Discount Amount ($)</Label>
              <Input
                type="number"
                min="0"
                value={newThreshold.max_discount_amount}
                onChange={(e) => setNewThreshold(prev => ({
                  ...prev,
                  max_discount_amount: Number(e.target.value)
                }))}
              />
            </div>

            <div className="grid gap-2">
              <Label>Valid Until (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !newThreshold.valid_until && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newThreshold.valid_until ? format(newThreshold.valid_until, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newThreshold.valid_until || undefined}
                    onSelect={(date) => setNewThreshold(prev => ({
                      ...prev,
                      valid_until: date
                    }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Terms & Conditions</Label>
              <Textarea
                value={newThreshold.terms_conditions}
                onChange={(e) => setNewThreshold(prev => ({
                  ...prev,
                  terms_conditions: e.target.value
                }))}
                placeholder="Enter any terms and conditions for this reward threshold"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={newThreshold.is_active}
                onCheckedChange={(checked) => setNewThreshold(prev => ({
                  ...prev,
                  is_active: checked
                }))}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>

            <Button onClick={handleAddThreshold} className="w-full">
              Add Threshold
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Current Thresholds</h3>
          {thresholds?.map((threshold) => (
            <Card key={threshold.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">{threshold.points_required} Points</p>
                    <p className="text-sm text-muted-foreground">
                      {threshold.discount_percentage}% discount up to ${threshold.max_discount_amount}
                    </p>
                  </div>
                  <Switch
                    checked={threshold.is_active}
                    onCheckedChange={() => handleToggleActive(threshold.id, threshold.is_active)}
                  />
                </div>
                {threshold.valid_until && (
                  <p className="text-sm text-muted-foreground">
                    Valid until: {format(new Date(threshold.valid_until), "PPP")}
                  </p>
                )}
                {threshold.terms_conditions && (
                  <p className="text-sm mt-2">{threshold.terms_conditions}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
