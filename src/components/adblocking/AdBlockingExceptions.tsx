
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/supabase-client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export function AdBlockingExceptions() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [newDomain, setNewDomain] = useState("");
  const [reason, setReason] = useState("");
  const [isTemporary, setIsTemporary] = useState(false);

  const { data: exceptions, refetch } = useQuery({
    queryKey: ['ad-blocking-exceptions', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_blocking_exceptions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const addException = async () => {
    if (!session?.user?.id || !newDomain) return;

    try {
      const { error } = await supabase
        .from('ad_blocking_exceptions')
        .insert({
          user_id: session.user.id,
          domain: newDomain,
          reason,
          is_temporary: isTemporary,
          expiry_date: isTemporary ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
        });

      if (error) throw error;

      toast({
        title: "Exception added",
        description: "Your new exception has been added successfully."
      });

      setNewDomain("");
      setReason("");
      setIsTemporary(false);
      refetch();
    } catch (error) {
      console.error('Error adding exception:', error);
      toast({
        title: "Error adding exception",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const deleteException = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ad_blocking_exceptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Exception removed",
        description: "The exception has been removed successfully."
      });

      refetch();
    } catch (error) {
      console.error('Error deleting exception:', error);
      toast({
        title: "Error removing exception",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label>Domain</Label>
          <Input
            placeholder="Enter domain (e.g., example.com)"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
          />
        </div>
        <div>
          <Label>Reason (optional)</Label>
          <Input
            placeholder="Why do you want to allow ads on this domain?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="temporary"
            checked={isTemporary}
            onCheckedChange={setIsTemporary}
          />
          <Label htmlFor="temporary">Temporary exception (1 week)</Label>
        </div>
        <Button onClick={addException} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Exception
        </Button>
      </div>

      <div className="space-y-4">
        {exceptions?.map((exception) => (
          <div
            key={exception.id}
            className="flex items-center justify-between p-2 border rounded-lg"
          >
            <div className="space-y-1">
              <Label>{exception.domain}</Label>
              {exception.reason && (
                <p className="text-sm text-muted-foreground">{exception.reason}</p>
              )}
              {exception.is_temporary && (
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(exception.expiry_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteException(exception.id)}
            >
              <Trash className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
