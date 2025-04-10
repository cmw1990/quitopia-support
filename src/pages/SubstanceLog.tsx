import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/components/AuthProvider";

type SubstanceType = "alcohol" | "tobacco" | "other";

interface FormData {
  substance_type: SubstanceType | "";
  quantity: string;
  unit_of_measure: string;
  location: string;
  social_context: string;
  mood_before: number;
  mood_after: number;
  notes: string;
}

export default function SubstanceLog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    substance_type: "",
    quantity: "",
    unit_of_measure: "",
    location: "",
    social_context: "",
    mood_before: 5,
    mood_after: 5,
    notes: "",
  });

  const { data: logs } = useQuery({
    queryKey: ['substanceLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('substance_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createLog = useMutation({
    mutationFn: async (data: FormData) => {
      if (!data.substance_type) {
        throw new Error("Substance type is required");
      }

      const { error } = await supabase
        .from('substance_logs')
        .insert([{
          substance_type: data.substance_type,
          quantity: Number(data.quantity),
          unit_of_measure: data.unit_of_measure,
          location: data.location,
          social_context: data.social_context,
          mood_before: data.mood_before,
          mood_after: data.mood_after,
          notes: data.notes,
          user_id: session?.user.id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['substanceLogs'] });
      toast({
        title: "Log created",
        description: "Your substance use has been logged successfully.",
      });
      setFormData({
        substance_type: "",
        quantity: "",
        unit_of_measure: "",
        location: "",
        social_context: "",
        mood_before: 5,
        mood_after: 5,
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create log. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a log.",
        variant: "destructive",
      });
      return;
    }
    createLog.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Substance Use Log</h1>
        <Button variant="outline" onClick={() => navigate('/sobriety')}>
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="substance_type">Substance Type</Label>
                <Select
                  value={formData.substance_type}
                  onValueChange={(value: SubstanceType) => 
                    setFormData(prev => ({ ...prev, substance_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select substance type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alcohol">Alcohol</SelectItem>
                    <SelectItem value="tobacco">Tobacco</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, quantity: e.target.value }))
                    }
                    placeholder="Amount"
                  />
                  <Input
                    value={formData.unit_of_measure}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, unit_of_measure: e.target.value }))
                    }
                    placeholder="Units (e.g., drinks, cigarettes)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Where were you?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_context">Social Context</Label>
                <Input
                  id="social_context"
                  value={formData.social_context}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, social_context: e.target.value }))
                  }
                  placeholder="Who were you with?"
                />
              </div>

              <div className="space-y-2">
                <Label>Mood Before</Label>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mood_before}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, mood_before: parseInt(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Mood After</Label>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.mood_after}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, mood_after: parseInt(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any additional notes or triggers?"
              />
            </div>

            <Button type="submit" className="w-full">
              Log Substance Use
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Logs</h2>
        <div className="grid gap-4">
          {logs?.map((log) => (
            <Card key={log.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Date</Label>
                    <p>{format(new Date(log.created_at), 'PPP')}</p>
                  </div>
                  <div>
                    <Label>Substance</Label>
                    <p className="capitalize">{log.substance_type}</p>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <p>{log.quantity} {log.unit_of_measure}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p>{log.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}