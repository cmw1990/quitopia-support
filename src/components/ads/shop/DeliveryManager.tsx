
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function DeliveryManager() {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: deliveries, isLoading } = useQuery({
    queryKey: ['vendor-deliveries', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return [];

      const { data, error } = await supabase
        .from('delivery_tracking')
        .select(`
          *,
          order:orders (
            id,
            shipping_address,
            user_id
          )
        `)
        .eq('order.vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const updateTracking = async (deliveryId: string, trackingNumber: string) => {
    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .update({ 
          tracking_number: trackingNumber,
          status: 'in_transit'
        })
        .eq('id', deliveryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tracking information updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tracking information",
        variant: "destructive"
      });
    }
  };

  const columns = [
    {
      accessorKey: "order.id",
      header: "Order ID"
    },
    {
      accessorKey: "status",
      header: "Status"
    },
    {
      accessorKey: "tracking_number",
      header: "Tracking #",
      cell: ({ row }) => (
        <Input
          defaultValue={row.getValue("tracking_number") || ""}
          onBlur={(e) => updateTracking(row.original.id, e.target.value)}
          placeholder="Enter tracking number"
        />
      )
    },
    {
      accessorKey: "estimated_delivery",
      header: "Est. Delivery",
      cell: ({ row }) => row.getValue("estimated_delivery") 
        ? new Date(row.getValue("estimated_delivery")).toLocaleDateString()
        : "N/A"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading deliveries...</div>
        ) : (
          <DataTable 
            columns={columns}
            data={deliveries || []}
          />
        )}
      </CardContent>
    </Card>
  );
}
