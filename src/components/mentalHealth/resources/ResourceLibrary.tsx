
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Edit2, Trash2, Share2 } from "lucide-react";

const RESOURCE_TYPES = [
  "Article",
  "Video",
  "Audio",
  "Document",
  "Exercise",
  "Worksheet"
];

export function ResourceLibrary() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    resource_type: "",
    content: "",
    file_url: "",
    tags: [] as string[],
    is_public: false
  });
  const [newTag, setNewTag] = useState("");

  const { data: resources } = useQuery({
    queryKey: ['consultation-resources', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultation_resources')
        .select('*')
        .eq('professional_id', session?.user?.id)
        .order('created_at', { ascending: false });
      return data;
    },
    enabled: !!session?.user?.id
  });

  const addResource = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('consultation_resources')
        .insert([{
          professional_id: session?.user?.id,
          ...newResource
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-resources'] });
      toast({
        title: "Success",
        description: "Resource added successfully"
      });
      setNewResource({
        title: "",
        description: "",
        resource_type: "",
        content: "",
        file_url: "",
        tags: [],
        is_public: false
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add resource",
        variant: "destructive"
      });
      console.error('Resource error:', error);
    }
  });

  const updateResource = useMutation({
    mutationFn: async (resourceData: typeof newResource & { id: string }) => {
      const { data, error } = await supabase
        .from('consultation_resources')
        .update(resourceData)
        .eq('id', resourceData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-resources'] });
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
        .from('consultation_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation-resources'] });
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

  const addTag = () => {
    if (newTag && !newResource.tags.includes(newTag)) {
      setNewResource(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setNewResource(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Resource Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Add New Resource</Label>
          <div className="space-y-4">
            <Input
              placeholder="Resource Title"
              value={newResource.title}
              onChange={(e) => setNewResource(prev => ({
                ...prev,
                title: e.target.value
              }))}
            />
            <Textarea
              placeholder="Resource Description"
              value={newResource.description}
              onChange={(e) => setNewResource(prev => ({
                ...prev,
                description: e.target.value
              }))}
            />
            <select
              className="w-full p-2 border rounded"
              value={newResource.resource_type}
              onChange={(e) => setNewResource(prev => ({
                ...prev,
                resource_type: e.target.value
              }))}
            >
              <option value="">Select Resource Type</option>
              {RESOURCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Textarea
              placeholder="Resource Content"
              value={newResource.content}
              onChange={(e) => setNewResource(prev => ({
                ...prev,
                content: e.target.value
              }))}
            />
            <Input
              placeholder="File URL (optional)"
              value={newResource.file_url}
              onChange={(e) => setNewResource(prev => ({
                ...prev,
                file_url: e.target.value
              }))}
            />
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} type="button">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newResource.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newResource.is_public}
                onCheckedChange={(checked) => setNewResource(prev => ({
                  ...prev,
                  is_public: checked
                }))}
              />
              <Label>Make Public</Label>
            </div>
          </div>
          <Button
            onClick={() => addResource.mutate()}
            disabled={addResource.isPending}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>

        <div className="space-y-4">
          <Label>Your Resources</Label>
          {resources?.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                    <p className="text-sm mt-1">Type: {resource.resource_type}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {resource.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                    {resource.is_public && (
                      <Badge variant="default" className="mt-2">Public</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(resource.id);
                        setNewResource({
                          title: resource.title,
                          description: resource.description || "",
                          resource_type: resource.resource_type,
                          content: resource.content || "",
                          file_url: resource.file_url || "",
                          tags: resource.tags,
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
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
