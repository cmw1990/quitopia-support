import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_KEY } from "@/integrations/supabase/db-client";
import { Card } from "@/components/ui/card";
import { Eye, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";

interface VisionItem {
  id: string;
  title: string;
  goal_type: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const VisionBoard = () => {
  const { toast } = useToast();
  const { session } = useAuth();
  const [imageUrl, setImageUrl] = useState("");

  const { data: visionItems } = useQuery<VisionItem[]>({
    queryKey: ["visionBoard"],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/goals?goal_type=eq.vision&user_id=eq.${session.user.id}&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      return await response.json();
    },
    enabled: !!session?.access_token
  });

  const addVisionItem = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add vision items",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/goals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            title: "Vision Board Item",
            goal_type: "vision",
            description: imageUrl,
            user_id: session.user.id
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || response.statusText);
      }

      toast({
        title: "Item added!",
        description: "Keep building your vision!",
      });
      setImageUrl("");
    } catch (error) {
      toast({
        title: "Error adding item",
        description: "Please try again",
        variant: "destructive",
      });
      console.error('Error adding vision item:', error);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Eye className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-semibold">Vision Board</h2>
      </div>

      <div className="flex gap-2">
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
          className="flex-1"
        />
        <Button onClick={addVisionItem}>
          <ImagePlus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {visionItems?.map((item) => (
          <div
            key={item.id}
            className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform"
          >
            <img
              src={item.description}
              alt="Vision board item"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};