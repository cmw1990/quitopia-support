
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parent_id: z.string().optional()
});

type Category = {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
};

export function CategoriesManager() {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: categories, refetch } = useQuery({
    queryKey: ['vendor-categories', session?.user?.id],
    queryFn: async () => {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) return [];

      const { data, error } = await supabase
        .from('vendor_categories')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!session?.user?.id
  });

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parent_id: undefined
    }
  });

  const handleAddCategory = async (values: z.infer<typeof categorySchema>) => {
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('claimed_by', session?.user?.id)
        .single();

      if (!vendorData) throw new Error("Vendor not found");

      const { error } = await supabase
        .from('vendor_categories')
        .insert({
          vendor_id: vendorData.id,
          name: values.name,
          description: values.description || null,
          parent_id: values.parent_id || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category added successfully"
      });

      form.reset();
      refetch();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully"
      });

      refetch();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Categories</CardTitle>
        <CardDescription>
          Organize your products into categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddCategory)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Energy Drinks" />
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
                    <Textarea {...field} placeholder="Category description (optional)" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent category (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Button type="submit">Add Category</Button>
          </form>
        </Form>

        <div className="mt-8 space-y-4">
          <h3 className="font-semibold">Current Categories</h3>
          {categories?.map((category) => (
            <Card key={category.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}
                  {category.parent_id && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Parent: {categories.find(c => c.id === category.parent_id)?.name}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteCategory(category.id)}
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
