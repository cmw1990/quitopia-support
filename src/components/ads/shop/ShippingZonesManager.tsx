
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Trash2 } from "lucide-react"

const shippingZoneSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rates: z.array(z.object({
    min_amount: z.number(),
    max_amount: z.number().optional(),
    rate: z.number(),
  }))
});

type ShippingZone = {
  id: string;
  name: string;
  rates: Array<{
    min_amount: number;
    max_amount?: number;
    rate: number;
  }>;
};

export function ShippingZonesManager() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  const { data: zones, refetch } = useQuery({
    queryKey: ['shipping-zones', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return [];

      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Properly cast the rates from Json to our expected type
      return (data as any[]).map(zone => ({
        ...zone,
        rates: zone.rates as Array<{
          min_amount: number;
          max_amount?: number;
          rate: number;
        }>
      })) as ShippingZone[];
    },
    enabled: !!session?.user?.id
  });

  const form = useForm<z.infer<typeof shippingZoneSchema>>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: {
      name: '',
      rates: [{ min_amount: 0, rate: 0 }]
    }
  });

  const handleAddZone = async (values: z.infer<typeof shippingZoneSchema>) => {
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) throw new Error("Vendor not found");

      const { error } = await supabase
        .from('shipping_zones')
        .insert({
          vendor_id: vendorData.id,
          name: values.name,
          rates: values.rates
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shipping zone added successfully"
      });

      form.reset();
      refetch();
    } catch (error) {
      console.error('Error adding shipping zone:', error);
      toast({
        title: "Error",
        description: "Failed to add shipping zone",
        variant: "destructive"
      });
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', zoneId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Shipping zone deleted successfully"
      });

      refetch();
    } catch (error) {
      console.error('Error deleting shipping zone:', error);
      toast({
        title: "Error",
        description: "Failed to delete shipping zone",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Zones</CardTitle>
        <CardDescription>
          Manage shipping rates for different regions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddZone)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Domestic Standard" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium">Shipping Rates</h4>
              {form.watch('rates').map((_, index) => (
                <div key={index} className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`rates.${index}.min_amount`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Min Order Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`rates.${index}.max_amount`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Max Order Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="No limit"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`rates.${index}.rate`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Shipping Rate ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const rates = form.getValues('rates');
                  form.setValue('rates', [...rates, { min_amount: 0, rate: 0 }]);
                }}
              >
                Add Rate Tier
              </Button>
            </div>

            <Button type="submit">Add Shipping Zone</Button>
          </form>
        </Form>

        <div className="mt-8 space-y-4">
          <h3 className="font-semibold">Current Shipping Zones</h3>
          {zones?.map((zone) => (
            <Card key={zone.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-medium">{zone.name}</h4>
                  <div className="mt-2 space-y-1">
                    {zone.rates.map((rate, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        ${rate.min_amount} - {rate.max_amount ? `$${rate.max_amount}` : 'No limit'}: ${rate.rate} shipping
                      </p>
                    ))}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteZone(zone.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
