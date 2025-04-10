
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { useAuth } from "@/components/AuthProvider"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function ProductManager() {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: ['vendor-products', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const updateProduct = async (productId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
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
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <Input
          type="number"
          defaultValue={row.getValue("price")}
          onChange={(e) => updateProduct(row.original.id, { price: e.target.value })}
          className="w-24"
        />
      )
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <Input
          type="number"
          defaultValue={row.getValue("stock")}
          onChange={(e) => updateProduct(row.original.id, { stock: e.target.value })}
          className="w-24"
        />
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Open edit modal
          }}
        >
          Edit
        </Button>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <Button className="mb-4">Add New Product</Button>
        
        {isLoading ? (
          <div>Loading products...</div>
        ) : (
          <DataTable 
            columns={columns}
            data={products || []}
          />
        )}
      </CardContent>
    </Card>
  );
}
