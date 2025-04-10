
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle, History } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function InventoryManager() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: inventory, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor-inventory', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock,
          inventory_logs (
            quantity_change,
            reason,
            created_at
          )
        `)
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const updateStock = async (productId: string, quantity: number) => {
    try {
      // First update the product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: quantity })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Then create an inventory log entry
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: productId,
          quantity_change: quantity,
          reason: 'Manual stock update'
        });

      if (logError) throw logError;

      toast({
        title: "Success",
        description: "Stock updated successfully"
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Product Name",
    },
    {
      accessorKey: "stock",
      header: "Current Stock",
      cell: ({ row }) => (
        <Input
          type="number"
          defaultValue={row.getValue("stock")}
          onChange={(e) => updateStock(row.original.id, parseInt(e.target.value))}
          className="w-24"
        />
      )
    },
    {
      accessorKey: "inventory_logs",
      header: "Recent Changes",
      cell: ({ row }) => {
        const logs = row.getValue("inventory_logs") as any[];
        return logs?.length > 0 ? (
          <div className="text-sm">
            Last change: {logs[0].quantity_change} units
            <br />
            <span className="text-muted-foreground">
              {new Date(logs[0].created_at).toLocaleDateString()}
            </span>
          </div>
        ) : null;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedProduct(row.original);
            setHistoryOpen(true);
          }}
        >
          <History className="h-4 w-4 mr-2" />
          View History
        </Button>
      )
    }
  ];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load inventory data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Management</CardTitle>
        <CardDescription>Track and update your product stock levels</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <DataTable 
            columns={columns}
            data={inventory || []}
          />
        )}

        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Inventory History - {selectedProduct?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedProduct?.inventory_logs?.map((log: any, index: number) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Change: {log.quantity_change} units</p>
                    <p className="text-sm text-muted-foreground">{log.reason}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
