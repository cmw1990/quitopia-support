import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

export function SupplementInventory() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState<Record<string, number>>({});

  const { data: inventory } = useQuery({
    queryKey: ['supplementInventory', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_inventory')
        .select('*')
        .eq('user_id', session?.user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('supplement_inventory')
        .upsert({
          user_id: session?.user?.id,
          supplement_name: values.supplement_name,
          quantity: values.quantity,
          reorder_threshold: values.reorder_threshold || 5,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplementInventory'] });
      toast({
        title: "Success",
        description: "Inventory updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
      console.error("Error updating inventory:", error);
    },
  });

  const handleUpdateQuantity = (supplementName: string, newQuantity: number) => {
    updateInventoryMutation.mutate({
      supplement_name: supplementName,
      quantity: newQuantity,
    });
  };

  return (
    <div className="space-y-4">
      {inventory?.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{item.supplement_name}</h4>
              <p className="text-sm text-muted-foreground">
                Remaining: {item.quantity} units
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={quantity[item.supplement_name] || item.quantity}
                onChange={(e) => setQuantity({
                  ...quantity,
                  [item.supplement_name]: parseInt(e.target.value),
                })}
                className="w-20"
              />
              <Button
                onClick={() => handleUpdateQuantity(
                  item.supplement_name,
                  quantity[item.supplement_name] || item.quantity
                )}
              >
                Update
              </Button>
            </div>
          </div>
          {item.quantity <= item.reorder_threshold && (
            <div className="mt-2 flex items-center gap-2 text-warning">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Running low - consider reordering</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}