import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const sampleFormSchema = z.object({
  code: z.string().min(3).max(20),
  discount_amount: z.number().optional(),
  discount_percentage: z.number().min(1).max(100).optional(),
  description: z.string(),
  expires_at: z.string().optional(),
  product_id: z.string().uuid()
})

export function CouponManager() {
  const { session } = useAuth()
  const { toast } = useToast()

  const { data: coupons, refetch } = useQuery({
    queryKey: ['vendor-coupons', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select(`
          *,
          products (
            name
          )
        `)
        .eq('vendor_id', session?.user?.id)
      
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  const { data: products } = useQuery({
    queryKey: ['vendor-products', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('maker_id', session?.user?.id)
      
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  const form = useForm<z.infer<typeof sampleFormSchema>>({
    resolver: zodResolver(sampleFormSchema)
  })

  async function onSubmit(values: z.infer<typeof sampleFormSchema>) {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: values.code,
          vendor_id: session?.user?.id,
          product_id: values.product_id,
          discount_amount: values.discount_amount,
          discount_percentage: values.discount_percentage,
          description: values.description,
          expires_at: values.expires_at
        })

      if (error) throw error

      toast({
        title: "Coupon created",
        description: "Your coupon has been created successfully"
      })

      form.reset()
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create coupon. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Coupon</CardTitle>
          <CardDescription>
            Create discount coupons for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The code customers will enter to claim the discount
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="">Select a product</option>
                        {products?.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">Create Coupon</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons?.map((coupon) => (
              <Card key={coupon.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-semibold">{coupon.code}</h4>
                    <p className="text-sm text-muted-foreground">
                      {coupon.description}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {coupon.discount_amount && (
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                          ${coupon.discount_amount} off
                        </span>
                      )}
                      {coupon.discount_percentage && (
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                          {coupon.discount_percentage}% off
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={async () => {
                      const { error } = await supabase
                        .from('coupons')
                        .update({ active: false })
                        .eq('id', coupon.id)
                      
                      if (error) {
                        toast({
                          title: "Error",
                          description: "Failed to deactivate coupon",
                          variant: "destructive"
                        })
                      } else {
                        refetch()
                        toast({
                          title: "Coupon deactivated",
                          description: "The coupon has been deactivated"
                        })
                      }
                    }}
                  >
                    Deactivate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
