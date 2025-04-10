import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function SupplementStacks() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stackName, setStackName] = useState("");
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);

  const { data: supplements } = useQuery({
    queryKey: ['supplementLogs', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_logs')
        .select('supplement_name')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return [...new Set(data.map(log => log.supplement_name))];
    },
    enabled: !!session?.user?.id,
  });

  const { data: stacks } = useQuery({
    queryKey: ['supplementStacks', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_stacks')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const createStackMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('supplement_stacks')
        .insert({
          user_id: session?.user?.id,
          name: values.name,
          supplements: values.supplements,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplementStacks'] });
      toast({
        title: "Success",
        description: "Supplement stack created successfully",
      });
      setStackName("");
      setSelectedSupplements([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create supplement stack",
        variant: "destructive",
      });
      console.error("Error creating stack:", error);
    },
  });

  const handleCreateStack = () => {
    if (!stackName || selectedSupplements.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a name and select supplements",
        variant: "destructive",
      });
      return;
    }

    createStackMutation.mutate({
      name: stackName,
      supplements: selectedSupplements,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Create Supplement Stack</h3>
        <div className="space-y-4">
          <Input
            placeholder="Stack name"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {supplements?.map((supplement) => (
              <Button
                key={supplement}
                variant={selectedSupplements.includes(supplement) ? "default" : "outline"}
                onClick={() => {
                  setSelectedSupplements(prev =>
                    prev.includes(supplement)
                      ? prev.filter(s => s !== supplement)
                      : [...prev, supplement]
                  );
                }}
                className="text-sm"
              >
                {supplement}
              </Button>
            ))}
          </div>
          <Button onClick={handleCreateStack} className="w-full">
            Create Stack
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {stacks?.map((stack) => (
          <Card key={stack.id} className="p-4">
            <h4 className="font-medium">{stack.name}</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {stack.supplements.map((supplement: string) => (
                <span
                  key={supplement}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm"
                >
                  {supplement}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}