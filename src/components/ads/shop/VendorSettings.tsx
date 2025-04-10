
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea" 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useAuth } from "@/components/AuthProvider"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

const settingsSchema = z.object({
  business_registration: z.string().min(1, "Business registration is required"),
  tax_id: z.string().min(1, "Tax ID is required"),
  return_policy: z.string().min(1, "Return policy is required"),
  shipping_policy: z.string().min(1, "Shipping policy is required"),
  customer_service_email: z.string().email("Must be a valid email"),
  customer_service_phone: z.string().optional(),
  shop_enabled: z.boolean().default(false),
  shop_announcement: z.string().optional(),
  minimum_order_amount: z.number().min(0).default(0),
  rules_accepted: z.boolean()
})

export function VendorSettings() {
  const { session } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      business_registration: '',
      tax_id: '',
      return_policy: '',
      shipping_policy: '',
      customer_service_email: '',
      customer_service_phone: '',
      shop_enabled: false,
      shop_announcement: '',
      minimum_order_amount: 0,
      rules_accepted: false
    }
  })

  useEffect(() => {
    async function loadVendorSettings() {
      if (!session?.user?.id) return

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('claimed_by', session.user.id)
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load vendor settings",
          variant: "destructive"
        })
        return
      }

      if (data) {
        form.reset({
          business_registration: data.business_registration || '',
          tax_id: data.tax_id || '',
          return_policy: data.return_policy || '',
          shipping_policy: data.shipping_policy || '',
          customer_service_email: data.customer_service_email || '',
          customer_service_phone: data.customer_service_phone || '',
          shop_enabled: data.shop_enabled || false,
          shop_announcement: data.shop_announcement || '',
          minimum_order_amount: data.minimum_order_amount || 0,
          rules_accepted: data.rules_accepted || false
        })
      }
    }

    loadVendorSettings()
  }, [session?.user?.id])

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const updates = {
        ...values,
        rules_accepted_at: values.rules_accepted ? new Date().toISOString() : null
      }

      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('claimed_by', session.user.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Vendor settings updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Settings</CardTitle>
          <CardDescription>
            Configure your vendor profile and shop settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Information</h3>
                <FormField
                  control={form.control}
                  name="business_registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Registration Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Policies */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Store Policies</h3>
                <FormField
                  control={form.control}
                  name="return_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Policy</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shipping_policy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Policy</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Customer Service */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Service</h3>
                <FormField
                  control={form.control}
                  name="customer_service_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_service_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Shop Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Shop Settings</h3>
                <FormField
                  control={form.control}
                  name="shop_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Shop</FormLabel>
                        <FormDescription>
                          Make your products available for purchase
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shop_announcement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Announcement</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Display an announcement message in your shop
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_order_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Terms Acceptance */}
              <FormField
                control={form.control}
                name="rules_accepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Accept Vendor Rules and Terms
                      </FormLabel>
                      <FormDescription>
                        You must accept our vendor rules and terms to sell on our platform
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
