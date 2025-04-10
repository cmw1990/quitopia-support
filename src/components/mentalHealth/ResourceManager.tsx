
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ResourceManager() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({
    title: "",
    content: "",
    category: "",
    is_public: false
  });

  const { data: resources } = useQuery({
    queryKey: ['professional-resources', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('professional_resources')
        .select('*')
        .eq('created_by', session?.user?.id)
        .order('created_at', { ascending: false });
      return data;
    },
    enabled: !!session?.user?.id
  });

  const createResource = useMutation({
    mutationFn: async (resourceData: typeof newResource) => {
      const { data, error } = await supabase
        .from('professional_resources')
        .insert([{
          ...resourceData,
          created_by: session?.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-resources'] });
      setNewResource({
        title: "",
        content: "",
        category: "",
        is_public: false
      });
      toast({
        title: "Success",
        description: "Resource created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create resource",
        variant: "destructive"
      });
      console.error('Resource error:', error);
    }
  });

  const updateResource = useMutation({
    mutationFn: async (resourceData: any) => {
      const { data, error } = await supabase
        .from('professional_resources')
        .update(resourceData)
        .eq('id', resourceData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-resources'] });
      setEditing(null);
      toast({
        title: "Success",
        description: "Resource updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "destructive"
      });
      console.error('Update error:', error);
    }
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professional_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-resources'] });
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive"
      });
      console.error('Delete error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateResource.mutate({ ...newResource, id: editing });
    } else {
      createResource.mutate(newResource);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <Input
            placeholder="Resource Title"
            value={newResource.title}
            onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <Textarea
            placeholder="Resource Content"
            value={newResource.content}
            onChange={(e) => setNewResource(prev => ({ ...prev, content: e.target.value }))}
            required
          />
          <Input
            placeholder="Category"
            value={newResource.category}
            onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={newResource.is_public}
              onChange={(e) => setNewResource(prev => ({ ...prev, is_public: e.target.checked }))}
            />
            <label htmlFor="is_public">Make Public</label>
          </div>
          <Button type="submit" disabled={createResource.isPending || updateResource.isPending}>
            {editing ? 'Update Resource' : 'Add Resource'}
          </Button>
          {editing && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setEditing(null);
                setNewResource({
                  title: "",
                  content: "",
                  category: "",
                  is_public: false
                });
              }}
            >
              Cancel
            </Button>
          )}
        </form>

        <div className="space-y-4">
          {resources?.map((resource) => (
            <Card key={resource.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{resource.category}</Badge>
                    {resource.is_public && <Badge variant="secondary">Public</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(resource.id);
                      setNewResource({
                        title: resource.title,
                        content: resource.content,
                        category: resource.category,
                        is_public: resource.is_public
                      });
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteResource.mutate(resource.id)}
                    disabled={deleteResource.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
