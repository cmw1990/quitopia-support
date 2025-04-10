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
import { Badge } from "@/components/ui/badge"

const sampleFormSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().min(1),
  description: z.string(),
  expires_at: z.string().optional()
})

export function SampleManager() {
  const { session } = useAuth()
  const { toast } = useToast()

  const { data: samples, refetch } = useQuery({
    queryKey: ['vendor-samples', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('free_samples')
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
        .from('free_samples')
        .insert({
          vendor_id: session?.user?.id,
          product_id: values.product_id,
          quantity: values.quantity,
          description: values.description,
          expires_at: values.expires_at
        })

      if (error) throw error

      toast({
        title: "Sample campaign created",
        description: "Your free sample campaign has been created successfully"
      })

      form.reset()
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sample campaign. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Sample Campaign</CardTitle>
          <CardDescription>
            Offer free samples of your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity Available</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of free samples to offer
                    </FormDescription>
                  </FormItem>
                )}
              />

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
                    <FormDescription>
                      Describe your sample offer and any conditions
                    </FormDescription>
                  </FormItem>
                )}
              />

              <Button type="submit">Create Sample Campaign</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sample Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {samples?.map((sample) => (
              <Card key={sample.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-semibold">{sample.products?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {sample.description}
                    </p>
                    <Badge className="mt-2">
                      {sample.quantity} remaining
                    </Badge>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={async () => {
                      const { error } = await supabase
                        .from('free_samples')
                        .update({ active: false })
                        .eq('id', sample.id)
                      
                      if (error) {
                        toast({
                          title: "Error",
                          description: "Failed to deactivate sample campaign",
                          variant: "destructive"
                        })
                      } else {
                        refetch()
                        toast({
                          title: "Campaign deactivated",
                          description: "The sample campaign has been deactivated"
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
