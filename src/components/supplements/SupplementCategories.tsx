import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function SupplementCategories() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCategory, setNewCategory] = useState("");

  const { data: categories } = useQuery({
    queryKey: ['supplementCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userCategoryMappings } = useQuery({
    queryKey: ['supplementCategoryMappings', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplement_category_mappings')
        .select('*')
        .eq('user_id', session?.user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('supplement_categories')
        .insert({ name });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplementCategories'] });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      setNewCategory("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
      console.error("Error adding category:", error);
    },
  });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    addCategoryMutation.mutate(newCategory);
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Supplement Categories</h3>
      
      <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
        <Input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
        />
        <Button type="submit">Add</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => (
          <Badge
            key={category.id}
            variant="secondary"
            className="text-sm"
          >
            {category.name}
          </Badge>
        ))}
      </div>
    </Card>
  );
}