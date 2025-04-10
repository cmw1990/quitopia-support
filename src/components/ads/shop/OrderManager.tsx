
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export function OrderManager() {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['vendor-orders', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (name)
          )
        `)
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully"
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const columns = [
    {
      accessorKey: "id",
      header: "Order ID"
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString()
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "delivered" ? "default" : "secondary"}>
          {row.getValue("status")}
        </Badge>
      )
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => `$${row.getValue("total_amount")}`
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateOrderStatus(row.original.id, "processing")}
          >
            Process
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateOrderStatus(row.original.id, "shipped")}
          >
            Mark Shipped
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading orders...</div>
        ) : (
          <DataTable 
            columns={columns}
            data={orders || []}
          />
        )}
      </CardContent>
    </Card>
  );
}
